package types

// ErrorResponse represents a generic error response
// This can be used across all API endpoints for consistent error handling
type ErrorResponse struct {
	Message string `json:"message"`
}
