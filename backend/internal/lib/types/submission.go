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
