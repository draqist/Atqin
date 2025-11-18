# Start everything (DB, Backend, Frontend)
up:
	docker compose up --build

# Stop everything
down:
	docker compose down

# Enter the running backend container
shell-be:
	docker exec -it iqraa_backend sh

# Generate TypeScript types from Go structs
types:
	cd backend && tygo generate

# Database Connection String (Matches your docker-compose credentials)
DB_DSN=postgres://user:password@localhost:5432/iqraa_db?sslmode=disable

# Create a new migration file (Usage: make migrate-create name=create_users)
migrate-create:
	@echo "Creating migration files for ${name}..."
	# You might need to install golang-migrate locally for this, or just create files manually like we did above.
	# For now, we will assume manual file creation or install the tool if you want.

# Run Migrations UP (Apply changes)
migrate-up:
	docker run -v $(PWD)/backend/migrations:/migrations --network host migrate/migrate \
		-path=/migrations/ -database "$(DB_DSN)" up

# Run Migrations DOWN (Rollback changes)
migrate-down:
	docker run -v $(PWD)/backend/migrations:/migrations --network host migrate/migrate \
		-path=/migrations/ -database "$(DB_DSN)" down