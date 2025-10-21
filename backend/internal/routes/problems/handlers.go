package problems

import (
	"app/internal/db"
	"app/internal/lib"
	"app/internal/middlewares"
	"app/internal/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
)

func GetLanguages(w http.ResponseWriter, r *http.Request) {
	lib.JSON(w, http.StatusOK, lib.Languages)
}

func GetProblemByTitle(w http.ResponseWriter, r *http.Request) {

	title := strings.TrimSpace(r.PathValue("title"))
	if title == "" {
		lib.JSONError(w, http.StatusBadRequest, "Invalid Problem Id")
		return
	}

	query := r.URL.Query()
	mode := query.Get("mode")

	if mode == "" || strings.TrimSpace(mode) == "" {
		lib.JSONError(w, http.StatusBadRequest, "Invalid Mode")
		return
	}
	problemMode := models.ProblemMode(mode)

	if !problemMode.IsValid() {
		lib.JSONError(w, http.StatusBadRequest, "Invalid Mode")
		return
	}
	ctx := r.Context()

	if problemMode == models.Edit {
		problem, err := db.GetProblemForAdmin(ctx, title, false)
		if err != nil {
			log.Printf("Error while fetching problem for admin: %v", err)
			lib.InternalErrorHandler(w)
			return
		}
		lib.JSON(w, http.StatusOK, map[string]any{
			"problem": problem,
		})
		return
	}

	problem, err := db.GetProblem(ctx, title, true)

	if err != nil {
		log.Printf("Error while fetching problem: %v", err)
		lib.InternalErrorHandler(w)
		return
	}

	lib.JSON(w, http.StatusOK, map[string]any{
		"problem": problem,
	})
}

func AddProblem(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user context
	userCtx := middlewares.GetUserContext(r)
	if userCtx == nil {
		lib.JSONError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	// Check if user has admin or author role (enforced by middleware, but double-check)
	if !middlewares.HasAnyRole(userCtx, "admin", "author") {
		lib.JSONError(w, http.StatusForbidden, "Insufficient permissions")
		return
	}

	var problemData models.ProblemInput
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&problemData)
	if err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid Data")
		return
	}

	// Validate required fields
	if len(strings.TrimSpace(problemData.Title)) < 5 {
		lib.JSONError(w, http.StatusBadRequest, "Title must be at least 5 characters")
		return
	}
	if len(problemData.Title) > 200 {
		lib.JSONError(w, http.StatusBadRequest, "Title must not exceed 200 characters")
		return
	}

	if len(strings.TrimSpace(problemData.Description)) < 10 {
		lib.JSONError(w, http.StatusBadRequest, "Description must be at least 10 characters")
		return
	}
	if len(problemData.Description) > 10000 {
		lib.JSONError(w, http.StatusBadRequest, "Description must not exceed 10000 characters")
		return
	}

	if len(strings.TrimSpace(problemData.InputDescription)) < 10 {
		lib.JSONError(w, http.StatusBadRequest, "Input description must be at least 10 characters")
		return
	}
	if len(problemData.InputDescription) > 10000 {
		lib.JSONError(w, http.StatusBadRequest, "Input description must not exceed 10000 characters")
		return
	}

	if len(strings.TrimSpace(problemData.OutputDescription)) < 10 {
		lib.JSONError(w, http.StatusBadRequest, "Output description must be at least 10 characters")
		return
	}
	if len(problemData.OutputDescription) > 10000 {
		lib.JSONError(w, http.StatusBadRequest, "Output description must not exceed 10000 characters")
		return
	}

	if !problemData.Difficulty.IsValid() {
		lib.JSONError(w, http.StatusBadRequest, "Invalid problem difficulty")
		return
	}

	if problemData.TimeLimit < 100 || problemData.TimeLimit > 10000 {
		lib.JSONError(w, http.StatusBadRequest, "Time limit must be between 100 and 10000 ms")
		return
	}

	if problemData.MemoryLimit < 16 || problemData.MemoryLimit > 512 {
		lib.JSONError(w, http.StatusBadRequest, "Memory limit must be between 16 and 512 MB")
		return
	}

	// Validate optional constraints field
	if problemData.Constraints != nil && len(*problemData.Constraints) > 2000 {
		lib.JSONError(w, http.StatusBadRequest, "Constraints must not exceed 2000 characters")
		return
	}

	// Validate test cases
	if len(problemData.TestCases) == 0 {
		lib.JSONError(w, http.StatusBadRequest, "At least one test case is required")
		return
	}

	// Validate each test case has required fields
	orderIndexMap := make(map[int]bool)
	for i, tc := range problemData.TestCases {
		if strings.TrimSpace(tc.Input) == "" {
			lib.JSONError(w, http.StatusBadRequest, fmt.Sprintf("Test case %d: input is required", i+1))
			return
		}
		if strings.TrimSpace(tc.ExpectedOutput) == "" {
			lib.JSONError(w, http.StatusBadRequest, fmt.Sprintf("Test case %d: expected_output is required", i+1))
			return
		}
		// Check for duplicate order_index values
		if orderIndexMap[tc.OrderIndex] {
			lib.JSONError(w, http.StatusBadRequest, fmt.Sprintf("Test case %d: duplicate order_index %d", i+1, tc.OrderIndex))
			return
		}
		orderIndexMap[tc.OrderIndex] = true
	}

	ctx := r.Context()
	exists, err := db.ProblemExists(ctx, problemData.Title)

	if err != nil {
		log.Printf("Error while checking problem exists: %v", err)
		lib.InternalErrorHandler(w)
		return
	}

	if exists {
		lib.JSONError(w, http.StatusConflict, fmt.Sprintf("Problem %s already exists", problemData.Title))
		return
	}

	// Determine status based on user role
	// Admin: auto-approve, Author: pending approval
	var status models.RequestStatus
	isAdmin := middlewares.HasAnyRole(userCtx, "admin")
	if isAdmin {
		status = models.Approved
	} else {
		status = models.Pending
	}

	// Author ID comes from authenticated user context
	authorID := userCtx.UserID

	err = db.AddProblem(ctx, problemData, authorID, status)

	if err != nil {
		log.Printf("Error when adding a problem: %v", err)
		lib.InternalErrorHandler(w)
		return
	}

	responseMessage := "Problem added"
	if isAdmin {
		responseMessage = "Problem added and approved"
	} else {
		responseMessage = "Problem added, pending approval"
	}

	lib.JSON(w, http.StatusCreated, map[string]any{
		"message": responseMessage,
		"status":  status,
	})
}

func FecthProblems(w http.ResponseWriter, r *http.Request) {
	pagination := middlewares.GetPagination(r)
	problems, err := db.FecthProblems(r.Context(), pagination.Offset, pagination.Limit)

	if err != nil {
		log.Printf("Error while fetching problems: %v", err)
		lib.InternalErrorHandler(w)
		return
	}

	lib.JSON(w, http.StatusOK, problems)
}
