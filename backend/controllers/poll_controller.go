package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pulse-poll/config"
	"pulse-poll/models"
)

type CreatePollRequest struct {
	Question  string     `json:"question"`
	Options   []string   `json:"options"`
	ExpiresAt *time.Time `json:"expiresAt"`
}

// CreatePoll creates a new poll
func CreatePoll(c *gin.Context) {

	var request CreatePollRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request data",
		})
		return
	}

	request.Question = strings.TrimSpace(request.Question)

	if request.Question == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Question is required",
		})
		return
	}

	if len(request.Question) > 300 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Question must be 300 characters or less",
		})
		return
	}

	if len(request.Options) < 2 || len(request.Options) > 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "A poll must have between 2 and 6 options",
		})
		return
	}

	cleanOptions := make([]string, 0, len(request.Options))
	seenOptions := make(map[string]bool)

	for _, option := range request.Options {

		option = strings.TrimSpace(option)

		if option == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Poll options cannot be empty",
			})
			return
		}

		optionKey := strings.ToLower(option)

		if seenOptions[optionKey] {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Poll options cannot be duplicated",
			})
			return
		}

		seenOptions[optionKey] = true

		cleanOptions = append(cleanOptions, option)
	}

	
    if request.ExpiresAt != nil {
	 if !request.ExpiresAt.After(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Expiration time must be in the future",
		})
		return
	  }  
	}
  
	userIDValue, exists := c.Get("userId")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User authentication required",
		})
		return
	}

	userID, ok := userIDValue.(bson.ObjectID)

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid user information",
		})
		return
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	poll := models.Poll{
		ID:        bson.NewObjectID(),
		Question:  request.Question,
		Options:   cleanOptions,
		CreatedBy: userID,
		CreatedAt: time.Now(),
		ExpiresAt: request.ExpiresAt,
	}

	_, err := config.DB.Collection("polls").InsertOne(ctx, poll)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not create poll",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll created successfully",
		"poll":    poll,
	})
}

// GetPolls returns all polls
func GetPolls(c *gin.Context) {

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	// Find all polls
	cursor, err := config.DB.Collection("polls").
		Find(ctx, bson.M{})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not fetch polls",
		})
		return
	}

	defer cursor.Close(ctx)

	// Store polls here
	var polls []models.Poll

	// Convert MongoDB results into Go structs
	if err := cursor.All(ctx, &polls); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not read polls",
		})
		return
	}

	// If no polls exist, return empty array instead of null
	if polls == nil {
		polls = []models.Poll{}
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": polls,
	})
}

// GetPollByID returns one poll by its ID
func GetPollByID(c *gin.Context) {

	// Get poll ID from URL
	pollIDString := c.Param("id")

	// Convert string ID into MongoDB ObjectID
	pollID, err := bson.ObjectIDFromHex(pollIDString)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	// Create MongoDB context
	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	// Find poll in MongoDB
	var poll models.Poll

	err = config.DB.Collection("polls").
		FindOne(ctx, bson.M{"_id": pollID}).
		Decode(&poll)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Poll not found",
		})
		return
	}

	// Return poll
	c.JSON(http.StatusOK, gin.H{
		"poll": poll,
	})
}
