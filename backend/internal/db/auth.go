package db

import (
	"app/internal/models"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// CreateUserFromSupabase creates a new user using Supabase UUID as primary key
func CreateUserFromSupabase(ctx context.Context, supabaseUserID, email, name, roleName string) (*models.User, error) {
	tx, err := Pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var user models.User
	userQuery := `
		INSERT INTO users (id, email, name, is_active, email_verified)
		VALUES ($1, $2, $3, true, true)
		RETURNING id, email, name, created_at, is_active, email_verified
	`
	err = tx.QueryRow(ctx, userQuery, supabaseUserID, email, name).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.CreatedAt,
		&user.IsActive,
		&user.EmailVerified,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create user from Supabase: %w", err)
	}

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
