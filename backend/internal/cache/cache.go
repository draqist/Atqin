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

// Get fetches a key and unmarshals it.
// A nil receiver is safe and always returns false (cache miss).
func (s *Service) Get(ctx context.Context, key string, dest interface{}) bool {
	if s == nil {
		return false
	}
	val, err := s.client.Get(ctx, key).Result()
	if err == redis.Nil || err != nil {
		return false // Cache Miss
	}

	if err := json.Unmarshal([]byte(val), dest); err != nil {
		return false // Corrupt data
	}

	return true // Cache Hit
}

// Set marshals value and saves it with TTL.
// A nil receiver is safe and is a no-op.
func (s *Service) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if s == nil {
		return nil
	}
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return s.client.Set(ctx, key, data, ttl).Err()
}

// Delete removes keys matching a pattern using SCAN (non-blocking, safe for production).
// Using SCAN instead of KEYS avoids blocking Redis on large datasets.
// A nil receiver is safe and is a no-op.
func (s *Service) Delete(ctx context.Context, pattern string) error {
	if s == nil {
		return nil
	}
	var cursor uint64
	for {
		keys, nextCursor, err := s.client.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return err
		}
		if len(keys) > 0 {
			if err := s.client.Del(ctx, keys...).Err(); err != nil {
				return err
			}
		}
		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}
	return nil
}

// IncrBy increments a key by value.
// A nil receiver is safe and is a no-op.
func (s *Service) IncrBy(ctx context.Context, key string, value int64) error {
	if s == nil {
		return nil
	}
	return s.client.IncrBy(ctx, key, value).Err()
}

// DecrBy decrements a key by value.
// A nil receiver is safe and is a no-op.
func (s *Service) DecrBy(ctx context.Context, key string, value int) error {
	if s == nil {
		return nil
	}
	return s.client.DecrBy(ctx, key, int64(value)).Err()
}

// Exists returns true if the key exists in Redis.
// A nil receiver is safe and always returns false.
func (s *Service) Exists(ctx context.Context, key string) bool {
	if s == nil {
		return false
	}
	val, _ := s.client.Exists(ctx, key).Result()
	return val > 0
}

// GetInt returns an integer value from Redis.
// A nil receiver returns 0, redis.Nil.
func (s *Service) GetInt(ctx context.Context, key string) (int, error) {
	if s == nil {
		return 0, redis.Nil
	}
	val, err := s.client.Get(ctx, key).Int()
	if err != nil {
		return 0, err
	}
	return val, nil
}