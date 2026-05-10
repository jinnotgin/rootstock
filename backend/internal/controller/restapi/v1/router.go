package v1

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"rootstock/backend/internal/entity"
	"rootstock/backend/internal/usecase"
)

type Handler struct {
	auth     *usecase.AuthUseCase
	catalog  *usecase.CatalogUseCase
	sessions *SessionManager
}

type responseData[T any] struct {
	Data T `json:"data"`
}

type authResponse struct {
	JWT  string      `json:"jwt"`
	User entity.User `json:"user"`
}

func NewHandler(auth *usecase.AuthUseCase, catalog *usecase.CatalogUseCase, sessions *SessionManager) *Handler {
	return &Handler{auth: auth, catalog: catalog, sessions: sessions}
}

func (h *Handler) Router() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/healthcheck", h.healthcheck)
	mux.HandleFunc("POST /api/auth/register", h.register)
	mux.HandleFunc("POST /api/auth/login", h.login)
	mux.HandleFunc("POST /api/auth/logout", h.logout)
	mux.HandleFunc("GET /api/auth/me", h.me)
	mux.HandleFunc("GET /api/teams", h.teams)
	mux.HandleFunc("GET /api/users", h.users)
	mux.HandleFunc("PATCH /api/users/profile", h.updateProfile)
	mux.HandleFunc("DELETE /api/users/{userId}", h.deleteUser)
	mux.HandleFunc("GET /api/discussions", h.discussions)
	mux.HandleFunc("POST /api/discussions", h.createDiscussion)
	mux.HandleFunc("GET /api/discussions/{discussionId}", h.discussion)
	mux.HandleFunc("PATCH /api/discussions/{discussionId}", h.updateDiscussion)
	mux.HandleFunc("DELETE /api/discussions/{discussionId}", h.deleteDiscussion)
	mux.HandleFunc("GET /api/comments", h.comments)
	mux.HandleFunc("POST /api/comments", h.createComment)
	mux.HandleFunc("DELETE /api/comments/{commentId}", h.deleteComment)
	return h.withMiddleware(mux)
}

func (h *Handler) withMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) healthcheck(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) register(w http.ResponseWriter, r *http.Request) {
	var input usecase.RegisterInput
	if !decodeJSON(w, r, &input) {
		return
	}
	user, err := h.auth.Register(r.Context(), input)
	if err != nil {
		writeError(w, err)
		return
	}
	h.writeAuth(w, user)
}

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	var input usecase.LoginInput
	if !decodeJSON(w, r, &input) {
		return
	}
	user, err := h.auth.Login(r.Context(), input)
	if err != nil {
		writeError(w, err)
		return
	}
	h.writeAuth(w, user)
}

func (h *Handler) logout(w http.ResponseWriter, _ *http.Request) {
	h.sessions.ClearCookie(w)
	writeJSON(w, http.StatusOK, map[string]string{"message": "Logged out"})
}

func (h *Handler) me(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	writeJSON(w, http.StatusOK, responseData[entity.User]{Data: user})
}

func (h *Handler) teams(w http.ResponseWriter, r *http.Request) {
	teams, err := h.catalog.ListTeams(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, responseData[[]entity.Team]{Data: teams})
}

func (h *Handler) users(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	users, err := h.catalog.ListUsers(r.Context(), user)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, responseData[[]entity.User]{Data: users})
}

func (h *Handler) updateProfile(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	var input usecase.UpdateProfileInput
	if !decodeJSON(w, r, &input) {
		return
	}
	updated, err := h.catalog.UpdateProfile(r.Context(), user, input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Handler) deleteUser(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	deleted, err := h.catalog.DeleteUser(r.Context(), user, r.PathValue("userId"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, deleted)
}

func (h *Handler) discussions(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	result, err := h.catalog.ListDiscussions(r.Context(), user, page)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) createDiscussion(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	var input usecase.DiscussionInput
	if !decodeJSON(w, r, &input) {
		return
	}
	discussion, err := h.catalog.CreateDiscussion(r.Context(), user, input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, discussion)
}

func (h *Handler) discussion(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	discussion, err := h.catalog.GetDiscussion(r.Context(), user, r.PathValue("discussionId"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, responseData[entity.Discussion]{Data: discussion})
}

func (h *Handler) updateDiscussion(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	var input usecase.DiscussionInput
	if !decodeJSON(w, r, &input) {
		return
	}
	discussion, err := h.catalog.UpdateDiscussion(r.Context(), user, r.PathValue("discussionId"), input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, discussion)
}

func (h *Handler) deleteDiscussion(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	discussion, err := h.catalog.DeleteDiscussion(r.Context(), user, r.PathValue("discussionId"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, discussion)
}

func (h *Handler) comments(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	result, err := h.catalog.ListComments(r.Context(), user, r.URL.Query().Get("discussionId"), page)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) createComment(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	var input usecase.CommentInput
	if !decodeJSON(w, r, &input) {
		return
	}
	comment, err := h.catalog.CreateComment(r.Context(), user, input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, comment)
}

func (h *Handler) deleteComment(w http.ResponseWriter, r *http.Request) {
	user, ok := h.currentUser(w, r)
	if !ok {
		return
	}
	comment, err := h.catalog.DeleteComment(r.Context(), user, r.PathValue("commentId"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, comment)
}

func (h *Handler) currentUser(w http.ResponseWriter, r *http.Request) (entity.User, bool) {
	userID, err := h.sessions.UserID(r)
	if err != nil {
		writeError(w, usecase.ErrUnauthorized)
		return entity.User{}, false
	}
	user, err := h.auth.CurrentUser(r.Context(), userID)
	if err != nil {
		writeError(w, usecase.ErrUnauthorized)
		return entity.User{}, false
	}
	return user, true
}

func (h *Handler) writeAuth(w http.ResponseWriter, user entity.User) {
	token, err := h.sessions.Create(user.ID)
	if err != nil {
		writeError(w, err)
		return
	}
	h.sessions.SetCookie(w, token)
	writeJSON(w, http.StatusOK, authResponse{JWT: token, User: user})
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	if err := json.NewDecoder(r.Body).Decode(target); err != nil {
		writeError(w, usecase.ErrInvalidInput)
		return false
	}
	return true
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	message := err.Error()
	switch {
	case errors.Is(err, usecase.ErrUnauthorized):
		status = http.StatusUnauthorized
		message = "Unauthorized"
	case errors.Is(err, usecase.ErrForbidden):
		status = http.StatusForbidden
		message = "Forbidden"
	case errors.Is(err, usecase.ErrNotFound):
		status = http.StatusNotFound
		message = "Not found"
	case errors.Is(err, usecase.ErrInvalidInput):
		status = http.StatusBadRequest
		message = "Invalid input"
	case errors.Is(err, usecase.ErrConflict), strings.Contains(strings.ToLower(err.Error()), "unique"):
		status = http.StatusBadRequest
		message = "The user already exists"
	}
	writeJSON(w, status, map[string]string{"message": message})
}
