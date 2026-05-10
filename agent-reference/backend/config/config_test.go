package config

import "testing"

func TestLoadUsesLocalDevelopmentDefaults(t *testing.T) {
	t.Setenv("APP_ENV", "")
	t.Setenv("ADDRESS", "")
	t.Setenv("DATABASE_PATH", "")
	t.Setenv("JWT_SECRET", "")
	t.Setenv("COOKIE_NAME", "")
	t.Setenv("ALLOWED_ORIGIN", "")

	cfg := Load()

	if cfg.AppEnv != EnvLocal {
		t.Fatalf("expected default app env, got %q", cfg.AppEnv)
	}
	if cfg.Address != ":8770" {
		t.Fatalf("expected default address, got %q", cfg.Address)
	}
	if cfg.DatabasePath != "data/app.db" {
		t.Fatalf("expected default database path, got %q", cfg.DatabasePath)
	}
	if cfg.JWTSecret != "dev-secret-change-me" {
		t.Fatalf("expected local development JWT default, got %q", cfg.JWTSecret)
	}
	if cfg.CookieName != "bulletproof_react_app_token" {
		t.Fatalf("expected default cookie name, got %q", cfg.CookieName)
	}
	if cfg.AllowedOrigin != "http://localhost:3770" {
		t.Fatalf("expected default allowed origin, got %q", cfg.AllowedOrigin)
	}
}

func TestLoadAllowsEnvironmentOverrides(t *testing.T) {
	t.Setenv("APP_ENV", "staging")
	t.Setenv("ADDRESS", ":9090")
	t.Setenv("DATABASE_PATH", "/tmp/rootstock.db")
	t.Setenv("JWT_SECRET", "test-secret")
	t.Setenv("COOKIE_NAME", "test-cookie")
	t.Setenv("ALLOWED_ORIGIN", "http://localhost:4000")

	cfg := Load()

	if cfg.AppEnv != EnvStaging {
		t.Fatalf("expected configured app env, got %q", cfg.AppEnv)
	}
	if cfg.Address != ":9090" {
		t.Fatalf("expected configured address, got %q", cfg.Address)
	}
	if cfg.DatabasePath != "/tmp/rootstock.db" {
		t.Fatalf("expected configured database path, got %q", cfg.DatabasePath)
	}
	if cfg.JWTSecret != "test-secret" {
		t.Fatalf("expected configured JWT secret, got %q", cfg.JWTSecret)
	}
	if cfg.CookieName != "test-cookie" {
		t.Fatalf("expected configured cookie name, got %q", cfg.CookieName)
	}
	if cfg.AllowedOrigin != "http://localhost:4000" {
		t.Fatalf("expected configured allowed origin, got %q", cfg.AllowedOrigin)
	}
}

func TestLoadRejectsDefaultJWTSecretOutsideLocalOrDev(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("JWT_SECRET", "")

	defer func() {
		if recovered := recover(); recovered == nil {
			t.Fatalf("expected Load to panic when production JWT_SECRET is missing")
		}
	}()

	_ = Load()
}
