package middlewares

import (
	"app/internal/db"
	"app/internal/lib"
	"context"
	"log"
	"net/http"
	"strings"
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

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorization := r.Header.Get("authorization")
		parts := strings.Fields(authorization)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			lib.JSONError(w, http.StatusUnauthorized, "invalid authorization header")
			return
		}
		token := parts[1]

		jwtClaims, err := lib.ValidateAccessToken(token)
		if err != nil {
			lib.JSONError(w, http.StatusUnauthorized, "Invalid or Expired Token")
			return
		}

		// Fetch user roles from database
		roles, err := db.GetUserRoles(r.Context(), jwtClaims.UserID)
		if err != nil {
			log.Printf("Error fetching user roles: %v", err)
			// Continue with empty roles - don't block authentication
			roles = []string{}
		}

		userCtx := &UserContext{
			UserID: jwtClaims.UserID,
			Email:  jwtClaims.Email,
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
