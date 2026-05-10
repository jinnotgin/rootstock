package sqlite

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"math"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"

	"rootstock/backend/internal/entity"
	"rootstock/backend/internal/usecase"
)

type Repository struct {
	db *sql.DB
}

func Open(path string) (*Repository, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	db, err := sql.Open("sqlite3", path+"?_foreign_keys=on")
	if err != nil {
		return nil, err
	}
	repo := &Repository{db: db}
	if err := repo.migrate(context.Background()); err != nil {
		_ = db.Close()
		return nil, err
	}
	return repo, nil
}

func (r *Repository) Close() error {
	return r.db.Close()
}

func (r *Repository) migrate(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  team_id TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  FOREIGN KEY(team_id) REFERENCES teams(id)
);
CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  team_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  FOREIGN KEY(team_id) REFERENCES teams(id),
  FOREIGN KEY(author_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  body TEXT NOT NULL,
  discussion_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  FOREIGN KEY(discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
  FOREIGN KEY(author_id) REFERENCES users(id)
);
`)
	return err
}

func (r *Repository) CreateTeam(ctx context.Context, team entity.Team) (entity.Team, error) {
	_, err := r.db.ExecContext(ctx, `INSERT INTO teams (id, created_at, name, description) VALUES (?, ?, ?, ?)`, team.ID, team.CreatedAt, team.Name, team.Description)
	return team, err
}

func (r *Repository) GetTeam(ctx context.Context, id string) (entity.Team, error) {
	row := r.db.QueryRowContext(ctx, `SELECT id, created_at, name, description FROM teams WHERE id = ?`, id)
	return scanTeam(row)
}

func (r *Repository) ListTeams(ctx context.Context) ([]entity.Team, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, created_at, name, description FROM teams ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var teams []entity.Team
	for rows.Next() {
		var team entity.Team
		if err := rows.Scan(&team.ID, &team.CreatedAt, &team.Name, &team.Description); err != nil {
			return nil, err
		}
		teams = append(teams, team)
	}
	return teams, rows.Err()
}

func (r *Repository) CreateUser(ctx context.Context, user entity.User) (entity.User, error) {
	_, err := r.db.ExecContext(ctx, `INSERT INTO users (id, created_at, first_name, last_name, email, role, team_id, bio, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, user.ID, user.CreatedAt, user.FirstName, user.LastName, user.Email, user.Role, user.TeamID, user.Bio, user.PasswordHash)
	return user, err
}

