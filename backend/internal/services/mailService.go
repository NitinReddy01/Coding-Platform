package services

import (
	"crypto/tls"
	"log"
	"time"

	gomail "gopkg.in/mail.v2"
)

func SendMail(to string, subject string, body string, isHtml bool, smtpHost string, smtpPort int, smtpSender string, smtpPassword string) error {
	// Create a new message
	m := gomail.NewMessage()
	m.SetHeader("From", smtpSender)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)

	if isHtml {
		m.SetBody("text/html", body)
	} else {
		m.SetBody("text/plain", body)
	}

	// Create a dialer with explicit TLS configuration
	d := gomail.NewDialer(smtpHost, smtpPort, smtpSender, smtpPassword)
	d.Timeout = 10 * time.Second
	d.TLSConfig = &tls.Config{
		ServerName: smtpHost,
	}

	// Send the email
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}

// SendMailAsync sends email asynchronously without blocking
func SendMailAsync(to string, subject string, body string, isHtml bool, smtpHost string, smtpPort int, smtpSender string, smtpPassword string) {
	go func() {
		err := SendMail(to, subject, body, isHtml, smtpHost, smtpPort, smtpSender, smtpPassword)
		if err != nil {
			log.Printf("Error sending email to %s: %v", to, err)
		} else {
			log.Printf("Email sent successfully to %s", to)
		}
	}()
}
