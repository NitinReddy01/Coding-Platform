package routes

import (
	"app/internal/config"
	"app/internal/lib"
	"app/internal/middlewares"
	"app/internal/routes/auth"
	"app/internal/routes/mail"
	"app/internal/routes/problems"
	"app/internal/routes/submissions"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func New(cfg *config.Config) *chi.Mux {
	r := chi.NewRouter()

	r.Route("/api", func(r chi.Router) {

		r.Use(func(next http.Handler) http.Handler {
			return middlewares.CORSMiddleware(next, cfg.AllowedOrigins)
		})

		r.Group(func(public chi.Router) {
			public.Get("/health", func(w http.ResponseWriter, r *http.Request) {
				lib.JSON(w, http.StatusOK, map[string]string{"health": "ok"})
			})

			public.Mount("/auth", auth.AuthRoutes(cfg))
		})

		r.Group(func(private chi.Router) {
			private.Use(middlewares.AuthMiddleware)

			private.Mount("/problems", problems.ProblemRoutes())
			private.Mount("/mails", mail.MailRoutes(cfg))
			private.Mount("/submissions", submissions.SubmissionRoutes(cfg))
		})

		r.Group(func(internal chi.Router) {
			internal.Use(middlewares.WorkerAuthMiddleware(cfg.WorkerAPIKey))
			internal.Mount("/internal/submissions", submissions.InternalSubmissionRoutes())
		})
	})

	return r
}
