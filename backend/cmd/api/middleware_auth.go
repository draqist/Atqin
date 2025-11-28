package main

import (
	"context"
	"net/http"
	"strings"

	"github.com/draqist/iqraa/backend/internal/auth"
)

// Define a custom key type to avoid context collisions
type contextKey string
const UserContextKey = contextKey("userID")

func (app *application) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Get the Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			app.errorResponse(w, http.StatusUnauthorized, "Missing authorization header")
			return
		}

		// 2. Expect format "Bearer <token>"
		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
			app.errorResponse(w, http.StatusUnauthorized, "Invalid authorization header format")
			return
		}

		token := headerParts[1]

		// 3. Validate the token
		claims, err := auth.ValidateToken(token)
		if err != nil {
			app.errorResponse(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		// 4. Add UserID to the request context so handlers can use it
		ctx := context.WithValue(r.Context(), UserContextKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
