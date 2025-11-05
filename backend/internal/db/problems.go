package db

import (
	"app/internal/lib/types"
	"app/internal/models"
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
)

func AddProblem(ctx context.Context, problem types.ProblemInput, authorID string, status models.RequestStatus) error {
	// Start a transaction to ensure all inserts succeed or fail together
	tx, err := Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx) // Rollback if not committed

	// Insert the problem and get the generated ID
	var problemID string
	problemQuery := `
		INSERT INTO problems(
			title, description, difficulty, author_id, status,
			time_limit, memory_limit, constraints, input_description, output_description,
			validator_code, validator_language
		) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`

	validatorLanguage := problem.ValidatorLanguage
	if validatorLanguage == "" {
		validatorLanguage = "python"
	}

	err = tx.QueryRow(ctx, problemQuery,
		problem.Title,
		problem.Description,
		problem.Difficulty,
		authorID,
		status,
		problem.TimeLimit,
		problem.MemoryLimit,
		problem.Constraints,
		problem.InputDescription,
		problem.OutputDescription,
		problem.ValidatorCode,
		validatorLanguage,
	).Scan(&problemID)

	if err != nil {
		return fmt.Errorf("failed to insert problem: %w", err)
	}

	// Insert test cases
	if len(problem.TestCases) > 0 {
		err = insertTestCases(ctx, tx, problemID, problem.TestCases)
		if err != nil {
			return fmt.Errorf("failed to insert test cases: %w", err)
		}
	}

	// Handle tags: get or create tags, then link to problem
	if len(problem.Tags) > 0 {
		tagIDs, err := upsertTags(ctx, tx, problem.Tags)
		if err != nil {
			return fmt.Errorf("failed to upsert tags: %w", err)
		}

		err = linkProblemTags(ctx, tx, problemID, tagIDs)
		if err != nil {
			return fmt.Errorf("failed to link problem tags: %w", err)
		}
	}

	// Commit the transaction
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
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
func FetchTestCases(ctx context.Context, problemID string, sample bool) ([]models.TestCase, error) {
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

		err := rows.Scan(
			&tc.ID,
			&tc.ProblemID,
			&tc.Input,
			&tc.ExpectedOutput,
			&tc.IsSample,
			&tc.OrderIndex,
			&tc.Explanation,
			&tc.CreatedAt,
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
			constraints, submissions, accepted, input_description, output_description,
			validator_code, validator_language
		FROM problems
		WHERE title = $1 AND status = 'approved'
	`

	var constraints *string
	var validatorCode *string
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
		&problem.InputDescription,
		&problem.OutputDescription,
		&validatorCode,
		&problem.ValidatorLanguage,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch problem: %w", err)
	}

	problem.Constraints = constraints
	problem.ValidatorCode = validatorCode

	// Fetch test cases
	testCases, err := FetchTestCases(ctx, problem.ID, sample)
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
			time_limit, memory_limit, constraints, submissions, accepted, input_description, output_description,
			validator_code, validator_language
		FROM problems
		WHERE title = $1
	`

	var reviewedBy, reviewedAt, constraints *string
	var validatorCode *string
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
		&problem.InputDescription,
		&problem.OutputDescription,
		&validatorCode,
		&problem.ValidatorLanguage,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch problem: %w", err)
	}

	// Set optional fields
	problem.ReviewedBy = reviewedBy
	problem.ReviewedAt = reviewedAt
	problem.Constraints = constraints
	problem.ValidatorCode = validatorCode

	// Fetch test cases
	testCases, err := FetchTestCases(ctx, problem.ID, sample)
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

// GetProblemLimits fetches time and memory limits for a problem by ID
func GetProblemLimits(ctx context.Context, problemID string) (timeLimit int, memoryLimit int, err error) {
	query := `SELECT time_limit, memory_limit FROM problems WHERE id = $1`
	err = Pool.QueryRow(ctx, query, problemID).Scan(&timeLimit, &memoryLimit)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to fetch problem limits: %w", err)
	}
	return timeLimit, memoryLimit, nil
}

