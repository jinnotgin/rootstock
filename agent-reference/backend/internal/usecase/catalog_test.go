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
