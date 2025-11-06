package main

import (
	"app/internal/config"
	"app/internal/db"
	"app/internal/lib"
	"app/internal/routes"
	"log"
	"net/http"
)

func main() {
	config := config.Load()

	// Run database migrations automatically
	if err := db.RunMigrations(config.DB_URL); err != nil {
		log.Fatalf("Failed to run migrations: %s", err)
	}

	router := routes.New(config)
	lib.InitJWT(config.JWTAccessSecret, config.JWTRefreshSecret, config.AccessTokenExpiry, config.RefreshTokenExpiry)

	db.Connect(config.DB_URL)
	log.Println("BE server running on", config.Port)
	defer db.Close()
	err := http.ListenAndServe(":"+config.Port, router)
	if err != nil {
		log.Fatalf("Unable to start the server: %s", err)
	}
}
