# ACME Salary Management

[![CI / CD](https://github.com/utsabbera/acme-salary-management/actions/workflows/deploy.yml/badge.svg)](https://github.com/utsabbera/acme-salary-management/actions/workflows/deploy.yml)

Full-stack HR salary management software for 10,000 employees across multiple countries.

Built with **FastAPI** (Python 3.13) + **Next.js 16** (React 19, TypeScript 6, Tailwind CSS 4).

---

## Quick Start

```bash
make install          # install all deps (pnpm + uv)
make migrate MSG="initial schema"  # run migrations
make seed             # seed 10,000 employees
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
make migrate MSG="description"     # create + apply Alembic migration
make seed                             # seed database with 10,000 employees

```

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI 0.138, Python 3.13, SQLAlchemy 2 (async), Alembic, SQLite |
| Frontend | Next.js 16, React 19, TypeScript 6, Tailwind CSS 4, shadcn/ui |
| API Client | hey-api/openapi-ts (auto-generated from OpenAPI spec) |
| Tests | pytest + pytest-asyncio (backend), Vitest (frontend) |

## Project Structure

```
backend/      FastAPI app — models, services, repositories, routers
frontend/     Next.js app — dashboard, employee table, analytics
docs/         Requirements, architecture, ADRs, AI prompts
Makefile      Sole orchestrator
```

## Documentation

- **[Deployment](docs/deployment.md)**: CI/CD pipeline overview, hosting stack, and required secrets.
- **[Architecture](docs/architecture.md)**: High-level system design, data models, and API patterns.
- **[Requirements](docs/requirements.md)**: Product requirements and feature specifications.
- **[Workflow](docs/workflow.md)**: Standard operating procedures and development lifecycle.
- **[Architecture Decisions (ADRs)](docs/decisions/)**: Chronological record of significant engineering decisions.

## Database

Default: `sqlite+aiosqlite:///./dev.db`

## Deployment

The application is deployed via GitHub Actions to Vercel (Frontend) and Render (Backend), using a Serverless PostgreSQL database on Neon. 

See the **[Deployment Guide](docs/deployment.md)** for a full overview of the CI/CD pipeline, required GitHub secrets, and first-time setup instructions.

## Engineering Practices

- **Monorepo & Trunk-Based Development:** We use a single repository for both frontend and backend to ensure atomic commits and unified tooling. We optimize for continuous deployment by pushing small, frequent commits directly to `main`. See the [Engineering Practices ADR](docs/decisions/engineering-practices.md) for full details on this approach.
- **Deployment & Hosting:** The application is continuously deployed via GitHub Actions. Frontend is hosted on Vercel, backend on Render, and the database on Neon (Serverless PostgreSQL). See the [Deployment & Hosting ADR](docs/decisions/deployment-and-hosting.md).

# Commit Messages

Conventional Commits — subject line enforced by the commit-msg hook.

<type>(<scope>): <description>

<why this change was made — optional body for non-trivial commits>

Refs #123       ← ongoing work on an issue
Closes #123     ← final commit that completes the issue
BREAKING CHANGE: <description>
```

Types: `feat` `fix` `docs` `style` `refactor` `test` `chore` `ci` `build` `perf` `revert`
Scope: module/area (`auth`, `db`, `api`) — not the ticket number
Description: imperative mood, max 72 chars, no trailing period

## Testing Conventions

The standard "Testing Trophy" pattern is strictly enforced across the stack:
- **Integration Tests:** Used for FastAPI routes, HTTP parameter validation, database queries, and SQLAlchemy models. These run end-to-end against a real test database using `AsyncClient`. We explicitly **do not** write unit tests for FastAPI routers with mocked services, as this leads to tautological tests.
- **Unit Tests:** Used exclusively for complex, isolated business logic, Pydantic math, and raw SQL query builders.
- **File Organization:** Always group tests into logical classes (e.g., `class TestPagination:`, `class TestSearch:`) to improve readability and allow for class-scoped fixtures, regardless of the file size.

# Project Origins

This project was bootstrapped and configured using the following tools and templates:
- **Starter Repo**: [utsabbera/fastapi-nextjs-starter](https://github.com/utsabbera/fastapi-nextjs-starter)
- **Agent Skills**: [utsabbera/skills](https://github.com/utsabbera/skills)
