package entity

type Role string

const (
	RoleAdmin Role = "ADMIN"
	RoleUser  Role = "USER"
)

type User struct {
	ID           string `json:"id"`
	CreatedAt    int64  `json:"createdAt"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	Email        string `json:"email"`
	Role         Role   `json:"role"`
	TeamID       string `json:"teamId"`
	Bio          string `json:"bio"`
	PasswordHash string `json:"-"`
}

type Team struct {
	ID          string `json:"id"`
	CreatedAt   int64  `json:"createdAt"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Discussion struct {
	ID        string `json:"id"`
	CreatedAt int64  `json:"createdAt"`
	Title     string `json:"title"`
	Body      string `json:"body"`
	TeamID    string `json:"teamId"`
	AuthorID  string `json:"-"`
	Author    User   `json:"author"`
}

type Comment struct {
	ID           string `json:"id"`
	CreatedAt    int64  `json:"createdAt"`
	Body         string `json:"body"`
	DiscussionID string `json:"discussionId"`
	AuthorID     string `json:"-"`
	Author       User   `json:"author"`
}

type Meta struct {
	Page       int `json:"page"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

type Page[T any] struct {
	Data []T  `json:"data"`
	Meta Meta `json:"meta"`
}
