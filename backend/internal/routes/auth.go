package routes

import (
	"app/internal/handlers"
	"net/http"
)

func AuthRoutes() *http.ServeMux {
	authRouter := http.NewServeMux()

	authRouter.HandleFunc("POST /login", handlers.HandleLogin)

	return authRouter
}
