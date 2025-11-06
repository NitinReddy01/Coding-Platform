package auth

import (
	"app/internal/config"
	"app/internal/middlewares"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func AuthRoutes(cfg *config.Config) *chi.Mux {
	r := chi.NewRouter()

	// Public routes (no authentication required)
	r.Post("/register", func(w http.ResponseWriter, r *http.Request) {
		HandleRegister(w, r, cfg)
	})
	r.Post("/login", HandleLogin)
	r.Post("/refresh", HandleRefresh)
	r.Post("/logout", HandleLogout)

	// Email verification routes
	r.Get("/verify-email", HandleVerifyEmail)
	r.Post("/resend-verification", func(w http.ResponseWriter, r *http.Request) {
		HandleResendVerification(w, r, cfg)
	})

	// Protected routes (authentication required)
	r.With(middlewares.AuthMiddleware).Get("/me", HandleGetMe)

	return r
}
