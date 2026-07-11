# Load port configurations if .env files exist (useful inside Git worktrees)
ifneq (,$(wildcard backend/.env))
    BACKEND_PORT ?= $(shell grep -E '^PORT=' backend/.env | cut -d'=' -f2)
endif
BACKEND_PORT ?= 8000

ifneq (,$(wildcard frontend/.env.local))
    FRONTEND_PORT ?= $(shell grep -E '^PORT=' frontend/.env.local | cut -d'=' -f2)
endif
FRONTEND_PORT ?= 3000

.PHONY: install dev dev-backend dev-frontend gen-client migrate lint typecheck test seed worktree worktree-clean plan issues

install:
	pnpm install
	cd backend && uv sync

dev:
	make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && uv run fastapi dev main.py --port $(BACKEND_PORT)

dev-frontend:
	cd frontend && pnpm dev --port $(FRONTEND_PORT)

gen-openapi:
	cd backend && uv run python -c "import json; from main import app; print(json.dumps(app.openapi(), indent=2))" > openapi.json

gen-client:
	cd frontend && pnpm openapi-ts

migrate:
	cd backend && uv run alembic upgrade head

check: lint typecheck test-cov


lint:
	pnpm biome check frontend/src
	cd backend && uv run ruff check app/

typecheck:
	cd frontend && pnpm tsc --noEmit
	cd backend && uv run mypy app/ scripts/ tests/

test:
	cd frontend && pnpm vitest run
	cd backend && uv run pytest


test-cov:
	cd frontend && pnpm test:cov
	cd backend && uv run pytest


seed:
	cd backend && uv run python scripts/seed/reference.py scripts/seed/samples/countries.csv scripts/seed/samples/departments.csv
	cd backend && uv run python scripts/seed/fx.py scripts/seed/samples/fx.csv
	cd backend && uv run python scripts/seed/employee.py --random --count 10000

PORT_OFFSET ?= 1
WT_BACKEND_PORT = $(shell expr 8000 + $(PORT_OFFSET))
WT_FRONTEND_PORT = $(shell expr 3000 + $(PORT_OFFSET))

worktree:
	@if [ -z "$(name)" ] || [ -z "$(branch)" ]; then \
		echo "Usage: make worktree name=<name> branch=<branch> [PORT_OFFSET=1]"; \
		exit 1; \
	fi
	@if [ -d "_worktrees/$(name)" ]; then \
		echo "Error: Worktree _worktrees/$(name) already exists."; \
		exit 1; \
	fi
	@if git show-ref --verify --quiet refs/heads/$(branch); then \
		git worktree add _worktrees/$(name) $(branch); \
	else \
		git worktree add -b $(branch) _worktrees/$(name); \
	fi
	@# Generate environment files for backend and frontend in the new worktree
	@echo "DATABASE_URL=sqlite+aiosqlite:///./dev-$(name).db" > _worktrees/$(name)/backend/.env
	@echo "DEBUG=true" >> _worktrees/$(name)/backend/.env
	@echo "CORS_ORIGINS=[\"http://localhost:$(WT_FRONTEND_PORT)\"]" >> _worktrees/$(name)/backend/.env
	@echo "PORT=$(WT_BACKEND_PORT)" >> _worktrees/$(name)/backend/.env
	@echo "NEXT_PUBLIC_API_URL=http://localhost:$(WT_BACKEND_PORT)" > _worktrees/$(name)/frontend/.env.local
	@echo "PORT=$(WT_FRONTEND_PORT)" >> _worktrees/$(name)/frontend/.env.local
	@echo "Successfully created worktree _worktrees/$(name) on branch $(branch)"
	@echo "Backend Port: $(WT_BACKEND_PORT), Frontend Port: $(WT_FRONTEND_PORT)"
	@echo "Database URL: sqlite+aiosqlite:///./dev-$(name).db"

worktree-clean:
	@if [ -z "$(name)" ]; then \
		echo "Usage: make worktree-clean name=<name> [branch=<branch>]"; \
		exit 1; \
	fi
	git worktree remove _worktrees/$(name) || true
	@if [ -n "$(branch)" ]; then \
		git branch -d $(branch) || true; \
	else \
		git branch -d $(name) || true; \
	fi

plan:
	@if [ -z "$(issue)" ]; then \
		echo "Usage: make plan issue=<number>"; \
		exit 1; \
	fi
	@uv run scripts/dev/plan_issue.py $(issue)

issues: ## Create GitHub issues from a plan. Usage: make issues INPUT=path/to/issues.json
	@if [ -z "$(INPUT)" ]; then \
		echo "Usage: make issues INPUT=<path/to/issues.json>"; \
		exit 1; \
	fi
	@python scripts/dev/create_issues.py --plan $(INPUT)
