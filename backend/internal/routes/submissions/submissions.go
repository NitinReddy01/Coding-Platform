package submissions

import (
	"app/internal/config"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func SubmissionRoutes(cfg *config.Config) *chi.Mux {
	router := chi.NewRouter()

	// Use closure to pass config to handler
	router.Post("/", func(w http.ResponseWriter, r *http.Request) {
		HandleSubmission(w, r, cfg.RabbitMQURL)
	})

	return router
}
