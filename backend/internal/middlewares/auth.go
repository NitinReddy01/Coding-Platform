package middlewares

import (
	"app/internal/config"
	"app/internal/db"
	"app/internal/lib"
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey int

const (
	userContextKey contextKey = iota
)

// UserContext holds authenticated user information
type UserContext struct {
	UserID string
	Email  string
	Roles  []string
}

// SupabaseClaims represents the claims in a Supabase JWT token
type SupabaseClaims struct {
	Sub   string `json:"sub"`   // User ID
	Email string `json:"email"` // User email
	jwt.RegisteredClaims
}

// ValidateSupabaseJWT validates a Supabase JWT token and returns claims
func ValidateSupabaseJWT(tokenString string, jwtSecret string) (*SupabaseClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &SupabaseClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*SupabaseClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token claims")
}

var supabaseJWTSecret string

// InitAuthMiddleware initializes the auth middleware with Supabase config
func InitAuthMiddleware(cfg *config.Config) {
	supabaseJWTSecret = cfg.SupabaseJWTSecret
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorization := r.Header.Get("authorization")
		parts := strings.Fields(authorization)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			lib.JSONError(w, http.StatusUnauthorized, "invalid authorization header")
			return
		}
		token := parts[1]

		// Validate Supabase JWT token
		claims, err := ValidateSupabaseJWT(token, supabaseJWTSecret)
		if err != nil {
			log.Printf("Supabase JWT validation error: %v", err)
			lib.JSONError(w, http.StatusUnauthorized, "Invalid or Expired Token")
			return
		}

		// Fetch user roles from database
		// Note: claims.Sub is Supabase user ID, which is now our primary key
		roles, err := db.GetUserRoles(r.Context(), claims.Sub)
		if err != nil {
			log.Printf("Error fetching user roles: %v", err)
			// Continue with empty roles - don't block authentication
			roles = []string{}
		}

		userCtx := &UserContext{
			UserID: claims.Sub, // Supabase user UUID (same as our users.id)
			Email:  claims.Email,
			Roles:  roles,
		}

		ctx := context.WithValue(r.Context(), userContextKey, userCtx)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserContext retrieves the authenticated user information from the request context
func GetUserContext(r *http.Request) *UserContext {
	if userCtx, ok := r.Context().Value(userContextKey).(*UserContext); ok {
		return userCtx
	}
	return nil
}

func WorkerAuthMiddleware(apiKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			workerKey := r.Header.Get("X-Worker-API-Key")

			if workerKey == "" {
				lib.JSONError(w, http.StatusUnauthorized, "Worker API key required")
				return
			}

			if workerKey != apiKey {
				lib.JSONError(w, http.StatusUnauthorized, "Invalid worker API key")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
