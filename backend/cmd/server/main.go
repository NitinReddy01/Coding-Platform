package main

import (
	"app/internal/config"
	"app/internal/db"
	"app/internal/routes"
	"log"
	"net/http"
)

func main() {
	config := config.Load()

	router := http.NewServeMux()
	router.Handle("/api/", http.StripPrefix("/api", routes.ApiRoutes()))

	server := http.Server{
		Addr:    ":" + config.Port,
		Handler: router,
	}
	db.Connect(config.DB_URL)
	log.Println("BE server running on", config.Port)
	defer db.Close()
	err := server.ListenAndServe()
	if err != nil {
		log.Fatalf("Unable to start the server: %s", err)
	}
}
