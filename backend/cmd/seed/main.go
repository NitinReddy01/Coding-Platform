package main

import (
	"app/internal/config"
	"app/internal/db"
	"app/internal/seed"
	"log"
	"os"
)

func main() {
	log.Println("🌱 Starting admin user seeding...")

	// Load config
	cfg := config.Load()

	// Initialize database connection
	db.Connect(cfg.DB_URL)
	defer db.Close()
	log.Println("✅ Database connection established")

	// Run seeding with verbose output
	if err := seed.SeedAdminUser(cfg, true); err != nil {
		log.Fatalf("❌ Failed to seed admin user: %v", err)
	}

	log.Println("\n🎉 Admin user seeding completed successfully!")
	log.Printf("📧 Email: %s", seed.AdminEmail)
	log.Printf("🔑 Password: %s", seed.AdminPassword)
	log.Printf("👤 Name: %s", seed.AdminName)
	log.Printf("🛡️  Role: %s", seed.AdminRole)
	log.Println("\n⚠️  Remember to change the default password after first login!")
}

func init() {
	// Set log flags for better output
	log.SetFlags(0)
	log.SetOutput(os.Stdout)
}
