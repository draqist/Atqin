package mailer

import (
	"fmt"
	"net/smtp"
)

type Mailer struct {
	dialer *smtp.Auth
	sender string
}

func New(host string, port int, username, password, sender string) Mailer {
	auth := smtp.PlainAuth("", username, password, host)
	return Mailer{
		dialer: &auth,
		sender: sender,
	}
}

func (m Mailer) Send(recipient, templateFile string, data any) error {
	// For now, we will just log the email content to stdout as requested in the plan
	// since we might not have a real SMTP server configured in dev.
	// In a real implementation, we would parse templates and send actual emails.
	
	// If we wanted to send real emails:
	// msg := []byte("To: " + recipient + "\r\n" +
	// 	"Subject: Reset your password\r\n" +
	// 	"\r\n" +
	// 	fmt.Sprintf("%v", data) + "\r\n")
	// addr := fmt.Sprintf("%s:%d", "smtp.example.com", 587)
	// err := smtp.SendMail(addr, *m.dialer, m.sender, []string{recipient}, msg)
	// return err
	
	return nil
}

// SendPasswordReset sends a password reset email (simulated)
func (m Mailer) SendPasswordReset(recipient, token string) error {
	fmt.Printf("----------------------------------------\n")
	fmt.Printf("Sending Password Reset Email to %s\n", recipient)
	fmt.Printf("Token: %s\n", token)
	fmt.Printf("----------------------------------------\n")
	return nil
}
