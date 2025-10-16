package routes

import (
	"app/internal/lib"
	"app/internal/middlewares"
	"app/internal/routes/auth"
	"app/internal/routes/problems"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func New(allowedOrigins []string) *chi.Mux {
	r := chi.NewRouter()

	r.Route("/api", func(r chi.Router) {

		r.Use(func(next http.Handler) http.Handler {
			return middlewares.CORSMiddleware(next, allowedOrigins)
		})

		r.Group(func(public chi.Router) {
			public.Get("/health", func(w http.ResponseWriter, r *http.Request) {
				lib.JSON(w, http.StatusOK, map[string]string{"health": "ok"})
			})

			public.Mount("/auth", auth.AuthRoutes())
		})

		r.Group(func(private chi.Router) {
			private.Use(middlewares.AuthMiddleware)

			private.Mount("/problems", problems.ProblemRoutes())
		})
	})

	return r
}
