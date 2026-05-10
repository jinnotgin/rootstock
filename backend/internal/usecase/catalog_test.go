package usecase

import (
	"context"
	"errors"
	"testing"

	"rootstock/backend/internal/entity"
)

func TestCatalogUseCaseCreateDiscussionRequiresAdmin(t *testing.T) {
	repo := newCatalogMemoryRepo()
	ids := fixedIDs{"discussion-1"}
	uc := NewCatalogUseCase(repo, &ids, fixedClock{})

	_, err := uc.CreateDiscussion(context.Background(), entity.User{
		ID:     "user-1",
		Role:   entity.RoleUser,
		TeamID: "team-1",
	}, DiscussionInput{Title: "Roadmap", Body: "Plan the roadmap."})
	if !errors.Is(err, ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
}

func TestCatalogUseCaseCreateCommentRequiresTeamDiscussion(t *testing.T) {
	repo := newCatalogMemoryRepo()
	repo.discussions["discussion-1"] = entity.Discussion{
		ID:     "discussion-1",
		TeamID: "team-2",
	}
	ids := fixedIDs{"comment-1"}
	uc := NewCatalogUseCase(repo, &ids, fixedClock{})

	_, err := uc.CreateComment(context.Background(), entity.User{
		ID:     "user-1",
		Role:   entity.RoleUser,
		TeamID: "team-1",
	}, CommentInput{DiscussionID: "discussion-1", Body: "Looks good."})
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

type catalogMemoryRepo struct {
	discussions map[string]entity.Discussion
	comments    map[string]entity.Comment
}

func newCatalogMemoryRepo() *catalogMemoryRepo {
	return &catalogMemoryRepo{
		discussions: map[string]entity.Discussion{},
		comments:    map[string]entity.Comment{},
	}
}

func (r *catalogMemoryRepo) ListTeams(_ context.Context) ([]entity.Team, error) {
	return nil, nil
}

func (r *catalogMemoryRepo) ListUsers(_ context.Context, _ string) ([]entity.User, error) {
	return nil, nil
}

func (r *catalogMemoryRepo) UpdateUserProfile(_ context.Context, user entity.User) (entity.User, error) {
	return user, nil
}

func (r *catalogMemoryRepo) DeleteUser(_ context.Context, _ string, _ string) (entity.User, error) {
	return entity.User{}, nil
}

func (r *catalogMemoryRepo) ListDiscussions(_ context.Context, _ string, _ int, _ int) (entity.Page[entity.Discussion], error) {
	return entity.Page[entity.Discussion]{}, nil
}

func (r *catalogMemoryRepo) GetDiscussion(_ context.Context, discussionID string, teamID string) (entity.Discussion, error) {
	discussion, ok := r.discussions[discussionID]
	if !ok || discussion.TeamID != teamID {
		return entity.Discussion{}, ErrNotFound
	}
	return discussion, nil
}

func (r *catalogMemoryRepo) CreateDiscussion(_ context.Context, discussion entity.Discussion) (entity.Discussion, error) {
	r.discussions[discussion.ID] = discussion
	return discussion, nil
}

func (r *catalogMemoryRepo) UpdateDiscussion(_ context.Context, discussion entity.Discussion) (entity.Discussion, error) {
	r.discussions[discussion.ID] = discussion
	return discussion, nil
}

func (r *catalogMemoryRepo) DeleteDiscussion(_ context.Context, discussionID string, teamID string) (entity.Discussion, error) {
	discussion, err := r.GetDiscussion(context.Background(), discussionID, teamID)
	if err != nil {
		return entity.Discussion{}, err
	}
	delete(r.discussions, discussionID)
	return discussion, nil
}

func (r *catalogMemoryRepo) ListComments(_ context.Context, _ string, _ int, _ int) (entity.Page[entity.Comment], error) {
	return entity.Page[entity.Comment]{}, nil
}

func (r *catalogMemoryRepo) CreateComment(_ context.Context, comment entity.Comment) (entity.Comment, error) {
	r.comments[comment.ID] = comment
	return comment, nil
}

func (r *catalogMemoryRepo) DeleteComment(_ context.Context, _ string, _ entity.User) (entity.Comment, error) {
	return entity.Comment{}, nil
}
