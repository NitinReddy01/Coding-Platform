package types

import "app/internal/models"

type ProblemInput struct {
	Title             string                 `json:"title"`
	Description       string                 `json:"description"`
	Difficulty        models.DifficultyLevel `json:"difficulty"`
	InputDescription  string                 `json:"input_description"`
	OutputDescription string                 `json:"output_description"`
	TimeLimit         int                    `json:"time_limit"`   // milliseconds
	MemoryLimit       int                    `json:"memory_limit"` // MB
	Constraints       *string                `json:"constraints,omitempty"`
	ValidatorCode     *string                `json:"validator_code,omitempty"`     // Optional custom validator code
	ValidatorLanguage string                 `json:"validator_language,omitempty"` // Language for validator (default: "python")
	TestCases         []models.TestCase      `json:"test_cases"`
	Tags              []string               `json:"tags"`
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
