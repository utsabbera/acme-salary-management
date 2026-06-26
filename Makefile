.PHONY: install dev dev-backend dev-frontend gen-client db-up db-down db-migrate db-reset lint typecheck test clean

install:
	pnpm install
	cd backend && uv sync

dev:
	make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && uv run fastapi dev main.py

dev-frontend:
	cd frontend && pnpm dev

gen-client:
	cd frontend && pnpm openapi-ts

db-up:
	docker compose up -d

db-down:
	docker compose down

db-migrate:
	cd backend && uv run alembic revision --autogenerate -m "$(MSG)"
	cd backend && uv run alembic upgrade head

db-reset:
	cd backend && uv run alembic downgrade base
	cd backend && uv run alembic upgrade head

lint:
	pnpm biome check frontend/src
	cd backend && uv run ruff check app/

typecheck:
	cd frontend && pnpm tsc --noEmit
	cd backend && uv run mypy app/

test:
	cd frontend && pnpm vitest run
	cd backend && uv run pytest

clean:
	rm -rf frontend/.next frontend/node_modules
	rm -rf backend/.venv backend/__pycache__
