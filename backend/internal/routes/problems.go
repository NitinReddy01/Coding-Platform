package routes

import (
	"app/internal/handlers"
	"net/http"
)

func ProblemRoutes() *http.ServeMux {
	router := http.NewServeMux()

	router.HandleFunc("POST /", handlers.AddProblem)
	router.HandleFunc("GET /{title}", handlers.GetProblem)
	router.HandleFunc("GET /languages", handlers.GetLanguages)

	return router
}
