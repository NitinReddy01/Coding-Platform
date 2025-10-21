package models

import (
	"time"
)

type Tag struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type DifficultyLevel string

const (
	Easy   DifficultyLevel = "easy"
	Medium DifficultyLevel = "medium"
	Hard   DifficultyLevel = "hard"
)

func (d DifficultyLevel) IsValid() bool {
	switch d {
	case Easy, Medium, Hard:
		return true
	default:
		return false
	}
}

type RequestStatus string

const (
	Pending          RequestStatus = "pending"
	Rejected         RequestStatus = "rejected"
	Approved         RequestStatus = "approved"
	RequestedChanges RequestStatus = "requested_changes"
)

func (s RequestStatus) IsValid() bool {
	switch s {
	case Pending, Rejected, Approved, RequestedChanges:
		return true
	default:
		return false
	}
}

type Problem struct {
	ID              string          `json:"id"`
	Title           string          `json:"title"`
	Description     string          `json:"description"`
	Difficulty      DifficultyLevel `json:"difficulty"`
	AuthorID        string          `json:"author_id"`
	Status          RequestStatus   `json:"status"`
	ReviewedBy      *string         `json:"reviewed_by"`
	ReviewedAt      *string         `json:"reviewed_at"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	TimeLimit       int             `json:"time_limit"`   // milliseconds
	MemoryLimit     int             `json:"memory_limit"` // MB
	Constraints     *string         `json:"constraints"`
	Submissions     int             `json:"submissions"`
	Accepted        int             `json:"accepted"`
	Tags            []Tag           `json:"tags"`
	TestCases       []TestCase      `json:"test_cases"`
	SampleTestCases []TestCase      `json:"sample_test_cases"`
}

type ProblemInput struct {
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Difficulty  DifficultyLevel `json:"difficulty"`
	TimeLimit   int             `json:"time_limit"`   // milliseconds
	MemoryLimit int             `json:"memory_limit"` // MB
	Constraints *string         `json:"constraints,omitempty"`
	TestCases   []TestCase      `json:"test_cases"`
	Tags        []string        `json:"tags"`
	// Note: AuthorID and Status are set server-side based on authenticated user
}

type ProblemMode string

const (
	Contest  ProblemMode = "contest"
	Practice ProblemMode = "practice"
	Edit     ProblemMode = "edit"
)

func (m ProblemMode) IsValid() bool {
	switch m {
	case Contest, Practice, Edit:
		return true
	default:
		return false
	}
}

type ProblemListItem struct {
	ID                   string  `json:"id"`
	Title                string  `json:"title"`
	Difficulty           string  `json:"difficulty"`
	Acceptance           int16   `json:"acceptance"`
	Submissions          int16   `json:"submissions"`
	AcceptancePercentage float64 `json:"acceptance_percentage"`
}

type PaginatedProblems struct {
	Problems []ProblemListItem `json:"problems"`
	Total    uint16            `json:"total"`
	Page     uint16            `json:"page"`
	Limit    uint8             `json:"limit"`
}
