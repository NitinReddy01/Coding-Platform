package mail

import (
	"app/internal/lib"
	"app/internal/lib/types"
	"app/internal/services"
	"encoding/json"
	"log"
	"net/http"
)

// handleSendMail handles the /send-mail POST request
func handleSendMail(w http.ResponseWriter, r *http.Request) {
	var req types.MailRequest

	// Decode the JSON request body into req
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		lib.JSONError(w, http.StatusBadRequest, "Missing fields in request body")
		return
	}

	if err := services.SendMail(req.To, req.Subject, req.Message, req.IsHTML); err != nil {
		log.Printf("Error when sending mail %v", err)
		lib.InternalErrorHandler(w)
		return
	}

	lib.JSON(w, http.StatusOK, map[string]string{
		"message": "Email sent successfully",
	})
}
