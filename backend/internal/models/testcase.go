package models

import "time"

type TestCase struct {
	ID             string     `json:"id,omitempty"`
	ProblemID      string     `json:"problem_id,omitempty"`
	Input          string     `json:"input"`
	ExpectedOutput string     `json:"expected_output"`
	IsSample       bool       `json:"is_sample,omitempty"`
	OrderIndex     int        `json:"order_index,omitempty"`
	Explanation    *string    `json:"explanation,omitempty"`
	CreatedAt      *time.Time `json:"created_at,omitempty"`
}
