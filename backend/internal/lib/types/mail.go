package types

type MailRequest struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Message string `json:"message"`
	IsHTML  bool   `json:"isHtml"`
}
