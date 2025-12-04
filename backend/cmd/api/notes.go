package main

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
	"github.com/draqist/iqraa/backend/internal/validator"
)

// MockUserID is a placeholder for development without full auth.
const MockUserID = "00000000-0000-0000-0000-000000000001"

// getBookNoteHandler fetches the user's draft note for a specific book.
// GET /v1/books/{id}/note
func (app *application) getBookNoteHandler(w http.ResponseWriter, r *http.Request) {
	bookID := r.PathValue("id")

	userID := r.Context().Value(UserContextKey).(string)

	note, err := app.models.Notes.GetDraft(bookID, userID)
	if err != nil {
		if errors.Is(err, data.ErrRecordNotFound) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte("null"))
			return
		}
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}

// saveBookNoteHandler creates or updates a user's note for a specific book.
// PUT /v1/books/{id}/note
func (app *application) saveBookNoteHandler(w http.ResponseWriter, r *http.Request) {
	bookID := r.PathValue("id")
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var input struct {
		ID          string          `json:"id"`
		Content     json.RawMessage `json:"content"`
		Title       string          `json:"title"`
		Description string          `json:"description"`
		IsPublished bool            `json:"is_published"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	note := &data.Note{
		ID:          input.ID,
		BookID:      bookID,
		UserID:      userID,
		Content:     input.Content,
		Title:       input.Title,
		Description: input.Description,
		IsPublished: input.IsPublished,
	}

	err := app.models.Notes.Save(note)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}

// listPublicNotesHandler fetches the community feed (published notes) for a specific book.
// GET /v1/books/{id}/notes/public
func (app *application) listPublicNotesHandler(w http.ResponseWriter, r *http.Request) {
	bookID := r.PathValue("id")

	notes, err := app.models.Notes.GetPublished(bookID)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

// listAllPublicNotesHandler fetches the global community feed of published notes.
// GET /v1/notes/public
func (app *application) listAllPublicNotesHandler(w http.ResponseWriter, r *http.Request) {
	qs := r.URL.Query()
	category := qs.Get("category")
	search := qs.Get("q")

	v := validator.New()

	filters := data.NoteFilters{
		Category: category,
		Search:   search,
	}

	filters.Page = app.readInt(qs, "page", 1, v)
	filters.PageSize = app.readInt(qs, "page_size", 20, v)
	filters.Sort = app.readString(qs, "sort", "created_at")
	filters.SortSafeList = []string{"created_at"}

	if data.ValidateFilters(v, filters.Filters); !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	notes, metadata, err := app.models.Notes.GetAllPublished(filters)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{"notes": notes, "metadata": metadata}, nil)
}

// getPublicNoteHandler fetches a specific published note by its ID.
// GET /v1/notes/public/{id}
func (app *application) getPublicNoteHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	note, err := app.models.Notes.GetPublicByID(id)
	if err != nil {
		if errors.Is(err, data.ErrRecordNotFound) {
			app.errorResponse(w, http.StatusNotFound, "Note not found")
			return
		}
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}