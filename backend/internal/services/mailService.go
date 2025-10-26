package services

import (
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

	// Create a dialer
	d := gomail.NewDialer(smtpHost, smtpPort, smtpSender, smtpPassword)

	// Send the email
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
