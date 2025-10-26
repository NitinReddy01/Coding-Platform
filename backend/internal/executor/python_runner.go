package executor

import (
	"app/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// PythonRunner implements LanguageRunner for Python code execution in Docker.
type PythonRunner struct {
	workDir    string
	memLimitMB int
	imageBuilt bool
}

// NewPythonRunner creates a new Python code runner.
func NewPythonRunner(workDir string, memLimitMB int) *PythonRunner {
	return &PythonRunner{
		workDir:    workDir,
		memLimitMB: memLimitMB,
	}
}

// GetLanguageName returns the language identifier.
func (r *PythonRunner) GetLanguageName() string {
	return "python"
}

// ensureDockerImage checks if the Docker image exists and builds it if necessary.
func (r *PythonRunner) ensureDockerImage() error {
	if r.imageBuilt {
		return nil
	}

	checkCmd := exec.Command("docker", "image", "inspect", "python-executor")
	err := checkCmd.Run()

	if err == nil {
		r.imageBuilt = true
		return nil
	}

	fmt.Println("Docker image 'python-executor' not found. Building it now...")

	buildCmd := exec.Command("docker", "build",
		"-t", "python-executor",
		"-f", "dockerfiles/python.Dockerfile",
		"dockerfiles/")

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

// ExecuteBatch runs Python code against multiple test cases in a single Docker container.
// Creates temporary files, executes a wrapper script that runs all test cases, and returns results.
func (r *PythonRunner) ExecuteBatch(ctx context.Context, code string, testCases []models.TestCase, timeLimit int, memLimitMB int) ([]*ExecutionOutput, error) {
	if err := r.ensureDockerImage(); err != nil {
		return nil, err
	}

	tempDir, err := os.MkdirTemp(r.workDir, "exec-*")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	codeFile := filepath.Join(tempDir, "solution.py")
	err = os.WriteFile(codeFile, []byte(code), 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write code file: %w", err)
	}

	type TestCaseInput struct {
		Input          string `json:"input"`
		ExpectedOutput string `json:"expected_output"`
	}
	testCasesData := make([]TestCaseInput, len(testCases))
	for i, tc := range testCases {
		testCasesData[i] = TestCaseInput{
			Input:          tc.Input,
			ExpectedOutput: tc.ExpectedOutput,
		}
	}
	testCasesJSON, err := json.Marshal(testCasesData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal test cases: %w", err)
	}

	testCasesFile := filepath.Join(tempDir, "test_cases.json")
	err = os.WriteFile(testCasesFile, testCasesJSON, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write test cases file: %w", err)
	}

	wrapperScript := fmt.Sprintf(`import sys
import time
import json
import signal
import traceback
import tracemalloc
from io import StringIO

# Load test cases
with open('/workspace/test_cases.json', 'r') as f:
    test_cases = json.load(f)

# Load user code
with open('/workspace/solution.py', 'r') as f:
    user_code = f.read()

# Compile user code once (to avoid recompilation overhead in loop)
try:
    compiled_code = compile(user_code, '/workspace/solution.py', 'exec')
except SyntaxError as e:
    # If compilation fails, return error for all test cases
    results = [{
        'stdout': '',
        'stderr': str(e),
        'exit_code': 1,
        'time_ms': 0,
        'memory_kb': 0,
        'timed_out': False,
        'memory_exceeded': False,
        'error': f'Compilation error: {str(e)}'
    } for _ in test_cases]
    with open('/workspace/results.json', 'w') as f:
        json.dump(results, f)
    sys.exit(0)

# Time limit per test case (milliseconds)
time_limit_ms = %d

results = []

for i, tc in enumerate(test_cases):
    result = {
        'stdout': '',
        'stderr': '',
        'exit_code': 0,
        'time_ms': 0,
        'memory_kb': 0,
        'timed_out': False,
        'memory_exceeded': False,
        'error': ''
    }

    # Redirect stdin to simulate user input
    old_stdin = sys.stdin
    sys.stdin = StringIO(tc['input'])

    # Capture stdout
    old_stdout = sys.stdout
    sys.stdout = StringIO()

    # Capture stderr
    old_stderr = sys.stderr
    sys.stderr = StringIO()

    # Set up timeout signal handler
    def timeout_handler(signum, frame):
        raise TimeoutError(f'Time limit exceeded ({time_limit_ms}ms)')

    # Start memory tracking
    tracemalloc.start()

    # Set up timeout signal
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.setitimer(signal.ITIMER_REAL, time_limit_ms / 1000.0)

    # Start timing
    start_time = time.perf_counter()

    try:
        # Execute compiled code in a fresh namespace
        exec(compiled_code, {'__name__': '__main__'})

    except TimeoutError:
        result['timed_out'] = True
        result['error'] = f'Time limit exceeded ({time_limit_ms}ms)'

    except Exception as e:
        result['exit_code'] = 1
        result['error'] = str(e)
        sys.stderr.write(traceback.format_exc())

    finally:
        # Cancel the alarm
        signal.alarm(0)

        # End timing
        end_time = time.perf_counter()
        result['time_ms'] = int((end_time - start_time) * 1000)

        # Get memory usage
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        result['memory_kb'] = peak // 1024

        # Capture output
        result['stdout'] = sys.stdout.getvalue()
        result['stderr'] = sys.stderr.getvalue()

        # Restore stdin/stdout/stderr
        sys.stdin = old_stdin
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    results.append(result)

# Write results to file
with open('/workspace/results.json', 'w') as f:
    json.dump(results, f)
`, timeLimit)

	wrapperFile := filepath.Join(tempDir, "wrapper.py")
	err = os.WriteFile(wrapperFile, []byte(wrapperScript), 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write wrapper script: %w", err)
	}

	containerName := fmt.Sprintf("code-exec-%d", rand.Int63())
	memoryLimit := fmt.Sprintf("%dm", memLimitMB)
	dockerArgs := []string{
		"run",
		"--rm",
		"--name", containerName,
		"--network", "none",
		"--memory", memoryLimit,
		"--cpus", "1.0",
		"--pids-limit", "50",
		"-v", tempDir + ":/workspace",
		"-w", "/workspace",
		"python-executor",
		"python3", "wrapper.py",
	}

	cmd := exec.CommandContext(ctx, "docker", dockerArgs...)
	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err = cmd.Run()

	if err != nil {
		stderrStr := stderr.String()
		stdoutStr := stdout.String()
		if strings.Contains(stderrStr, "Error response from daemon") ||
			strings.Contains(stderrStr, "unable to find image") ||
			strings.Contains(stderrStr, "Cannot connect to the Docker daemon") {
			return nil, fmt.Errorf("Docker system error: %w", err)
		}
		if stderrStr != "" || stdoutStr != "" {
			return nil, fmt.Errorf("wrapper script error: stdout=%s, stderr=%s, err=%w", stdoutStr, stderrStr, err)
		}
	}

	resultsFile := filepath.Join(tempDir, "results.json")
	resultsData, err := os.ReadFile(resultsFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read results file: %w", err)
	}

	var rawResults []struct {
		Stdout         string `json:"stdout"`
		Stderr         string `json:"stderr"`
		ExitCode       int    `json:"exit_code"`
		TimeMs         int64  `json:"time_ms"`
		MemoryKB       int64  `json:"memory_kb"`
		TimedOut       bool   `json:"timed_out"`
		MemoryExceeded bool   `json:"memory_exceeded"`
		Error          string `json:"error"`
	}
	err = json.Unmarshal(resultsData, &rawResults)
	if err != nil {
		return nil, fmt.Errorf("failed to parse results: %w", err)
	}

	outputs := make([]*ExecutionOutput, len(rawResults))
	for i, r := range rawResults {
		outputs[i] = &ExecutionOutput{
			Stdout:         r.Stdout,
			Stderr:         r.Stderr,
			ExitCode:       r.ExitCode,
			TimeMs:         r.TimeMs,
			MemoryKB:       r.MemoryKB,
			TimedOut:       r.TimedOut,
			MemoryExceeded: r.MemoryExceeded,
			Error:          r.Error,
		}
	}

	return outputs, nil
}
