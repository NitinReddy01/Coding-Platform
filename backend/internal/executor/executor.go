package executor

import (
	"app/internal/lib/types"
	"app/internal/models"
	"context"
	"fmt"
)

// LanguageRunner interface defines how to execute code for a specific language.
// Implementations must provide batch execution and language identification.
type LanguageRunner interface {
	// ExecuteBatch runs code against multiple test cases in a single execution
	ExecuteBatch(ctx context.Context, code string, testCases []models.TestCase, timeLimit int, memLimitMB int, language string) ([]*ExecutionOutput, error)

	// GetLanguageName returns the language identifier (e.g., "python", "java")
	GetLanguageName() string
}

// ExecutionOutput contains information about a single code execution.
type ExecutionOutput struct {
	Stdout         string
	Stderr         string
	ExitCode       int
	TimeMs         int64
	MemoryKB       int64
	TimedOut       bool
	MemoryExceeded bool
	Error          string // System error, not user code error
}

// Executor orchestrates code execution across multiple language runners.
type Executor struct {
	runners map[string]LanguageRunner
}

// NewExecutor creates a new Executor with the code runner supporting all languages.
func NewExecutor(workDir string, memLimitMB int) *Executor {
	runners := make(map[string]LanguageRunner)

	// Use code runner for all languages
	codeRunner := NewCodeRunner(workDir, memLimitMB)

	// Register the code runner for each supported language
	for _, lang := range codeRunner.GetSupportedLanguages() {
		runners[lang] = codeRunner
	}

	return &Executor{
		runners: runners,
	}
}


// Execute runs a submission against all test cases and returns results.
func (e *Executor) Execute(submission *types.Submission) (*models.ExecutionResult, error) {
	runner, ok := e.runners[submission.Language]
	if !ok {
		return nil, fmt.Errorf("unsupported language: %s", submission.Language)
	}

	// Add buffer for Docker container overhead
	dockerOverheadBuffer := 10000
	contextTimeout := timeLimitToDuration(submission.TimeLimit*len(submission.TestCases) + dockerOverheadBuffer)
	ctx, cancel := context.WithTimeout(context.Background(), contextTimeout)
	defer cancel()

	outputs, err := runner.ExecuteBatch(ctx, submission.Code, submission.TestCases, submission.TimeLimit, submission.MemLimit, submission.Language)
	if err != nil {
		return nil, fmt.Errorf("batch execution failed: %w", err)
	}

	result := &models.ExecutionResult{
		Success:     true,
		TestResults: make([]models.TestCaseResult, 0, len(submission.TestCases)),
		TotalTests:  len(submission.TestCases),
	}

	for i, testCase := range submission.TestCases {
		if i >= len(outputs) {
			result.TestResults = append(result.TestResults, models.TestCaseResult{
				Input:          testCase.Input,
				ExpectedOutput: testCase.ExpectedOutput,
				ActualOutput:   "",
				Passed:         false,
				Error:          "Execution did not produce result for this test case",
			})
			result.Success = false
			continue
		}

		output := outputs[i]
		testResult := e.processTestCaseOutput(testCase, output, submission.TimeLimit, submission.MemLimit)
		result.TestResults = append(result.TestResults, testResult)

		if testResult.Passed {
			result.TotalPassed++
		}

		if testResult.ExecutionTime > result.MaxExecutionMs {
			result.MaxExecutionMs = testResult.ExecutionTime
		}

		if testResult.MemoryUsed > result.MaxMemoryKB {
			result.MaxMemoryKB = testResult.MemoryUsed
		}

		if testResult.Error != "" && !testResult.Passed {
			result.Success = false
		}
	}

	// Check if there's a compilation error (all test cases fail with "Compilation error")
	if len(result.TestResults) > 0 && result.TestResults[0].Error == "Compilation error" {
		// Extract the actual compiler error from stderr
		if len(outputs) > 0 && outputs[0].Stderr != "" {
			result.CompileError = outputs[0].Stderr
		}
	}

	return result, nil
}

// processTestCaseOutput evaluates execution output against expected results.
func (e *Executor) processTestCaseOutput(testCase models.TestCase, output *ExecutionOutput, timeLimit int, memLimit int) models.TestCaseResult {
	testResult := models.TestCaseResult{
		Input:          testCase.Input,
		ExpectedOutput: testCase.ExpectedOutput,
		ExecutionTime:  output.TimeMs,
		MemoryUsed:     output.MemoryKB,
	}

	if output.Error != "" {
		testResult.Passed = false
		testResult.Error = output.Error
		testResult.ActualOutput = output.Stdout
		return testResult
	}

	if output.TimedOut {
		testResult.Passed = false
		testResult.Error = fmt.Sprintf("Time limit exceeded (%dms)", timeLimit)
		testResult.ActualOutput = output.Stdout
		return testResult
	}

	if output.MemoryExceeded {
		testResult.Passed = false
		testResult.Error = fmt.Sprintf("Memory limit exceeded (%dMB)", memLimit)
		testResult.ActualOutput = output.Stdout
		return testResult
	}

	if output.ExitCode != 0 || output.Stderr != "" {
		testResult.Passed = false
		testResult.Error = fmt.Sprintf("Runtime error: %s", output.Stderr)
		testResult.ActualOutput = output.Stdout
		return testResult
	}

	testResult.ActualOutput = normalizeOutput(output.Stdout)
	expectedOutput := normalizeOutput(testCase.ExpectedOutput)

	if testResult.ActualOutput == expectedOutput {
		testResult.Passed = true
	} else {
		testResult.Passed = false
		// No error set - wrong answer is not an error, frontend will show both outputs
	}

	return testResult
}
