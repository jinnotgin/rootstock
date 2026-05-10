package sqlite

import (
	"context"
	"errors"
	"path/filepath"
	"testing"

	"rootstock/backend/internal/entity"
	"rootstock/backend/internal/usecase"
)

func TestRepositoryDeleteCommentAllowsAuthorOrAdminOnly(t *testing.T) {
	ctx := context.Background()
	repo, admin, author, other := newSeededRepo(t)
	discussion := createDiscussion(t, repo, "discussion-1", admin)
	comment, err := repo.CreateComment(ctx, entity.Comment{
		ID:           "comment-1",
		CreatedAt:    6,
		Body:         "Looks good.",
		DiscussionID: discussion.ID,
		AuthorID:     author.ID,
	})
	if err != nil {
		t.Fatalf("CreateComment returned error: %v", err)
	}

	_, err = repo.DeleteComment(ctx, comment.ID, other)
	if !errors.Is(err, usecase.ErrNotFound) {
		t.Fatalf("expected ErrNotFound for non-owner, got %v", err)
	}
	deleted, err := repo.DeleteComment(ctx, comment.ID, admin)
	if err != nil {
		t.Fatalf("expected admin delete to succeed, got %v", err)
	}
	if deleted.ID != comment.ID {
		t.Fatalf("expected deleted comment %s, got %s", comment.ID, deleted.ID)
	}
}

func TestRepositoryDeleteDiscussionCascadeDeletesComments(t *testing.T) {
	ctx := context.Background()
	repo, admin, author, _ := newSeededRepo(t)
	discussion := createDiscussion(t, repo, "discussion-1", admin)
	if _, err := repo.CreateComment(ctx, entity.Comment{
		ID:           "comment-1",
		CreatedAt:    6,
		Body:         "Looks good.",
		DiscussionID: discussion.ID,
		AuthorID:     author.ID,
	}); err != nil {
		t.Fatalf("CreateComment returned error: %v", err)
	}

	if _, err := repo.DeleteDiscussion(ctx, discussion.ID, admin.TeamID); err != nil {
		t.Fatalf("DeleteDiscussion returned error: %v", err)
	}
	comments, err := repo.ListComments(ctx, discussion.ID, 1, 10)
	if err != nil {
		t.Fatalf("ListComments returned error: %v", err)
	}
	if comments.Meta.Total != 0 || len(comments.Data) != 0 {
		t.Fatalf("expected deleted discussion comments to cascade, got total=%d len=%d", comments.Meta.Total, len(comments.Data))
	}
}

func TestRepositoryListDiscussionsIsTeamScopedAndPaginated(t *testing.T) {
	ctx := context.Background()
	repo, admin, _, _ := newSeededRepo(t)
	otherTeam := entity.Team{ID: "team-2", CreatedAt: 10, Name: "Other Team"}
	if _, err := repo.CreateTeam(ctx, otherTeam); err != nil {
		t.Fatalf("CreateTeam returned error: %v", err)
	}
	otherAdmin := entity.User{ID: "admin-2", CreatedAt: 11, FirstName: "Other", LastName: "Admin", Email: "other-admin@example.com", Role: entity.RoleAdmin, TeamID: otherTeam.ID, PasswordHash: "hash"}
	if _, err := repo.CreateUser(ctx, otherAdmin); err != nil {
		t.Fatalf("CreateUser returned error: %v", err)
	}
	createDiscussion(t, repo, "discussion-1", admin)
	createDiscussion(t, repo, "discussion-2", admin)
	createDiscussion(t, repo, "discussion-3", admin)
	createDiscussion(t, repo, "discussion-other-team", otherAdmin)

	page, err := repo.ListDiscussions(ctx, admin.TeamID, 2, 2)
	if err != nil {
		t.Fatalf("ListDiscussions returned error: %v", err)
	}
	if page.Meta.Page != 2 || page.Meta.Total != 3 || page.Meta.TotalPages != 2 {
		t.Fatalf("unexpected meta: %+v", page.Meta)
	}
	if len(page.Data) != 1 {
		t.Fatalf("expected one discussion on second page, got %d", len(page.Data))
	}
	if page.Data[0].TeamID != admin.TeamID {
		t.Fatalf("expected team-scoped discussion, got team %s", page.Data[0].TeamID)
	}
}

func newSeededRepo(t *testing.T) (*Repository, entity.User, entity.User, entity.User) {
	t.Helper()
	ctx := context.Background()
	repo, err := Open(filepath.Join(t.TempDir(), "test.db"))
	if err != nil {
		t.Fatalf("Open returned error: %v", err)
	}
	t.Cleanup(func() {
		if err := repo.Close(); err != nil {
			t.Fatalf("repo.Close returned error: %v", err)
		}
	})
	team := entity.Team{ID: "team-1", CreatedAt: 1, Name: "Team"}
	if _, err := repo.CreateTeam(ctx, team); err != nil {
		t.Fatalf("CreateTeam returned error: %v", err)
	}
	admin := entity.User{ID: "admin-1", CreatedAt: 2, FirstName: "Ada", LastName: "Admin", Email: "admin@example.com", Role: entity.RoleAdmin, TeamID: team.ID, PasswordHash: "hash"}
	author := entity.User{ID: "author-1", CreatedAt: 3, FirstName: "Grace", LastName: "Author", Email: "author@example.com", Role: entity.RoleUser, TeamID: team.ID, PasswordHash: "hash"}
	other := entity.User{ID: "other-1", CreatedAt: 4, FirstName: "Alan", LastName: "Other", Email: "other@example.com", Role: entity.RoleUser, TeamID: team.ID, PasswordHash: "hash"}
	for _, user := range []entity.User{admin, author, other} {
		if _, err := repo.CreateUser(ctx, user); err != nil {
			t.Fatalf("CreateUser(%s) returned error: %v", user.ID, err)
		}
	}
	return repo, admin, author, other
}

func createDiscussion(t *testing.T, repo *Repository, id string, author entity.User) entity.Discussion {
	t.Helper()
	discussion, err := repo.CreateDiscussion(context.Background(), entity.Discussion{
		ID:        id,
		CreatedAt: 5,
		Title:     "Planning " + id,
		Body:      "Discuss the plan.",
		TeamID:    author.TeamID,
		AuthorID:  author.ID,
	})
	if err != nil {
		t.Fatalf("CreateDiscussion returned error: %v", err)
	}
	return discussion
}
