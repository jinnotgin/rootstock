package usecase

import (
	"context"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"rootstock/backend/internal/entity"
)

type AuthRepository interface {
	CreateTeam(ctx context.Context, team entity.Team) (entity.Team, error)
	GetTeam(ctx context.Context, id string) (entity.Team, error)
	CreateUser(ctx context.Context, user entity.User) (entity.User, error)
	GetUserByEmail(ctx context.Context, email string) (entity.User, error)
	GetUser(ctx context.Context, id string) (entity.User, error)
}

type AuthUseCase struct {
	repo AuthRepository
	ids  IDGenerator
	now  Clock
}

type RegisterInput struct {
	Email     string  `json:"email"`
	FirstName string  `json:"firstName"`
	LastName  string  `json:"lastName"`
	Password  string  `json:"password"`
	TeamID    *string `json:"teamId"`
	TeamName  *string `json:"teamName"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func NewAuthUseCase(repo AuthRepository, ids IDGenerator, now Clock) *AuthUseCase {
	return &AuthUseCase{repo: repo, ids: ids, now: now}
}

func (uc *AuthUseCase) Register(ctx context.Context, input RegisterInput) (entity.User, error) {
	if strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.FirstName) == "" || strings.TrimSpace(input.LastName) == "" || len(input.Password) < 5 {
		return entity.User{}, ErrInvalidInput
	}
	if _, err := uc.repo.GetUserByEmail(ctx, input.Email); err == nil {
		return entity.User{}, ErrConflict
	}

	teamID := ""
	role := entity.RoleUser
	if input.TeamID != nil && strings.TrimSpace(*input.TeamID) != "" {
		team, err := uc.repo.GetTeam(ctx, *input.TeamID)
		if err != nil {
			return entity.User{}, ErrInvalidInput
		}
		teamID = team.ID
	} else {
		role = entity.RoleAdmin
		name := strings.TrimSpace(input.FirstName) + " Team"
		if input.TeamName != nil && strings.TrimSpace(*input.TeamName) != "" {
			name = strings.TrimSpace(*input.TeamName)
		}
		team, err := uc.repo.CreateTeam(ctx, entity.Team{
			ID:          uc.ids.NewID(),
			CreatedAt:   uc.now.Now().UnixMilli(),
			Name:        name,
			Description: "",
		})
		if err != nil {
			return entity.User{}, err
		}
		teamID = team.ID
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return entity.User{}, err
	}

	return uc.repo.CreateUser(ctx, entity.User{
		ID:           uc.ids.NewID(),
		CreatedAt:    uc.now.Now().UnixMilli(),
		FirstName:    strings.TrimSpace(input.FirstName),
		LastName:     strings.TrimSpace(input.LastName),
		Email:        strings.TrimSpace(input.Email),
		Role:         role,
		TeamID:       teamID,
		Bio:          "",
		PasswordHash: string(hash),
	})
}

func (uc *AuthUseCase) Login(ctx context.Context, input LoginInput) (entity.User, error) {
	user, err := uc.repo.GetUserByEmail(ctx, input.Email)
	if err != nil {
		return entity.User{}, ErrUnauthorized
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)) != nil {
		return entity.User{}, ErrUnauthorized
	}
	return user, nil
}

func (uc *AuthUseCase) CurrentUser(ctx context.Context, userID string) (entity.User, error) {
	return uc.repo.GetUser(ctx, userID)
}

type IDGenerator interface {
	NewID() string
}

type Clock interface {
	Now() time.Time
}
