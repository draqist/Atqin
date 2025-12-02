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
	Username     string    `json:"username"`       // Added
	Password     string    `json:"-"`              // Never output this to JSON
	PasswordHash []byte    `json:"-"`              // Never output this to JSON
	CreatedAt    time.Time `json:"created_at"`
	Role         string    `json:"role"`
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
		INSERT INTO users (name, email, username, password_hash)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err = m.DB.QueryRowContext(ctx, query, user.Name, user.Email, user.Username, user.PasswordHash).Scan(&user.ID, &user.CreatedAt)
	if err != nil {
		return err 
	}
	return nil
}

// GetByEmail fetches a user to verify login
func (m UserModel) GetByEmail(email string) (*User, error) {
	query := `SELECT id, name, email, username, password_hash, role, created_at FROM users WHERE email = $1`

	var user User
	var username sql.NullString // Handle NULL
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&username, 
		&user.PasswordHash,
		&user.Role,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}
	user.Username = username.String
	return &user, nil
}

// GetByEmailOrUsername fetches a user by email OR username
func (m UserModel) GetByEmailOrUsername(identifier string) (*User, error) {
	query := `
		SELECT id, name, email, username, password_hash, role, created_at 
		FROM users 
		WHERE email = $1 OR username = $1`

	var user User
	var username sql.NullString // Handle NULL
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRowContext(ctx, query, identifier).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&username, 
		&user.PasswordHash,
		&user.Role,
		&user.CreatedAt,
	)

	if err != nil {
		return nil, err
	}
	user.Username = username.String
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
    query := `
        SELECT id, name, email, username, role, created_at 
        FROM users 
        WHERE id = $1`

    var user User
    var username sql.NullString // Handle NULL
    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    defer cancel()

    err := m.DB.QueryRowContext(ctx, query, id).Scan(
        &user.ID,
        &user.Name,
        &user.Email,
        &username,
        &user.Role,
        &user.CreatedAt,
    )

    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, ErrRecordNotFound
        }
        return nil, err
    }
    user.Username = username.String
    return &user, nil
}

// Search finds users by username or name
func (m UserModel) Search(query string) ([]*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Simple ILIKE search
	sqlQuery := `
		SELECT id, name, username 
		FROM users 
		WHERE username ILIKE $1 OR name ILIKE $1
		LIMIT 10`

	rows, err := m.DB.QueryContext(ctx, sqlQuery, "%"+query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		var u User
		// We only scan public fields
		var username sql.NullString // Handle nulls if migration didn't backfill
		if err := rows.Scan(&u.ID, &u.Name, &username); err != nil {
			return nil, err
		}
		u.Username = username.String
		users = append(users, &u)
	}
	return users, nil
}