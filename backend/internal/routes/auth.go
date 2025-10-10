package routes

import (
	"app/internal/handlers"
	"net/http"
)

func AuthRoutes() *http.ServeMux {
	authRouter := http.NewServeMux()

	authRouter.HandleFunc("POST /register", handlers.HandleRegister)
	authRouter.HandleFunc("POST /login", handlers.HandleLogin)
	authRouter.HandleFunc("POST /refresh", handlers.HandleRefresh)
	authRouter.HandleFunc("POST /logout", handlers.HandleLogout)

	return authRouter
}
