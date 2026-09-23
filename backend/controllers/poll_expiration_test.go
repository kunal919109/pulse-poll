package controllers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestCreatePollExpiredDate(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.Default()
	router.POST("/api/polls", CreatePoll)

	body := `{
		"question": "Which feature should we build next?",
		"options": ["Option A", "Option B"],
		"expiresAt": "2020-01-01T00:00:00Z"
	}`

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/polls",
		strings.NewReader(body),
	)

	req.Header.Set("Content-Type", "application/json")

	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf(
			"expected status code 400, got %d",
			recorder.Code,
		)
	}

	expected := `{"message":"Expiration time must be in the future"}`

	if recorder.Body.String() != expected {
		t.Fatalf(
			"expected response %s, got %s", 
			expected,
			recorder.Body.String(),
		)
	}
}  