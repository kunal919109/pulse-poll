package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"pulse-poll/middleware"
)

func ProtectedRoutes(router *gin.Engine) {

	protected := router.Group("/api")

	// Everything inside this group requires JWT
	protected.Use(middleware.AuthMiddleware())

	{
		protected.GET("/protected", func(c *gin.Context) {

			c.JSON(http.StatusOK, gin.H{
				"message": "You are authenticated!",
			})

		})
	}
}
