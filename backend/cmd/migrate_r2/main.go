package main

import (
	"bytes"
	"context"
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	_ "github.com/lib/pq"
)

// CONFIGURATION
const (
	R2BucketName   = "iqraa-assets"
	R2PublicDomain = "https://assets.iqraa.space" // Verify this matches your R2 settings
)

func main() {
	// 1. Load Env Vars
	dbDSN := os.Getenv("DB_DSN")
	r2AccountID := os.Getenv("R2_ACCOUNT_ID")
	r2AccessKey := os.Getenv("R2_ACCESS_KEY_ID")
	r2SecretKey := os.Getenv("R2_SECRET_ACCESS_KEY")

	if dbDSN == "" || r2AccountID == "" || r2AccessKey == "" || r2SecretKey == "" {
		log.Fatal("Missing environment variables")
	}

	// 2. Connect to DB
	db, err := sql.Open("postgres", dbDSN)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// 3. Connect to R2
	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", r2AccountID),
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(r2AccessKey, r2SecretKey, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		log.Fatal(err)
	}

	s3Client := s3.NewFromConfig(cfg)

	// 4. Fetch Resources (Only PDFs/Audio that haven't been migrated)
	query := `
		SELECT id, title, url, type 
		FROM resources 
		WHERE url NOT LIKE $1 
		AND (type = 'pdf' OR type = 'audio')
	`
	rows, err := db.Query(query, "%iqraa.space%") // Assuming new URL contains your domain
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	log.Println("🚀 Starting Migration...")

	for rows.Next() {
		var id, title, oldURL, resType string
		if err := rows.Scan(&id, &title, &oldURL, &resType); err != nil {
			log.Println("Error scanning row:", err)
			continue
		}

		log.Printf("Processing: %s...", title)

		// 5. Download from Supabase
		resp, err := http.Get(oldURL)
		if err != nil {
			log.Printf("❌ Download failed: %v", err)
			continue
		}

		if resp.StatusCode != 200 {
			log.Printf("❌ Supabase returned %d. Skipping.", resp.StatusCode)
			resp.Body.Close()
			continue
		}

		// --- THE FIX: Read into Memory ---
		fileBytes, err := io.ReadAll(resp.Body)
		resp.Body.Close() // Close connection immediately
		if err != nil {
			log.Printf("❌ Read body failed: %v", err)
			continue
		}
		
		// Create a "Seekable" Reader from memory
		fileReader := bytes.NewReader(fileBytes)
		// --------------------------------

		// 6. Upload to R2
		extension := "pdf"
		if resType == "audio" { extension = "mp3" }
		objectKey := fmt.Sprintf("%s.%s", id, extension)

		_, err = s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String(R2BucketName),
			Key:         aws.String(objectKey),
			Body:        fileReader, // Use the memory reader
			ContentType: aws.String("application/pdf"), // Or dynamically detect
		})
		if err != nil {
			log.Printf("❌ Upload to R2 failed: %v", err)
			continue
		}

		// 7. Update Database
		newURL := fmt.Sprintf("%s/%s", R2PublicDomain, objectKey)
		_, err = db.Exec("UPDATE resources SET url = $1 WHERE id = $2", newURL, id)
		if err != nil {
			log.Printf("❌ DB Update failed: %v", err)
			continue
		}

		log.Printf("✅ Success: %s", title)
		
		// CRITICAL: Slow down to avoid Supabase banhammer
		time.Sleep(2 * time.Second) 
	}

	log.Println("🏁 Migration Complete.")
}