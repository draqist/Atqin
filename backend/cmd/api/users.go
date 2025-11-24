package main

import (
	"encoding/json"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/auth"
	"github.com/draqist/iqraa/backend/internal/data"
)

func (app *application) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	user := &data.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: input.Password,
	}

	// Insert user (hashes password inside model)
	err := app.models.Users.Insert(user)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Could not create user")
		return
	}

	// Generate Token immediately so they are logged in
	token, _ := auth.GenerateToken(user.ID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token, "user_id": user.ID, "name": user.Name})
}

func (app *application) loginUserHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// 1. Find User
	user, err := app.models.Users.GetByEmail(input.Email)
	if err != nil {
		app.errorResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// 2. Check Password
	match, err := user.PasswordMatches(input.Password)
	if err != nil || !match {
		app.errorResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// 3. Generate Token
	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Token generation failed")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token, "user_id": user.ID, "name": user.Name})
}

func (app *application) getMeHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Get ID from Context (set by middleware)
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Invalid user context")
		return
	}

	// 2. Fetch User Details
	user, err := app.models.Users.GetByID(userID)
	if err != nil {
		app.errorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	// 3. Return JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}