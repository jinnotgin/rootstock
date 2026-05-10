package v1

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"rootstock/backend/internal/platform"
	"rootstock/backend/internal/repo/sqlite"
	"rootstock/backend/internal/usecase"
)

func TestHandlerCurrentUserReturnsDataEnvelope(t *testing.T) {
	handler := newTestHandler(t)
	registerBody := `{"email":"ada@example.com","firstName":"Ada","lastName":"Lovelace","password":"secret","teamName":"Ada Team"}`
	register := httptest.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewBufferString(registerBody))
	register.Header.Set("Content-Type", "application/json")
	registerResponse := httptest.NewRecorder()
	handler.ServeHTTP(registerResponse, register)
	if registerResponse.Code != http.StatusOK {
		t.Fatalf("register status = %d, body = %s", registerResponse.Code, registerResponse.Body.String())
	}

	me := httptest.NewRequest(http.MethodGet, "/api/auth/me", nil)
	for _, cookie := range registerResponse.Result().Cookies() {
		me.AddCookie(cookie)
	}
	meResponse := httptest.NewRecorder()
	handler.ServeHTTP(meResponse, me)
	if meResponse.Code != http.StatusOK {
		t.Fatalf("me status = %d, body = %s", meResponse.Code, meResponse.Body.String())
	}
	var payload struct {
		Data struct {
			Email        string `json:"email"`
			PasswordHash string `json:"PasswordHash"`
		} `json:"data"`
	}
	if err := json.Unmarshal(meResponse.Body.Bytes(), &payload); err != nil {
		t.Fatalf("invalid response JSON: %v", err)
	}
	if payload.Data.Email != "ada@example.com" {
		t.Fatalf("expected current user email, got %q", payload.Data.Email)
	}
	if payload.Data.PasswordHash != "" {
		t.Fatalf("password hash leaked in current user response")
	}
}

func TestHandlerReturnsForbiddenForAuthenticatedUserWithoutPermission(t *testing.T) {
	handler := newTestHandler(t)
	admin := postJSON(t, handler, "/api/auth/register", `{"email":"admin@example.com","firstName":"Ada","lastName":"Admin","password":"secret","teamName":"Ada Team"}`, nil)
	var adminPayload struct {
		User struct {
			TeamID string `json:"teamId"`
		} `json:"user"`
	}
	if err := json.Unmarshal(admin.Body.Bytes(), &adminPayload); err != nil {
		t.Fatalf("invalid admin response JSON: %v", err)
	}
	userBody := `{"email":"user@example.com","firstName":"Grace","lastName":"User","password":"secret","teamId":"` + adminPayload.User.TeamID + `"}`
	user := postJSON(t, handler, "/api/auth/register", userBody, nil)

	response := postJSON(t, handler, "/api/discussions", `{"title":"Roadmap","body":"Plan the roadmap."}`, user.Result().Cookies())
	if response.Code != http.StatusForbidden {
		t.Fatalf("create discussion status = %d, body = %s", response.Code, response.Body.String())
	}
}

