package mail

import (
	"app/internal/config"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func MailRoutes(cfg *config.Config) *chi.Mux {
	r := chi.NewRouter()

	r.Post("/send-mail", func(w http.ResponseWriter, r *http.Request) {
		handleSendMail(w, r, cfg)
	})

	return r
}
