package usecase

import "errors"

var (
	ErrUnauthorized = errors.New("Unauthorized")
	ErrForbidden    = errors.New("Forbidden")
	ErrNotFound     = errors.New("Not found")
	ErrInvalidInput = errors.New("Invalid input")
	ErrConflict     = errors.New("Conflict")
)
