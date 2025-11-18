package main

import (
	"encoding/json"
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
)

// createBookHandler handles POST /v1/books
func (app *application) createBookHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Define a struct to hold the incoming JSON data
	var input struct {
		Title          string `json:"title"`
		OriginalAuthor string `json:"original_author"`
		Description    string `json:"description"`
	}

	// 2. Decode the JSON body
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// 3. Create the Book model
	book := &data.Book{
		Title:          input.Title,
		OriginalAuthor: input.OriginalAuthor,
		Description:    input.Description,
		Metadata:       json.RawMessage(`{}`), // Empty JSON for now
		IsPublic:       true,
	}

	// 4. Insert data into the database
	err = app.models.Books.Insert(book)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// 5. Send the response back
	// We encode the created book (which now has an ID) back to JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// showBookHandler handles GET /v1/books/{id}
func (app *application) showBookHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Get ID from URL
	id := r.PathValue("id")

	// 2. Call the Chef (Model)
	book, err := app.models.Books.Get(id)
	if err != nil {
		// If record not found, 404. Otherwise, 500.
		if err.Error() == "record not found" {
			http.Error(w, "Book not found", http.StatusNotFound)
		} else {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
		return
	}

	// 3. Serve the JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// listBooksHandler handles GET /v1/books
func (app *application) listBooksHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Call the Chef (Model)
	books, err := app.models.Books.GetAll()
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// 2. Serve the JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}
