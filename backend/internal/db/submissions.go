package db

import (
	"app/internal/lib/types"
	"app/internal/models"
	"context"
	"fmt"
	"time"
)

func AddSubmission(
	ctx context.Context,
	userId string,
	problemId string,
	code string,
	language string,
	submissionType types.SubmissionType,
	totalTestCases int,
) (string, error) {
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
		return "", fmt.Errorf("failed to insert submission: %w", err)
	}

	return submissionId, nil
}

func UpdateSubmissionStatus(ctx context.Context, submissionId string, status models.SubmissionStatus) error {
	if !status.IsValid() {
		return fmt.Errorf("invalid submission status %v", status)
	}
	query := `
		UPDATE submissions
		SET status = $1
		WHERE id = $2
	`
	result, err := Pool.Exec(ctx, query, string(status), submissionId)
	if err != nil {
		return fmt.Errorf("failed to update submission status: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("submission with id %s not found", submissionId)
	}

	return nil
}

func GetSubmissionStatus(ctx context.Context, submissionId string, userId string) (*models.Submission, error) {
	query := `
		SELECT
			status, runtime_ms, memory_used_mb, test_cases_passed, test_cases_total, error_message
		FROM submissions
		WHERE id = $1 AND user_id = $2
	`

	var submission models.Submission
	err := Pool.QueryRow(ctx, query, submissionId, userId).Scan(
		&submission.Status,
		&submission.RuntimeMs,
		&submission.MemoryUsedMb,
		&submission.TestCasesPassed,
		&submission.TestCasesTotal,
		&submission.ErrorMessage,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to fetch submission status: %w", err)
	}

	return &submission, nil
}

func SaveSubmissionResult(ctx context.Context, submissionId string, result *models.ExecutionResult) error {
	// KB to MB
	memoryUsedMb := float64(result.MaxMemoryKB) / 1024.0

	var errorMessage *string
	if result.CompileError != "" {
		errorMessage = &result.CompileError
	} else if result.RuntimeError != "" {
		errorMessage = &result.RuntimeError
	} else {
		for _, testResult := range result.TestResults {
			if !testResult.Passed && testResult.Error != "" {
				errorMessage = &testResult.Error
				break
			}
		}
	}

	query := `
		UPDATE submissions
		SET
			runtime_ms = $1,
			memory_used_mb = $2,
			test_cases_passed = $3,
			error_message = $4,
			completed_at = NOW()
		WHERE id = $5
	`

	result_exec, err := Pool.Exec(ctx, query,
		result.MaxExecutionMs,
		memoryUsedMb,
		result.TotalPassed,
		errorMessage,
		submissionId,
	)

	if err != nil {
		return fmt.Errorf("failed to save submission result: %w", err)
	}

	if result_exec.RowsAffected() == 0 {
		return fmt.Errorf("submission with id %s not found", submissionId)
	}

	return nil
}

func GetLatestSubmissionForProblem(ctx context.Context, userId string, problemId string) (*models.Submission, error) {
	query := `
		SELECT
			id, code, language, submitted_at
		FROM submissions
		WHERE user_id = $1 AND problem_id = $2
		ORDER BY submitted_at DESC
		LIMIT 1
	`

	var submission models.Submission
	err := Pool.QueryRow(ctx, query, userId, problemId).Scan(
		&submission.ID,
		&submission.Code,
		&submission.Language,
		&submission.SubmittedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to fetch latest submission: %w", err)
	}

	return &submission, nil
}
