package lib

import "golang.org/x/crypto/bcrypt"

// HashPassword generates a bcrypt hash for the given password
func HashPassword(password string) (string, error) {
	// Cost of 10 is a good balance between security and performance
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// ComparePassword compares a bcrypt hashed password with its plain text version
// Returns true if they match, false otherwise
func ComparePassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}
