package auth

import "github.com/go-chi/chi/v5"

func AuthRoutes() *chi.Mux {
	r := chi.NewRouter()

	r.Post("/register", HandleRegister)
	r.Post("/login", HandleLogin)
	r.Post("/refresh", HandleRefresh)
	r.Post("/logout", HandleLogout)

	return r
}
