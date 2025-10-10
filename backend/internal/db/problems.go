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

func GetProblem(ctx context.Context, title string, sample bool) (*models.Problem, error) {
	var problem models.Problem

	query := `
		SELECT p.id, 
		
		t.id
		FROM problems p
		LEFT JOIN test_cases t 
			ON p.id = t.problem_id 
		AND t.is_sample = $2
		WHERE p.title = $1
		`

	rows, err := Pool.Query(ctx, query, title, sample)
	if err != nil {
		log.Fatalf("Query error: %v", err)
	}
	defer rows.Close()

	found := false
	for rows.Next() {
		found = true
		var problemID string
		var testCaseID *string
		if err := rows.Scan(&problemID, &testCaseID); err != nil {
			log.Printf("Scan error: %v", err)
			continue
		}
		fmt.Printf("Problem ID: %s, TestCase ID: %v\n", problemID, testCaseID)
	}

	if !found {
		fmt.Println("No problem found with this title.")
	}

	return &problem, nil
}
