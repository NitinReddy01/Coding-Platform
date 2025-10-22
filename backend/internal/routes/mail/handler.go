package mail

import (
	"app/internal/lib"
	"app/internal/lib/types"
	"app/internal/services"
	"encoding/json"
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
		lib.InternalErrorHandler(w)
		return
	}

	lib.JSON(w, http.StatusOK, map[string]string{
		"message": "Email sent successfully",
	})
}
