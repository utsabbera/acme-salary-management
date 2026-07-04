---
trigger: model_decision
---

# Stack Conventions

These conventions describe our technology stack architecture, code patterns, and project tooling rules. Consult this rule when implementing or refactoring frontend, backend, or data access code.

## 1. Tooling Boundaries
- **Backend (Python)**: Always use `uv` for all backend dependencies, scripting, and testing. Do not use `pip` directly.
- **Frontend (TypeScript/Next.js)**: Always use `pnpm` for all frontend package management, scripts, and tasks. Do not use `npm` or `yarn`.
- **Sole Orchestration**: Always invoke commands via the `Makefile` targets when available.

## 2. Backend Conventions (FastAPI & SQLAlchemy)
- **Async Execution**: Always write async router handlers, repository methods, and database connections.
- **Repository Pattern**: Delineate data access from business logic. Keep raw SQL or database queries inside repository classes, accessed via services.
- **SQLAlchemy 2.0 style**: Use modern async session execution patterns (`select`, `execute`). Do not use legacy query/session structures.

## 3. Frontend Conventions (Next.js & Tailwind CSS)
- **Component Boundaries**: Respect React Server Components (RSC) by default. Use `"use client"` only for files containing state, interactivity (event listeners), or browser-only hooks.
- **Styling**: Use Vanilla CSS or Tailwind CSS 4 utilities for layouts. Never mix Tailwind with raw inline styles.
- **API Clients**: Always run `make gen-client` to regenerate the TypeScript SDK client from backend OpenAPI specification after schema/endpoint modifications.

## 4. Testing Trophy
- **Integration Tests**: Focus testing on integration tests hitting a real test database (no service layer mocks) using `AsyncClient`.
- **Unit Tests**: Reserve unit tests for isolated mathematical functions, schema validations, and pure logic.
