package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"

	"pulse-poll/config"
	"pulse-poll/models"
	"pulse-poll/utils"
)

// RegisterRequest represents the data
// received when a user wants to register.
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Register creates a new user.
func Register(c *gin.Context) {

	var request RegisterRequest

	// ------------------------------------------------
	// 1. Read JSON sent by the frontend/Postman
	// ------------------------------------------------

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request data",
		})
		return
	}

	// ------------------------------------------------
	// 2. Clean the input
	// ------------------------------------------------

	request.Name = strings.TrimSpace(request.Name)

	request.Email = strings.TrimSpace(
		strings.ToLower(request.Email),
	)

	// ------------------------------------------------
	// 3. Validate the input
	// ------------------------------------------------

	if request.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Name is required",
		})
		return
	}

	if request.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email is required",
		})
		return
	}

	if len(request.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Password must be at least 6 characters",
		})
		return
	}

	// ------------------------------------------------
	// 4. Create MongoDB context
	// ------------------------------------------------

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	// ------------------------------------------------
	// 5. Check whether email already exists
	// ------------------------------------------------

	var existingUser models.User

	err := config.DB.Collection("users").
		FindOne(
			ctx,
			bson.M{
				"email": request.Email,
			},
		).
		Decode(&existingUser)

	// If no error occurred, a user with this email exists.
	if err == nil {

		c.JSON(http.StatusConflict, gin.H{
			"message": "Email already registered",
		})

		return
	}

	// If the error is something other than
	// "document not found", something went wrong
	// with MongoDB.
	if err != mongo.ErrNoDocuments {

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not check email",
		})

		return
	}

	// ------------------------------------------------
	// 6. Hash the password
	// ------------------------------------------------

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(request.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not secure password",
		})

		return
	}

	// ------------------------------------------------
	// 7. Create the user object
	// ------------------------------------------------

	user := models.User{
		Name:      request.Name,
		Email:     request.Email,
		Password:  string(hashedPassword),
		CreatedAt: time.Now(),
	}

	// ------------------------------------------------
	// 8. Save user in MongoDB
	// ------------------------------------------------

	_, err = config.DB.Collection("users").
		InsertOne(ctx, user)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not create user",
		})

		return
	}

	// ------------------------------------------------
	// 9. Send success response
	// ------------------------------------------------

	c.JSON(http.StatusCreated, gin.H{

		"message": "User registered successfully",

		"user": gin.H{
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

func Login(c *gin.Context) {

	var request LoginRequest

	// 1. Read JSON request
	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request data",
		})

		return
	}

	// 2. Clean email
	request.Email = strings.TrimSpace(
		strings.ToLower(request.Email),
	)

	// 3. Validate input
	if request.Email == "" || request.Password == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email and password are required",
		})

		return
	}

	// 4. Create MongoDB context
	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)

	defer cancel()

	// 5. Find user by email
	var user models.User

	err := config.DB.Collection("users").
		FindOne(
			ctx,
			bson.M{
				"email": request.Email,
			},
		).
		Decode(&user)

	if err != nil {

		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid email or password",
		})

		return
	}

	// 6. Compare entered password
	// with hashed password in MongoDB
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(request.Password),
	)

	if err != nil {

		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Invalid email or password",
		})

		return
	}

	// 7. Generate JWT token
	token, err := utils.GenerateToken(
		user.ID.Hex(),
		user.Email,
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Could not create authentication token",
		})

		return
	}

	// 8. Send successful response
	c.JSON(http.StatusOK, gin.H{

		"message": "Login successful",

		"token": token,

		"user": gin.H{
			"id":    user.ID.Hex(),
			"name":  user.Name,
			"email": user.Email,
		},
	})
}
