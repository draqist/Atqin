package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/draqist/iqraa/backend/internal/auth"
	"github.com/draqist/iqraa/backend/internal/data"
)

func (app *application) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Username string `json:"username"` // Added
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// Basic validation
	if input.Name == "" || input.Email == "" || len(input.Password) < 8 {
		app.errorResponse(w, http.StatusBadRequest, "Invalid name, email, or password (min 8 chars)")
		return
	}

	user := &data.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: input.Password,
		Username: input.Username, // Added
	}

	err := app.models.Users.Insert(user)
	if err != nil {
		if errors.Is(err, data.ErrDuplicateEmail) {
			app.errorResponse(w, http.StatusConflict, "Email already in use")
		} else {
			app.errorResponse(w, http.StatusInternalServerError, "Failed to register user")
		}
		return
	}

	// Generate Token immediately
	token, err := app.generateToken(user.ID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"token": token,
		"user":  user,
	})
}

func (app *application) loginUserHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		// We will allow Email field to be username or email
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// Use GetByEmailOrUsername (to be implemented)
	user, err := app.models.Users.GetByEmailOrUsername(input.Email)
	if err != nil {
		app.errorResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	match, err := user.PasswordMatches(input.Password)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to verify password")
		return
	}

	if !match {
		app.errorResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	token, err := app.generateToken(user.ID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"token": token,
		"user":  user,
	})
}

func (app *application) getMeHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserContextKey).(string)

	user, err := app.models.Users.GetByID(userID)
	if err != nil {
		app.errorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (app *application) searchUsersHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		app.errorResponse(w, http.StatusBadRequest, "Query parameter 'q' is required")
		return
	}

	users, err := app.models.Users.Search(query)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to search users")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (app *application) forgotPasswordHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	user, err := app.models.Users.GetByEmail(input.Email)
	if err != nil {
		if errors.Is(err, data.ErrRecordNotFound) {
			// Do not reveal if email exists, just return accepted
			w.WriteHeader(http.StatusAccepted)
			json.NewEncoder(w).Encode(map[string]string{"message": "If that email exists, we sent a reset link to it."})
			return
		}
		app.errorResponse(w, http.StatusInternalServerError, "Failed to process request")
		return
	}

	// Generate a random token
	tokenBytes := make([]byte, 16)
	_, err = rand.Read(tokenBytes)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}
	token := hex.EncodeToString(tokenBytes)

	// Hash the token for storage
	hash := sha256.Sum256([]byte(token))
	hashSlice := hash[:]

	expiry := time.Now().Add(1 * time.Hour) // Token valid for 1 hour

	err = app.models.Users.SetPasswordResetToken(user.ID, hashSlice, expiry)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to store reset token")
		return
	}

	// Send email (simulated for now)
	err = app.mailer.SendPasswordReset(user.Email, token)
	if err != nil {
		app.logger.Println("Failed to send email:", err)
	}

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{"message": "If that email exists, we sent a reset link to it."})
}

func (app *application) resetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	if len(input.Password) < 8 {
		app.errorResponse(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}

	// Hash the provided token
	hash := sha256.Sum256([]byte(input.Token))
	hashSlice := hash[:]

	user, err := app.models.Users.GetByPasswordResetToken(hashSlice)
	if err != nil {
		if errors.Is(err, data.ErrRecordNotFound) {
			app.errorResponse(w, http.StatusBadRequest, "Invalid or expired token")
			return
		}
		app.errorResponse(w, http.StatusInternalServerError, "Failed to validate token")
		return
	}

	err = app.models.Users.UpdatePassword(user.ID, input.Password)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to update password")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Password updated successfully"})
}

func (app *application) generateToken(userID string) (string, error) {
	return auth.GenerateToken(userID)
}
