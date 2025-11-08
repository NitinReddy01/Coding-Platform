package lib

import (
	"log"
	"sync"

	"app/internal/config"

	"github.com/supabase-community/supabase-go"
)

var (
	supabaseClient *supabase.Client
	once           sync.Once
)

func InitSupabase(cfg *config.Config) {
	once.Do(func() {
		client, err := supabase.NewClient(
			cfg.SupabaseURL,
			cfg.SupabaseServiceKey,
			&supabase.ClientOptions{},
		)
		if err != nil {
			log.Fatalf("Failed to initialize Supabase client: %v", err)
		}
		supabaseClient = client
		log.Println("✅ Supabase client initialized successfully")
	})
}

func GetSupabaseClient() *supabase.Client {
	if supabaseClient == nil {
		log.Fatal("Supabase client not initialized. Call InitSupabase first")
	}
	return supabaseClient
}
