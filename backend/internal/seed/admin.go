package seed

import (
	"app/internal/config"
	"app/internal/db"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

const (
	// Admin user credentials
	AdminEmail    = "nitin@gmail.com"
	AdminPassword = "admin123" // Change this to a secure password
	AdminName     = "Admin User"
	AdminRole     = "admin"
)

// SupabaseUser represents a user from Supabase Auth Admin API
type SupabaseUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// CreateUserRequest represents the request to create a user via Supabase Admin API
type CreateUserRequest struct {
	Email        string                 `json:"email"`
	Password     string                 `json:"password"`
	EmailConfirm bool                   `json:"email_confirm"`
	UserMetadata map[string]interface{} `json:"user_metadata"`
}

// CreateUserResponse represents the response from Supabase Admin API
type CreateUserResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// ListUsersResponse represents the response from list users endpoint
type ListUsersResponse struct {
	Users []SupabaseUser `json:"users"`
}

// SeedAdminUser ensures an admin user exists in both Supabase and the database
// Returns true if admin was created, false if already existed
func SeedAdminUser(cfg *config.Config, verbose bool) error {
	ctx := context.Background()

	// Step 1: Check if admin already exists in Supabase
	existingSupabaseUser, err := getExistingUser(cfg, AdminEmail)
	if err == nil && existingSupabaseUser != nil {
		if verbose {
			log.Printf("✅ Admin user already exists in Supabase: %s", existingSupabaseUser.Email)
		}

		// Check if also exists in backend database
		backendUser, err := db.GetUserByID(ctx, existingSupabaseUser.ID)
		if err == nil && backendUser != nil {
			if verbose {
				log.Printf("✅ Admin user already exists in backend database: %s", backendUser.Email)
			}
			// Verify admin role
			roles, _ := db.GetUserRoles(ctx, existingSupabaseUser.ID)
			hasAdmin := false
			for _, role := range roles {
				if role == AdminRole {
					hasAdmin = true
					break
				}
			}
			if hasAdmin {
				if verbose {
					log.Println("✅ Admin user fully configured - skipping seed")
				}
				return nil
			}
		}
	}

	// Admin doesn't exist or needs setup - create/configure
	if verbose {
		log.Println("🌱 Seeding admin user...")
	}

	// Step 2: Create admin user in Supabase Auth
	user, err := createSupabaseAdminUser(cfg, AdminEmail, AdminPassword, AdminName, verbose)
	if err != nil {
		return fmt.Errorf("failed to create Supabase admin user: %w", err)
	}

	// Step 3: Check if user exists in backend database
	existingUser, err := db.GetUserByID(ctx, user.ID)
	if err != nil || existingUser == nil {
		// Create user in backend database
		_, err = db.CreateUserFromSupabase(ctx, user.ID, user.Email, AdminName, AdminRole)
		if err != nil {
			return fmt.Errorf("failed to create admin user in backend: %w", err)
		}
		if verbose {
			log.Printf("✅ Admin user created in backend database")
		}
	}

	// Step 4: Ensure admin role is assigned
	roles, err := db.GetUserRoles(ctx, user.ID)
	if err != nil {
		return fmt.Errorf("failed to get user roles: %w", err)
	}

	hasAdminRole := false
	for _, role := range roles {
		if role == AdminRole {
			hasAdminRole = true
			break
		}
	}

	if !hasAdminRole {
		if err := db.AssignRoleToUser(ctx, user.ID, AdminRole); err != nil {
			return fmt.Errorf("failed to assign admin role: %w", err)
		}
		if verbose {
			log.Println("✅ Admin role assigned")
		}
	}

	if verbose {
		log.Printf("✅ Admin user seeded successfully: %s", AdminEmail)
	}

	return nil
}

// createSupabaseAdminUser creates an admin user in Supabase Auth using Admin API
func createSupabaseAdminUser(cfg *config.Config, email, password, name string, verbose bool) (*SupabaseUser, error) {
	// Supabase Admin API endpoint
	apiURL := fmt.Sprintf("%s/auth/v1/admin/users", cfg.SupabaseURL)

	// Create request body
	reqBody := CreateUserRequest{
		Email:        email,
		Password:     password,
		EmailConfirm: true, // Auto-confirm email
		UserMetadata: map[string]interface{}{
			"name": name,
		},
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers (use service role key for admin operations)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", cfg.SupabaseServiceKey))
	req.Header.Set("apikey", cfg.SupabaseServiceKey)

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	bodyText, _ := io.ReadAll(resp.Body)

	// Check if user already exists
	if resp.StatusCode == 422 || resp.StatusCode == 400 {
		if strings.Contains(string(bodyText), "already been registered") ||
			strings.Contains(string(bodyText), "already exists") {
			if verbose {
				log.Printf("ℹ️  Admin user already exists in Supabase")
			}
			return getExistingUser(cfg, email)
		}
	}

	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return nil, fmt.Errorf("unexpected status code %d: %s", resp.StatusCode, string(bodyText))
	}

	// Parse response
	var createResp CreateUserResponse
	if err := json.Unmarshal(bodyText, &createResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &SupabaseUser{
		ID:    createResp.ID,
		Email: createResp.Email,
	}, nil
}

// getExistingUser fetches an existing user by email from Supabase
func getExistingUser(cfg *config.Config, email string) (*SupabaseUser, error) {
	// List users endpoint
	apiURL := fmt.Sprintf("%s/auth/v1/admin/users", cfg.SupabaseURL)

	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", cfg.SupabaseServiceKey))
	req.Header.Set("apikey", cfg.SupabaseServiceKey)

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		bodyText, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("unexpected status code %d: %s", resp.StatusCode, string(bodyText))
	}

	// Parse response
	bodyText, _ := io.ReadAll(resp.Body)
	var listResp ListUsersResponse
	if err := json.Unmarshal(bodyText, &listResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Find user by email
	for _, user := range listResp.Users {
		if user.Email == email {
			return &user, nil
		}
	}

	return nil, fmt.Errorf("user not found")
}
