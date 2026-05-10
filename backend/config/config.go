package config

import "os"

type Config struct {
	Address       string
	DatabasePath  string
	JWTSecret     string
	CookieName    string
	AllowedOrigin string
}

func Load() Config {
	return Config{
		Address:       getEnv("ADDRESS", ":8080"),
		DatabasePath:  getEnv("DATABASE_PATH", "data/app.db"),
		JWTSecret:     getEnv("JWT_SECRET", "dev-secret-change-me"),
		CookieName:    getEnv("COOKIE_NAME", "bulletproof_react_app_token"),
		AllowedOrigin: getEnv("ALLOWED_ORIGIN", "http://localhost:3000"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
