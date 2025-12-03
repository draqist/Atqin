package main

import (
	"net/http"
)

// requireAdmin middleware checks if the authenticated user has the 'admin' role.
// It must be used after requireAuth middleware.
func (app *application) requireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(UserContextKey).(string)
		if !ok || userID == "" {
			app.errorResponse(w, http.StatusUnauthorized, "Authentication required")
			return
		}

		user, err := app.models.Users.GetByID(userID)
		if err != nil {
			app.errorResponse(w, http.StatusUnauthorized, "User not found")
			return
		}

		if user.Role != "admin" {
			app.errorResponse(w, http.StatusForbidden, "Access denied: Admins only")
			return
		}

		next.ServeHTTP(w, r)
	}
}