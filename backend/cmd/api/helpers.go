package main

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"

	"github.com/draqist/iqraa/backend/internal/validator" // Assuming you have or need a validator
)

// readString is a helper to read a string from query params or return default
func (app *application) readString(qs url.Values, key string, defaultValue string) string {
	s := qs.Get(key)
	if s == "" {
		return defaultValue
	}
	return s
}

// readInt reads an integer from query params or returns default
// It also adds an error to the validator if the value is not an integer
func (app *application) readInt(qs url.Values, key string, defaultValue int, v *validator.Validator) int {
	s := qs.Get(key)
	if s == "" {
		return defaultValue
	}

	i, err := strconv.Atoi(s)
	if err != nil {
		v.AddError(key, "must be an integer value")
		return defaultValue
	}

	return i
}

// Helper for JSON responses (You likely have something similar already)
func (app *application) writeJSON(w http.ResponseWriter, status int, data any, headers http.Header) error {
	js, err := json.Marshal(data)
	if err != nil {
		return err
	}

	js = append(js, '\n')

	for key, value := range headers {
		w.Header()[key] = value
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(js)
	return nil
}

func (app *application) errorResponse(w http.ResponseWriter, status int, message any) {
	env := envelope{"error": message}

	err := app.writeJSON(w, status, env, nil)
	if err != nil {
		app.logger.Println(err)
		w.WriteHeader(500)
	}
}

func (app *application) failedValidationResponse(w http.ResponseWriter, r *http.Request, errors map[string]string) {
	app.errorResponse(w, http.StatusUnprocessableEntity, errors)
}

type envelope map[string]any