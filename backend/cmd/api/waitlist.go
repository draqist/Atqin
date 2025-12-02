package main

import (
	"encoding/json"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/validator"
)

func (app *application) subscribeHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email string `json:"email"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	v := validator.New()
	if validator.Matches(input.Email, validator.EmailRX); !v.Valid() {
		v.AddError("email", "must be a valid email address")
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	err = app.models.Waitlist.Insert(input.Email)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to subscribe")
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Subscribed successfully"})
}
