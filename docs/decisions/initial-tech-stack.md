# Initial Tech Stack

## Context

The ACME Salary Management project requires a robust foundation that prioritizes long-term maintainability and an exceptional Developer Experience (DX). To efficiently build and scale the application, we need a technology stack that aggressively reduces boilerplate, eliminates integration bugs between the frontend and backend, and provides unified tooling. By enforcing strict end-to-end type safety and automating the API contract, we establish a clean, predictable development lifecycle that minimizes regressions as the codebase grows.

## Decision

We have adopted the following core technologies to meet these architectural constraints:

### Backend
- **FastAPI (Python 3.13)**: Chosen for its high performance and native async capabilities. Its automatic OpenAPI documentation generation drastically reduces the overhead of documenting and syncing the API contract.
- **SQLAlchemy 2 & Alembic**: Provides a modern, async-compatible ORM and robust database schema migrations, ensuring strict and reliable data modeling.
- **SQLite (aiosqlite)**: Utilized as the default database to ensure a frictionless, zero-configuration onboarding experience. The abstraction layer ensures we can easily swap to PostgreSQL as production needs dictate.
- **ruff & mypy**: Enforces strict code quality and type safety standards, catching potential runtime errors during the CI/local development phase.

### Frontend
- **Next.js 16 (React 19)**: Selected for its robust App Router and built-in performance optimizations, providing a seamless Server-Side Rendering (SSR) strategy.
- **TypeScript (v6)**: Critical for maintaining end-to-end type safety across the frontend application.
- **Tailwind CSS 4 & shadcn/ui**: Enables rapid, consistent, and accessible UI component development, minimizing the time spent writing and maintaining custom CSS architectures.
- **OpenAPI TS Client (`@hey-api/openapi-ts`)**: Automatically generates a fully typed API client directly from the backend's OpenAPI specification. This eliminates an entire class of integration bugs and keeps the frontend perfectly synced with the backend contract.

### Tooling & Orchestration
- **pnpm** and **uv**: Best-in-class, highly performant package managers for Node and Python ecosystems, respectively, significantly reducing dependency resolution and installation times.
- **Makefile**: Serves as the centralized task orchestrator. It abstracts away the complexity of managing two distinct language ecosystems, providing a unified interface for running, testing, and linting the project.
- **Biome & lefthook**: Provides unified, ultra-fast frontend linting and pre-commit hook management to enforce standards automatically.

## Consequences

- **Positive**: The combination of OpenAPI generation, strong typing (Pydantic / TypeScript), and automated tooling drastically reduces boilerplate and integration bugs. This empowers a single developer to safely build and refactor a full-stack application at high velocity. The `Makefile` and `SQLite` setup ensures that new developers can onboard and run the project almost instantly.
- **Negative**: The dual-ecosystem setup (Python and Node.js) introduces inherent complexity in tooling and dependency management. However, this is largely mitigated by the unified `Makefile` interface for daily tasks.
