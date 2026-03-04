package main

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/draqist/iqraa/backend/internal/auth"
)

// enableCORS sets up Cross-Origin Resource Sharing (CORS) headers for the application.
// It allows requests from configured origins and handles preflight OPTIONS requests.
// For mobile apps (React Native/Expo), we need to be more permissive.
func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		
		// Allowed origins list
		allowedOrigins := []string{
			os.Getenv("FRONTEND_URL"),
			"http://localhost:3000",
			"http://localhost:8081", // Expo web
		}
		
		// For mobile apps, Origin header might be empty or different
		// In development, we can be more permissive
		allowOrigin := ""
		if origin == "" {
			// Mobile apps often don't send Origin header - allow the request
			allowOrigin = "*"
		} else {
			// Check if origin is in allowed list
			for _, allowed := range allowedOrigins {
				if origin == allowed {
					allowOrigin = origin
					break
				}
			}
			// In development, allow any localhost origin
			if allowOrigin == "" && (strings.HasPrefix(origin, "http://localhost") || strings.HasPrefix(origin, "http://10.") || strings.HasPrefix(origin, "http://192.168.")) {
				allowOrigin = origin
			}
		}
		
		if allowOrigin != "" {
			w.Header().Set("Access-Control-Allow-Origin", allowOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

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