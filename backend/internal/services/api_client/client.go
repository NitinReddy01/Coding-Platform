package api_client

import (
	"app/internal/lib/types"
	"app/internal/models"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// Client is an HTTP client for making API calls from worker to server
type Client struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

// NewClient creates a new API client for worker
func NewClient(baseURL, apiKey string) *Client {
	return &Client{
		baseURL: baseURL,
		apiKey:  apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// UpdateStatus updates the submission status
func (c *Client) UpdateStatus(ctx context.Context, submissionId string, status models.SubmissionStatus) error {
	url := fmt.Sprintf("%s/api/internal/submissions/%s/status", c.baseURL, submissionId)

	req := types.UpdateStatusRequest{
		Status: string(status),
	}

	body, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "PATCH", url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Worker-API-Key", c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}

// SaveResult saves the execution result
func (c *Client) SaveResult(ctx context.Context, submissionId string, result *models.ExecutionResult, testCases []models.TestCase) error {
	url := fmt.Sprintf("%s/api/internal/submissions/%s/result", c.baseURL, submissionId)

	// Extract only sample test results for debugging
	sampleTestResults := make([]models.TestCaseResult, 0)
	for i, testResult := range result.TestResults {
		if i < len(testCases) && testCases[i].IsSample {
			sampleTestResults = append(sampleTestResults, testResult)
		}
	}

	req := types.SaveResultRequest{
		Success:           result.Success,
		CompileError:      result.CompileError,
		RuntimeError:      result.RuntimeError,
		MaxExecutionMs:    result.MaxExecutionMs,
		MaxMemoryKB:       result.MaxMemoryKB,
		TotalPassed:       result.TotalPassed,
		TestResults:       result.TestResults,
		SampleTestResults: sampleTestResults,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "PATCH", url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Worker-API-Key", c.apiKey)

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}

// UpdateStatusWithRetry updates status with exponential backoff retry
func (c *Client) UpdateStatusWithRetry(ctx context.Context, submissionId string, status models.SubmissionStatus, maxRetries int) error {
	var lastErr error
	backoff := 1 * time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		err := c.UpdateStatus(ctx, submissionId, status)
		if err == nil {
			return nil
		}

		lastErr = err
		log.Printf("Failed to update status (attempt %d/%d): %v", attempt+1, maxRetries, err)

		if attempt < maxRetries-1 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(backoff):
				backoff *= 2 // Exponential backoff
			}
		}
	}

	return fmt.Errorf("failed after %d retries: %w", maxRetries, lastErr)
}

// SaveResultWithRetry saves result with exponential backoff retry
func (c *Client) SaveResultWithRetry(ctx context.Context, submissionId string, result *models.ExecutionResult, testCases []models.TestCase, maxRetries int) error {
	var lastErr error
	backoff := 1 * time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		err := c.SaveResult(ctx, submissionId, result, testCases)
		if err == nil {
			return nil
		}

		lastErr = err
		log.Printf("Failed to save result (attempt %d/%d): %v", attempt+1, maxRetries, err)

		if attempt < maxRetries-1 {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(backoff):
				backoff *= 2 // Exponential backoff
			}
		}
	}

	return fmt.Errorf("failed after %d retries: %w", maxRetries, lastErr)
}
