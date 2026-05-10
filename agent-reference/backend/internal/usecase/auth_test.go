package usecase

import (
	"context"
	"errors"
	"testing"

	"rootstock/backend/internal/entity"
)

func TestAuthUseCaseRegisterCreatesAdminAndTeamWhenNoTeamID(t *testing.T) {
	repo := newMemoryRepo()
	ids := fixedIDs{"team-1", "user-1"}
	uc := NewAuthUseCase(repo, &ids, fixedClock{})

	user, err := uc.Register(context.Background(), RegisterInput{
		Email:     "admin@example.com",
		FirstName: "Ada",
		LastName:  "Lovelace",
		Password:  "secret",
		TeamName:  ptr("Ada Team"),
	})
	if err != nil {
		t.Fatalf("Register returned error: %v", err)
	}
	if user.Role != entity.RoleAdmin {
		t.Fatalf("expected admin role, got %s", user.Role)
	}
	if user.TeamID != "team-1" {
		t.Fatalf("expected generated team id, got %s", user.TeamID)
	}
	if _, err := repo.GetTeam(context.Background(), "team-1"); err != nil {
		t.Fatalf("expected team to be created: %v", err)
	}
}

func TestAuthUseCaseLoginRejectsInvalidPassword(t *testing.T) {
	repo := newMemoryRepo()
	ids := fixedIDs{"team-1", "user-1"}
	uc := NewAuthUseCase(repo, &ids, fixedClock{})
	_, err := uc.Register(context.Background(), RegisterInput{
		Email:     "admin@example.com",
		FirstName: "Ada",
		LastName:  "Lovelace",
		Password:  "secret",
	})
	if err != nil {
		t.Fatalf("Register returned error: %v", err)
	}

	_, err = uc.Login(context.Background(), LoginInput{Email: "admin@example.com", Password: "wrong"})
	if !errors.Is(err, ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}
