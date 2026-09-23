package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"pulse-poll/config"
	"pulse-poll/models"
)

type OptionResult struct {
	Option string `json:"option"`
	Votes  int64  `json:"votes"`
}

type PollResultPoll struct {
	ID      bson.ObjectID `json:"id"`
	Question string       `json:"question"`
	Options []string      `json:"options"`
}

type PollResultsResponse struct {
	Poll       PollResultPoll `json:"poll"`
	Results    []OptionResult `json:"results"`
	TotalVotes int64          `json:"totalVotes"`
}

func GetPollResults(c *gin.Context) {

	pollIDString := c.Param("id")

	pollID, err := bson.ObjectIDFromHex(pollIDString)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid poll ID",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// --------------------------------
	// 1. Check Redis cache
	// --------------------------------

	cacheKey := fmt.Sprintf("poll:results:%s", pollID.Hex())

	cachedData, err := config.RedisClient.Get(ctx, cacheKey).Result()

	if err == nil {

		var cachedResponse PollResultsResponse

		err := json.Unmarshal([]byte(cachedData), &cachedResponse)

		if err == nil {
			c.JSON(http.StatusOK, cachedResponse)
			return
		}
	}

	// --------------------------------
	// 2. Get poll from MongoDB
	// --------------------------------

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

	// --------------------------------
	// 3. Calculate vote counts
	// --------------------------------

	pipeline := bson.A{
		bson.D{
			{
				Key: "$match",
				Value: bson.D{
					{
						Key: "pollId",
						Value: pollID,
					},
				},
			},
		},
		bson.D{
			{
				Key: "$group",
				Value: bson.D{
					{
						Key: "_id",
						Value: "$option",
					},
					{
						Key: "votes",
						Value: bson.D{
							{
								Key: "$sum",
								Value: 1,
							},
						},
					},
				},
			},
		},
	}

	cursor, err := config.DB.Collection("votes").Aggregate(ctx, pipeline)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not calculate results",
		})
		return
	}

	defer cursor.Close(ctx)

	var results []struct {
		ID    string `bson:"_id"`
		Votes int64  `bson:"votes"`
	}

	if err := cursor.All(ctx, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not read results",
		})
		return
	}

	// --------------------------------
	// 4. Prepare results
	// --------------------------------

	voteCounts := make(map[string]int64)

	var totalVotes int64

	for _, result := range results {

		voteCounts[result.ID] = result.Votes

		totalVotes += result.Votes
	}

	optionResults := make([]OptionResult, 0, len(poll.Options))

	for _, option := range poll.Options {

		optionResults = append(optionResults, OptionResult{
			Option: option,
			Votes:  voteCounts[option],
		})
	}

	response := PollResultsResponse{
		Poll: PollResultPoll{
			ID:       poll.ID,
			Question: poll.Question,
			Options:  poll.Options,
		},
		Results:    optionResults,
		TotalVotes: totalVotes,
	}

	// --------------------------------
	// 5. Save results in Redis
	// --------------------------------

	responseJSON, err := json.Marshal(response)

	if err == nil {

		err = config.RedisClient.Set(
			ctx,
			cacheKey,
			responseJSON,
			30*time.Second,
		).Err()

		// Redis failure should not break the results API.
		if err != nil {
			fmt.Println("Redis cache error:", err)
		}
	}

	// --------------------------------
	// 6. Return response
	// --------------------------------

	c.JSON(http.StatusOK, response)
}  
