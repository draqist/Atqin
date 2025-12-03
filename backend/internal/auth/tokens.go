// Package auth provides authentication and token management functionality.
package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// jwtSecret is the secret key used for signing JWT tokens.
// TODO: Move this to environment variables for security.
var jwtSecret = []byte("your-very-secret-key-change-this")

// Claims represents the custom JWT claims, including the user ID.
type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for the specified user ID.
// The token expires in 24 hours.
func GenerateToken(userID string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "iqraa-api",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ValidateToken parses and validates a JWT token string.
// It returns the claims if the token is valid, or an error otherwise.
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}