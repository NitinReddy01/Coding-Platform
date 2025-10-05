package main

import (
	"app/internal/config"
	"app/internal/routes"
	"fmt"
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
	fmt.Printf("BE server running on %s", config.Port)
	err := server.ListenAndServe()
	if err != nil {
		log.Fatalf("Unable to start the server: %s", err)
	}
}
