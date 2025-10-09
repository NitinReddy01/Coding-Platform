// Package models contains the data structures used throughout the application.
// In Go, packages are the way to organize code into reusable components.
package models

import "time"

// TestCase represents a single test case for evaluating user-submitted code.
// In Go, structs are used to group related data together, similar to classes in other languages.
//
// Test cases can be either sample (visible to users) or hidden (used for final evaluation).
//
// Example for submission (minimal):
//
//	testCase := TestCase{
//	    Input:          "5\n3",
//	    ExpectedOutput: "8",
//	}
//
// Example from database (complete):
//
//	testCase := TestCase{
//	    ID:             "550e8400-e29b-41d4-a716-446655440000",
//	    ProblemID:      "650e8400-e29b-41d4-a716-446655440000",
//	    Input:          "5\n3",
//	    ExpectedOutput: "8",
//	    IsSample:       true,
//	    OrderIndex:     0,
//	    Explanation:    "This example demonstrates basic addition",
//	    CreatedAt:      time.Now(),
//	}
type TestCase struct {
	// ID is the unique identifier for this test case (from database)
	ID string `json:"id,omitempty"`

	// ProblemID is the UUID of the problem this test case belongs to
	ProblemID string `json:"problem_id,omitempty"`

	// Input is the data that will be provided to the user's code via stdin (standard input).
	// For example, if the problem asks to add two numbers, Input might be "5\n3"
	Input string `json:"input"`

	// ExpectedOutput is what the code should produce when given the Input.
	// This will be compared against the actual output to determine if the test passed.
	// The `json:"expected_output"` is a struct tag that tells Go how to serialize
	// this field when converting to/from JSON format.
	ExpectedOutput string `json:"expected_output"`

	// IsSample indicates whether this test case is visible to users (true) or hidden (false).
	// Sample test cases are shown as examples and used when users click "Run".
	// Hidden test cases are only used during final submission evaluation.
	IsSample bool `json:"is_sample,omitempty"`

	// OrderIndex specifies the display and execution order of test cases.
	// Lower numbers are shown/executed first.
	OrderIndex int `json:"order_index,omitempty"`

	// Explanation provides additional context for sample test cases (optional).
	// This is displayed to users to help them understand the test case.
	Explanation *string `json:"explanation,omitempty"`

	// CreatedAt is the timestamp when this test case was created
	CreatedAt *time.Time `json:"created_at,omitempty"`
}
