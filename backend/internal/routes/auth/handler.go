package auth

import (
	"app/internal/db"
	"app/internal/lib"
	"app/internal/models"
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// Email validation regex
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

// HandleRegister handles user registration with email and password
func HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate inputs
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	if req.Name == "" {
		lib.JSONError(w, http.StatusBadRequest, "Name is required")
		return
	}
	if req.Email == "" {
		lib.JSONError(w, http.StatusBadRequest, "Email is required")
		return
	}
	if !emailRegex.MatchString(req.Email) {
		lib.JSONError(w, http.StatusBadRequest, "Invalid email format")
		return
	}
	if len(req.Password) < 8 {
		lib.JSONError(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	ctx := r.Context()

	// TODO: Email verification will be implemented in the future
	// For now, users can register without email verification
	// When implemented:
	// 1. Generate verification token
	// 2. Send verification email
	// 3. Set email_verified = false in users table
	// 4. Add verification endpoint to validate token

	// Check if email already exists
	exists, err := db.EmailExists(ctx, req.Email)
	if err != nil {
		log.Printf("Error checking email existence: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	if exists {
		lib.JSONError(w, http.StatusConflict, "Email already registered")
		return
	}

	// Hash password
	passwordHash, err := lib.HashPassword(req.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Create user
	user, err := db.CreateUser(ctx, req.Name, req.Email, passwordHash)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Generate tokens
	accessToken, err := lib.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		log.Printf("Error generating access token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	refreshToken, err := lib.GenerateRefreshToken(user.ID)
	if err != nil {
		log.Printf("Error generating refresh token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Store refresh token
	tokenHash := lib.HashToken(refreshToken)
	expiresAt := time.Now().Add(lib.GetRefreshExpiry())
	deviceInfo := r.UserAgent()

	err = db.SaveRefreshToken(ctx, user.ID, tokenHash, expiresAt, deviceInfo)
	if err != nil {
		log.Printf("Error saving refresh token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Set refresh token cookie
	setRefreshTokenCookie(w, refreshToken)

	// Send response
	response := models.AuthResponse{
		User:        *user,
		AccessToken: accessToken,
	}
	lib.JSON(w, http.StatusCreated, response)
}

// HandleLogin handles user login with email and password
func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate inputs
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		lib.JSONError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	ctx := r.Context()

	// Get user by email
	user, auth, err := db.GetUserByEmail(ctx, req.Email)
	if err != nil {
		// Don't reveal whether email exists for security
		lib.JSONError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Check if user is active
	if !user.IsActive {
		lib.JSONError(w, http.StatusForbidden, "Account is disabled")
		return
	}

	// Compare passwords
	if !lib.ComparePassword(auth.PasswordHash, req.Password) {
		lib.JSONError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Update last login
	err = db.UpdateLastLogin(ctx, user.ID)
	if err != nil {
		log.Printf("Error updating last login: %v", err)
		// Don't fail the login for this
	}

	// Generate tokens
	accessToken, err := lib.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		log.Printf("Error generating access token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	refreshToken, err := lib.GenerateRefreshToken(user.ID)
	if err != nil {
		log.Printf("Error generating refresh token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Store refresh token
	tokenHash := lib.HashToken(refreshToken)
	expiresAt := time.Now().Add(lib.GetRefreshExpiry())
	deviceInfo := r.UserAgent()

	err = db.SaveRefreshToken(ctx, user.ID, tokenHash, expiresAt, deviceInfo)
	if err != nil {
		log.Printf("Error saving refresh token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Set refresh token cookie
	setRefreshTokenCookie(w, refreshToken)

	// Send response
	response := models.AuthResponse{
		User:        *user,
		AccessToken: accessToken,
	}
	lib.JSON(w, http.StatusOK, response)
}

// HandleRefresh handles access token refresh using refresh token from cookie
func HandleRefresh(w http.ResponseWriter, r *http.Request) {
	// Get refresh token from cookie
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		lib.JSONError(w, http.StatusUnauthorized, "Refresh token not found")
		return
	}

	refreshToken := cookie.Value
	if refreshToken == "" {
		lib.JSONError(w, http.StatusUnauthorized, "Refresh token not found")
		return
	}

	// Validate JWT signature and expiry
	claims, err := lib.ValidateRefreshToken(refreshToken)
	if err != nil {
		lib.JSONError(w, http.StatusUnauthorized, "Invalid or expired refresh token")
		return
	}

	ctx := r.Context()

	// Validate token in database
	tokenHash := lib.HashToken(refreshToken)
	user, err := db.ValidateRefreshToken(ctx, tokenHash)
	if err != nil {
		lib.JSONError(w, http.StatusUnauthorized, "Invalid or expired refresh token")
		return
	}

	// Verify user ID matches
	if user.ID != claims.UserID {
		lib.JSONError(w, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	// Check if user is active
	if !user.IsActive {
		lib.JSONError(w, http.StatusForbidden, "Account is disabled")
		return
	}

	// Generate new access token
	accessToken, err := lib.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		log.Printf("Error generating access token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Send response
	response := models.RefreshResponse{
		AccessToken: accessToken,
	}
	lib.JSON(w, http.StatusOK, response)
}

// HandleLogout handles user logout by revoking the refresh token
func HandleLogout(w http.ResponseWriter, r *http.Request) {
	// Get refresh token from cookie
	cookie, err := r.Cookie("refresh_token")
	if err == nil && cookie.Value != "" {
		// Revoke the token in database
		tokenHash := lib.HashToken(cookie.Value)
		ctx := r.Context()
		err = db.RevokeRefreshToken(ctx, tokenHash)
		if err != nil {
			log.Printf("Error revoking refresh token: %v", err)
			// Continue with logout even if revocation fails
		}
	}

	// Clear the cookie
	clearRefreshTokenCookie(w)

	// Send success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

// Helper function to set refresh token cookie
func setRefreshTokenCookie(w http.ResponseWriter, token string) {
	cookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    token,
		Path:     "/api/auth",
		MaxAge:   7 * 24 * 60 * 60, // 7 days
		HttpOnly: true,
		Secure:   false, // Set to true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)
}

// Helper function to clear refresh token cookie
func clearRefreshTokenCookie(w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/auth",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)
}
