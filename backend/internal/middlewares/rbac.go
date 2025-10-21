package middlewares

import (
	"app/internal/lib"
	"net/http"
)

// RequireRole creates a middleware that checks if the authenticated user has any of the specified roles
func RequireRole(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user context (populated by AuthMiddleware)
			userCtx := GetUserContext(r)
			if userCtx == nil {
				lib.JSONError(w, http.StatusUnauthorized, "Authentication required")
				return
			}

			// Check if user has any of the allowed roles
			hasRole := false
			for _, userRole := range userCtx.Roles {
				for _, allowedRole := range allowedRoles {
					if userRole == allowedRole {
						hasRole = true
						break
					}
				}
				if hasRole {
					break
				}
			}

			if !hasRole {
				lib.JSONError(w, http.StatusForbidden, "Insufficient permissions")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// HasAnyRole checks if the user context has any of the specified roles
func HasAnyRole(userCtx *UserContext, roles ...string) bool {
	if userCtx == nil {
		return false
	}

	for _, userRole := range userCtx.Roles {
		for _, role := range roles {
			if userRole == role {
				return true
			}
		}
	}
	return false
}