func (r *Repository) GetUser(ctx context.Context, id string) (entity.User, error) {
	row := r.db.QueryRowContext(ctx, userSelect()+` WHERE u.id = ?`, id)
	return scanUser(row)
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (entity.User, error) {
	row := r.db.QueryRowContext(ctx, userSelect()+` WHERE u.email = ?`, email)
	return scanUser(row)
}

func (r *Repository) ListUsers(ctx context.Context, teamID string) ([]entity.User, error) {
	rows, err := r.db.QueryContext(ctx, userSelect()+` WHERE u.team_id = ? ORDER BY u.created_at DESC`, teamID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []entity.User
	for rows.Next() {
		user, err := scanUserRows(rows)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (r *Repository) UpdateUserProfile(ctx context.Context, user entity.User) (entity.User, error) {
	_, err := r.db.ExecContext(ctx, `UPDATE users SET email = ?, first_name = ?, last_name = ?, bio = ? WHERE id = ?`, user.Email, user.FirstName, user.LastName, user.Bio, user.ID)
	if err != nil {
		return entity.User{}, err
	}
	return r.GetUser(ctx, user.ID)
}

func (r *Repository) DeleteUser(ctx context.Context, userID string, teamID string) (entity.User, error) {
	user, err := r.GetUser(ctx, userID)
	if err != nil {
		return entity.User{}, err
	}
	if user.TeamID != teamID {
		return entity.User{}, usecase.ErrNotFound
	}
	_, err = r.db.ExecContext(ctx, `DELETE FROM users WHERE id = ? AND team_id = ?`, userID, teamID)
	return user, err
}

func (r *Repository) ListDiscussions(ctx context.Context, teamID string, page int, pageSize int) (entity.Page[entity.Discussion], error) {
	if page < 1 {
		page = 1
	}
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM discussions WHERE team_id = ?`, teamID).Scan(&total); err != nil {
		return entity.Page[entity.Discussion]{}, err
	}
	rows, err := r.db.QueryContext(ctx, discussionSelect()+` WHERE d.team_id = ? ORDER BY d.created_at DESC LIMIT ? OFFSET ?`, teamID, pageSize, (page-1)*pageSize)
	if err != nil {
		return entity.Page[entity.Discussion]{}, err
	}
	defer rows.Close()
	var discussions []entity.Discussion
	for rows.Next() {
		discussion, err := scanDiscussionRows(rows)
		if err != nil {
			return entity.Page[entity.Discussion]{}, err
		}
		discussions = append(discussions, discussion)
	}
	return entity.Page[entity.Discussion]{Data: discussions, Meta: meta(page, total, pageSize)}, rows.Err()
}

func (r *Repository) GetDiscussion(ctx context.Context, discussionID string, teamID string) (entity.Discussion, error) {
	row := r.db.QueryRowContext(ctx, discussionSelect()+` WHERE d.id = ? AND d.team_id = ?`, discussionID, teamID)
	return scanDiscussion(row)
}

func (r *Repository) CreateDiscussion(ctx context.Context, discussion entity.Discussion) (entity.Discussion, error) {
	_, err := r.db.ExecContext(ctx, `INSERT INTO discussions (id, created_at, title, body, team_id, author_id) VALUES (?, ?, ?, ?, ?, ?)`, discussion.ID, discussion.CreatedAt, discussion.Title, discussion.Body, discussion.TeamID, discussion.AuthorID)
	if err != nil {
		return entity.Discussion{}, err
	}
	return r.GetDiscussion(ctx, discussion.ID, discussion.TeamID)
}

func (r *Repository) UpdateDiscussion(ctx context.Context, discussion entity.Discussion) (entity.Discussion, error) {
	_, err := r.db.ExecContext(ctx, `UPDATE discussions SET title = ?, body = ? WHERE id = ? AND team_id = ?`, discussion.Title, discussion.Body, discussion.ID, discussion.TeamID)
	if err != nil {
		return entity.Discussion{}, err
	}
	return r.GetDiscussion(ctx, discussion.ID, discussion.TeamID)
}

func (r *Repository) DeleteDiscussion(ctx context.Context, discussionID string, teamID string) (entity.Discussion, error) {
	discussion, err := r.GetDiscussion(ctx, discussionID, teamID)
	if err != nil {
		return entity.Discussion{}, err
	}
	_, err = r.db.ExecContext(ctx, `DELETE FROM discussions WHERE id = ? AND team_id = ?`, discussionID, teamID)
	return discussion, err
}

func (r *Repository) ListComments(ctx context.Context, discussionID string, page int, pageSize int) (entity.Page[entity.Comment], error) {
	if page < 1 {
		page = 1
	}
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM comments WHERE discussion_id = ?`, discussionID).Scan(&total); err != nil {
		return entity.Page[entity.Comment]{}, err
	}
	rows, err := r.db.QueryContext(ctx, commentSelect()+` WHERE c.discussion_id = ? ORDER BY c.created_at ASC LIMIT ? OFFSET ?`, discussionID, pageSize, (page-1)*pageSize)
	if err != nil {
		return entity.Page[entity.Comment]{}, err
	}
	defer rows.Close()
	var comments []entity.Comment
	for rows.Next() {
		comment, err := scanCommentRows(rows)
		if err != nil {
			return entity.Page[entity.Comment]{}, err
		}
		comments = append(comments, comment)
	}
	return entity.Page[entity.Comment]{Data: comments, Meta: meta(page, total, pageSize)}, rows.Err()
}

func (r *Repository) CreateComment(ctx context.Context, comment entity.Comment) (entity.Comment, error) {
	_, err := r.db.ExecContext(ctx, `INSERT INTO comments (id, created_at, body, discussion_id, author_id) VALUES (?, ?, ?, ?, ?)`, comment.ID, comment.CreatedAt, comment.Body, comment.DiscussionID, comment.AuthorID)
	if err != nil {
		return entity.Comment{}, err
	}
	return r.getComment(ctx, comment.ID)
}

func (r *Repository) DeleteComment(ctx context.Context, commentID string, currentUser entity.User) (entity.Comment, error) {
	comment, err := r.getComment(ctx, commentID)
	if err != nil {
		return entity.Comment{}, err
	}
	if currentUser.Role != entity.RoleAdmin && comment.Author.ID != currentUser.ID {
		return entity.Comment{}, usecase.ErrNotFound
	}
	_, err = r.db.ExecContext(ctx, `DELETE FROM comments WHERE id = ?`, commentID)
	return comment, err
}

func (r *Repository) getComment(ctx context.Context, id string) (entity.Comment, error) {
	row := r.db.QueryRowContext(ctx, commentSelect()+` WHERE c.id = ?`, id)
	return scanComment(row)
}

type scanner interface {
	Scan(dest ...any) error
}

func scanTeam(row scanner) (entity.Team, error) {
	var team entity.Team
	err := row.Scan(&team.ID, &team.CreatedAt, &team.Name, &team.Description)
	return team, mapNotFound(err)
}

func scanUser(row scanner) (entity.User, error) {
	return scanUserScanner(row)
}

func scanUserRows(row scanner) (entity.User, error) {
	return scanUserScanner(row)
}

func scanUserScanner(row scanner) (entity.User, error) {
	var user entity.User
	err := row.Scan(&user.ID, &user.CreatedAt, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.TeamID, &user.Bio, &user.PasswordHash)
	return user, mapNotFound(err)
}

func scanDiscussion(row scanner) (entity.Discussion, error) {
	return scanDiscussionScanner(row)
}

func scanDiscussionRows(row scanner) (entity.Discussion, error) {
	return scanDiscussionScanner(row)
}

func scanDiscussionScanner(row scanner) (entity.Discussion, error) {
	var discussion entity.Discussion
	err := row.Scan(&discussion.ID, &discussion.CreatedAt, &discussion.Title, &discussion.Body, &discussion.TeamID, &discussion.AuthorID, &discussion.Author.ID, &discussion.Author.CreatedAt, &discussion.Author.FirstName, &discussion.Author.LastName, &discussion.Author.Email, &discussion.Author.Role, &discussion.Author.TeamID, &discussion.Author.Bio)
	return discussion, mapNotFound(err)
}

func scanComment(row scanner) (entity.Comment, error) {
	return scanCommentScanner(row)
}

func scanCommentRows(row scanner) (entity.Comment, error) {
	return scanCommentScanner(row)
}

func scanCommentScanner(row scanner) (entity.Comment, error) {
	var comment entity.Comment
	err := row.Scan(&comment.ID, &comment.CreatedAt, &comment.Body, &comment.DiscussionID, &comment.AuthorID, &comment.Author.ID, &comment.Author.CreatedAt, &comment.Author.FirstName, &comment.Author.LastName, &comment.Author.Email, &comment.Author.Role, &comment.Author.TeamID, &comment.Author.Bio)
	return comment, mapNotFound(err)
}

func userSelect() string {
	return `SELECT u.id, u.created_at, u.first_name, u.last_name, u.email, u.role, u.team_id, u.bio, u.password_hash FROM users u`
}

func discussionSelect() string {
	return `SELECT d.id, d.created_at, d.title, d.body, d.team_id, d.author_id, u.id, u.created_at, u.first_name, u.last_name, u.email, u.role, u.team_id, u.bio FROM discussions d JOIN users u ON u.id = d.author_id`
}

func commentSelect() string {
	return `SELECT c.id, c.created_at, c.body, c.discussion_id, c.author_id, u.id, u.created_at, u.first_name, u.last_name, u.email, u.role, u.team_id, u.bio FROM comments c JOIN users u ON u.id = c.author_id`
}

func mapNotFound(err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return usecase.ErrNotFound
	}
	return err
}

func meta(page, total, pageSize int) entity.Meta {
	return entity.Meta{Page: page, Total: total, TotalPages: int(math.Ceil(float64(total) / float64(pageSize)))}
}

func CheckInterfaces() {
	var repo any = (*Repository)(nil)
	if _, ok := repo.(usecase.AuthRepository); !ok {
		panic(fmt.Sprintf("%T does not implement AuthRepository", repo))
	}
	if _, ok := repo.(usecase.CatalogRepository); !ok {
		panic(fmt.Sprintf("%T does not implement CatalogRepository", repo))
	}
}
