package auth

import (
	"app/internal/middlewares"

	"github.com/go-chi/chi/v5"
)

func AuthRoutes() *chi.Mux {
	r := chi.NewRouter()

	// Public routes (no authentication required)
	r.Post("/register", HandleRegister)
	r.Post("/login", HandleLogin)
	r.Post("/refresh", HandleRefresh)
	r.Post("/logout", HandleLogout)

	// Protected routes (authentication required)
	r.With(middlewares.AuthMiddleware).Get("/me", HandleGetMe)

	return r
}