func TestHandlerUserDiscussionAndCommentFlow(t *testing.T) {
	handler := newTestHandler(t)
	admin := postJSON(t, handler, "/api/auth/register", `{"email":"admin@example.com","firstName":"Ada","lastName":"Admin","password":"secret","teamName":"Ada Team"}`, nil)
	adminCookies := admin.Result().Cookies()
	var adminPayload struct {
		User struct {
			TeamID string `json:"teamId"`
		} `json:"user"`
	}
	if err := json.Unmarshal(admin.Body.Bytes(), &adminPayload); err != nil {
		t.Fatalf("invalid admin response JSON: %v", err)
	}
	normalUser := postJSON(t, handler, "/api/auth/register", `{"email":"user@example.com","firstName":"Grace","lastName":"User","password":"secret","teamId":"`+adminPayload.User.TeamID+`"}`, nil)

	discussionResponse := postJSON(t, handler, "/api/discussions", `{"title":"Roadmap","body":"Plan the roadmap."}`, adminCookies)
	if discussionResponse.Code != http.StatusOK {
		t.Fatalf("create discussion status = %d, body = %s", discussionResponse.Code, discussionResponse.Body.String())
	}
	var discussion struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(discussionResponse.Body.Bytes(), &discussion); err != nil {
		t.Fatalf("invalid discussion JSON: %v", err)
	}
	if discussion.ID == "" {
		t.Fatalf("expected discussion id")
	}

	listDiscussions := get(t, handler, "/api/discussions?page=1", adminCookies)
	if listDiscussions.Code != http.StatusOK {
		t.Fatalf("list discussions status = %d, body = %s", listDiscussions.Code, listDiscussions.Body.String())
	}
	var discussionsPage struct {
		Data []struct {
			ID string `json:"id"`
		} `json:"data"`
		Meta struct {
			Total int `json:"total"`
		} `json:"meta"`
	}
	if err := json.Unmarshal(listDiscussions.Body.Bytes(), &discussionsPage); err != nil {
		t.Fatalf("invalid discussions JSON: %v", err)
	}
	if discussionsPage.Meta.Total != 1 || discussionsPage.Data[0].ID != discussion.ID {
		t.Fatalf("unexpected discussions page: %+v", discussionsPage)
	}

	commentResponse := postJSON(t, handler, "/api/comments", `{"discussionId":"`+discussion.ID+`","body":"Looks good."}`, normalUser.Result().Cookies())
	if commentResponse.Code != http.StatusOK {
		t.Fatalf("create comment status = %d, body = %s", commentResponse.Code, commentResponse.Body.String())
	}
	var comment struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(commentResponse.Body.Bytes(), &comment); err != nil {
		t.Fatalf("invalid comment JSON: %v", err)
	}
	listComments := get(t, handler, "/api/comments?discussionId="+discussion.ID, adminCookies)
	if listComments.Code != http.StatusOK {
		t.Fatalf("list comments status = %d, body = %s", listComments.Code, listComments.Body.String())
	}
	var commentsPage struct {
		Data []struct {
			ID string `json:"id"`
		} `json:"data"`
		Meta struct {
			Total int `json:"total"`
		} `json:"meta"`
	}
	if err := json.Unmarshal(listComments.Body.Bytes(), &commentsPage); err != nil {
		t.Fatalf("invalid comments JSON: %v", err)
	}
	if commentsPage.Meta.Total != 1 || commentsPage.Data[0].ID != comment.ID {
		t.Fatalf("unexpected comments page: %+v", commentsPage)
	}
}

func newTestHandler(t *testing.T) http.Handler {
	t.Helper()
	repo, err := sqlite.Open(filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("sqlite.Open returned error: %v", err)
	}
	t.Cleanup(func() {
		if err := repo.Close(); err != nil {
			t.Fatalf("repo.Close returned error: %v", err)
		}
	})
	ids := platform.IDGenerator{}
	clock := platform.Clock{}
	auth := usecase.NewAuthUseCase(repo, ids, clock)
	catalog := usecase.NewCatalogUseCase(repo, ids, clock)
	return NewHandler(auth, catalog, NewSessionManager("test-secret", "auth-token")).Router()
}

func postJSON(t *testing.T, handler http.Handler, path string, body string, cookies []*http.Cookie) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(http.MethodPost, path, bytes.NewBufferString(body))
	request.Header.Set("Content-Type", "application/json")
	for _, cookie := range cookies {
		request.AddCookie(cookie)
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if path == "/api/auth/register" && response.Code != http.StatusOK {
		t.Fatalf("%s status = %d, body = %s", path, response.Code, response.Body.String())
	}
	return response
}

func get(t *testing.T, handler http.Handler, path string, cookies []*http.Cookie) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(http.MethodGet, path, nil)
	for _, cookie := range cookies {
		request.AddCookie(cookie)
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	return response
}
