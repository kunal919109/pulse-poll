package config

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func ConnectRedis() error {

	redisURL := os.Getenv("REDIS_URL")

	if redisURL == "" {
		return fmt.Errorf("REDIS_URL is not set")
	}

	options, err := redis.ParseURL(redisURL)
	if err != nil {
		return fmt.Errorf("invalid REDIS_URL: %v", err)
	}

	RedisClient = redis.NewClient(options)

	ctx := context.Background()

	err = RedisClient.Ping(ctx).Err()
	if err != nil {
		return fmt.Errorf("error connecting to Redis: %v", err)
	}

	fmt.Println("Redis connected successfully!")

	return nil
}  