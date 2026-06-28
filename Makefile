.PHONY: install dev dev-backend dev-frontend gen-client migrate lint typecheck test seed

install:
	pnpm install
	cd backend && uv sync

dev:
	make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && uv run fastapi dev main.py

dev-frontend:
	cd frontend && pnpm dev

gen-openapi:
	cd backend && uv run python -c "import json; from main import app; print(json.dumps(app.openapi(), indent=2))" > openapi.json

gen-client:
	cd frontend && pnpm openapi-ts

migrate:
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


test-cov:
	cd frontend && pnpm test:cov
	cd backend && uv run pytest


seed:
	cd backend && uv run python scripts/seed.py
