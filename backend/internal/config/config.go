package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	DB_URL             string
	AllowedOrigins     []string
	RabbitMQURL        string
	SMTPHost           string
	SMTPPort           int
	SMTPSender         string
	SMTPPassword       string
	WorkerAPIKey       string
	APIBaseURL         string
	FrontendURL        string
	SupabaseURL        string
	SupabaseAnonKey    string
	SupabaseServiceKey string
	SupabaseJWTSecret  string
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

	// Parse CORS allowed origins
	allowedOriginsStr := getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
	allowedOrigins := parseAllowedOrigins(allowedOriginsStr)

	rabbitMqUrl := getEnv("RABBITMQ_URL", "")

	if rabbitMqUrl == "" {
		log.Fatal("Missing rabbit mq url")
	}

	// Worker API configuration
	workerAPIKey := getEnv("WORKER_API_KEY", "")
	if workerAPIKey == "" {
		log.Fatal("WORKER_API_KEY is required in .env file")
	}

	apiBaseURL := getEnv("API_BASE_URL", "http://localhost:4000")
	frontendURL := getEnv("FRONTEND_URL", "http://localhost:5173")

	// Supabase Configuration
	supabaseURL := getEnv("SUPABASE_URL", "")
	if supabaseURL == "" {
		log.Fatal("SUPABASE_URL is required in .env file")
	}

	supabaseAnonKey := getEnv("SUPABASE_ANON_KEY", "")
	if supabaseAnonKey == "" {
		log.Fatal("SUPABASE_ANON_KEY is required in .env file")
	}

	supabaseServiceKey := getEnv("SUPABASE_SERVICE_KEY", "")
	if supabaseServiceKey == "" {
		log.Fatal("SUPABASE_SERVICE_KEY is required in .env file")
	}

	supabaseJWTSecret := getEnv("SUPABASE_JWT_SECRET", "")
	if supabaseJWTSecret == "" {
		log.Fatal("JWT is required in .env file")
	}

	config := &Config{
		Port:               portString,
		DB_URL:             dbUrl,
		AllowedOrigins:     allowedOrigins,
		RabbitMQURL:        rabbitMqUrl,
		WorkerAPIKey:       workerAPIKey,
		APIBaseURL:         apiBaseURL,
		FrontendURL:        frontendURL,
		SupabaseURL:        supabaseURL,
		SupabaseAnonKey:    supabaseAnonKey,
		SupabaseServiceKey: supabaseServiceKey,
		SupabaseJWTSecret:  supabaseJWTSecret,
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
