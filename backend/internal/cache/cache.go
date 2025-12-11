package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

type Service struct {
	client *redis.Client
}

// New now accepts a full connection string (e.g., "rediss://:pass@host:port")
func New(connectionString string) (*Service, error) {
	// 1. Parse the URL (handles password, user, and TLS automatically)
	opt, err := redis.ParseURL(connectionString)
	if err != nil {
		return nil, err
	}

	// 2. Create Client
	client := redis.NewClient(opt)

	// 3. Test Connection
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, err
	}

	return &Service{client: client}, nil
}

// Get fetches a key and unmarshals it
func (s *Service) Get(ctx context.Context, key string, dest interface{}) bool {
	val, err := s.client.Get(ctx, key).Result()
	if err == redis.Nil || err != nil {
		return false // Cache Miss
	}

	if err := json.Unmarshal([]byte(val), dest); err != nil {
		return false // Corrupt data
	}
	
	return true // Cache Hit
}

// Set marshals value and saves it with TTL
func (s *Service) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return s.client.Set(ctx, key, data, ttl).Err()
}

// Delete removes keys (supports patterns like "books:*")
func (s *Service) Delete(ctx context.Context, pattern string) error {
	// Check if keys exist first to avoid errors
	keys, err := s.client.Keys(ctx, pattern).Result()
	if err != nil || len(keys) == 0 {
		return nil
	}
	
	return s.client.Del(ctx, keys...).Err()
}