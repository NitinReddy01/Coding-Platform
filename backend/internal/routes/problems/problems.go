package problems

import (
	"app/internal/middlewares"

	"github.com/go-chi/chi/v5"
)

func ProblemRoutes() *chi.Mux {

	r := chi.NewRouter()

	r.With(middlewares.Paginate).Get("/", FecthProblems)
	r.Post("/", AddProblem)
	r.Get("/languages", GetLanguages)
	r.Get("/{title}", GetProblemByTitle)

	return r

}
