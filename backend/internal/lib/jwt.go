package lib

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT configuration (loaded from environment via config)
var (
	accessSecret    string
	refreshSecret   string
	accessExpiry    time.Duration
	refreshExpiry   time.Duration
	isInitialized   bool
)

// Claims represents the JWT claims
type Claims struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// InitJWT initializes the JWT configuration
func InitJWT(accessSec, refreshSec string, accessExp, refreshExp time.Duration) {
	accessSecret = accessSec
	refreshSecret = refreshSec
	accessExpiry = accessExp
	refreshExpiry = refreshExp
	isInitialized = true
}

// GenerateAccessToken creates a new access token for the given user
func GenerateAccessToken(userID, email string) (string, error) {
	if !isInitialized {
		return "", fmt.Errorf("JWT not initialized")
	}

	claims := Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(accessSecret))
}

// GenerateRefreshToken creates a new refresh token for the given user
func GenerateRefreshToken(userID string) (string, error) {
	if !isInitialized {
		return "", fmt.Errorf("JWT not initialized")
	}

	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshExpiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(refreshSecret))
}

// ValidateAccessToken validates and parses an access token
func ValidateAccessToken(tokenString string) (*Claims, error) {
	if !isInitialized {
		return nil, fmt.Errorf("JWT not initialized")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(accessSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// ValidateRefreshToken validates and parses a refresh token
func ValidateRefreshToken(tokenString string) (*Claims, error) {
	if !isInitialized {
		return nil, fmt.Errorf("JWT not initialized")
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(refreshSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// HashToken creates a SHA256 hash of the token for storage
func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// GetRefreshExpiry returns the refresh token expiry duration
func GetRefreshExpiry() time.Duration {
	return refreshExpiry
}
