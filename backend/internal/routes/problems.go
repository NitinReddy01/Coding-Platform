package routes

import (
	"app/internal/handlers"
	"net/http"
)

func ProblemRoutes() *http.ServeMux {
	router := http.NewServeMux()

	router.HandleFunc("GET /languages", handlers.GetLanguages)
	router.HandleFunc("POST /as", handlers.AddProblem)
	router.HandleFunc("GET /{title}", handlers.GetProblem)

	return router
}
