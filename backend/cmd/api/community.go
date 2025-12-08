package main

import (
	"net/http"

	"github.com/draqist/iqraa/backend/internal/data"
)

// contextGetUser retrieves the User from the request context.
// It assumes the user has already been authenticated and the ID is in the context.
func (app *application) contextGetUser(r *http.Request) *data.User {
	userID, ok := r.Context().Value(UserContextKey).(string)
	if !ok {
		return nil
	}

	user, err := app.models.Users.GetByID(userID)
	if err != nil {
		return nil
	}

	return user
}

// -------------------------------------------------------------------------
// 1. List Discussions (GET /v1/discussions?type=book&id=123)
// -------------------------------------------------------------------------
func (app *application) listDiscussionsHandler(w http.ResponseWriter, r *http.Request) {
	qs := r.URL.Query()
	contextType := qs.Get("type")
	contextID := qs.Get("id")

	// Basic Validation
	if contextType == "" || contextID == "" {
		app.errorResponse(w, http.StatusBadRequest, "context_type and context_id are required")
		return
	}

	discussions, err := app.models.Community.GetContextDiscussions(contextType, contextID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	// Always return an array, even if empty (avoid null in JSON)
	if discussions == nil {
		discussions = []*data.Discussion{}
	}

	app.writeJSON(w, http.StatusOK, envelope{"discussions": discussions}, nil)
}

// -------------------------------------------------------------------------
// 2. Create Discussion (POST /v1/discussions)
// -------------------------------------------------------------------------
func (app *application) createDiscussionHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		ContextType string `json:"context_type"`
		ContextID   string `json:"context_id"`
		Title       string `json:"title"`
		Body        string `json:"body"`
	}

	if err := app.readJSON(w, r, &input); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user := app.contextGetUser(r)
	if user == nil {
		app.serverErrorResponse(w, r, nil)
		return
	}

	d := &data.Discussion{
		UserID:      user.ID,
		ContextType: input.ContextType,
		ContextID:   input.ContextID,
		Title:       input.Title,
		Body:        input.Body,
	}

	err := app.models.Community.CreateDiscussion(d)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusCreated, envelope{"discussion": d}, nil)
}

// -------------------------------------------------------------------------
// 3. Get Replies (GET /v1/discussions/:id/replies)
// -------------------------------------------------------------------------
func (app *application) listRepliesHandler(w http.ResponseWriter, r *http.Request) {
	discussionID := r.PathValue("id")
	
	replies, err := app.models.Community.GetReplies(discussionID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if replies == nil {
		replies = []*data.Reply{}
	}

	app.writeJSON(w, http.StatusOK, envelope{"replies": replies}, nil)
}

// -------------------------------------------------------------------------
// 4. Create Reply (POST /v1/discussions/:id/replies)
// -------------------------------------------------------------------------
func (app *application) createReplyHandler(w http.ResponseWriter, r *http.Request) {
	discussionID := r.PathValue("id")

	var input struct {
		Body string `json:"body"`
	}

	if err := app.readJSON(w, r, &input); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user := app.contextGetUser(r)
	if user == nil {
		app.serverErrorResponse(w, r, nil)
		return
	}

	reply := &data.Reply{
		DiscussionID: discussionID,
		UserID:       user.ID,
		Body:         input.Body,
	}

	err := app.models.Community.CreateReply(reply)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusCreated, envelope{"reply": reply}, nil)
}