package main

import (
	"net/http"
)

// requireAdmin allows 'admin' and 'super_admin' roles
// Use this for: Creating Books, Resources (Drafts)
func (app *application) requireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Get User ID from Context
		userID, ok := r.Context().Value(UserContextKey).(string)
		if !ok || userID == "" {
			app.errorResponse(w, http.StatusUnauthorized, "Authentication required")
			return
		}

		// 2. Fetch User to check Role
		user, err := app.models.Users.GetByID(userID)
		if err != nil {
			app.errorResponse(w, http.StatusUnauthorized, "User not found")
			return
		}

		// 3. Check Role
		if user.Role != "admin" && user.Role != "super_admin" {
			app.errorResponse(w, http.StatusForbidden, "Access denied: Admins only")
			return
		}

		next.ServeHTTP(w, r)
	}
}

// requireSuperAdmin allows ONLY 'super_admin'
// Use this for: Approving Content, Deleting Content, Managing Users
func (app *application) requireSuperAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, _ := r.Context().Value(UserContextKey).(string)
		user, err := app.models.Users.GetByID(userID)
		if err != nil {
			app.errorResponse(w, http.StatusUnauthorized, "User not found")
			return
		}

		if user.Role != "super_admin" {
			app.errorResponse(w, http.StatusForbidden, "Access denied: Super Admins only")
			return
		}

		next.ServeHTTP(w, r)
	}
}