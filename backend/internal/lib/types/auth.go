package types

import "app/internal/models"

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
	User        models.User `json:"user"`
	AccessToken string      `json:"accessToken"`
}

// RefreshResponse represents the response for token refresh
type RefreshResponse struct {
	AccessToken string `json:"accessToken"`
}

// UserProfile represents a user profile with roles
type UserProfile struct {
	User  models.User `json:"user"`
	Roles []string    `json:"roles"`
}

// VerifyEmailRequest represents the request to verify email
type VerifyEmailRequest struct {
	Token string `json:"token"`
}

// ResendVerificationRequest represents the request to resend verification email
type ResendVerificationRequest struct {
	Email string `json:"email"`
}

// VerificationResponse represents the response for verification operations
type VerificationResponse struct {
	Message string `json:"message"`
	Email   string `json:"email,omitempty"`
}

// RegisterResponse represents the response for successful registration (before email verification)
type RegisterResponse struct {
	Message string `json:"message"`
	Email   string `json:"email"`
}
