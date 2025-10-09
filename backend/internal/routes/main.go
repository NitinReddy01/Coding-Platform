package routes

import (
	"net/http"
)

func ApiRoutes() *http.ServeMux {
	router := http.NewServeMux()

	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	router.Handle("/auth/", http.StripPrefix("/auth", AuthRoutes()))
	router.Handle("/problems/", http.StripPrefix("/problems", ProblemRoutes()))

	return router
}
