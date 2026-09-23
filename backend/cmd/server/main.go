package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"pulse-poll/config"
	"pulse-poll/routes"
)

func main() {
	err := config.ConnectDatabase()
	if err != nil {
		panic(err)
	}

	err = config.CreateIndexes()
	if err != nil {
		panic(err)
	}

	err = config.ConnectRedis()
	if err != nil {
		panic(err)
	}

	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		// Handle browser preflight request
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	routes.AuthRoutes(router)
	routes.ProtectedRoutes(router)
	routes.PollRoutes(router)

	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "PulsePoll backend is running",
		})
	})

	router.Run(":8080")
}
