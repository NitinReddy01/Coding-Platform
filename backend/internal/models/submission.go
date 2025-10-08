package models

// Submission represents a complete code submission from a user that needs to be executed and tested.
// This is the main input structure that contains all information needed to run and evaluate code.
//
// Example JSON that maps to this struct:
//
//	{
//	  "code": "n = int(input())\nprint(n * 2)",
//	  "language": "python",
//	  "time_limit": 2000,
//	  "memory_limit": 128,
//	  "test_cases": [
//	    {"input": "5", "expected_output": "10"}
//	  ]
//	}
type Submission struct {
	// Code is the actual source code submitted by the user.
	// This will be written to a file and executed.
	Code string `json:"code"`

	// Language specifies which programming language the code is written in.
	// Currently supports "python", but the system is designed to easily add more languages.
	Language string `json:"language"`

	// TestCases is a slice (Go's version of a dynamic array) containing all test cases.
	// In Go, []TestCase means "a slice of TestCase structs"
	// Each test case will be run independently to verify the code works correctly.
	TestCases []TestCase `json:"test_cases"`

	// TimeLimit is the maximum time (in milliseconds) that code execution is allowed to take.
	// If execution exceeds this limit, it will be terminated.
	// Example: 2000 means 2 seconds maximum
	TimeLimit int `json:"time_limit"`

	// MemLimit is the maximum memory (in megabytes) that the code is allowed to use.
	// If the code tries to use more memory, it will be terminated.
	// Example: 128 means 128MB maximum
	MemLimit int `json:"memory_limit"`
}
