package main

import (
	"net/http"
)

func (app *application) requireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Get the UserID from the context (set by requireAuth)
		userID, ok := r.Context().Value(UserContextKey).(string)
		if !ok || userID == "" {
			app.errorResponse(w, http.StatusUnauthorized, "Authentication required")
			return
		}

		// 2. Fetch the user from DB to check their current role
		// (We hit the DB here to ensure that if we demote an admin, 
		// their access is revoked immediately, even if their token is still valid)
		user, err := app.models.Users.GetByID(userID)
		if err != nil {
			app.errorResponse(w, http.StatusUnauthorized, "User not found")
			return
		}

		// 3. Check the Role
		if user.Role != "admin" {
			app.errorResponse(w, http.StatusForbidden, "Access denied: Admins only")
			return
		}

		// 4. Pass to the next handler
		next.ServeHTTP(w, r)
	}
}