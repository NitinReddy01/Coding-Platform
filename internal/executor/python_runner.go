package executor

import (
	"context"
	"fmt"
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

// Execute runs Python code with the given input and returns the execution output.
// This method satisfies the LanguageRunner interface.
//
// How it works:
//  1. Creates a temporary directory for isolation
//  2. Writes the code to a Python file
//  3. Runs the code with python3
//  4. Monitors resource usage (time, memory)
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
	// Create a temporary directory for this execution
	// os.MkdirTemp creates a unique directory with a random suffix
	// Example: /tmp/code-executor/exec-123456789
	// The "*" in "exec-*" is replaced with a random string
	tempDir, err := os.MkdirTemp(r.workDir, "exec-*")
	if err != nil {
		// %w wraps the error so we can trace where it came from
		return nil, fmt.Errorf("failed to create temp directory: %w", err)
	}

	// defer means "run this when the function returns"
	// This ensures we always clean up the temp directory, even if there's an error
	// os.RemoveAll deletes a directory and everything inside it
	defer os.RemoveAll(tempDir)

	// Write the user's code to a Python file
	// filepath.Join creates a proper file path for any OS (handles / vs \ differences)
	codeFile := filepath.Join(tempDir, "solution.py")

	// os.WriteFile writes data to a file
	// []byte(code) converts the string to bytes
	// 0644 is the file permission (owner can read/write, others can read)
	err = os.WriteFile(codeFile, []byte(code), 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write code file: %w", err)
	}

	// Write input to a file (not currently used, but could be useful for debugging)
	inputFile := filepath.Join(tempDir, "input.txt")
	err = os.WriteFile(inputFile, []byte(input), 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write input file: %w", err)
	}

	// Prepare the command to execute
	// exec.CommandContext creates a command that can be cancelled via context
	// This runs: python3 /tmp/code-executor/exec-123/solution.py
	cmd := exec.CommandContext(ctx, "python3", codeFile)

	// Set the working directory for the command
	cmd.Dir = tempDir

	// Set up stdin (standard input) for the command
	// strings.NewReader creates a reader that provides the input string
	// When the Python code calls input(), it will read from this
	cmd.Stdin = strings.NewReader(input)

	// Capture stdout and stderr
	// WHAT IS strings.Builder?
	// It's an efficient way to build strings piece by piece
	// We use it to collect all the output from the program
	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout // Everything the code prints goes here
	cmd.Stderr = &stderr // All error messages go here

	// Record the start time so we can measure execution duration
	// time.Now() returns the current time
	startTime := time.Now()

	// Start the command (doesn't wait for it to finish)
	// This begins running the Python code
	err = cmd.Start()
	if err != nil {
		return nil, fmt.Errorf("failed to start command: %w", err)
	}

	// Monitor resource usage in a separate goroutine
	// WHAT IS A GOROUTINE?
	// A goroutine is Go's lightweight thread - it runs concurrently with other code
	// This lets us monitor memory while the code is running, not just after
	monitor := NewResourceMonitor(r.memLimitMB)
	memExceeded := false
	var maxMemory int64

	// WHAT IS A CHANNEL?
	// A channel is Go's way for goroutines to communicate
	// make(chan struct{}) creates a channel that can pass empty signals
	// We use it to know when the monitoring goroutine is done
	monitorDone := make(chan struct{})

	// Launch the monitoring goroutine
	// "go func() {...}()" starts a new concurrent function
	go func() {
		// Monitor the process and get memory stats
		maxMemory, memExceeded = monitor.MonitorProcess(ctx, cmd)

		// Signal that monitoring is complete by closing the channel
		close(monitorDone)
	}()

	// Wait for the Python code to finish executing
	// This blocks until the process exits
	err = cmd.Wait()

	// Calculate how long the execution took
	// time.Since returns the duration between startTime and now
	execTime := time.Since(startTime)

	// Wait for the monitoring goroutine to finish
	// The "<-" operator receives from a channel
	// Reading from a closed channel returns immediately, so this unblocks when monitoring is done
	<-monitorDone

	// Create the output structure with all the execution details
	output := &ExecutionOutput{
		Stdout:         stdout.String(), // Convert Builder to string
		Stderr:         stderr.String(),
		TimeMs:         execTime.Milliseconds(), // Convert duration to milliseconds
		MemoryKB:       maxMemory,
		TimedOut:       false,
		MemoryExceeded: memExceeded,
	}

	// Check if the context deadline was exceeded (timeout)
	// ctx.Err() returns the error that caused the context to be cancelled
	if ctx.Err() == context.DeadlineExceeded {
		output.TimedOut = true

		// Kill the process if it's still running
		// This ensures we don't leave zombie processes
		if cmd.Process != nil {
			cmd.Process.Kill()
		}

		// Return the output with TimedOut=true
		// Note: This is NOT an error from our perspective - we successfully detected a timeout
		return output, nil
	}

	// If memory limit was exceeded, terminate the process
	if memExceeded {
		if cmd.Process != nil {
			cmd.Process.Kill()
		}
		return output, nil
	}

	// Handle execution errors
	if err != nil {
		// TYPE ASSERTION in Go
		// err.(*exec.ExitError) tries to convert err to an *exec.ExitError
		// ok is true if the conversion succeeded
		// This is how we check "is this error specifically an exit error?"
		if exitErr, ok := err.(*exec.ExitError); ok {
			// The code ran but exited with a non-zero code (e.g., syntax error, runtime error)
			output.ExitCode = exitErr.ExitCode()
		} else {
			// Something else went wrong (e.g., couldn't find python3)
			return nil, fmt.Errorf("execution failed: %w", err)
		}
	}

	return output, nil
}
