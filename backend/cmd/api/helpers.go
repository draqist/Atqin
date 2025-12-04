package main

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"

	"github.com/draqist/iqraa/backend/internal/validator" // Assuming you have or need a validator
)

// readString retrieves a string value from query parameters or returns a default value.
func (app *application) readString(qs url.Values, key string, defaultValue string) string {
	s := qs.Get(key)
	if s == "" {
		return defaultValue
	}
	return s
}

// readInt retrieves an integer value from query parameters or returns a default value.
// It adds a validation error if the value is not a valid integer.
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

// readBool retrieves a boolean value from query parameters or returns nil.
func (app *application) readBool(qs url.Values, key string, v *validator.Validator) *bool {
	s := qs.Get(key)
	if s == "" {
		return nil
	}

	b, err := strconv.ParseBool(s)
	if err != nil {
		v.AddError(key, "must be a boolean value")
		return nil
	}

	return &b
}

// writeJSON sends a JSON response with the specified status code, data, and headers.
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

// errorResponse sends a JSON error response with the specified status code and message.
func (app *application) errorResponse(w http.ResponseWriter, status int, message any) {
	env := envelope{"error": message}

	err := app.writeJSON(w, status, env, nil)
	if err != nil {
		app.logger.Println(err)
		w.WriteHeader(500)
	}
}

// failedValidationResponse sends a 422 Unprocessable Entity response with validation errors.
func (app *application) failedValidationResponse(w http.ResponseWriter, r *http.Request, errors map[string]string) {
	app.errorResponse(w, http.StatusUnprocessableEntity, errors)
}

// envelope is a generic map for wrapping JSON responses.
type envelope map[string]any