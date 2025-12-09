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
		Title          string  `json:"title"`
		OriginalAuthor string  `json:"original_author"`
		Description    string  `json:"description"`
		CoverImageURL  string  `json:"cover_image_url"`
		TitleAr        *string `json:"title_ar"`
		OriginalAuthorAr *string `json:"author_ar"`
		Status         *string `json:"status"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok || userID == "" {
		app.errorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := app.models.Users.GetByID(userID)
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to fetch user")
		return
	}

	book := &data.Book{
		Title:          input.Title,
		OriginalAuthor: input.OriginalAuthor,
		Description:    input.Description,
		Metadata:       json.RawMessage(`{}`),
		CoverImageURL:  input.CoverImageURL,
		TitleAr:        input.TitleAr,
		OriginalAuthorAr: input.OriginalAuthorAr,
		Status:         "draft", // Default to draft
	}

	if input.Status != nil && user.Role == "super_admin" {
		book.Status = *input.Status
		if book.Status == "published" {
			book.IsPublic = true
		}
	}
	
	// Default to private/draft is already handled above or by struct init.
	if book.Status != "published" {
		book.IsPublic = false
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
	input.Filters.IsPublic = app.readBool(qs, "is_public", v)
    status := app.readString(qs, "status", "")

	if data.ValidateFilters(v, input.Filters); !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

    // Auth check for status visibility
    userID, ok := r.Context().Value(UserContextKey).(string)
    if !ok || userID == "" {
        status = "published"
    } else {
        user, err := app.models.Users.GetByID(userID)
        if err != nil {
             // If auth fails internally, safer to show public info
            status = "published"
        } else if user.Role != "admin" && user.Role != "super_admin" {
            status = "published"
        }
        // If admin/super_admin, respect the provided 'status' query param (or empty for all)
    }

	books, metadata, err := app.models.Books.GetAll(input.Title, input.Filters, status)
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
		TitleAr        *string `json:"title_ar"`
		OriginalAuthorAr *string `json:"author_ar"`
		Status         *string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

    userID, ok := r.Context().Value(UserContextKey).(string)
    var userRole string
    if ok && userID != "" {
        u, _ := app.models.Users.GetByID(userID)
        if u != nil {
            userRole = u.Role
        }
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
	if input.TitleAr != nil {
		book.TitleAr = input.TitleAr
	}
	if input.OriginalAuthorAr != nil {
		book.OriginalAuthorAr = input.OriginalAuthorAr
	}
    
    if input.Status != nil {
        if userRole == "super_admin" {
            book.Status = *input.Status
            // Sync IsPublic
            if book.Status == "published" {
                book.IsPublic = true
            } else {
                book.IsPublic = false
            }
        } else if userRole == "admin" {
             // Admin can only edit drafts, can't publish?
             // User said: "they will not be able to publish it".
             // So if they try to set "published", we ignore or error.
             if *input.Status == "published" {
                 // Ignore or error. Let's error to be clear.
                 app.errorResponse(w, http.StatusForbidden, "Admins cannot publish books")
                 return
             }
             // Admin can potentially change back to draft or other non-published statuses?
             // Let's allow other statuses if any (e.g. pending_review).
             book.Status = *input.Status
             book.IsPublic = false // Ensure public is false
        }
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