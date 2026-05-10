package v1

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"
)

type SessionManager struct {
	secret     []byte
	cookieName string
}

type sessionClaims struct {
	UserID string `json:"userId"`
	Exp    int64  `json:"exp"`
}

func NewSessionManager(secret string, cookieName string) *SessionManager {
	return &SessionManager{secret: []byte(secret), cookieName: cookieName}
}

func (m *SessionManager) Create(userID string) (string, error) {
	claims := sessionClaims{UserID: userID, Exp: time.Now().Add(24 * time.Hour).Unix()}
	payload, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	encoded := base64.RawURLEncoding.EncodeToString(payload)
	signature := m.sign(encoded)
	return encoded + "." + signature, nil
}

func (m *SessionManager) UserID(r *http.Request) (string, error) {
	cookie, err := r.Cookie(m.cookieName)
	if err != nil {
		return "", err
	}
	parts := strings.Split(cookie.Value, ".")
	if len(parts) != 2 || !hmac.Equal([]byte(parts[1]), []byte(m.sign(parts[0]))) {
		return "", errors.New("invalid session")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", err
	}
	var claims sessionClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return "", err
	}
	if claims.Exp < time.Now().Unix() {
		return "", errors.New("expired session")
	}
	return claims.UserID, nil
}

func (m *SessionManager) SetCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     m.cookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   86400,
	})
}

func (m *SessionManager) ClearCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     m.cookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

func (m *SessionManager) sign(payload string) string {
	mac := hmac.New(sha256.New, m.secret)
	mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
