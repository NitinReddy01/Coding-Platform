package main

import (
	"app/internal/config"
	"app/internal/db"
	"app/internal/lib"
	"app/internal/middlewares"
	"app/internal/routes"
	"app/internal/seed"
	"log"
	"net/http"
)

func main() {
	config := config.Load()

	// Run database migrations automatically
	if err := db.RunMigrations(config.DB_URL); err != nil {
		log.Fatalf("Failed to run migrations: %s", err)
	}

	// Initialize database connection
	db.Connect(config.DB_URL)
	defer db.Close()

	// Seed admin user automatically on startup
	if err := seed.SeedAdminUser(config, false); err != nil {
		log.Printf("⚠️  Warning: Failed to seed admin user: %v", err)
		log.Println("Continuing server startup...")
	}

	// Initialize services
	router := routes.New(config)
	lib.InitSupabase(config)
	middlewares.InitAuthMiddleware(config)

	log.Println("BE server running on", config.Port)
	err := http.ListenAndServe(":"+config.Port, router)
	if err != nil {
		log.Fatalf("Unable to start the server: %s", err)
	}
}
