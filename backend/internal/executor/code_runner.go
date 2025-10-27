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

// LanguageConfig defines configuration for a supported language.
type LanguageConfig struct {
	Extension string // File extension (e.g., ".py", ".cpp", ".js")
	ImageName string // Docker image name
}

// CodeRunner implements LanguageRunner for all supported languages using a single Docker image.
type CodeRunner struct {
	workDir        string
	memLimitMB     int
	imageBuilt     bool
	supportedLangs map[string]LanguageConfig
}

// NewCodeRunner creates a new multi-language code runner supporting multiple languages.
func NewCodeRunner(workDir string, memLimitMB int) *CodeRunner {
	return &CodeRunner{
		workDir:    workDir,
		memLimitMB: memLimitMB,
		supportedLangs: map[string]LanguageConfig{
			"python": {
				Extension: ".py",
				ImageName: "code-executor",
			},
			"cpp": {
				Extension: ".cpp",
				ImageName: "code-executor",
			},
			"javascript": {
				Extension: ".js",
				ImageName: "code-executor",
			},
			"java": {
				Extension: ".java",
				ImageName: "code-executor",
			},
		},
	}
}

// GetLanguageName returns a special identifier for multi-language runner.
// Note: This is called by the executor to register the runner, but we support multiple languages.
func (r *CodeRunner) GetLanguageName() string {
	return "code-executor" // Special identifier for multi-language code runner
}

// GetSupportedLanguages returns all languages this runner supports.
func (r *CodeRunner) GetSupportedLanguages() []string {
	langs := make([]string, 0, len(r.supportedLangs))
	for lang := range r.supportedLangs {
		langs = append(langs, lang)
	}
	return langs
}

// ensureDockerImage checks if the Docker image exists and builds it if necessary.
func (r *CodeRunner) ensureDockerImage() error {
	if r.imageBuilt {
		return nil
	}

	checkCmd := exec.Command("docker", "image", "inspect", "code-executor")
	err := checkCmd.Run()

	if err == nil {
		r.imageBuilt = true
		return nil
	}

	fmt.Println("Docker image 'code-executor' not found. Building it now...")

	buildCmd := exec.Command("docker", "build",
		"-t", "code-executor",
		"-f", "dockerfiles/code-executor.Dockerfile",
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

// ExecuteBatch runs code against multiple test cases in a single Docker container.
// Works with any supported language by using the Python wrapper script.
func (r *CodeRunner) ExecuteBatch(ctx context.Context, code string, testCases []models.TestCase, timeLimit int, memLimitMB int, language string) ([]*ExecutionOutput, error) {
	if err := r.ensureDockerImage(); err != nil {
		return nil, err
	}

	// Validate language support
	langConfig, ok := r.supportedLangs[language]
	if !ok {
		return nil, fmt.Errorf("unsupported language: %s", language)
	}

	tempDir, err := os.MkdirTemp(r.workDir, "exec-*")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Write user's code with appropriate extension
	// Java requires capital 'Solution.java' for public class Solution
	var codeFile string
	if language == "java" {
		codeFile = filepath.Join(tempDir, "Solution.java")
	} else {
		codeFile = filepath.Join(tempDir, fmt.Sprintf("solution%s", langConfig.Extension))
	}

	err = os.WriteFile(codeFile, []byte(code), 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write code file: %w", err)
	}

	// Write test cases to JSON
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

	// Write execution config
	configData := map[string]interface{}{
		"language":        language,
		"time_limit_ms":   timeLimit,
		"memory_limit_mb": memLimitMB,
	}
	configJSON, err := json.Marshal(configData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal config: %w", err)
	}

	configFile := filepath.Join(tempDir, "config.json")
	err = os.WriteFile(configFile, configJSON, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write config file: %w", err)
	}

	// Copy wrapper script to temp directory
	wrapperSource := "dockerfiles/code_wrapper.py"
	wrapperContent, err := os.ReadFile(wrapperSource)
	if err != nil {
		return nil, fmt.Errorf("failed to read wrapper script: %w", err)
	}

	wrapperFile := filepath.Join(tempDir, "wrapper.py")
	err = os.WriteFile(wrapperFile, wrapperContent, 0755)
	if err != nil {
		return nil, fmt.Errorf("failed to write wrapper script: %w", err)
	}

	// Run Docker container
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
		langConfig.ImageName,
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

	// Read results
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
