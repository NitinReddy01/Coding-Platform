package submissions

import (
	"app/internal/db"
	"app/internal/lib"
	"app/internal/lib/types"
	"app/internal/middlewares"
	"app/internal/models"
	"app/internal/services/queue"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

func HandleSubmission(w http.ResponseWriter, r *http.Request, rabbitMQURL string) {
	userCtx := middlewares.GetUserContext(r)
	if userCtx == nil {
		lib.JSONError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	var submissionReq types.SubmissionRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&submissionReq); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate request
	if !submissionReq.Type.IsValid() {
		lib.JSONError(w, http.StatusBadRequest, "Invalid submission type")
		return
	}
	if strings.TrimSpace(submissionReq.Code) == "" {
		lib.JSONError(w, http.StatusBadRequest, "Code is required")
		return
	}
	if strings.TrimSpace(submissionReq.ProblemId) == "" {
		lib.JSONError(w, http.StatusBadRequest, "ProblemId is required")
		return
	}
	if strings.TrimSpace(submissionReq.Language) == "" {
		lib.JSONError(w, http.StatusBadRequest, "Language is required")
		return
	}

	ctx := r.Context()

	// Fetch test cases based on submission type (sample for Run, all for Submit)
	var testCases []models.TestCase
	var err error

	if submissionReq.Type == types.Run {
		testCases, err = db.FetchTestCases(ctx, submissionReq.ProblemId, true)
	} else {
		testCases, err = db.FetchTestCases(ctx, submissionReq.ProblemId, false)
	}

	if err != nil {
		log.Printf("Error fetching test cases for problem %s: %v", submissionReq.ProblemId, err)
		lib.InternalErrorHandler(w)
		return
	}

	if len(testCases) == 0 {
		lib.JSONError(w, http.StatusNotFound, "No test cases found for this problem")
		return
	}

	// Get problem limits
	timeLimit, memoryLimit, err := db.GetProblemLimits(ctx, submissionReq.ProblemId)
	if err != nil {
		lib.JSONError(w, http.StatusNotFound, "Problem not found")
		return
	}

	totalTestCases := len(testCases)

	// Insert submission into database
	submissionId, err := db.AddSubmission(
		ctx,
		userCtx.UserID,
		submissionReq.ProblemId,
		submissionReq.Code,
		submissionReq.Language,
		submissionReq.Type,
		totalTestCases,
	)

	if err != nil {
		log.Printf("Error creating submission for user %s, problem %s: %v", userCtx.UserID, submissionReq.ProblemId, err)
		lib.InternalErrorHandler(w)
		return
	}

	// Create submission payload for queue
	queueSubmission := types.Submission{
		SubmissionId: submissionId,
		Code:         submissionReq.Code,
		Language:     submissionReq.Language,
		TestCases:    testCases,
		TimeLimit:    timeLimit,
		MemLimit:     memoryLimit,
	}

	// Send to RabbitMQ queue for async processing
	err = queue.SendSubmission(ctx, queueSubmission, rabbitMQURL)
	if err != nil {
		log.Printf("Error queuing submission %s to RabbitMQ: %v", submissionId, err)
		lib.InternalErrorHandler(w)
		return
	}

	// Return submission ID and timestamp for frontend polling
	response := types.SubmissionResponse{
		SubmissionId: submissionId,
	}

	lib.JSON(w, http.StatusCreated, response)
}

func GetSubmissionStatus(w http.ResponseWriter, r *http.Request) {

	userCtx := middlewares.GetUserContext(r)
	if userCtx == nil {
		lib.JSONError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	submissionId := r.PathValue("submissionId")
	if submissionId == "" {
		lib.JSONError(w, http.StatusBadRequest, "Invalid submission ID")
		return
	}

	ctx := r.Context()

	submission, err := db.GetSubmissionStatus(ctx, submissionId, userCtx.UserID)
	if err != nil {
		if strings.Contains(err.Error(), "no rows") {
			lib.JSONError(w, http.StatusNotFound, "Submission not found")
			return
		}
		log.Printf("Error fetching submission status for id %s, user %s: %v", submissionId, userCtx.UserID, err)
		lib.InternalErrorHandler(w)
		return
	}

	// Only include test case counts when submission is complete
	var testCasesPassed, testCasesTotal *int
	if submission.Status != models.StatusPending && submission.Status != models.StatusRunning {
		testCasesPassed = &submission.TestCasesPassed
		testCasesTotal = &submission.TestCasesTotal
	}

	response := types.SubmissionStatusResponse{
		Status:          string(submission.Status),
		RuntimeMs:       submission.RuntimeMs,
		MemoryUsedMb:    submission.MemoryUsedMb,
		TestCasesPassed: testCasesPassed,
		TestCasesTotal:  testCasesTotal,
		ErrorMessage:    submission.ErrorMessage,
	}

	lib.JSON(w, http.StatusOK, response)
}

func GetLatestSubmissionForProblem(w http.ResponseWriter, r *http.Request) {
	userCtx := middlewares.GetUserContext(r)
	if userCtx == nil {
		lib.JSONError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	problemId := r.PathValue("problemId")
	if problemId == "" {
		lib.JSONError(w, http.StatusBadRequest, "Invalid problem ID")
		return
	}

	ctx := r.Context()

	submission, err := db.GetLatestSubmissionForProblem(ctx, userCtx.UserID, problemId)
	if err != nil {
		if strings.Contains(err.Error(), "no rows") {
			lib.JSONError(w, http.StatusNotFound, "No submissions found for this problem")
			return
		}
		log.Printf("Error fetching latest submission for problem %s, user %s: %v", problemId, userCtx.UserID, err)
		lib.InternalErrorHandler(w)
		return
	}

	response := types.LatestSubmissionResponse{
		Code:        submission.Code,
		Language:    submission.Language,
		SubmittedAt: submission.SubmittedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	lib.JSON(w, http.StatusOK, response)
}

func UpdateSubmissionStatusInternal(w http.ResponseWriter, r *http.Request) {
	submissionId := r.PathValue("submissionId")
	if submissionId == "" {
		lib.JSONError(w, http.StatusBadRequest, "Invalid submission ID")
		return
	}

	var req types.UpdateStatusRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate status
	status := models.SubmissionStatus(req.Status)
	if !status.IsValid() {
		lib.JSONError(w, http.StatusBadRequest, "Invalid submission status")
		return
	}

	ctx := r.Context()

	err := db.UpdateSubmissionStatus(ctx, submissionId, status)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			lib.JSONError(w, http.StatusNotFound, "Submission not found")
			return
		}
		log.Printf("Error updating submission status for id %s: %v", submissionId, err)
		lib.InternalErrorHandler(w)
		return
	}

	lib.JSON(w, http.StatusOK, map[string]string{"message": "Status updated successfully"})
}

// SaveSubmissionResultInternal handles internal worker requests to save execution results
func SaveSubmissionResultInternal(w http.ResponseWriter, r *http.Request) {
	submissionId := r.PathValue("submissionId")
	if submissionId == "" {
		lib.JSONError(w, http.StatusBadRequest, "Invalid submission ID")
		return
	}

	var req types.SaveResultRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	ctx := r.Context()

	// Convert request to ExecutionResult model
	result := &models.ExecutionResult{
		Success:        req.Success,
		CompileError:   req.CompileError,
		RuntimeError:   req.RuntimeError,
		MaxExecutionMs: req.MaxExecutionMs,
		MaxMemoryKB:    req.MaxMemoryKB,
		TotalPassed:    req.TotalPassed,
		TestResults:    req.TestResults,
	}

	err := db.SaveSubmissionResult(ctx, submissionId, result)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			lib.JSONError(w, http.StatusNotFound, "Submission not found")
			return
		}
		log.Printf("Error saving submission result for id %s: %v", submissionId, err)
		lib.InternalErrorHandler(w)
		return
	}

	lib.JSON(w, http.StatusOK, map[string]string{"message": "Result saved successfully"})
}
