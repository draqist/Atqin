package data

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrDuplicateEmail = errors.New("duplicate email")
)

type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Password     string    `json:"-"`              // Never output this to JSON
	PasswordHash []byte    `json:"-"`              // Never output this to JSON
	CreatedAt    time.Time `json:"created_at"`
}

type UserModel struct {
	DB *sql.DB
}

// Insert adds a new user
func (m UserModel) Insert(user *User) error {
	// 1. Hash the password
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), 12)
	if err != nil {
		return err
	}
	user.PasswordHash = hash

	// 2. Insert into DB
	query := `
		INSERT INTO users (name, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, created_at`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err = m.DB.QueryRowContext(ctx, query, user.Name, user.Email, user.PasswordHash).Scan(&user.ID, &user.CreatedAt)
	if err != nil {
		// Check for unique violation (Postgres error code 23505)
		// For simplicity here we return generic error, but you can check pq errors
		return err 
	}
	return nil
}

// GetByEmail fetches a user to verify login
func (m UserModel) GetByEmail(email string) (*User, error) {
	query := `SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1`

	var user User
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

// PasswordMatches checks if the provided password matches the hash
func (u *User) PasswordMatches(plaintextPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword(u.PasswordHash, []byte(plaintextPassword))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// GetByID fetches a user by their UUID
func (m UserModel) GetByID(id string) (*User, error) {
	query := `SELECT id, name, email, created_at FROM users WHERE id = $1`

	var user User
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}

	return &user, nil
}