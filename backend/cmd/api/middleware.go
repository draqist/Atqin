package main

import "net/http"

func (app *application) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Allow specific origin (Frontend)
		// In production, you would check a list of allowed origins
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")

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