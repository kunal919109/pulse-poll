package config

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func CreateIndexes() error {

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	emailIndex := mongo.IndexModel{
		Keys: bson.D{
			{Key: "email", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	}

	_, err := DB.Collection("users").Indexes().CreateOne(ctx, emailIndex)
	if err != nil {
		return fmt.Errorf("failed to create email index: %w", err)
	}
  
	// Create a unique index on pollId + userId.
	// This guarantees that one user can vote
	// only once on the same poll.
	voteIndex := mongo.IndexModel{
		Keys: bson.D{
			{Key: "pollId", Value: 1},
			{Key: "userId", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	}

	_, err = DB.Collection("votes").Indexes().CreateOne(
		ctx,
		voteIndex,
	)

	if err != nil {
		return fmt.Errorf("failed to create vote index: %w", err)
	}

	return nil
}
