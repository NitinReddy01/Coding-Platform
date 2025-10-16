package problems

import (
	"github.com/go-chi/chi/v5"
)

func ProblemRoutes() *chi.Mux {

	r := chi.NewRouter()

	r.Post("/", AddProblem)
	r.Get("/languages", GetLanguages)
	r.Get("/{title}", GetProblemByTitle)

	return r

}
