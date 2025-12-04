package main

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
	"github.com/draqist/iqraa/backend/internal/validator"
)

// createBookHandler handles the creation of a new book.
// POST /v1/books
func (app *application) createBookHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title          string `json:"title"`
		OriginalAuthor string `json:"original_author"`
		Description    string `json:"description"`
		CoverImageURL  string `json:"cover_image_url"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	book := &data.Book{
		Title:          input.Title,
		OriginalAuthor: input.OriginalAuthor,
		Description:    input.Description,
		Metadata:       json.RawMessage(`{}`),
		IsPublic:       true,
		CoverImageURL:  input.CoverImageURL,
	}

	err = app.models.Books.Insert(book)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// showBookHandler retrieves a specific book by its ID.
// GET /v1/books/{id}
func (app *application) showBookHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	book, err := app.models.Books.Get(id)
	if err != nil {
		if err.Error() == "record not found" {
			http.Error(w, "Book not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// listBooksHandler retrieves a paginated list of books with optional filtering.
// GET /v1/books
func (app *application) listBooksHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title string
		data.Filters
	}

	v := validator.New()

	qs := r.URL.Query()

	input.Title = app.readString(qs, "q", "")
	input.Filters.Page = app.readInt(qs, "page", 1, v)
	input.Filters.PageSize = app.readInt(qs, "page_size", 20, v)
	input.Filters.Sort = app.readString(qs, "sort", "id")
	input.Filters.SortSafeList = []string{"id", "title", "created_at", "-id", "-title", "-created_at"}

	if data.ValidateFilters(v, input.Filters); !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	books, metadata, err := app.models.Books.GetAll(input.Title, input.Filters)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{"books": books, "metadata": metadata}, nil)
}

// updateBookHandler updates an existing book's details.
// PUT /v1/books/{id}
func (app *application) updateBookHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	book, err := app.models.Books.Get(id)
	if err != nil {
		app.errorResponse(w, http.StatusNotFound, "Book not found")
		return
	}

	var input struct {
		Title          *string `json:"title"`
		OriginalAuthor *string `json:"original_author"`
		Description    *string `json:"description"`
		CoverImageURL  *string `json:"cover_image_url"`
		Category       *string `json:"category"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	if input.Title != nil {
		book.Title = *input.Title
	}
	if input.OriginalAuthor != nil {
		book.OriginalAuthor = *input.OriginalAuthor
	}
	if input.Description != nil {
		book.Description = *input.Description
	}
	if input.CoverImageURL != nil {
		book.CoverImageURL = *input.CoverImageURL
	}

	if input.Category != nil {
		metaMap := map[string]string{"category": *input.Category}
		jsonBytes, _ := json.Marshal(metaMap)
		book.Metadata = jsonBytes
	}

	err = app.models.Books.Update(book)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to update book")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// deleteBookHandler removes a book from the database.
// DELETE /v1/books/{id}
func (app *application) deleteBookHandler(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	err := app.models.Books.Delete(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrRecordNotFound):
			app.errorResponse(w, http.StatusNotFound, "Book not found")
		default:
			app.errorResponse(w, http.StatusInternalServerError, "Failed to delete book")
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message": "book deleted successfully"}`))
}

// saveProgressHandler updates the user's reading progress for a specific book.
// POST /v1/books/{id}/progress
func (app *application) saveProgressHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	bookID := r.PathValue("id")

	var input struct {
		CurrentPage int `json:"current_page"`
		TotalPages  int `json:"total_pages"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	err := app.models.Books.UpdateProgress(userID, bookID, input.CurrentPage, input.TotalPages)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to save progress")
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "progress saved"}`))
}