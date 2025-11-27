package main

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/draqist/iqraa/backend/internal/auth"
)

func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Allow specific origin (Frontend)
		// In production, you would check a list of allowed origins
		frontendURL := os.Getenv("FRONTEND_URL")
        if frontendURL == "" {
            frontendURL = "http://localhost:3000" // Fallback for dev
        }

        w.Header().Set("Access-Control-Allow-Origin", frontendURL)

		// 2. Allow specific methods
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// 3. Allow specific headers (Content-Type is crucial for JSON)
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")

		// 4. Handle Preflight Requests
		// Browsers send an empty "OPTIONS" request first to check permissions.
		// We must reply with "OK" immediately and stop processing.
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 5. Pass the request to the next handler (The Waiter)
		next.ServeHTTP(w, r)
	})
}

func (app *application) authenticateIfExists(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		// 1. If no header, proceed as Guest immediately (Don't error)
		if authHeader == "" {
			next.ServeHTTP(w, r)
			return
		}

		// 2. Check format
		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
			// Bad format? Just ignore it and proceed as Guest
			next.ServeHTTP(w, r)
			return
		}

		token := headerParts[1]

		// 3. Validate the token
		claims, err := auth.ValidateToken(token)
		if err != nil {
			// Invalid token? Just ignore it and proceed as Guest
			next.ServeHTTP(w, r)
			return
		}

		// 4. Valid Token found! Add to context.
		ctx := context.WithValue(r.Context(), UserContextKey, claims.UserID)

		// CRITICAL FIX: Use r.WithContext(ctx) to pass the user ID down the chain
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}