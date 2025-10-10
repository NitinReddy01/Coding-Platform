package main

import (
	"app/internal/config"
	"app/internal/db"
	"app/internal/lib"
	"app/internal/middlewares"
	"app/internal/routes"
	"log"
	"net/http"
)

func main() {
	config := config.Load()

	// Initialize JWT with configuration
	lib.InitJWT(config.JWTAccessSecret, config.JWTRefreshSecret, config.AccessTokenExpiry, config.RefreshTokenExpiry)

	router := http.NewServeMux()
	router.Handle("/api/", http.StripPrefix("/api", routes.ApiRoutes()))

	// Wrap router with CORS middleware
	handler := middlewares.CORSMiddleware(router, config.AllowedOrigins)

	server := http.Server{
		Addr:    ":" + config.Port,
		Handler: handler,
	}
	db.Connect(config.DB_URL)
	log.Println("BE server running on", config.Port)
	defer db.Close()
	err := server.ListenAndServe()
	if err != nil {
		log.Fatalf("Unable to start the server: %s", err)
	}
}
