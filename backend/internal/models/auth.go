package models

import "time"

// User represents a user in the system
// Note: ID field contains Supabase user UUID directly
type User struct {
	ID            string    `json:"id"`            // Supabase user UUID
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	CreatedAt     time.Time `json:"createdAt"`
	IsActive      bool      `json:"isActive"`
	EmailVerified bool      `json:"emailVerified"`
}
