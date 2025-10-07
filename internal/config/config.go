package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port   string
	DB_URL string
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
	config := &Config{
		Port:   portString,
		DB_URL: dbUrl,
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
