package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var DB *mongo.Database

func ConnectDatabase() error {

	// Load .env file
	err := godotenv.Load()
	if err != nil {
		return fmt.Errorf("error loading .env file: %v", err)
	}

	// Get MongoDB connection string
	mongoURI := os.Getenv("MONGODB_URI")

	if mongoURI == "" {
		return fmt.Errorf("MONGODB_URI is not set")
	}

	// Create MongoDB client
	client, err := mongo.Connect(
		options.Client().ApplyURI(mongoURI),
	)

	if err != nil {
		return fmt.Errorf("error creating MongoDB client: %v", err)
	}

	// Create a timeout for connection test
	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	// Check MongoDB connection
	err = client.Ping(ctx, nil)

	if err != nil {
		return fmt.Errorf("error connecting to MongoDB: %v", err)
	}

	// Select database
	DB = client.Database("pulsepoll")

	fmt.Println("MongoDB connected successfully!")

	return nil
}