// GetProblemValidator fetches validator code and language for a problem by ID
func GetProblemValidator(ctx context.Context, problemID string) (validatorCode *string, validatorLanguage string, err error) {
	query := `SELECT validator_code, validator_language FROM problems WHERE id = $1`
	err = Pool.QueryRow(ctx, query, problemID).Scan(&validatorCode, &validatorLanguage)
	if err != nil {
		return nil, "", fmt.Errorf("failed to fetch problem validator: %w", err)
	}
	return validatorCode, validatorLanguage, nil
}

func FecthProblems(ctx context.Context, offset uint16, limit uint8) (*types.PaginatedProblems, error) {
	query := `
		SELECT
			id, title, difficulty, accepted, submissions,
			CASE
				WHEN submissions > 0
				THEN ROUND((accepted::decimal / submissions) * 100, 2)
				ELSE 0
   			END AS acceptance_percentage
		FROM problems
		where status = 'approved'
		ORDER BY created_at ASC
		LIMIT $1 OFFSET $2
	`

	problemRows, err := Pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tags: %w", err)
	}
	defer problemRows.Close()

	problems := make([]types.ProblemListItem, 0, limit)

	for problemRows.Next() {
		var problem types.ProblemListItem

		if err := problemRows.Scan(&problem.ID, &problem.Title, &problem.Difficulty, &problem.Acceptance, &problem.Submissions, &problem.AcceptancePercentage); err != nil {
			return nil, fmt.Errorf("failed to fetch problem: %w", err)
		}

		problems = append(problems, problem)
	}

	if err := problemRows.Err(); err != nil {
		return nil, fmt.Errorf("iteration error: %w", err)
	}

	var total uint16

	err = Pool.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM problems
		WHERE status = 'approved'
	`).Scan(&total)

	if err != nil {
		return nil, fmt.Errorf("failed to count problems: %w", err)
	}

	paginatedProblems := &types.PaginatedProblems{
		Problems: problems,
		Total:    total,
		Page:     1,
		Limit:    limit,
	}

	return paginatedProblems, nil
}

// insertTestCases inserts test cases for a problem within a transaction
func insertTestCases(ctx context.Context, tx pgx.Tx, problemID string, testCases []models.TestCase) error {
	testCaseQuery := `
		INSERT INTO test_cases(
			problem_id, input, expected_output, is_sample, order_index, explanation
		) VALUES($1, $2, $3, $4, $5, $6)
	`

	for _, tc := range testCases {
		_, err := tx.Exec(ctx, testCaseQuery,
			problemID,
			tc.Input,
			tc.ExpectedOutput,
			tc.IsSample,
			tc.OrderIndex,
			tc.Explanation,
		)
		if err != nil {
			return fmt.Errorf("failed to insert test case: %w", err)
		}
	}

	return nil
}

// upsertTags gets existing tag IDs or creates new tags, returns all tag IDs
func upsertTags(ctx context.Context, tx pgx.Tx, tagNames []string) ([]string, error) {
	tagIDs := make([]string, 0, len(tagNames))

	for _, tagName := range tagNames {
		var tagID string

		// Try to get existing tag
		selectQuery := `SELECT id FROM tags WHERE name = $1`
		err := tx.QueryRow(ctx, selectQuery, tagName).Scan(&tagID)

		if err != nil {
			// Tag doesn't exist, create it
			insertQuery := `INSERT INTO tags(name) VALUES($1) RETURNING id`
			err = tx.QueryRow(ctx, insertQuery, tagName).Scan(&tagID)
			if err != nil {
				return nil, fmt.Errorf("failed to insert tag '%s': %w", tagName, err)
			}
		}

		tagIDs = append(tagIDs, tagID)
	}

	return tagIDs, nil
}

// linkProblemTags creates associations between a problem and tags
func linkProblemTags(ctx context.Context, tx pgx.Tx, problemID string, tagIDs []string) error {
	linkQuery := `INSERT INTO problem_tags(problem_id, tag_id) VALUES($1, $2)`

	for _, tagID := range tagIDs {
		_, err := tx.Exec(ctx, linkQuery, problemID, tagID)
		if err != nil {
			return fmt.Errorf("failed to link tag %s to problem: %w", tagID, err)
		}
	}

	return nil
}
