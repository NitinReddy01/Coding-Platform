package problems

import (
	"app/internal/db"
	"app/internal/executor"
	"app/internal/lib"
	"app/internal/lib/types"
	"app/internal/middlewares"
	"app/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
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
	problemMode := types.ProblemMode(mode)

	if !problemMode.IsValid() {
		lib.JSONError(w, http.StatusBadRequest, "Invalid Mode")
		return
	}
	ctx := r.Context()

	if problemMode == types.Edit {
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

// ValidateValidatorRequest represents the request body for validator testing
type ValidateValidatorRequest struct {
	ValidatorCode     string            `json:"validator_code"`
	ValidatorLanguage string            `json:"validator_language"`
	TestCases         []models.TestCase `json:"test_cases"`
}

// ValidatorTestResult represents the result of testing a validator against a test case
type ValidatorTestResult struct {
	TestCaseID  string `json:"test_case_id"`
	Input       string `json:"input"`
	Expected    string `json:"expected"`
	Passed      bool   `json:"passed"`
	Error       string `json:"error,omitempty"`
	DebugOutput string `json:"debug_output,omitempty"` // stderr from validator
	IsSample    bool   `json:"is_sample"`               // whether this is a sample test case
	OrderIndex  int    `json:"order_index"`
}

// ValidateValidatorResponse represents the response for validator testing
type ValidateValidatorResponse struct {
	Valid   bool                  `json:"valid"`
	Results []ValidatorTestResult `json:"results"`
	Message string                `json:"message,omitempty"`
}

// ValidateValidator tests a custom validator against sample test cases
func ValidateValidator(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user context
	userCtx := middlewares.GetUserContext(r)
	if userCtx == nil {
		lib.JSONError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	// Check if user has admin or author role
	if !middlewares.HasAnyRole(userCtx, "admin", "author") {
		lib.JSONError(w, http.StatusForbidden, "Insufficient permissions")
		return
	}

	var req ValidateValidatorRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&req)
	if err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Validate required fields
	if strings.TrimSpace(req.ValidatorCode) == "" {
		lib.JSONError(w, http.StatusBadRequest, "Validator code is required")
		return
	}

	if req.ValidatorLanguage != "python" {
		lib.JSONError(w, http.StatusBadRequest, "Only Python validators are currently supported")
		return
	}

	// Validate that test cases exist
	if len(req.TestCases) == 0 {
		lib.JSONError(w, http.StatusBadRequest, "At least one test case is required for validation")
		return
	}

	// Create custom validator
	validator := executor.NewCustomCodeValidator(req.ValidatorCode, req.ValidatorLanguage)

	// Test validator against ALL test cases (samples + hidden) to catch edge cases
	results := make([]ValidatorTestResult, 0, len(req.TestCases))
	allPassed := true

	for _, tc := range req.TestCases {
		result := ValidatorTestResult{
			TestCaseID: tc.ID,
			Input:      tc.Input,
			Expected:   tc.ExpectedOutput,
			IsSample:   tc.IsSample,
			OrderIndex: tc.OrderIndex,
			Passed:     false,
		}

		// Create context with timeout
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

		// Test validator with expected output as actual output
		// validator(input, expected, expected) should return true
		validatorResult, err := validator.ValidateWithDebug(ctx, tc.Input, tc.ExpectedOutput, tc.ExpectedOutput)
		cancel()

		if err != nil {
			log.Printf("Validator execution error for test case (order_index: %d, id: %s): %v", tc.OrderIndex, tc.ID, err)
			result.Error = err.Error()
			if validatorResult != nil {
				result.DebugOutput = validatorResult.DebugOutput
			}
			allPassed = false
		} else if validatorResult != nil {
			result.Passed = validatorResult.Passed
			result.DebugOutput = validatorResult.DebugOutput
			if !validatorResult.Passed {
				result.Error = "Validator rejected the expected output"
				allPassed = false
			}
		}

		results = append(results, result)
	}

	response := ValidateValidatorResponse{
		Valid:   allPassed,
		Results: results,
	}

	// Count samples and hidden test cases for better messaging
	sampleCount := 0
	for _, r := range results {
		if r.IsSample {
			sampleCount++
		}
	}
	hiddenCount := len(results) - sampleCount

	if allPassed {
		response.Message = fmt.Sprintf("Validator passed all %d test cases (%d sample, %d hidden)", len(results), sampleCount, hiddenCount)
	} else {
		response.Message = fmt.Sprintf("Validator failed one or more test cases (%d sample, %d hidden)", sampleCount, hiddenCount)
	}

	lib.JSON(w, http.StatusOK, response)
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

	var problemData types.ProblemInput

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

	// Validate custom validator if provided
	if problemData.ValidatorCode != nil && strings.TrimSpace(*problemData.ValidatorCode) != "" {
		// Validate validator language
		if problemData.ValidatorLanguage != "python" {
			lib.JSONError(w, http.StatusBadRequest, "Only Python validators are currently supported")
			return
		}

		// Filter sample test cases for validation
		sampleTestCases := make([]models.TestCase, 0)
		for _, tc := range problemData.TestCases {
			if tc.IsSample {
				sampleTestCases = append(sampleTestCases, tc)
			}
		}

		if len(sampleTestCases) == 0 {
			lib.JSONError(w, http.StatusBadRequest, "At least one sample test case is required when using a custom validator")
			return
		}

		// Create and test the validator
		validator := executor.NewCustomCodeValidator(*problemData.ValidatorCode, problemData.ValidatorLanguage)

		validatorErrors := make([]string, 0)
		for i, tc := range sampleTestCases {
			// Create context with timeout for each test
			validatorCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

			// Test validator with expected output as actual output
			passed, err := validator.Validate(validatorCtx, tc.Input, tc.ExpectedOutput, tc.ExpectedOutput)
			cancel()

			if err != nil {
				validatorErrors = append(validatorErrors, fmt.Sprintf("Sample test case %d: %s", i+1, err.Error()))
			} else if !passed {
				validatorErrors = append(validatorErrors, fmt.Sprintf("Sample test case %d: validator rejected the expected output", i+1))
			}
		}

		if len(validatorErrors) > 0 {
			errorMsg := "Validator validation failed:\n" + strings.Join(validatorErrors, "\n")
			lib.JSONError(w, http.StatusBadRequest, errorMsg)
			return
		}
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
