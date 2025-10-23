package db

import (
	"app/internal/lib/types"
	"context"
	"fmt"
	"time"
)

// AddSubmission inserts a new submission record into the database with status='pending'
// Returns the submission ID and timestamp for frontend polling
func AddSubmission(
	ctx context.Context,
	userId string,
	problemId string,
	code string,
	language string,
	submissionType types.SubmissionType,
	totalTestCases int,
) (string, string, error) {
	query := `
		INSERT INTO submissions(
			user_id, problem_id, code, language, status, type, test_cases_total
		) VALUES($1, $2, $3, $4, 'pending', $5, $6)
		RETURNING id, submitted_at
	`

	var submissionId string
	var submittedAt time.Time

	err := Pool.QueryRow(ctx, query,
		userId,
		problemId,
		code,
		language,
		submissionType,
		totalTestCases,
	).Scan(&submissionId, &submittedAt)

	if err != nil {
		return "", "", fmt.Errorf("failed to insert submission: %w", err)
	}

	// Format timestamp as ISO 8601 string for JSON response
	submittedAtStr := submittedAt.Format(time.RFC3339)

	return submissionId, submittedAtStr, nil
}
