package routes

import (
	"github.com/gin-gonic/gin"

	"pulse-poll/controllers"
	"pulse-poll/middleware"
)

func PollRoutes(router *gin.Engine) {

	polls := router.Group("/api/polls")

	// All poll routes require authentication
	polls.Use(middleware.AuthMiddleware())

	{
		// Create poll
		polls.POST("", controllers.CreatePoll)

		// Get all polls
		polls.GET("", controllers.GetPolls)

		// Get one poll
		polls.GET("/:id", controllers.GetPollByID)

		// Get poll results
		polls.GET("/:id/results", controllers.GetPollResults)

		// Vote on poll
		polls.POST("/:id/vote", controllers.VoteOnPoll)
	}
}
