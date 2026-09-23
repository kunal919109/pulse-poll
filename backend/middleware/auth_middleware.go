package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		// Get Authorization header
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Authorization token is required",
			})
			c.Abort()
			return
		}

		// Expected format:
		// Bearer YOUR_TOKEN
		parts := strings.SplitN(authHeader, " ", 2)

		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid authorization format",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Get JWT secret
		secret := os.Getenv("JWT_SECRET")

		if secret == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "JWT secret is not configured",
			})
			c.Abort()
			return
		}

		// Parse token
		token, err := jwt.Parse(
			tokenString,
			func(token *jwt.Token) (interface{}, error) {

				// Make sure the token uses HMAC
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}

				return []byte(secret), nil
			},
		)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Get claims from token
		claims, ok := token.Claims.(jwt.MapClaims)

		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid token claims",
			})
			c.Abort()
			return
		}

		// Get user ID from token
		userIDString, ok := claims["userId"].(string)

		if !ok || userIDString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "User ID missing from token",
			})
			c.Abort()
			return
		}

		// Convert string ID into MongoDB ObjectID
		userID, err := bson.ObjectIDFromHex(userIDString)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Invalid user ID",
			})
			c.Abort()
			return
		}

		// Get email from token
		email, _ := claims["email"].(string)

		// Store user information inside Gin context
		c.Set("userId", userID)
		c.Set("email", email)

		// Continue to requested route
		c.Next()
	}
}
