package models

import "time"

// User represents a user in the system
type User struct {
	ID                        string     `json:"id"`
	Email                     string     `json:"email"`
	Name                      string     `json:"name"`
	CreatedAt                 time.Time  `json:"createdAt"`
	IsActive                  bool       `json:"isActive"`
	EmailVerified             bool       `json:"emailVerified"`
	VerificationToken         *string    `json:"-"` // Never expose in API responses
	VerificationTokenExpiresAt *time.Time `json:"-"` // Never expose in API responses
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
