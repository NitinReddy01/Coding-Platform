package auth

import (
	"app/internal/config"
	"app/internal/db"
	"app/internal/lib"
	"app/internal/lib/types"
	"app/internal/middlewares"
	"app/internal/services"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// Email validation regex
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func HandleRegister(w http.ResponseWriter, r *http.Request, cfg *config.Config) {
	var req types.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

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

	passwordHash, err := lib.HashPassword(req.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	user, err := db.CreateUser(ctx, req.Name, req.Email, passwordHash, "user", false)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	token, err := lib.GenerateRandomToken(32)
	if err != nil {
		log.Printf("Error generating verification token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	tokenHash := lib.HashToken(token)
	expiresAt := time.Now().Add(30 * time.Minute) // Token expires in 30 minutes

	err = db.UpdateVerificationToken(ctx, user.ID, tokenHash, expiresAt)
	if err != nil {
		log.Printf("Error storing verification token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Send verification email
	verificationURL := fmt.Sprintf("%s/verify-email?token=%s", cfg.FrontendURL, token)
	emailBody := services.GenerateVerificationEmail(user.Name, verificationURL)
	log.Print(verificationURL)
	err = services.SendMail(
		user.Email,
		"Verify Your Email Address",
		emailBody,
		true, // isHTML
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPSender,
		cfg.SMTPPassword,
	)
	if err != nil {
		log.Printf("Error sending verification email to %s: %v", user.Email, err)
	}

	response := types.RegisterResponse{
		Message: "Registration successful. Please check your email to verify your account.",
		Email:   user.Email,
	}
	lib.JSON(w, http.StatusCreated, response)
}

// HandleLogin handles user login with email and password
func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req types.LoginRequest
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

	// Check if email is verified
	if !user.EmailVerified {
		lib.JSONError(w, http.StatusForbidden, "Please verify your email before logging in. Check your inbox for the verification link.")
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
		lib.InternalErrorHandler(w)
		return
	}

	refreshToken, err := lib.GenerateRefreshToken(user.ID)
	if err != nil {
		log.Printf("Error generating refresh token: %v", err)
		lib.InternalErrorHandler(w)
		return
	}

	// Store refresh token
	tokenHash := lib.HashToken(refreshToken)
	expiresAt := time.Now().Add(lib.GetRefreshExpiry())
	deviceInfo := r.UserAgent()

	err = db.SaveRefreshToken(ctx, user.ID, tokenHash, expiresAt, deviceInfo)
	if err != nil {
		log.Printf("Error saving refresh token: %v", err)
		lib.InternalErrorHandler(w)
		return
	}

	// Set refresh token cookie
	setRefreshTokenCookie(w, refreshToken)

	// Send response
	response := types.AuthResponse{
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
		lib.InternalErrorHandler(w)
		return
	}

	// Send response
	response := types.RefreshResponse{
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

// HandleGetMe returns the current authenticated user's profile with roles
func HandleGetMe(w http.ResponseWriter, r *http.Request) {
	// Get user context from auth middleware
	userCtx := middlewares.GetUserContext(r)
	if userCtx == nil {
		lib.JSONError(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	ctx := r.Context()

	// Get user from database
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

// HandleVerifyEmail handles email verification using the token sent via email
func HandleVerifyEmail(w http.ResponseWriter, r *http.Request) {
	// Get token from query parameter
	token := r.URL.Query().Get("token")
	if token == "" {
		lib.JSONError(w, http.StatusBadRequest, "Verification token is required")
		return
	}

	ctx := r.Context()
	// Hash the token to match stored hash
	tokenHash := lib.HashToken(token)
	// Verify email using the hashed token
	err := db.VerifyEmail(ctx, tokenHash)
	if err != nil {
		log.Printf("Error verifying email: %v", err)
		lib.JSONError(w, http.StatusBadRequest, "Invalid or expired verification token")
		return
	}

	// Send success response
	response := types.VerificationResponse{
		Message: "Email verified successfully. You can now login.",
	}
	lib.JSON(w, http.StatusOK, response)
}

// HandleResendVerification handles resending verification email
func HandleResendVerification(w http.ResponseWriter, r *http.Request, cfg *config.Config) {
	var req types.ResendVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate email
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" {
		lib.JSONError(w, http.StatusBadRequest, "Email is required")
		return
	}

	ctx := r.Context()

	// Get user by email
	user, _, err := db.GetUserByEmail(ctx, req.Email)
	if err != nil {
		// Don't reveal whether email exists - return success anyway
		response := types.VerificationResponse{
			Message: "If the email exists and is not verified, a verification link has been sent.",
		}
		lib.JSON(w, http.StatusOK, response)
		return
	}

	// Check if already verified
	if user.EmailVerified {
		lib.JSONError(w, http.StatusBadRequest, "Email is already verified")
		return
	}

	// Generate new verification token
	token, err := lib.GenerateRandomToken(32)
	if err != nil {
		log.Printf("Error generating verification token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Hash the token before storing
	tokenHash := lib.HashToken(token)
	expiresAt := time.Now().Add(30 * time.Minute)

	// Update verification token
	err = db.UpdateVerificationToken(ctx, user.ID, tokenHash, expiresAt)
	if err != nil {
		log.Printf("Error updating verification token: %v", err)
		lib.JSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	// Send verification email
	verificationURL := fmt.Sprintf("%s/verify-email?token=%s", cfg.FrontendURL, token)
	emailBody := services.GenerateVerificationEmail(user.Name, verificationURL)

	err = services.SendMail(
		user.Email,
		"Verify Your Email Address",
		emailBody,
		true, // isHTML
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPSender,
		cfg.SMTPPassword,
	)
	if err != nil {
		log.Printf("Error sending verification email to %s: %v", user.Email, err)
		lib.JSONError(w, http.StatusInternalServerError, "Failed to send verification email")
		return
	}

	log.Printf("Verification email resent to %s", user.Email)

	// Send success response
	response := types.VerificationResponse{
		Message: "Verification email has been sent. Please check your inbox.",
		Email:   user.Email,
	}
	lib.JSON(w, http.StatusOK, response)
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
