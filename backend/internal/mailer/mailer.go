package mailer

import (
	"fmt"
	"net/smtp"
)

type Mailer struct {
	host     string
	port     int
	username string
	password string
	sender   string
}

func New(host string, port int, username, password, sender string) Mailer {
	return Mailer{
		host:     host,
		port:     port,
		username: username,
		password: password,
		sender:   sender,
	}
}

// SendPasswordReset sends a password reset email
func (m Mailer) SendPasswordReset(recipient, token string) error {
	addr := fmt.Sprintf("%s:%d", m.host, m.port)
	auth := smtp.PlainAuth("", m.username, m.password, m.host)

	msg := []byte("To: " + recipient + "\r\n" +
		"Subject: Reset your password\r\n" +
		"From: " + m.sender + "\r\n" +
		"\r\n" +
		"Use the following token to reset your password: " + token + "\r\n")

	err := smtp.SendMail(addr, auth, m.sender, []string{recipient}, msg)
	if err != nil {
		return err
	}

	return nil
}
