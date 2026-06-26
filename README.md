# ACME Salary Management

Full-stack HR salary management software for 10,000 employees across multiple countries.

Built with **FastAPI** (Python 3.13) + **Next.js 16** (React 19, TypeScript 6, Tailwind CSS 4).

---

## Quick Start

```bash
make install          # install all deps (pnpm + uv)
make db-migrate MSG="initial schema"  # run migrations
make db-seed          # seed 10,000 employees
make dev              # backend :8000 + frontend :3000
```

## Commands

```bash
make install                          # install all deps (pnpm + uv)
make dev                              # backend :8000 + frontend :3000 concurrently
make test                             # run all tests
make lint                             # biome (frontend) + ruff (backend)
make typecheck                        # tsc (frontend) + mypy (backend)
make gen-client                       # regenerate TS client from OpenAPI spec
make db-migrate MSG="description"     # create + apply Alembic migration
make db-seed                          # seed database with 10,000 employees
make db-up                            # start optional PostgreSQL via Docker
```

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI 0.138, Python 3.13, SQLAlchemy 2 (async), Alembic, SQLite |
| Frontend | Next.js 16, React 19, TypeScript 6, Tailwind CSS 4, shadcn/ui |
| API Client | hey-api/openapi-ts (auto-generated from OpenAPI spec) |
| Tests | pytest + pytest-asyncio (backend), Vitest (frontend) |

## Directory Map

```
backend/      FastAPI app — models, services, repositories, routers
frontend/     Next.js app — dashboard, employee table, analytics
docs/         Requirements, architecture, ADRs, AI prompts
Makefile      Sole orchestrator
```

## Database

Default: `sqlite+aiosqlite:///./dev.db` — no Docker required.

To switch to PostgreSQL:
```bash
# backend/.env
DATABASE_URL=postgresql+asyncpg://dev:dev@localhost:5432/app_dev
cd backend && uv add asyncpg && make db-up
```

