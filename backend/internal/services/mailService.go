package services

import (
	"errors"
	"log"
	"os"
	"strconv"

	gomail "gopkg.in/mail.v2"
)

func SendMail(to string, subject string, body string, isHtml bool) error {

	// Fetch SMTP configuration from environment variables
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	sender := os.Getenv("SMTP_SENDER")
	password := os.Getenv("SMTP_PASSWORD")

	// Basic validation
	if smtpHost == "" || smtpPort == "" || sender == "" || password == "" {
		return errors.New("SMTP configuration missing in environment variables")
	}

	parsedSmtpPort, err := strconv.Atoi(smtpPort)
	if err != nil {
		log.Fatalf("Failed to convert SMTP_SENDER to int: %v", err)
	}

	// Create a new message
	m := gomail.NewMessage()
	m.SetHeader("From", sender)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)

	if isHtml {
		m.SetBody("text/html", body)
	} else {
		m.SetBody("text/plain", body)
	}

	// Create a dialer
	d := gomail.NewDialer(smtpHost, parsedSmtpPort, sender, password)

	// Send the email
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
