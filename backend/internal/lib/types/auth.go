package types

import "app/internal/models"

// UserProfile represents a user profile with roles
type UserProfile struct {
	User  models.User `json:"user"`
	Roles []string    `json:"roles"`
}

// SyncUserRequest represents the request to sync a Supabase user with the local database
type SyncUserRequest struct {
	Name string `json:"name"` // Optional - will use email prefix if not provided
}
