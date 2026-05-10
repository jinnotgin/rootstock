package config

import (
	"fmt"
	"os"
)

type AppEnv string

const (
	EnvLocal      AppEnv = "local"
	EnvDev        AppEnv = "dev"
	EnvStaging    AppEnv = "staging"
	EnvProduction AppEnv = "production"
)

const devJWTSecret = "dev-secret-change-me"

type Config struct {
	AppEnv        AppEnv
	Address       string
	DatabasePath  string
	JWTSecret     string
	CookieName    string
	AllowedOrigin string
}

func Load() Config {
	cfg := Config{
		AppEnv:        appEnv(getEnv("APP_ENV", string(EnvLocal))),
		Address:       getEnv("ADDRESS", ":8770"),
		DatabasePath:  getEnv("DATABASE_PATH", "data/app.db"),
		JWTSecret:     getEnv("JWT_SECRET", devJWTSecret),
		CookieName:    getEnv("COOKIE_NAME", "bulletproof_react_app_token"),
		AllowedOrigin: getEnv("ALLOWED_ORIGIN", "http://localhost:3770"),
	}
	if (cfg.AppEnv == EnvStaging || cfg.AppEnv == EnvProduction) && cfg.JWTSecret == devJWTSecret {
		panic("JWT_SECRET must be configured for staging and production")
	}
	return cfg
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func appEnv(value string) AppEnv {
	switch AppEnv(value) {
	case EnvLocal, EnvDev, EnvStaging, EnvProduction:
		return AppEnv(value)
	default:
		panic(fmt.Sprintf("invalid APP_ENV %q", value))
	}
}
