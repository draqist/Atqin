package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type R2Service struct {
	Client       *s3.Client
	Bucket       string
	PublicDomain string
}

// UploadFile streams data directly to R2
func (s *R2Service) UploadFile(key string, file io.Reader, contentType string) (string, error) {
	_, err := s.Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(s.Bucket),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s/%s", s.PublicDomain, key), nil
}