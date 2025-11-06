package main

import (
	"app/internal/config"
	"app/internal/executor"
	"app/internal/lib/types"
	"app/internal/models"
	"app/internal/services/api_client"
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

	apiClient := api_client.NewClient(cfg.APIBaseURL, cfg.WorkerAPIKey)

	log.Println("Code execution worker starting...")
	log.Printf("Work directory: %s", workDir)
	log.Printf("RabbitMQ URL: %s", cfg.RabbitMQURL)
	log.Printf("API Base URL: %s", cfg.APIBaseURL)

	ctx := context.Background()

	handleSubmission := func(submission *types.SubmissionMessage) error {
		if submission.TimeLimit == 0 {
			submission.TimeLimit = 5000
		}
		if submission.MemLimit == 0 {
			submission.MemLimit = 256
		}

		if submission.ValidatorCode != nil && *submission.ValidatorCode != "" {
			validatorLanguage := submission.ValidatorLanguage
			if validatorLanguage == "" {
				validatorLanguage = "python"
			}
			validator := executor.NewCustomCodeValidator(*submission.ValidatorCode, validatorLanguage)
			exec.SetValidator(validator)
		} else {
			exec.SetValidator(nil)
		}

		err := apiClient.UpdateStatusWithRetry(ctx, submission.SubmissionId, models.StatusRunning, 3)
		if err != nil {
			log.Printf("Failed to update status to running: %v", err)
			return fmt.Errorf("failed to update status: %w", err)
		}

		result, err := exec.Execute(submission)
		if err != nil {
			log.Printf("❌ Execution failed for submission %s: %v", submission.SubmissionId, err)
			if updateErr := apiClient.UpdateStatus(ctx, submission.SubmissionId, models.StatusRuntimeError); updateErr != nil {
				log.Printf("Failed to update status to runtime error: %v", updateErr)
			}
			return fmt.Errorf("execution failed: %w", err)
		}

		var finalStatus models.SubmissionStatus

		if result.CompileError != "" {
			finalStatus = models.StatusCompilationError
			log.Printf("❌ Compilation Error:\n%s", result.CompileError)
		} else if result.RuntimeError != "" {
			finalStatus = models.StatusRuntimeError
		} else if result.TotalPassed == result.TotalTests {
			finalStatus = models.StatusAccepted
		} else {
			finalStatus = models.StatusWrongAnswer
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

		err = apiClient.UpdateStatusWithRetry(ctx, submission.SubmissionId, finalStatus, 3)
		if err != nil {
			log.Printf("Failed to update final status to %s: %v", finalStatus, err)
			return fmt.Errorf("failed to update final status: %w", err)
		}

		err = apiClient.SaveResultWithRetry(ctx, submission.SubmissionId, result, submission.TestCases, 3)
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
