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
	RabbitMQURL        string
	SMTPHost           string
	SMTPPort           int
	SMTPSender         string
	SMTPPassword       string
	WorkerAPIKey       string
	APIBaseURL         string
	FrontendURL        string
}

func Load() *Config {
	if os.Getenv("RENDER") == "" && os.Getenv("ENV") != "production" {
		if err := godotenv.Load(".env"); err != nil {
			log.Println("⚠️  No .env file found — using system environment variables")
		}
	}

	portString := getEnv("PORT", "4000")
	_, err := strconv.Atoi(portString)
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

	rabbitMqUrl := getEnv("RABBITMQ_URL", "")

	if rabbitMqUrl == "" {
		log.Fatal("Missing rabbit mq url")
	}

	// SMTP Configuration
	smtpHost := getEnv("SMTP_HOST", "")
	if smtpHost == "" {
		log.Fatal("SMTP_HOST is required in .env file")
	}

	smtpPortStr := getEnv("SMTP_PORT", "")
	if smtpPortStr == "" {
		log.Fatal("SMTP_PORT is required in .env file")
	}

	smtpPort, err := strconv.Atoi(smtpPortStr)
	if err != nil {
		log.Fatalf("Invalid SMTP_PORT '%s': %v", smtpPortStr, err)
	}

	smtpSender := getEnv("SMTP_SENDER", "")
	if smtpSender == "" {
		log.Fatal("SMTP_SENDER is required in .env file")
	}

	smtpPassword := getEnv("SMTP_PASSWORD", "")
	if smtpPassword == "" {
		log.Fatal("SMTP_PASSWORD is required in .env file")
	}

	// Worker API configuration
	workerAPIKey := getEnv("WORKER_API_KEY", "")
	if workerAPIKey == "" {
		log.Fatal("WORKER_API_KEY is required in .env file")
	}

	apiBaseURL := getEnv("API_BASE_URL", "http://localhost:4000")
	frontendURL := getEnv("FRONTEND_URL", "http://localhost:5173")

	config := &Config{
		Port:               portString,
		DB_URL:             dbUrl,
		JWTAccessSecret:    jwtAccessSecret,
		JWTRefreshSecret:   jwtRefreshSecret,
		AccessTokenExpiry:  accessTokenExpiry,
		RefreshTokenExpiry: refreshTokenExpiry,
		AllowedOrigins:     allowedOrigins,
		RabbitMQURL:        rabbitMqUrl,
		SMTPHost:           smtpHost,
		SMTPPort:           smtpPort,
		SMTPSender:         smtpSender,
		SMTPPassword:       smtpPassword,
		WorkerAPIKey:       workerAPIKey,
		APIBaseURL:         apiBaseURL,
		FrontendURL:        frontendURL,
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
