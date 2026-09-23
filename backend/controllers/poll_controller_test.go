package controllers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestCreatePollEmptyQuestion(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.Default()
	router.POST("/api/polls", CreatePoll)

	body := `{
		"question": "",
		"options": ["Option A", "Option B"]
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

	expected := `{"message":"Question is required"}`

	if recorder.Body.String() != expected {
		t.Fatalf(
			"expected response %s, got %s",
			expected,
			recorder.Body.String(),
		)
	}
}  