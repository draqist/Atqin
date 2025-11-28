package youtube

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type PlaylistItem struct {
	Snippet struct {
		Title       string `json:"title"`
		ResourceId  struct {
			VideoId string `json:"videoId"`
		} `json:"resourceId"`
		Position int `json:"position"`
	} `json:"snippet"`
}

type PlaylistResponse struct {
	Items         []PlaylistItem `json:"items"`
	NextPageToken string         `json:"nextPageToken"`
}

// FetchPlaylistVideos grabs all videos from a playlist
func FetchPlaylistVideos(playlistID string) ([]PlaylistItem, error) {
	apiKey := os.Getenv("YOUTUBE_API_KEY")
	if apiKey == "" {
		// This log will show up in your Render/Local terminal
		fmt.Println("CRITICAL ERROR: YOUTUBE_API_KEY is empty")
		return nil, fmt.Errorf("YOUTUBE_API_KEY not set")
	}
	var allItems []PlaylistItem
	pageToken := ""

	for {
		// Build URL
		apiUrl := fmt.Sprintf(
			"https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=%s&key=%s&pageToken=%s",
			playlistID, apiKey, pageToken,
		)

		resp, err := http.Get(apiUrl)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		if resp.StatusCode != 200 {
			return nil, fmt.Errorf("YouTube API error: %d", resp.StatusCode)
		}

		var data PlaylistResponse
		if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
			return nil, err
		}

		allItems = append(allItems, data.Items...)

		// Check for next page
		if data.NextPageToken == "" {
			break
		}
		pageToken = data.NextPageToken
	}

	return allItems, nil
}