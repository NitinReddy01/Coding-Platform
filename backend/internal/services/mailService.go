package services

import (
	"log"

	"github.com/resend/resend-go/v3"
)

func SendMail(to string, subject string, body string, apiKey string) error {
	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From:    "Nitin <nitingogula@gmail.com>",
		To:      []string{to},
		Subject: subject,
		Html:    body,
	}
	_, err := client.Emails.Send(params)

	if err != nil {
		return err
	}

	return nil
}

// SendMailAsync sends email asynchronously without blocking
func SendMailAsync(to string, subject string, body string, apiKey string) {
	go func() {
		err := SendMail(to, subject, body, apiKey)
		if err != nil {
			log.Printf("Error sending email to %s: %v", to, err)
		} else {
			log.Printf("Email sent successfully to %s", to)
		}
	}()
}
