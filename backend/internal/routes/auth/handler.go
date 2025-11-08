package auth

import (
	"app/internal/db"
	"app/internal/lib"
	"app/internal/lib/types"
	"app/internal/middlewares"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

// HandleSyncUser creates a user record in the database after Supabase signup
func HandleSyncUser(w http.ResponseWriter, r *http.Request) {
	// Get user context from auth middleware (contains Supabase user ID and email)
	userCtx := middlewares.GetUserContext(r)
	if userCtx == nil {
		lib.JSONError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	var req types.SyncUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	ctx := r.Context()

	// Check if user already exists (userCtx.UserID is Supabase UUID, which is our primary key)
	user, err := db.GetUserByID(ctx, userCtx.UserID)
	if err == nil {
		// User already exists, return existing user
		response := types.UserProfile{
			User:  *user,
			Roles: userCtx.Roles,
		}
		lib.JSON(w, http.StatusOK, response)
		return
	}

	// User doesn't exist, create new user with default "user" role
	name := req.Name
	if name == "" {
		name = strings.Split(userCtx.Email, "@")[0] // Use email prefix as fallback
	}

	user, err = db.CreateUserFromSupabase(ctx, userCtx.UserID, userCtx.Email, name, "user")
	if err != nil {
		log.Printf("Error creating user: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Fetch roles for new user (may have been assigned during creation)
	roles, err := db.GetUserRoles(ctx, user.ID)
	if err != nil {
		log.Printf("Error fetching user roles: %v", err)
		roles = []string{"user"} // Fallback to default
	}
	// Return user profile with roles
	response := types.UserProfile{
		User:  *user,
		Roles: roles,
	}

	lib.JSON(w, http.StatusOK, response)
}

// HandleGetMe returns the current authenticated user's profile with roles
func HandleGetMe(w http.ResponseWriter, r *http.Request) {
	// Get user context from auth middleware (contains Supabase user ID as primary key)
	userCtx := middlewares.GetUserContext(r)
	if userCtx == nil {
		lib.JSONError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	ctx := r.Context()

	// Get user from database (userCtx.UserID is the Supabase UUID, which is our primary key)
	user, err := db.GetUserByID(ctx, userCtx.UserID)
	if err != nil {
		log.Printf("Error getting user: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Failed to get user profile")
		return
	}

	// Return user profile with roles (roles already in context from middleware)
	response := types.UserProfile{
		User:  *user,
		Roles: userCtx.Roles,
	}

	lib.JSON(w, http.StatusOK, response)
}
