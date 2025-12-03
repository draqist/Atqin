package main

import (
	"encoding/json"
	"net/http"
)

// toggleBookmarkHandler adds or removes a book from the user's bookmarks.
// POST /v1/books/{id}/bookmark
func (app *application) toggleBookmarkHandler(w http.ResponseWriter, r *http.Request) {
	bookID := r.PathValue("id")
	userID := r.Context().Value(UserContextKey).(string)

	isBookmarked, err := app.models.Bookmarks.Toggle(userID, bookID)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	response := map[string]bool{"bookmarked": isBookmarked}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// listBookmarksHandler retrieves all bookmarked books for the authenticated user.
// GET /v1/bookmarks
func (app *application) listBookmarksHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserContextKey).(string)

	books, err := app.models.Bookmarks.GetUserBookmarks(userID)
	if err != nil {
		app.logger.Println(err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}