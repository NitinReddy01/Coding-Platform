include .env
MIGRATIONS_DIR = ./db/migrations

migration:
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: missing migration name."; \
		echo "Usage: make migration name=add_users_table"; \
		exit 1; \
	fi
	@goose -dir $(MIGRATIONS_DIR) create $(name) sql

migrate-up:
	@echo "Running up migrations..."
	@goose -dir ${MIGRATIONS_DIR} postgres ${DATABASE_URL} up

migrate-down:
	@goose -dir ${MIGRATIONS_DIR} postgres ${DATABASE_URL} down

migrate-status:
	@goose -dir ${MIGRATIONS_DIR} postgres ${DATABASE_URL} status

migrate-reset:
	@echo "Dropping..."
	@goose -dir ${MIGRATIONS_DIR} postgres ${DATABASE_URL} reset
	@make migrate-up

# Development commands
dev-server:
	air

dev-worker:
	@if [ -z "$(file)" ]; then \
		echo "❌ Error: missing submission file."; \
		echo "Usage: make dev-worker file=test_worker.json"; \
		exit 1; \
	fi
	go run cmd/worker/main.go $(file)