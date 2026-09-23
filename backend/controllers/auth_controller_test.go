package controllers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestRegisterEmptyName(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.Default()
	router.POST("/api/auth/register", Register)

	body := `{
		"name": "",
		"email": "test@example.com",
		"password": "password123"
	}`

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/auth/register",
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

	expected := `{"message":"Name is required"}`

	if recorder.Body.String() != expected {
		t.Fatalf(
			"expected response %s, got %s",
			expected,
			recorder.Body.String(),
		)
	}
}  