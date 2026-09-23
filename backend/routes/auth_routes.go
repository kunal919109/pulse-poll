package routes

import (
	"github.com/gin-gonic/gin"
	"pulse-poll/controllers"
)

func AuthRoutes(router *gin.Engine) {

	auth := router.Group("/api/auth")

	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)

	}
}
