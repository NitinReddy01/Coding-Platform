package submissions

import (
	"app/internal/config"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func SubmissionRoutes(cfg *config.Config) *chi.Mux {
	router := chi.NewRouter()

	router.Post("/", func(w http.ResponseWriter, r *http.Request) {
		HandleSubmission(w, r, cfg.RabbitMQURL)
	})

	router.Get("/status/{submissionId}", GetSubmissionStatus)
	router.Get("/problem/{problemId}/latest", GetLatestSubmissionForProblem)

	return router
}
