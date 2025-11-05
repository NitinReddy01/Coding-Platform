package problems

import (
	"app/internal/middlewares"

	"github.com/go-chi/chi/v5"
)

func ProblemRoutes() *chi.Mux {

	r := chi.NewRouter()

	r.With(middlewares.Paginate).Get("/", FecthProblems)
	r.With(middlewares.RequireRole("admin", "author")).Post("/", AddProblem)
	r.With(middlewares.RequireRole("admin", "author")).Post("/validate-validator", ValidateValidator)
	r.Get("/languages", GetLanguages)
	r.Get("/{title}", GetProblemByTitle)

	return r

}
