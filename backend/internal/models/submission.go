package models

import (
	"time"
)

// SubmissionStatus represents the current state of a submission in the database
type SubmissionStatus string

const (
	StatusPending             SubmissionStatus = "pending"
	StatusRunning             SubmissionStatus = "running"
	StatusAccepted            SubmissionStatus = "accepted"
	StatusWrongAnswer         SubmissionStatus = "wrong_answer"
	StatusTimeLimitExceeded   SubmissionStatus = "time_limit_exceeded"
	StatusMemoryLimitExceeded SubmissionStatus = "memory_limit_exceeded"
	StatusRuntimeError        SubmissionStatus = "runtime_error"
	StatusCompilationError    SubmissionStatus = "compilation_error"
)

func (s SubmissionStatus) IsValid() bool {
	switch s {
	case StatusPending, StatusRunning, StatusAccepted, StatusWrongAnswer, StatusTimeLimitExceeded, StatusMemoryLimitExceeded, StatusRuntimeError, StatusCompilationError:
		return true
	default:
		return false
	}
}

// Submission represents a database record of a code submission
type Submission struct {
	ID              string           `json:"id" db:"id"`
	UserID          string           `json:"user_id" db:"user_id"`
	ProblemID       string           `json:"problem_id" db:"problem_id"`
	Code            string           `json:"code" db:"code"`
	Language        string           `json:"language" db:"language"`
	Status          SubmissionStatus `json:"status" db:"status"`
	Type            string           `json:"type" db:"type"` // "run" or "submit"
	RuntimeMs       *int             `json:"runtime_ms,omitempty" db:"runtime_ms"`
	MemoryUsedMb    *float64         `json:"memory_used_mb,omitempty" db:"memory_used_mb"`
	TestCasesPassed int              `json:"test_cases_passed" db:"test_cases_passed"`
	TestCasesTotal  int              `json:"test_cases_total" db:"test_cases_total"`
	ErrorMessage    *string          `json:"error_message,omitempty" db:"error_message"`
	SubmittedAt     time.Time        `json:"submitted_at" db:"submitted_at"`
	CompletedAt     *time.Time       `json:"completed_at,omitempty" db:"completed_at"`
}
