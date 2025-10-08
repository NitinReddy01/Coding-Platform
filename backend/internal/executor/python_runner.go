package executor

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// PythonRunner implements the LanguageRunner interface for Python code execution.
// It handles running Python code in an isolated environment with resource monitoring.
type PythonRunner struct {
	// workDir is the directory where temporary execution files will be created
	workDir string

	// memLimitMB is the memory limit in megabytes for code execution
	memLimitMB int

	// imageBuilt tracks whether we've ensured the Docker image exists
	imageBuilt bool
}

// NewPythonRunner creates a new Python code runner.
//
// Parameters:
//   - workDir: Directory where temporary files will be created (e.g., /tmp/code-executor)
//   - memLimitMB: Maximum memory allowed in megabytes (e.g., 256 for 256MB)
//
// Example:
//
//	runner := NewPythonRunner("/tmp/executor", 256)
func NewPythonRunner(workDir string, memLimitMB int) *PythonRunner {
	return &PythonRunner{
		workDir:    workDir,
		memLimitMB: memLimitMB,
	}
}

// GetLanguageName returns "python" to identify this runner.
// This method satisfies the LanguageRunner interface.
func (r *PythonRunner) GetLanguageName() string {
	return "python"
}

// ensureDockerImage checks if the Docker image exists and builds it if necessary.
// This is called once before the first execution to ensure the image is available.
func (r *PythonRunner) ensureDockerImage() error {
	// Only check/build once per runner instance
	if r.imageBuilt {
		return nil
	}

	// Check if the image already exists
	checkCmd := exec.Command("docker", "image", "inspect", "python-executor")
	err := checkCmd.Run()

	if err == nil {
		// Image exists, mark as built and return
		r.imageBuilt = true
		return nil
	}

	// Image doesn't exist, build it
	fmt.Println("Docker image 'python-executor' not found. Building it now...")

	// Get the path to the Dockerfile
	// Assuming we're running from the project root
	buildCmd := exec.Command("docker", "build",
		"-t", "python-executor",
		"-f", "dockerfiles/python.Dockerfile",
		"dockerfiles/")

	// Show build output to the user
	buildCmd.Stdout = os.Stdout
	buildCmd.Stderr = os.Stderr

	err = buildCmd.Run()
	if err != nil {
		return fmt.Errorf("failed to build Docker image: %w", err)
	}

	fmt.Println("Docker image built successfully!")
	r.imageBuilt = true
	return nil
}

// Execute runs Python code with the given input and returns the execution output.
// This method satisfies the LanguageRunner interface.
//
// How it works:
//  1. Creates a temporary directory on the host
//  2. Writes the code to a Python file
//  3. Runs the code in an isolated Docker container
//  4. Docker enforces resource limits (memory, CPU, network isolation)
//  5. Captures output and cleans up
//
// Parameters:
//   - ctx: Context for timeout/cancellation (will be cancelled if time limit exceeded)
//   - code: The Python source code to execute
//   - input: Data to provide via stdin (what the user's input() calls will read)
//
// Returns:
//   - ExecutionOutput with stdout, stderr, metrics, and status
//   - error if there was a system error (not a user code error)
func (r *PythonRunner) Execute(ctx context.Context, code string, input string) (*ExecutionOutput, error) {
	// Ensure Docker image exists (builds it if necessary on first run)
	if err := r.ensureDockerImage(); err != nil {
		return nil, err
	}

	// Create a temporary directory for this execution on the host
	// This directory will be mounted into the Docker container
	tempDir, err := os.MkdirTemp(r.workDir, "exec-*")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp directory: %w", err)
	}

	// Ensure cleanup of temp directory when function returns
	defer os.RemoveAll(tempDir)

	// Write the user's code to a Python file on the host
	codeFile := filepath.Join(tempDir, "solution.py")
	err = os.WriteFile(codeFile, []byte(code), 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write code file: %w", err)
	}

	// Generate unique container name for tracking and cleanup
	containerName := fmt.Sprintf("code-exec-%d", rand.Int63())

	// Build Docker command with security restrictions
	memoryLimit := fmt.Sprintf("%dm", r.memLimitMB) // e.g., "256m"

	dockerArgs := []string{
		"run",
		"--rm",                      // Auto-remove container after execution
		"--name", containerName,     // Unique name for tracking
		"-i",                        // Interactive mode (keep stdin open)
		"--network", "none",         // No network access (security)
		"--memory", memoryLimit,     // Hard memory limit
		"--cpus", "0.5",             // CPU limit (0.5 cores)
		"--pids-limit", "50",        // Prevent fork bombs
		"-v", tempDir + ":/workspace", // Mount code directory (writable for stdin/temp files)
		"-w", "/workspace",          // Set working directory
		"python-executor",           // Docker image name
		"python3", "solution.py",    // Command to run
	}

	// Create the Docker command
	cmd := exec.CommandContext(ctx, "docker", dockerArgs...)

	// Set up stdin for user input
	cmd.Stdin = strings.NewReader(input)

	// Capture stdout and stderr
	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Record start time for duration measurement
	startTime := time.Now()

	// Execute the Docker container
	err = cmd.Run()

	// Calculate execution duration
	execTime := time.Since(startTime)

	// Create the output structure
	output := &ExecutionOutput{
		Stdout:         stdout.String(),
		Stderr:         stderr.String(),
		TimeMs:         execTime.Milliseconds(),
		MemoryKB:       0, // Docker handles memory internally, we don't track it
		TimedOut:       false,
		MemoryExceeded: false,
	}

	// Check if context deadline was exceeded (timeout)
	timedOut := ctx.Err() == context.DeadlineExceeded
	if timedOut {
		output.TimedOut = true

		// Force kill the container to ensure cleanup
		killCmd := exec.Command("docker", "kill", containerName)
		killCmd.Run() // Ignore errors - container might already be stopped

		return output, nil
	}

	// Handle execution errors
	if err != nil {
		// Check if this is a Docker system error vs user code error
		stderrStr := stderr.String()

		// Docker system errors contain specific patterns
		if strings.Contains(stderrStr, "Error response from daemon") ||
		   strings.Contains(stderrStr, "unable to find image") ||
		   strings.Contains(stderrStr, "Cannot connect to the Docker daemon") {
			return nil, fmt.Errorf("Docker system error: %w", err)
		}

		if exitErr, ok := err.(*exec.ExitError); ok {
			output.ExitCode = exitErr.ExitCode()

			// Exit code 137 = SIGKILL (could be OOM or other kill)
			// Only mark as MemoryExceeded if NOT a timeout
			if exitErr.ExitCode() == 137 && !timedOut {
				output.MemoryExceeded = true
			}
		} else {
			// Unexpected system error
			return nil, fmt.Errorf("execution failed: %w", err)
		}
	}

	return output, nil
}
