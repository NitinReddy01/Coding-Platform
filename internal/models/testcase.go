// Package models contains the data structures used throughout the application.
// In Go, packages are the way to organize code into reusable components.
package models

// TestCase represents a single test case for evaluating user-submitted code.
// In Go, structs are used to group related data together, similar to classes in other languages.
//
// Example:
//
//	testCase := TestCase{
//	    Input:          "5\n3",
//	    ExpectedOutput: "8",
//	}
type TestCase struct {
	// Input is the data that will be provided to the user's code via stdin (standard input).
	// For example, if the problem asks to add two numbers, Input might be "5\n3"
	Input string `json:"input"`

	// ExpectedOutput is what the code should produce when given the Input.
	// This will be compared against the actual output to determine if the test passed.
	// The `json:"expected_output"` is a struct tag that tells Go how to serialize
	// this field when converting to/from JSON format.
	ExpectedOutput string `json:"expected_output"`
}
