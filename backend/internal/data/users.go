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

// User represents a registered user in the system.
type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	Password     string    `json:"-"`
	PasswordHash []byte    `json:"-"`
	PasswordResetTokenHash []byte `json:"-"`
	PasswordResetExpiry    time.Time `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	Role         string    `json:"role"`
}

// UserModel wraps the database connection pool for User-related operations.
type UserModel struct {
	DB *sql.DB
}

// Insert adds a new user to the database.
// It hashes the password before storage and returns an error if the email or username already exists.
func (m UserModel) Insert(user *User) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), 12)
	if err != nil {
		return err
	}
	user.PasswordHash = hash

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

// GetByEmail retrieves a user by their email address.
// It returns the User struct or an error if the user is not found.
func (m UserModel) GetByEmail(email string) (*User, error) {
	query := `SELECT id, name, email, username, password_hash, role, created_at FROM users WHERE email = $1`

	var user User
	var username sql.NullString
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

// GetByEmailOrUsername retrieves a user by either their email or username.
// This is useful for login flows where the user can identify themselves with either.
func (m UserModel) GetByEmailOrUsername(identifier string) (*User, error) {
	query := `
		SELECT id, name, email, username, password_hash, role, created_at 
		FROM users 
		WHERE email = $1 OR username = $1`

	var user User
	var username sql.NullString
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

// PasswordMatches compares the provided plaintext password with the stored hash.
// It returns true if they match, false otherwise.
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

// GetByID retrieves a user by their unique ID (UUID).
func (m UserModel) GetByID(id string) (*User, error) {
	query := `
        SELECT id, name, email, username, role, created_at 
        FROM users 
        WHERE id = $1`

	var user User
	var username sql.NullString
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

// Search finds users matching the query string in either their username or name.
// It performs a case-insensitive search and limits results to 10.
func (m UserModel) Search(query string) ([]*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

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
		var username sql.NullString
		if err := rows.Scan(&u.ID, &u.Name, &username); err != nil {
			return nil, err
		}
		u.Username = username.String
		users = append(users, &u)
	}
	return users, nil
}

// SetPasswordResetToken sets the password reset token hash and expiry for a user.
func (m UserModel) SetPasswordResetToken(userID string, tokenHash []byte, expiry time.Time) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		UPDATE users 
		SET password_reset_token_hash = $1, password_reset_expiry = $2 
		WHERE id = $3`

	_, err := m.DB.ExecContext(ctx, query, tokenHash, expiry, userID)
	return err
}

// GetByPasswordResetToken retrieves a user matching the given token hash, provided the token has not expired.
func (m UserModel) GetByPasswordResetToken(tokenHash []byte) (*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		SELECT id, name, email, username, password_hash, role, created_at 
		FROM users 
		WHERE password_reset_token_hash = $1 AND password_reset_expiry > $2`

	var user User
	var username sql.NullString

	err := m.DB.QueryRowContext(ctx, query, tokenHash, time.Now()).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&username,
		&user.PasswordHash,
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

// UpdatePassword updates the user's password and clears the reset token.
func (m UserModel) UpdatePassword(userID string, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `
		UPDATE users 
		SET password_hash = $1, password_reset_token_hash = NULL, password_reset_expiry = NULL 
		WHERE id = $2`

	_, err = m.DB.ExecContext(ctx, query, hash, userID)
	return err
}