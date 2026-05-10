package usecase

import (
	"context"
	"time"

	"rootstock/backend/internal/entity"
)

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

func ptr(value string) *string {
	return &value
}
