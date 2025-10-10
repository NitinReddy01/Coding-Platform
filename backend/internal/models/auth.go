package models

import "time"

// User represents a user in the system
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	IsActive  bool      `json:"isActive"`
}

// AuthRecord represents authentication data from the authentication table
type AuthRecord struct {
	ID           string
	UserID       string
	Provider     string
	PasswordHash string
	LastLogin    time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// RegisterRequest represents the request body for user registration
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginRequest represents the request body for user login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse represents the response for successful authentication
type AuthResponse struct {
	User        User   `json:"user"`
	AccessToken string `json:"accessToken"`
}

// RefreshResponse represents the response for token refresh
type RefreshResponse struct {
	AccessToken string `json:"accessToken"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Message string `json:"message"`
}
