package executor

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type CustomCodeValidator struct {
	validatorCode     string
	validatorLanguage string
	dockerImage       string
	timeoutSeconds    int
	memoryLimitMB     int
}

func NewCustomCodeValidator(validatorCode, validatorLanguage string) *CustomCodeValidator {
	return &CustomCodeValidator{
		validatorCode:     validatorCode,
		validatorLanguage: validatorLanguage,
		dockerImage:       "python-executor",
		timeoutSeconds:    5,
		memoryLimitMB:     128,
	}
}

type ValidatorInput struct {
	Input    string `json:"input"`
	Expected string `json:"expected"`
	Actual   string `json:"actual"`
}

type ValidatorOutput struct {
	Passed bool `json:"passed"`
}

type ValidatorResult struct {
	Passed      bool
	DebugOutput string
}

func (v *CustomCodeValidator) Validate(ctx context.Context, input, expected, actual string) (bool, error) {

	tempDir, err := os.MkdirTemp("", "validator-*")
	if err != nil {
		return false, fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	validatorPath := filepath.Join(tempDir, "validator.py")
	if err := os.WriteFile(validatorPath, []byte(v.validatorCode), 0644); err != nil {
		return false, fmt.Errorf("failed to write validator code: %w", err)
	}

	validatorInput := ValidatorInput{
		Input:    input,
		Expected: expected,
		Actual:   actual,
	}
	inputJSON, err := json.Marshal(validatorInput)
	if err != nil {
		return false, fmt.Errorf("failed to marshal validator input: %w", err)
	}

	execCtx, cancel := context.WithTimeout(ctx, time.Duration(v.timeoutSeconds)*time.Second)
	defer cancel()

	containerName := fmt.Sprintf("validator-%d-%d", time.Now().UnixNano(), rand.Intn(10000))

	dockerArgs := []string{
		"run",
		"-i",
		"--rm",
		"--name", containerName,
		"--network", "none",
		"--memory", fmt.Sprintf("%dm", v.memoryLimitMB),
		"--memory-swap", fmt.Sprintf("%dm", v.memoryLimitMB),
		"--cpus", "0.5",
		"--pids-limit", "50",
		"-v", fmt.Sprintf("%s:/workspace:ro", tempDir),
		"-w", "/workspace",
		v.dockerImage,
		"python", "validator.py",
	}

	cmd := exec.CommandContext(execCtx, "docker", dockerArgs...)
	cmd.Stdin = strings.NewReader(string(inputJSON))

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err = cmd.Run()

	stdoutStr := stdout.String()
	stderrStr := stderr.String()

	// Handle timeout
	if execCtx.Err() == context.DeadlineExceeded {
		// Ensure container is killed
		killCmd := exec.Command("docker", "kill", containerName)
		_ = killCmd.Run()
		return false, fmt.Errorf("validator execution timed out after %d seconds", v.timeoutSeconds)
	}

	// Handle execution errors
	if err != nil {
		// Check if this is a Docker system error vs validator error
		if strings.Contains(err.Error(), "executable file not found") ||
			strings.Contains(err.Error(), "Cannot connect to the Docker daemon") {
			return false, fmt.Errorf("docker system error: %w", err)
		}
		// Include both stdout and stderr in error message
		return false, fmt.Errorf("validator execution failed: %w, stdout: %s, stderr: %s", err, stdoutStr, stderrStr)
	}

	// Parse validator output from stdout only
	var validatorOutput ValidatorOutput
	if err := json.Unmarshal([]byte(stdoutStr), &validatorOutput); err != nil {
		return false, fmt.Errorf("failed to parse validator output: %w, stdout: %s, stderr: %s", err, stdoutStr, stderrStr)
	}

	return validatorOutput.Passed, nil
}

// ValidateWithDebug runs the validator and returns both result and debug output
func (v *CustomCodeValidator) ValidateWithDebug(ctx context.Context, input, expected, actual string) (*ValidatorResult, error) {
	// Create temp directory for validator execution
	tempDir, err := os.MkdirTemp("", "validator-*")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Write validator code to file
	validatorPath := filepath.Join(tempDir, "validator.py")
	if err := os.WriteFile(validatorPath, []byte(v.validatorCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write validator code: %w", err)
	}

	// Prepare validator input JSON
	validatorInput := ValidatorInput{
		Input:    input,
		Expected: expected,
		Actual:   actual,
	}
	inputJSON, err := json.Marshal(validatorInput)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal validator input: %w", err)
	}

	// Create context with timeout
	execCtx, cancel := context.WithTimeout(ctx, time.Duration(v.timeoutSeconds)*time.Second)
	defer cancel()

	// Generate unique container name for tracking
	containerName := fmt.Sprintf("validator-%d-%d", time.Now().UnixNano(), rand.Intn(10000))

	// Build Docker command with -i flag for stdin
	dockerArgs := []string{
		"run",
		"-i", // Keep stdin open for JSON input
		"--rm",
		"--name", containerName,
		"--network", "none",
		"--memory", fmt.Sprintf("%dm", v.memoryLimitMB),
		"--memory-swap", fmt.Sprintf("%dm", v.memoryLimitMB),
		"--cpus", "0.5",
		"--pids-limit", "50",
		"-v", fmt.Sprintf("%s:/workspace:ro", tempDir),
		"-w", "/workspace",
		v.dockerImage,
		"python", "validator.py",
	}

	cmd := exec.CommandContext(execCtx, "docker", dockerArgs...)
	cmd.Stdin = strings.NewReader(string(inputJSON))

	// Separate stdout and stderr for proper JSON parsing
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Execute validator
	err = cmd.Run()

	// Get output strings
	stdoutStr := stdout.String()
	stderrStr := stderr.String()

	result := &ValidatorResult{
		Passed:      false,
		DebugOutput: stderrStr,
	}

	// Handle timeout
	if execCtx.Err() == context.DeadlineExceeded {
		// Ensure container is killed
		killCmd := exec.Command("docker", "kill", containerName)
		_ = killCmd.Run()
		return result, fmt.Errorf("validator execution timed out after %d seconds", v.timeoutSeconds)
	}

	// Handle execution errors
	if err != nil {
		// Check if this is a Docker system error vs validator error
		if strings.Contains(err.Error(), "executable file not found") ||
			strings.Contains(err.Error(), "Cannot connect to the Docker daemon") {
			return result, fmt.Errorf("docker system error: %w", err)
		}
		// Return validator error with debug output
		return result, fmt.Errorf("validator execution failed: %w", err)
	}

	// Parse validator output from stdout only
	var validatorOutput ValidatorOutput
	if err := json.Unmarshal([]byte(stdoutStr), &validatorOutput); err != nil {
		return result, fmt.Errorf("failed to parse validator output: %w, stdout: %s", err, stdoutStr)
	}

	result.Passed = validatorOutput.Passed
	return result, nil
}
