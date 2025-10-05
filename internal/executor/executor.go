// Package executor contains the core logic for executing user-submitted code
// and evaluating it against test cases with time and memory limits.
package executor

import (
	"app/internal/models"
	"context"
	"fmt"
)

// LanguageRunner is an interface that defines how to execute code for a specific language.
//
// WHAT IS AN INTERFACE IN GO?
// An interface in Go is like a contract - it specifies what methods a type must have,
// but doesn't implement them. Any type that has these methods automatically satisfies
// the interface (no explicit "implements" keyword needed like in Java).
//
// WHY USE AN INTERFACE HERE?
// This allows us to easily add support for new languages (Python, Java, C++, etc.)
// without changing the core executor code. Each language just needs to implement
// these two methods.
//
// Example: PythonRunner implements this interface by having both methods below.
type LanguageRunner interface {
	// Execute runs the given code with the provided input and returns the output
	// ctx is a context.Context used for timeouts and cancellation
	Execute(ctx context.Context, code string, input string) (*ExecutionOutput, error)

	// GetLanguageName returns the name of the language (e.g., "python", "java")
	GetLanguageName() string
}

// ExecutionOutput contains all the information about a single code execution.
// This is what a LanguageRunner returns after running code.
type ExecutionOutput struct {
	// Stdout is everything the program wrote to standard output (print statements)
	Stdout string

	// Stderr is everything the program wrote to standard error (error messages)
	Stderr string

	// ExitCode is the program's exit code (0 means success, non-zero means error)
	ExitCode int

	// TimeMs is how many milliseconds the execution took
	TimeMs int64

	// MemoryKB is how much memory (in kilobytes) the program used
	MemoryKB int64

	// TimedOut indicates if the execution was stopped due to time limit
	TimedOut bool

	// MemoryExceeded indicates if the execution used too much memory
	MemoryExceeded bool
}

// Executor is the main component that orchestrates code execution.
// It manages multiple language runners and executes submissions against test cases.
type Executor struct {
	// runners is a map (Go's version of a hash map/dictionary) that stores language runners
	// The key is the language name (string), the value is the runner (LanguageRunner interface)
	// Example: {"python": PythonRunner{...}, "java": JavaRunner{...}}
	runners map[string]LanguageRunner
}

// NewExecutor creates and returns a new Executor instance.
// In Go, constructor functions are typically named "New" or "New<Type>"
func NewExecutor() *Executor {
	return &Executor{
		// make() is Go's built-in function to create a map
		// This creates an empty map that can store LanguageRunner instances by name
		runners: make(map[string]LanguageRunner),
	}
}

// RegisterRunner adds a new language runner to the executor.
// Call this to add support for a new programming language.
//
// Example:
//
//	executor := NewExecutor()
//	pythonRunner := NewPythonRunner("/tmp", 256)
//	executor.RegisterRunner(pythonRunner)
//
// The (e *Executor) syntax means this is a method on the Executor type.
// The "e" is the receiver - like "this" or "self" in other languages.
func (e *Executor) RegisterRunner(runner LanguageRunner) {
	// Store the runner in the map using its language name as the key
	e.runners[runner.GetLanguageName()] = runner
}

