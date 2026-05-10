package usecase

import (
	"context"
	"strings"

	"rootstock/backend/internal/entity"
)

type CatalogRepository interface {
	ListTeams(ctx context.Context) ([]entity.Team, error)
	ListUsers(ctx context.Context, teamID string) ([]entity.User, error)
	UpdateUserProfile(ctx context.Context, user entity.User) (entity.User, error)
	DeleteUser(ctx context.Context, userID string, teamID string) (entity.User, error)
	ListDiscussions(ctx context.Context, teamID string, page int, pageSize int) (entity.Page[entity.Discussion], error)
	GetDiscussion(ctx context.Context, discussionID string, teamID string) (entity.Discussion, error)
	CreateDiscussion(ctx context.Context, discussion entity.Discussion) (entity.Discussion, error)
	UpdateDiscussion(ctx context.Context, discussion entity.Discussion) (entity.Discussion, error)
	DeleteDiscussion(ctx context.Context, discussionID string, teamID string) (entity.Discussion, error)
	ListComments(ctx context.Context, discussionID string, page int, pageSize int) (entity.Page[entity.Comment], error)
	CreateComment(ctx context.Context, comment entity.Comment) (entity.Comment, error)
	DeleteComment(ctx context.Context, commentID string, currentUser entity.User) (entity.Comment, error)
}

type CatalogUseCase struct {
	repo CatalogRepository
	ids  IDGenerator
	now  Clock
}

type UpdateProfileInput struct {
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Bio       string `json:"bio"`
}

type DiscussionInput struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

type CommentInput struct {
	DiscussionID string `json:"discussionId"`
	Body         string `json:"body"`
}

func NewCatalogUseCase(repo CatalogRepository, ids IDGenerator, now Clock) *CatalogUseCase {
	return &CatalogUseCase{repo: repo, ids: ids, now: now}
}

func (uc *CatalogUseCase) ListTeams(ctx context.Context) ([]entity.Team, error) {
	return uc.repo.ListTeams(ctx)
}

func (uc *CatalogUseCase) ListUsers(ctx context.Context, user entity.User) ([]entity.User, error) {
	return uc.repo.ListUsers(ctx, user.TeamID)
}

func (uc *CatalogUseCase) UpdateProfile(ctx context.Context, current entity.User, input UpdateProfileInput) (entity.User, error) {
	if strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.FirstName) == "" || strings.TrimSpace(input.LastName) == "" {
		return entity.User{}, ErrInvalidInput
	}
	current.Email = strings.TrimSpace(input.Email)
	current.FirstName = strings.TrimSpace(input.FirstName)
	current.LastName = strings.TrimSpace(input.LastName)
	current.Bio = input.Bio
	return uc.repo.UpdateUserProfile(ctx, current)
}

func (uc *CatalogUseCase) DeleteUser(ctx context.Context, current entity.User, userID string) (entity.User, error) {
	if current.Role != entity.RoleAdmin {
		return entity.User{}, ErrUnauthorized
	}
	return uc.repo.DeleteUser(ctx, userID, current.TeamID)
}

func (uc *CatalogUseCase) ListDiscussions(ctx context.Context, current entity.User, page int) (entity.Page[entity.Discussion], error) {
	return uc.repo.ListDiscussions(ctx, current.TeamID, page, 10)
}

func (uc *CatalogUseCase) GetDiscussion(ctx context.Context, current entity.User, discussionID string) (entity.Discussion, error) {
	return uc.repo.GetDiscussion(ctx, discussionID, current.TeamID)
}

func (uc *CatalogUseCase) CreateDiscussion(ctx context.Context, current entity.User, input DiscussionInput) (entity.Discussion, error) {
	if current.Role != entity.RoleAdmin {
		return entity.Discussion{}, ErrUnauthorized
	}
	if strings.TrimSpace(input.Title) == "" || strings.TrimSpace(input.Body) == "" {
		return entity.Discussion{}, ErrInvalidInput
	}
	return uc.repo.CreateDiscussion(ctx, entity.Discussion{
		ID:        uc.ids.NewID(),
		CreatedAt: uc.now.Now().UnixMilli(),
		Title:     strings.TrimSpace(input.Title),
		Body:      strings.TrimSpace(input.Body),
		TeamID:    current.TeamID,
		AuthorID:  current.ID,
	})
}

func (uc *CatalogUseCase) UpdateDiscussion(ctx context.Context, current entity.User, discussionID string, input DiscussionInput) (entity.Discussion, error) {
	if current.Role != entity.RoleAdmin {
		return entity.Discussion{}, ErrUnauthorized
	}
	if strings.TrimSpace(input.Title) == "" || strings.TrimSpace(input.Body) == "" {
		return entity.Discussion{}, ErrInvalidInput
	}
	return uc.repo.UpdateDiscussion(ctx, entity.Discussion{
		ID:     discussionID,
		Title:  strings.TrimSpace(input.Title),
		Body:   strings.TrimSpace(input.Body),
		TeamID: current.TeamID,
	})
}

func (uc *CatalogUseCase) DeleteDiscussion(ctx context.Context, current entity.User, discussionID string) (entity.Discussion, error) {
	if current.Role != entity.RoleAdmin {
		return entity.Discussion{}, ErrUnauthorized
	}
	return uc.repo.DeleteDiscussion(ctx, discussionID, current.TeamID)
}

func (uc *CatalogUseCase) ListComments(ctx context.Context, current entity.User, discussionID string, page int) (entity.Page[entity.Comment], error) {
	if _, err := uc.repo.GetDiscussion(ctx, discussionID, current.TeamID); err != nil {
		return entity.Page[entity.Comment]{}, err
	}
	return uc.repo.ListComments(ctx, discussionID, page, 10)
}

func (uc *CatalogUseCase) CreateComment(ctx context.Context, current entity.User, input CommentInput) (entity.Comment, error) {
	if strings.TrimSpace(input.DiscussionID) == "" || strings.TrimSpace(input.Body) == "" {
		return entity.Comment{}, ErrInvalidInput
	}
	if _, err := uc.repo.GetDiscussion(ctx, input.DiscussionID, current.TeamID); err != nil {
		return entity.Comment{}, err
	}
	return uc.repo.CreateComment(ctx, entity.Comment{
		ID:           uc.ids.NewID(),
		CreatedAt:    uc.now.Now().UnixMilli(),
		Body:         strings.TrimSpace(input.Body),
		DiscussionID: input.DiscussionID,
		AuthorID:     current.ID,
	})
}

func (uc *CatalogUseCase) DeleteComment(ctx context.Context, current entity.User, commentID string) (entity.Comment, error) {
	return uc.repo.DeleteComment(ctx, commentID, current)
}
