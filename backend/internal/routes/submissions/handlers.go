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
	submissionId, submittedAt, err := db.AddSubmission(
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
		SubmittedAt:  submittedAt,
	}

	lib.JSON(w, http.StatusCreated, response)
}
