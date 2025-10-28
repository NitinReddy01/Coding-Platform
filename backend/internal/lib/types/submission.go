package types

import "app/internal/models"

type SubmissionType string

const (
	Run    SubmissionType = "run"
	Submit SubmissionType = "submit"
)

func (s SubmissionType) IsValid() bool {
	switch s {
	case Run, Submit:
		return true
	default:
		return false
	}
}

type SubmissionRequest struct {
	ProblemId string         `json:"problem_id"`
	Code      string         `json:"code"`
	Language  string         `json:"language"`
	Type      SubmissionType `json:"type"`
}

type Submission struct {
	SubmissionId string            `json:"submission_id"`
	Code         string            `json:"code"`
	Language     string            `json:"language"`
	TestCases    []models.TestCase `json:"test_cases"`
	TimeLimit    int               `json:"time_limit"`
	MemLimit     int               `json:"memory_limit"`
}

type SubmissionResponse struct {
	SubmissionId string `json:"submission_id"`
	SubmittedAt  string `json:"submitted_at"`
}

// SubmissionStatusResponse represents the lightweight polling response for checking submission status
// Used by frontend to poll submission progress and completion
// Note: No progressive test case updates - status changes from pending -> running -> final state
type SubmissionStatusResponse struct {
	Status            string                  `json:"status"`                        // Current status: pending, running, accepted, etc.
	RuntimeMs         *int                    `json:"runtime_ms,omitempty"`          // Max runtime in milliseconds (only when complete)
	MemoryUsedMb      *float64                `json:"memory_used_mb,omitempty"`      // Max memory used in MB (only when complete)
	TestCasesPassed   *int                    `json:"test_cases_passed,omitempty"`   // Number of test cases passed (only when complete)
	TestCasesTotal    *int                    `json:"test_cases_total,omitempty"`    // Total number of test cases (only when complete)
	ErrorMessage      *string                 `json:"error_message,omitempty"`       // Error message if any (only on error statuses)
	SampleTestResults []models.TestCaseResult `json:"sample_test_results,omitempty"` // Results for sample test cases only (for debugging)
}

// LatestSubmissionResponse represents the user's most recent submission for a problem
// Used by frontend to populate the code editor with previous work
type LatestSubmissionResponse struct {
	Code        string `json:"code"`         // The code from the latest submission
	Language    string `json:"language"`     // Programming language used
	SubmittedAt string `json:"submitted_at"` // ISO 8601 timestamp of submission
}

type UpdateStatusRequest struct {
	Status string `json:"status"`
}

type SaveResultRequest struct {
	Success           bool                    `json:"success"`
	CompileError      string                  `json:"compile_error,omitempty"`
	RuntimeError      string                  `json:"runtime_error,omitempty"`
	MaxExecutionMs    int64                   `json:"max_execution_ms"`
	MaxMemoryKB       int64                   `json:"max_memory_kb"`
	TotalPassed       int                     `json:"total_passed"`
	TestResults       []models.TestCaseResult `json:"test_results"`
	SampleTestResults []models.TestCaseResult `json:"sample_test_results,omitempty"` // Only sample test results for debugging
}
