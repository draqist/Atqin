package main

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/draqist/iqraa/backend/internal/auth"
)

// enableCORS sets up Cross-Origin Resource Sharing (CORS) headers for the application.
// It allows requests from the configured frontend URL and handles preflight OPTIONS requests.
func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		frontendURL := os.Getenv("FRONTEND_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:3000"
		}

		w.Header().Set("Access-Control-Allow-Origin", frontendURL)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// authenticateIfExists checks for a Bearer token in the Authorization header.
// If a valid token is present, it adds the UserID to the request context.
// If the token is missing or invalid, it proceeds without adding the UserID (Guest mode).
func (app *application) authenticateIfExists(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			next.ServeHTTP(w, r)
			return
		}

		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
			next.ServeHTTP(w, r)
			return
		}

		token := headerParts[1]

		claims, err := auth.ValidateToken(token)
		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}