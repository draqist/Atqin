package main

import (
	"context"
	"net/http"
	"strings"

	"github.com/draqist/iqraa/backend/internal/auth"
)

// contextKey is a custom type for context keys to avoid collisions.
type contextKey string

// UserContextKey is the key used to store the UserID in the request context.
const UserContextKey = contextKey("userID")

// requireAuth middleware ensures that the request contains a valid Bearer token.
// It validates the token and adds the UserID to the request context.
func (app *application) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			app.errorResponse(w, http.StatusUnauthorized, "Missing authorization header")
			return
		}

		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
			app.errorResponse(w, http.StatusUnauthorized, "Invalid authorization header format")
			return
		}

		token := headerParts[1]

		claims, err := auth.ValidateToken(token)
		if err != nil {
			app.errorResponse(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
