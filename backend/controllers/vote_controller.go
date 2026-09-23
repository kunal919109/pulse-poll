package controllers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"pulse-poll/config"
	"pulse-poll/models"
)

type VoteRequest struct {
	Option string `json:"option"`
}

// VoteOnPoll allows an authenticated user to vote
func VoteOnPoll(c *gin.Context) {

	// Get poll ID from URL
	pollIDString := c.Param("id")

	pollID, err := bson.ObjectIDFromHex(pollIDString)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	// Get selected option from request body
	var request VoteRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request data",
		})
		return
	}

	// Get logged-in user ID
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

	// Find the poll
	var poll models.Poll

	err = config.DB.Collection("polls").
		FindOne(
			ctx,
			bson.M{"_id": pollID},
		).
		Decode(&poll)

	if err != nil {

		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Poll not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not find poll",
		})
		return
	}

	// Check whether poll has expired
	if poll.ExpiresAt != nil &&
		time.Now().After(*poll.ExpiresAt) {

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "This poll has expired",
		})
		return
	}

	// Check whether selected option exists
	optionExists := false

	for _, option := range poll.Options {

		if option == request.Option {
			optionExists = true
			break
		}
	}

	if !optionExists {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll option",
		})
		return
	}

	// Check whether user has already voted
	var existingVote models.Vote

	err = config.DB.Collection("votes").
		FindOne(
			ctx,
			bson.M{
				"pollId": pollID,
				"userId": userID,
			},
		).
		Decode(&existingVote)

	if err == nil {

		c.JSON(http.StatusConflict, gin.H{
			"message": "You have already voted on this poll",
		})
		return
	}

	if err != mongo.ErrNoDocuments {

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not check previous vote",
		})
		return
	}

	// Create vote
	vote := models.Vote{
		ID:        bson.NewObjectID(),
		PollID:    pollID,
		UserID:    userID,
		Option:    request.Option,
		CreatedAt: time.Now(),
	}

	// Save vote
	_, err = config.DB.Collection("votes").
		InsertOne(ctx, vote)
	cacheKey := fmt.Sprintf("poll:results:%s", pollID.Hex())

    err = config.RedisClient.Del(ctx, cacheKey).Err()

    if err != nil {
	fmt.Println("Redis cache delete error:", err)
   }   

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not save vote",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Vote recorded successfully",
		"vote":    vote,
	})
}


