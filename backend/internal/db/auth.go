package db

import (
	"app/internal/models"
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5"
)

func CreateUser(ctx context.Context, name, email, passwordHash, roleName string, emailVerified bool) (*models.User, error) {
	tx, err := Pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var user models.User
	userQuery := `
		INSERT INTO users (email, name, is_active, email_verified)
		VALUES ($1, $2, true, $3)
		RETURNING id, email, name, created_at, is_active, email_verified
	`
	err = tx.QueryRow(ctx, userQuery, email, name, emailVerified).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.IsActive,
		&user.EmailVerified,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	authQuery := `
		INSERT INTO authentication (user_id, provider, password_hash, last_login)
		VALUES ($1, $2, $3, now())
	`
	_, err = tx.Exec(ctx, authQuery, user.ID, "email", passwordHash)
	if err != nil {
		return nil, fmt.Errorf("failed to create authentication record: %w", err)
	}

	// Assign role to user
	roleQuery := `
		INSERT INTO user_roles (user_id, role_id)
		SELECT $1, id FROM roles WHERE name = $2
	`
	_, err = tx.Exec(ctx, roleQuery, user.ID, roleName)
	if err != nil {
		return nil, fmt.Errorf("failed to assign role: %w", err)
	}

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
			u.id, u.email, u.name, u.created_at, u.is_active, u.email_verified,
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
		&user.EmailVerified,
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
		SELECT id, email, name, created_at, is_active, email_verified
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
		&user.EmailVerified,
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
		SELECT u.id, u.email, u.name, u.created_at, u.is_active, u.email_verified
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
		&user.EmailVerified,
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

// AssignRoleToUser assigns a role to a user by role name
func AssignRoleToUser(ctx context.Context, userID, roleName string) error {
	query := `
		INSERT INTO user_roles (user_id, role_id)
		SELECT $1, id FROM roles WHERE name = $2
		ON CONFLICT (user_id, role_id) DO NOTHING
	`
	_, err := Pool.Exec(ctx, query, userID, roleName)
	if err != nil {
		return fmt.Errorf("failed to assign role: %w", err)
	}
	return nil
}

// GetUserRoles retrieves all role names for a user
func GetUserRoles(ctx context.Context, userID string) ([]string, error) {
	query := `
		SELECT r.name
		FROM roles r
		INNER JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = $1
		ORDER BY r.name
	`

	rows, err := Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var roleName string
		if err := rows.Scan(&roleName); err != nil {
			return nil, fmt.Errorf("failed to scan role: %w", err)
		}
		roles = append(roles, roleName)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating roles: %w", err)
	}

	return roles, nil
}

// HasRole checks if a user has a specific role
func HasRole(ctx context.Context, userID, roleName string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1
			FROM user_roles ur
			INNER JOIN roles r ON ur.role_id = r.id
			WHERE ur.user_id = $1 AND r.name = $2
		)
	`
	var exists bool
	err := Pool.QueryRow(ctx, query, userID, roleName).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check role: %w", err)
	}
	return exists, nil
}

// UpdateVerificationToken stores a verification token for a user
func UpdateVerificationToken(ctx context.Context, userID, hashedToken string, expiresAt time.Time) error {
	query := `
		UPDATE users
		SET verification_token = $1, verification_token_expires_at = $2
		WHERE id = $3
	`
	log.Print("db: ", hashedToken)
	_, err := Pool.Exec(ctx, query, hashedToken, expiresAt, userID)
	if err != nil {
		return fmt.Errorf("failed to update verification token: %w", err)
	}
	return nil
}

// VerifyEmail verifies a user's email using the verification token
func VerifyEmail(ctx context.Context, token string) error {
	// Check if token exists and get user details
	query := `
		SELECT id, email_verified,
		       CASE
		           WHEN verification_token_expires_at IS NULL THEN false
		           ELSE verification_token_expires_at > NOW()
		       END as is_valid
		FROM users
		WHERE verification_token = $1
	`
	var userID string
	var emailVerified, isValid bool

	err := Pool.QueryRow(ctx, query, token).Scan(&userID, &emailVerified, &isValid)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return fmt.Errorf("invalid verification token")
		}
		return fmt.Errorf("failed to verify email: %w", err)
	}

	// If already verified, return success (idempotent)
	if emailVerified {
		return nil
	}

	// Check if token is expired
	if !isValid {
		return fmt.Errorf("verification token has expired")
	}

	// Verify the email
	updateQuery := `
		UPDATE users
		SET email_verified = true
		WHERE verification_token = $1
		AND verification_token_expires_at > NOW()
		AND email_verified = false
	`

	_, err = Pool.Exec(ctx, updateQuery, token)
	if err != nil {
		return fmt.Errorf("failed to verify email: %w", err)
	}

	return nil
}

// GetUserByVerificationToken retrieves a user by their verification token
func GetUserByVerificationToken(ctx context.Context, token string) (*models.User, error) {
	query := `
		SELECT id, email, name, created_at, is_active, email_verified, verification_token, verification_token_expires_at
		FROM users
		WHERE verification_token = $1
	`

	var user models.User
	err := Pool.QueryRow(ctx, query, token).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.IsActive,
		&user.EmailVerified,
		&user.VerificationToken,
		&user.VerificationTokenExpiresAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// IsEmailVerified checks if a user's email is verified
func IsEmailVerified(ctx context.Context, userID string) (bool, error) {
	query := `SELECT email_verified FROM users WHERE id = $1`
	var verified bool
	err := Pool.QueryRow(ctx, query, userID).Scan(&verified)
	if err != nil {
		if err == pgx.ErrNoRows {
			return false, fmt.Errorf("user not found")
		}
		return false, fmt.Errorf("failed to check email verification: %w", err)
	}
	return verified, nil
}
