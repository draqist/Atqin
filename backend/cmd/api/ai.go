package main

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"

	"google.golang.org/genai"
)

func (app *application) extractPdfContentHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Url string `json:"url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		app.errorResponse(w, http.StatusBadRequest, "Invalid input")
		return
	}

	// 1. Download PDF from Supabase (or any URL)
	resp, err := http.Get(input.Url)
	if err != nil || resp.StatusCode != 200 {
		app.errorResponse(w, http.StatusBadGateway, "Failed to download PDF from source")
		return
	}
	defer resp.Body.Close()

	// Save to temp file (Gemini SDK needs a file path or reader)
	tempFile, _ := os.CreateTemp("", "upload-*.pdf")
	defer os.Remove(tempFile.Name())
	io.Copy(tempFile, resp.Body)

	// 2. Initialize Gemini Client
	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY") // Ensure this is set in your .env
	client, err := genai.NewClient(ctx, &genai.ClientConfig{APIKey: apiKey})
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to init AI client")
		return
	}

	// 3. Upload File to Gemini
	uploadRes, err := client.Files.UploadFromPath(ctx, tempFile.Name(), nil)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "Failed to upload file to AI")
		return
	}

	// 4. Generate Content (The Extraction)
	model := "gemini-1.5-flash"
	prompt := `
		Extract the Arabic text from this PDF document exactly as it appears. 
		- Ignore page numbers, headers, and footers.
		- Preserve line breaks between verses/poetry lines.
		- Do not include any English text or introductory commentary.
		- Output ONLY the Arabic text.
	`

	result, err := client.Models.GenerateContent(ctx, model, []*genai.Content{
		{
			Parts: []*genai.Part{
				{Text: prompt},
				{FileData: &genai.FileData{FileURI: uploadRes.URI, MIMEType: uploadRes.MIMEType}},
			},
		},
	}, nil)
	if err != nil {
		app.logger.Println(err)
		app.errorResponse(w, http.StatusInternalServerError, "AI generation failed")
		return
	}

	// 5. Extract Response Text
	var extractedText string
	for _, candidate := range result.Candidates {
		for _, part := range candidate.Content.Parts {
			if part.Text != "" {
				extractedText += part.Text
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"text": strings.TrimSpace(extractedText)})
}