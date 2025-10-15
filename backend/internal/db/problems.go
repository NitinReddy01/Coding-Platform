package db

import (
	"app/internal/models"
	"context"
	"fmt"
	"log"
)

func AddProblem(ctx context.Context, problem models.ProblemInput) error {

	query := "INSERT INTO problems(title,description,difficulty,author_id,status,reviewed_by, reviewed_at, time_limit, memory_limit, constraints) VALUES($1,$2, $3,$4,$5,$6,$7,$8,$9,$10)"

	_, err := Pool.Exec(ctx, query, problem.Title, problem.Description, problem.Difficulty, problem.AuthorID, problem.Status, problem.TimeLimit, problem.MemoryLimit, problem.Constraints)

	return err
}

func ProblemExists(ctx context.Context, title string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM problems WHERE title = $1)`
	var exists bool
	err := Pool.QueryRow(ctx, query, title).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check problem existence: %w", err)
	}
	return exists, nil
}

// fetchTestCases fetches test cases for a given problem
func fetchTestCases(ctx context.Context, problemID string, sample bool) ([]models.TestCase, error) {
	testCaseQuery := `
		SELECT
			id, problem_id, input, expected_output,
			is_sample, order_index, explanation, created_at
		FROM test_cases
		WHERE problem_id = $1 AND is_sample = $2
		ORDER BY order_index ASC
	`

	rows, err := Pool.Query(ctx, testCaseQuery, problemID, sample)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch test cases: %w", err)
	}
	defer rows.Close()

	var testCases []models.TestCase
	for rows.Next() {
		var tc models.TestCase
		var createdAt *string

		err := rows.Scan(
			&tc.ID,
			&tc.ProblemID,
			&tc.Input,
			&tc.ExpectedOutput,
			&tc.IsSample,
			&tc.OrderIndex,
			&tc.Explanation,
			&createdAt,
		)
		if err != nil {
			log.Printf("Warning: failed to scan test case: %v", err)
			continue
		}

		testCases = append(testCases, tc)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating test cases: %w", err)
	}

	return testCases, nil
}

// fetchTags fetches tags for a given problem
func fetchTags(ctx context.Context, problemID string) ([]models.Tag, error) {
	tagQuery := `
		SELECT t.id, t.name
		FROM tags t
		INNER JOIN problem_tags pt ON t.id = pt.tag_id
		WHERE pt.problem_id = $1
	`

	tagRows, err := Pool.Query(ctx, tagQuery, problemID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tags: %w", err)
	}
	defer tagRows.Close()

	var tags []models.Tag
	for tagRows.Next() {
		var tag models.Tag
		if err := tagRows.Scan(&tag.ID, &tag.Name); err != nil {
			log.Printf("Warning: failed to scan tag: %v", err)
			continue
		}
		tags = append(tags, tag)
	}

	if err := tagRows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating tags: %w", err)
	}

	return tags, nil
}

// GetProblem fetches a problem with user-facing fields only (for practice/contests)
// Excludes admin metadata like author_id, status, reviewed_by, reviewed_at
func GetProblem(ctx context.Context, title string, sample bool) (*models.Problem, error) {
	var problem models.Problem

	problemQuery := `
		SELECT
			id, title, description, difficulty,
			created_at, updated_at, time_limit, memory_limit,
			constraints, submissions, accepted
		FROM problems
		WHERE title = $1 AND status = 'approved'
	`

	var constraints *string
	err := Pool.QueryRow(ctx, problemQuery, title).Scan(
		&problem.ID,
		&problem.Title,
		&problem.Description,
		&problem.Difficulty,
		&problem.CreatedAt,
		&problem.UpdatedAt,
		&problem.TimeLimit,
		&problem.MemoryLimit,
		&constraints,
		&problem.Submissions,
		&problem.Accepted,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch problem: %w", err)
	}

	problem.Constraints = constraints

	// Fetch test cases
	testCases, err := fetchTestCases(ctx, problem.ID, sample)
	if err != nil {
		return nil, err
	}

	if sample {
		problem.SampleTestCases = testCases
	} else {
		problem.TestCases = testCases
	}

	if problem.TestCases == nil {
		problem.TestCases = []models.TestCase{}
	}
	if problem.SampleTestCases == nil {
		problem.SampleTestCases = []models.TestCase{}
	}

	// Fetch tags
	tags, err := fetchTags(ctx, problem.ID)
	if err != nil {
		return nil, err
	}
	problem.Tags = tags

	if problem.Tags == nil {
		problem.Tags = []models.Tag{}
	}

	return &problem, nil
}

// GetProblemForAdmin fetches a problem with all fields including admin metadata
// Used for problem editing, review, and administration
func GetProblemForAdmin(ctx context.Context, title string, sample bool) (*models.Problem, error) {
	var problem models.Problem

	problemQuery := `
		SELECT
			id, title, description, difficulty, author_id, status,
			reviewed_by, reviewed_at, created_at, updated_at,
			time_limit, memory_limit, constraints, submissions, accepted
		FROM problems
		WHERE title = $1
	`

	var reviewedBy, reviewedAt, constraints *string
	err := Pool.QueryRow(ctx, problemQuery, title).Scan(
		&problem.ID,
		&problem.Title,
		&problem.Description,
		&problem.Difficulty,
		&problem.AuthorID,
		&problem.Status,
		&reviewedBy,
		&reviewedAt,
		&problem.CreatedAt,
		&problem.UpdatedAt,
		&problem.TimeLimit,
		&problem.MemoryLimit,
		&constraints,
		&problem.Submissions,
		&problem.Accepted,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch problem: %w", err)
	}

	// Set optional fields
	problem.ReviewedBy = reviewedBy
	problem.ReviewedAt = reviewedAt
	problem.Constraints = constraints

	// Fetch test cases
	testCases, err := fetchTestCases(ctx, problem.ID, sample)
	if err != nil {
		return nil, err
	}

	if sample {
		problem.SampleTestCases = testCases
	} else {
		problem.TestCases = testCases
	}

	if problem.TestCases == nil {
		problem.TestCases = []models.TestCase{}
	}
	if problem.SampleTestCases == nil {
		problem.SampleTestCases = []models.TestCase{}
	}

	// Fetch tags
	tags, err := fetchTags(ctx, problem.ID)
	if err != nil {
		return nil, err
	}
	problem.Tags = tags

	if problem.Tags == nil {
		problem.Tags = []models.Tag{}
	}

	return &problem, nil
}
