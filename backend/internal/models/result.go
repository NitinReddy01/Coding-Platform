package models

// TestCaseResult represents the outcome of running user code against a single test case.
// After executing the code with a specific input, this struct contains all the details
// about what happened during that execution.
//
// Example:
//
//	result := TestCaseResult{
//	    Passed:         true,
//	    Input:          "5",
//	    ExpectedOutput: "10",
//	    ActualOutput:   "10",
//	    ExecutionTime:  45,
//	    MemoryUsed:     2048,
//	}
type TestCaseResult struct {
	// Passed indicates whether the test case succeeded.
	// true means the actual output matched the expected output
	// false means there was a mismatch, timeout, memory limit, or error
	Passed bool `json:"passed"`

	// Input is the test case input that was provided to the code
	Input string `json:"input"`

	// ExpectedOutput is what the output should have been
	ExpectedOutput string `json:"expected_output"`

	// ActualOutput is what the code actually produced when run
	ActualOutput string `json:"actual_output"`

	// ExecutionTime is how long (in milliseconds) it took for the code to run
	// This helps identify if code is efficient or too slow
	ExecutionTime int64 `json:"execution_time"`

	// MemoryUsed is how much memory (in kilobytes) the code consumed during execution
	MemoryUsed int64 `json:"memory_used"`

	// Error contains any error message if the test case failed
	// The `omitempty` tag means this field won't appear in JSON if it's empty
	// Common errors: "Output mismatch", "Time limit exceeded", "Runtime error: ..."
	Error string `json:"error,omitempty"`
}

// ExecutionResult represents the complete results of executing code against all test cases.
// This is the final output that tells you how well the submitted code performed overall.
//
// Example:
//
//	result := ExecutionResult{
//	    Success:      true,
//	    TotalPassed:  3,
//	    TotalTests:   3,
//	    TestResults:  []TestCaseResult{...},
//	    MaxExecutionMs: 120,
//	    MaxMemoryKB:    4096,
//	}
type ExecutionResult struct {
	// Success indicates if ALL test cases passed without any errors
	// true only if every single test case passed
	Success bool `json:"success"`

	// TestResults is a slice containing the result of each individual test case
	// In Go, []TestCaseResult means "a slice (dynamic array) of TestCaseResult structs"
	TestResults []TestCaseResult `json:"test_results"`

	// TotalPassed is the count of how many test cases passed
	TotalPassed int `json:"total_passed"`

	// TotalTests is the total number of test cases that were run
	TotalTests int `json:"total_tests"`

	// CompileError contains compilation error messages (for compiled languages like C++, Java)
	// Currently not used for Python, but included for future language support
	// The `omitempty` tag means this won't appear in JSON if empty
	CompileError string `json:"compile_error,omitempty"`

	// RuntimeError contains any runtime errors that occurred during execution
	// The `omitempty` tag means this won't appear in JSON if empty
	RuntimeError string `json:"runtime_error,omitempty"`

	// MaxExecutionMs is the longest execution time (in milliseconds) among all test cases
	// Useful for understanding the worst-case performance
	MaxExecutionMs int64 `json:"max_execution_ms"`

	// MaxMemoryKB is the highest memory usage (in kilobytes) among all test cases
	// Useful for understanding peak memory requirements
	MaxMemoryKB int64 `json:"max_memory_kb"`
}