// Execute runs a complete submission (code + test cases) and returns the results.
// This is the main entry point for code execution.
//
// How it works:
//  1. Find the appropriate language runner
//  2. Run the code against each test case
//  3. Collect all results and return them
//
// The (e *Executor) syntax means this is a method on the Executor type.
// The asterisk (*) before models.Submission means we accept a pointer to a Submission,
// not a copy. This is more efficient for large structs.
func (e *Executor) Execute(submission *models.Submission) (*models.ExecutionResult, error) {
	// Look up the runner for this language in our map
	// In Go, map lookup returns two values:
	// - runner: the value (if found)
	// - ok: a boolean indicating if the key exists
	runner, ok := e.runners[submission.Language]
	if !ok {
		// If the language isn't supported, return an error
		// fmt.Errorf creates a formatted error message
		return nil, fmt.Errorf("unsupported language: %s", submission.Language)
	}

	// Create the result structure that we'll populate and return
	// The & operator creates a pointer to the struct
	result := &models.ExecutionResult{
		Success:    true, // Start optimistic, will set to false if any test fails
		TestResults: make([]models.TestCaseResult, 0, len(submission.TestCases)),
		// make([]Type, length, capacity) creates a slice
		// 0 = initial length (empty), len(...) = capacity (pre-allocate space)
		TotalTests: len(submission.TestCases),
	}

	// Loop through each test case
	// In Go, "range" is used to iterate over slices, maps, etc.
	// _ is the blank identifier - we ignore the index, only care about testCase
	for _, testCase := range submission.TestCases {
		// Execute this single test case
		testResult := e.executeTestCase(runner, submission, testCase)

		// Add the result to our list
		// append() adds an element to a slice (similar to push in other languages)
		result.TestResults = append(result.TestResults, testResult)

		// Update statistics
		if testResult.Passed {
			result.TotalPassed++
		}

		// Track the maximum execution time across all test cases
		if testResult.ExecutionTime > result.MaxExecutionMs {
			result.MaxExecutionMs = testResult.ExecutionTime
		}

		// Track the maximum memory usage across all test cases
		if testResult.MemoryUsed > result.MaxMemoryKB {
			result.MaxMemoryKB = testResult.MemoryUsed
		}

		// If any test has an error and didn't pass, mark the whole submission as unsuccessful
		if testResult.Error != "" && !testResult.Passed {
			result.Success = false
		}
	}

	return result, nil
}

// executeTestCase runs code against a single test case and returns the result.
// This is a private helper method (lowercase name means private in Go).
func (e *Executor) executeTestCase(runner LanguageRunner, submission *models.Submission, testCase models.TestCase) models.TestCaseResult {
	// Create a context with timeout
	// WHAT IS CONTEXT?
	// context.Context is Go's way of handling timeouts and cancellation.
	// It's passed through function calls to allow early termination.
	//
	// context.WithTimeout creates a context that automatically cancels after the time limit
	// This ensures code execution can't run forever
	ctx, cancel := context.WithTimeout(context.Background(), timeLimitToDuration(submission.TimeLimit))

	// defer means "run this function when the current function returns"
	// This ensures we always clean up the context, even if there's an error
	defer cancel()

	// Execute the code with the test case input
	output, err := runner.Execute(ctx, submission.Code, testCase.Input)

	// Create the result structure
	testResult := models.TestCaseResult{
		Input:          testCase.Input,
		ExpectedOutput: testCase.ExpectedOutput,
		ExecutionTime:  0,
		MemoryUsed:     0,
	}

	// If there was an error during execution, record it and return
	if err != nil {
		testResult.Passed = false
		testResult.Error = err.Error()
		testResult.ActualOutput = ""
		return testResult
	}

	// Copy execution metrics from output
	testResult.ExecutionTime = output.TimeMs
	testResult.MemoryUsed = output.MemoryKB

	// Check if the code timed out
	if output.TimedOut {
		testResult.Passed = false
		testResult.Error = fmt.Sprintf("Time limit exceeded (%dms)", submission.TimeLimit)
		testResult.ActualOutput = output.Stdout
		return testResult
	}

	// Check if the code exceeded memory limit
	if output.MemoryExceeded {
		testResult.Passed = false
		testResult.Error = fmt.Sprintf("Memory limit exceeded (%dMB)", submission.MemLimit)
		testResult.ActualOutput = output.Stdout
		return testResult
	}

	// Check for runtime errors (non-zero exit code or stderr output)
	if output.ExitCode != 0 || output.Stderr != "" {
		testResult.Passed = false
		testResult.Error = fmt.Sprintf("Runtime error: %s", output.Stderr)
		testResult.ActualOutput = output.Stdout
		return testResult
	}

	// Compare actual output with expected output
	// normalizeOutput removes extra whitespace, newlines, etc. for fair comparison
	testResult.ActualOutput = normalizeOutput(output.Stdout)
	expectedOutput := normalizeOutput(testCase.ExpectedOutput)

	if testResult.ActualOutput == expectedOutput {
		testResult.Passed = true
	} else {
		testResult.Passed = false
		testResult.Error = "Output mismatch"
	}

	return testResult
}
