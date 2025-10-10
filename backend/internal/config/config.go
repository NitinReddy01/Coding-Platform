package config

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	DB_URL             string
	JWTAccessSecret    string
	JWTRefreshSecret   string
	AccessTokenExpiry  time.Duration
	RefreshTokenExpiry time.Duration
	AllowedOrigins     []string
}

func Load() *Config {
	err := godotenv.Load("./.env")
	if err != nil {
		log.Fatal("Missing .env file")
	}
	portString := getEnv("PORT", "4000")
	_, err = strconv.Atoi(portString)
	if err != nil {
		log.Fatalf("Invalid port: %s", portString)
	}
	dbUrl := getEnv("DATABASE_URL", "postgres://postgres:secret@localhost:5432/postgres?sslmode=disable")

	// JWT Configuration
	jwtAccessSecret := getEnv("JWT_ACCESS_SECRET", "")
	if jwtAccessSecret == "" {
		log.Fatal("JWT_ACCESS_SECRET is required in .env file")
	}
	jwtRefreshSecret := getEnv("JWT_REFRESH_SECRET", "")
	if jwtRefreshSecret == "" {
		log.Fatal("JWT_REFRESH_SECRET is required in .env file")
	}

	// Parse and validate token expiry durations
	accessTokenExpiryStr := getEnv("ACCESS_TOKEN_EXPIRY", "15m")
	accessTokenExpiry, err := time.ParseDuration(accessTokenExpiryStr)
	if err != nil {
		log.Fatalf("Invalid ACCESS_TOKEN_EXPIRY '%s': %v", accessTokenExpiryStr, err)
	}

	refreshTokenExpiryStr := getEnv("REFRESH_TOKEN_EXPIRY", "168h")
	refreshTokenExpiry, err := time.ParseDuration(refreshTokenExpiryStr)
	if err != nil {
		log.Fatalf("Invalid REFRESH_TOKEN_EXPIRY '%s': %v", refreshTokenExpiryStr, err)
	}

	// Parse CORS allowed origins
	allowedOriginsStr := getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
	allowedOrigins := parseAllowedOrigins(allowedOriginsStr)

	config := &Config{
		Port:               portString,
		DB_URL:             dbUrl,
		JWTAccessSecret:    jwtAccessSecret,
		JWTRefreshSecret:   jwtRefreshSecret,
		AccessTokenExpiry:  accessTokenExpiry,
		RefreshTokenExpiry: refreshTokenExpiry,
		AllowedOrigins:     allowedOrigins,
	}
	return config
}

func getEnv(key string, fallback string) string {
	value, ok := os.LookupEnv(key)
	if ok {
		return value
	}
	return fallback
}

// parseAllowedOrigins parses a comma-separated string of origins into a slice
func parseAllowedOrigins(originsStr string) []string {
	if originsStr == "" {
		return []string{}
	}

	origins := strings.Split(originsStr, ",")
	result := make([]string, 0, len(origins))

	for _, origin := range origins {
		trimmed := strings.TrimSpace(origin)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}

	return result
}
