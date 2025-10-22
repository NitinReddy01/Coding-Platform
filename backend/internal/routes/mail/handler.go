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
		lib.JSONError(w, http.StatusInternalServerError, "Missing fields in request body")
		return
	}

	if err := services.SendMail(req.To, req.Subject, req.Message, req.IsHTML); err != nil {
		lib.JSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	lib.JSON(w, http.StatusCreated, map[string]any{
		"message": "Email sent successfully",
		"status":  http.StatusOK,
	})
}
