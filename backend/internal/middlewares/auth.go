package middlewares

import (
	"app/internal/lib"
	"context"
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
	// Add more fields as needed (e.g., Role, Name, etc.)
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

		userCtx := &UserContext{
			UserID: jwtClaims.UserID,
			Email:  jwtClaims.Email,
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
