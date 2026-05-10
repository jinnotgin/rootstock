package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

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

type fixedIDs []string

func (f *fixedIDs) NewID() string {
	id := (*f)[0]
	*f = (*f)[1:]
	return id
}

type fixedClock struct{}

func (fixedClock) Now() time.Time {
	return time.UnixMilli(1715299200000)
}

type memoryRepo struct {
	users map[string]entity.User
	teams map[string]entity.Team
}

func newMemoryRepo() *memoryRepo {
	return &memoryRepo{users: map[string]entity.User{}, teams: map[string]entity.Team{}}
}

func (r *memoryRepo) CreateTeam(_ context.Context, team entity.Team) (entity.Team, error) {
	r.teams[team.ID] = team
	return team, nil
}

func (r *memoryRepo) GetTeam(_ context.Context, id string) (entity.Team, error) {
	team, ok := r.teams[id]
	if !ok {
		return entity.Team{}, ErrNotFound
	}
	return team, nil
}

func (r *memoryRepo) CreateUser(_ context.Context, user entity.User) (entity.User, error) {
	r.users[user.ID] = user
	return user, nil
}

func (r *memoryRepo) GetUserByEmail(_ context.Context, email string) (entity.User, error) {
	for _, user := range r.users {
		if user.Email == email {
			return user, nil
		}
	}
	return entity.User{}, ErrNotFound
}

func (r *memoryRepo) GetUser(_ context.Context, id string) (entity.User, error) {
	user, ok := r.users[id]
	if !ok {
		return entity.User{}, ErrNotFound
	}
	return user, nil
}

func ptr(value string) *string {
	return &value
}
