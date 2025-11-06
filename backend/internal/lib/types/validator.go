package types

import "app/internal/models"

// ValidateValidatorRequest represents the request body for validator testing
type ValidateValidatorRequest struct {
	ValidatorCode     string            `json:"validator_code"`
	ValidatorLanguage string            `json:"validator_language"`
	TestCases         []models.TestCase `json:"test_cases"`
}

// ValidatorTestResult represents the result of testing a validator against a test case
type ValidatorTestResult struct {
	TestCaseID  string `json:"test_case_id"`
	Input       string `json:"input"`
	Expected    string `json:"expected"`
	Passed      bool   `json:"passed"`
	Error       string `json:"error,omitempty"`
	DebugOutput string `json:"debug_output,omitempty"` // stderr from validator
	IsSample    bool   `json:"is_sample"`               // whether this is a sample test case
	OrderIndex  int    `json:"order_index"`
}

// ValidateValidatorResponse represents the response for validator testing
type ValidateValidatorResponse struct {
	Valid   bool                  `json:"valid"`
	Results []ValidatorTestResult `json:"results"`
	Message string                `json:"message,omitempty"`
}
