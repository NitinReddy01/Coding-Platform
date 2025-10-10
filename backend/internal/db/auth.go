package db

import (
	"app/internal/models"
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

// CreateUser creates a new user and authentication record in the database
func CreateUser(ctx context.Context, name, email, passwordHash string) (*models.User, error) {
	tx, err := Pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Insert into users table
	var user models.User
	userQuery := `
		INSERT INTO users (email, name, is_active)
		VALUES ($1, $2, true)
		RETURNING id, email, name, created_at, is_active
	`
	err = tx.QueryRow(ctx, userQuery, email, name).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.IsActive,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Insert into authentication table
	authQuery := `
		INSERT INTO authentication (user_id, provider, password_hash, last_login)
		VALUES ($1, $2, $3, now())
	`
	_, err = tx.Exec(ctx, authQuery, user.ID, "email", passwordHash)
	if err != nil {
		return nil, fmt.Errorf("failed to create authentication record: %w", err)
	}

	// Commit transaction
	err = tx.Commit(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &user, nil
}

// GetUserByEmail retrieves a user and their authentication record by email
func GetUserByEmail(ctx context.Context, email string) (*models.User, *models.AuthRecord, error) {
	query := `
		SELECT
			u.id, u.email, u.name, u.created_at, u.is_active,
			a.id, a.user_id, a.provider, a.password_hash, a.last_login, a.created_at, a.updated_at
		FROM users u
		INNER JOIN authentication a ON u.id = a.user_id
		WHERE u.email = $1 AND a.provider = 'email'
	`

	var user models.User
	var auth models.AuthRecord

	err := Pool.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.IsActive,
		&auth.ID,
		&auth.UserID,
		&auth.Provider,
		&auth.PasswordHash,
		&auth.LastLogin,
		&auth.CreatedAt,
		&auth.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil, fmt.Errorf("user not found")
		}
		return nil, nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, &auth, nil
}

// GetUserByID retrieves a user by their ID
func GetUserByID(ctx context.Context, userID string) (*models.User, error) {
	query := `
		SELECT id, email, name, created_at, is_active
		FROM users
		WHERE id = $1
	`

	var user models.User
	err := Pool.QueryRow(ctx, query, userID).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.IsActive,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// UpdateLastLogin updates the last_login timestamp for a user
func UpdateLastLogin(ctx context.Context, userID string) error {
	query := `
		UPDATE authentication
		SET last_login = now()
		WHERE user_id = $1 AND provider = 'email'
	`
	_, err := Pool.Exec(ctx, query, userID)
	return err
}

// SaveRefreshToken stores a refresh token in the database
func SaveRefreshToken(ctx context.Context, userID, tokenHash string, expiresAt time.Time, deviceInfo string) error {
	query := `
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info)
		VALUES ($1, $2, $3, $4)
	`
	_, err := Pool.Exec(ctx, query, userID, tokenHash, expiresAt, deviceInfo)
	if err != nil {
		return fmt.Errorf("failed to save refresh token: %w", err)
	}
	return nil
}

// ValidateRefreshToken checks if a refresh token is valid and returns the associated user
func ValidateRefreshToken(ctx context.Context, tokenHash string) (*models.User, error) {
	query := `
		SELECT u.id, u.email, u.name, u.created_at, u.is_active
		FROM users u
		INNER JOIN refresh_tokens rt ON u.id = rt.user_id
		WHERE rt.token_hash = $1
		AND rt.expires_at > now()
		AND rt.is_revoked = false
	`

	var user models.User
	err := Pool.QueryRow(ctx, query, tokenHash).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.IsActive,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("invalid or expired refresh token")
		}
		return nil, fmt.Errorf("failed to validate refresh token: %w", err)
	}

	return &user, nil
}

// RevokeRefreshToken marks a refresh token as revoked
func RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	query := `
		UPDATE refresh_tokens
		SET is_revoked = true
		WHERE token_hash = $1
	`
	_, err := Pool.Exec(ctx, query, tokenHash)
	if err != nil {
		return fmt.Errorf("failed to revoke refresh token: %w", err)
	}
	return nil
}

// EmailExists checks if an email already exists in the database
func EmailExists(ctx context.Context, email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`
	var exists bool
	err := Pool.QueryRow(ctx, query, email).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check email existence: %w", err)
	}
	return exists, nil
}
