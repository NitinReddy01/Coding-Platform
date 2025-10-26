package main

import (
	"app/internal/config"
	"app/internal/db"
	"app/internal/executor"
	"app/internal/lib/types"
	"app/internal/models"
	"app/internal/services/queue"
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	cfg := config.Load()

	workDir := filepath.Join(os.TempDir(), "code-executor")
	err := os.MkdirAll(workDir, 0755)
	if err != nil {
		log.Fatalf("Failed to create work directory: %v", err)
	}

	defaultMemLimit := 256
	exec := executor.NewExecutor(workDir, defaultMemLimit)

	log.Println("Code execution worker starting...")
	log.Printf("Work directory: %s", workDir)
	log.Printf("RabbitMQ URL: %s", cfg.RabbitMQURL)

	db.Connect(cfg.DB_URL)
	ctx := context.Background()

	handleSubmission := func(submission *types.Submission) error {
		if submission.TimeLimit == 0 {
			submission.TimeLimit = 5000
		}
		if submission.MemLimit == 0 {
			submission.MemLimit = 256
		}

		err := db.UpdateSubmissionStatus(ctx, submission.SubmissionId, models.StatusRunning)
		if err != nil {
			log.Printf("Failed to update status to running: %v", err)
			return fmt.Errorf("failed to update status: %w", err)
		}

		result, err := exec.Execute(submission)
		if err != nil {
			log.Printf("Execution failed for submission %s: %v", submission.SubmissionId, err)
			if updateErr := db.UpdateSubmissionStatus(ctx, submission.SubmissionId, models.StatusRuntimeError); updateErr != nil {
				log.Printf("Failed to update status to runtime error: %v", updateErr)
			}
			return fmt.Errorf("execution failed: %w", err)
		}

		// Determine final status based on execution results
		var finalStatus models.SubmissionStatus

		if result.CompileError != "" {
			finalStatus = models.StatusCompilationError
		} else if result.RuntimeError != "" {
			finalStatus = models.StatusRuntimeError
		} else if result.Success {
			finalStatus = models.StatusAccepted
		} else {
			// Check individual test results to determine specific failure reason
			finalStatus = models.StatusWrongAnswer // default
			for _, testResult := range result.TestResults {
				if strings.Contains(testResult.Error, "Time limit exceeded") {
					finalStatus = models.StatusTimeLimitExceeded
					break
				}
				if strings.Contains(testResult.Error, "Memory limit exceeded") {
					finalStatus = models.StatusMemoryLimitExceeded
					break
				}
			}
		}

		err = db.UpdateSubmissionStatus(ctx, submission.SubmissionId, finalStatus)
		if err != nil {
			log.Printf("Failed to update final status to %s: %v", finalStatus, err)
			return fmt.Errorf("failed to update final status: %w", err)
		}

		// Store detailed results in database
		err = db.SaveSubmissionResult(ctx, submission.SubmissionId, result)
		if err != nil {
			log.Printf("Failed to save submission result: %v", err)
			return fmt.Errorf("failed to save submission result: %w", err)
		}

		return nil
	}

	if err := queue.Receive(cfg.RabbitMQURL, handleSubmission); err != nil {
		log.Fatalf("Queue receiver error: %v", err)
	}
}
