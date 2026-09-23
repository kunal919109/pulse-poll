package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestHealthEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.Default()

	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "PulsePoll backend is running",
		})
	})

	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status code 200, got %d", recorder.Code)
	}

	expected := `{"message":"PulsePoll backend is running"}`

	if recorder.Body.String() != expected {
		t.Fatalf(
			"expected response %s, got %s",
			expected,
			recorder.Body.String(),
		)
	}
}   