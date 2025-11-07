package mail

import (
	"app/internal/config"
	"app/internal/lib"
	"app/internal/lib/types"
	"app/internal/services"
	"encoding/json"
	"log"
	"net/http"
)

// handleSendMail handles the /send-mail POST request
func handleSendMail(w http.ResponseWriter, r *http.Request, cfg *config.Config) {
	var req types.MailRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&req); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Missing fields in request body")
		return
	}

	if err := services.SendMail(req.To, req.Subject, req.Message, cfg.ResendAPIKey); err != nil {
		log.Printf("Error when sending mail %v", err)
		lib.InternalErrorHandler(w)
		return
	}

	lib.JSON(w, http.StatusOK, map[string]string{
		"message": "Email sent successfully",
	})
}
