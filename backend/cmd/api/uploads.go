package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

func (app *application) generateUploadURLHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Filename string `json:"filename"`
		Type     string `json:"type"` // e.g., "image/jpeg" or "application/pdf"
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// 1. Generate a clean, unique path
	ext := filepath.Ext(input.Filename)
	uniqueName := fmt.Sprintf("%d_%s%s", time.Now().Unix(), uuid.New().String()[0:8], ext)
	filePath := "uploads/" + uniqueName // Organization folder

	// 2. Call Supabase API to sign the upload
	// Endpoint: /storage/v1/object/upload/sign/{bucket}/{path}
	bucketName := "iqraa-library" // Your bucket name
	apiUrl := fmt.Sprintf("%s/storage/v1/object/upload/sign/%s/%s", app.config.supabase.url, bucketName, filePath)

	// Supabase expects an empty JSON object or specific options in the body
	reqBody, _ := json.Marshal(map[string]string{})

	req, err := http.NewRequest("POST", apiUrl, bytes.NewBuffer(reqBody))
	if err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Failed to create request")
		return
	}

	// CRITICAL: Use Service Key to bypass RLS
	req.Header.Set("Authorization", "Bearer "+app.config.supabase.key)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to contact storage service")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		app.logger.Printf("Supabase Error: %d", resp.StatusCode)
		app.errorResponse(w, http.StatusBadGateway, "Storage provider rejected sign request")
		return
	}

	// 3. Parse Response to get the Signed URL
	var supResp struct {
		Url string `json:"url"` // This is the relative path with token
	}
	if err := json.NewDecoder(resp.Body).Decode(&supResp); err != nil {
		app.errorResponse(w, http.StatusInternalServerError, "Invalid response from storage")
		return
	}

	// 4. Construct the FULL Public URL (for saving to DB) and FULL Signed URL (for uploading)
	// The API returns a relative URL with a token. We need to prepend the base.
	fullSignedUrl := app.config.supabase.url + "/storage/v1" + supResp.Url
	publicUrl := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", app.config.supabase.url, bucketName, filePath)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"signed_url": fullSignedUrl, // Frontend uses this to PUT the file
		"public_url": publicUrl,     // Frontend sends this back to be saved in DB
		"path":       filePath,
	})
}