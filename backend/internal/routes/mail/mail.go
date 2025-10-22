package mail

import (
	"github.com/go-chi/chi/v5"
)

func MailRoutes() *chi.Mux {
	r := chi.NewRouter()
	
	r.Post("/send-mail", handleSendMail)
	return r
}
