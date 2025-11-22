# Start everything (DB, Backend, Frontend)
up:
	docker compose up --build

# Stop everything
down:
	docker compose down

restart:
	docker compose restart

# Enter the running backend container
shell-be:
	docker exec -it iqraa_backend sh

# Generate TypeScript types from Go structs
types:
	cd backend && tygo generate

start:
	cd frontend && yarn dev

# Database Connection String (Matches your docker-compose credentials)
DB_DSN=postgres://user:password@localhost:5432/iqraa_db?sslmode=disable


migrate-create:
	docker run --rm -v $(PWD)/backend/migrations:/migrations migrate/migrate create -ext sql -dir /migrations -seq $(name)

# Run Migrations UP (Apply changes)
migrate-up:
	docker run -v $(PWD)/backend/migrations:/migrations --network host migrate/migrate \
		-path=/migrations/ -database "$(DB_DSN)" up

# Run Migrations DOWN (Rollback changes)
migrate-down:
	docker run -v $(PWD)/backend/migrations:/migrations --network host migrate/migrate \
		-path=/migrations/ -database "$(DB_DSN)" down