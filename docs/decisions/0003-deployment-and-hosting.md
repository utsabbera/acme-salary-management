# ADR 0003: Deployment, Hosting & CI/CD Strategy

## Context

For the ACME Salary Management MVP, we need a deployment strategy that is cost-effective (ideally free tier), easy to maintain, and supports automated testing and continuous integration. We initially planned to use SQLite as our primary database, but evaluating free hosting platforms revealed constraints with persistent file systems.

## Decision

We have adopted the following hosting stack and CI/CD strategy:

### Hosting Stack
- **Frontend:** [Vercel](https://vercel.com) — Provides native support for Next.js App Router and Server Actions.
- **Backend:** [Render](https://render.com) (Web Service) — A reliable free tier for Python/FastAPI applications.
- **Database:** [Neon](https://neon.tech) (Serverless PostgreSQL) — Replaces SQLite for production. Render's free tier does not provide persistent disk storage, which makes SQLite unsuitable. Neon provides a generously sized, scalable serverless PostgreSQL database.

### Trunk-Based Development & CI/CD
We will practice **Trunk-Based Development (TBD)** to maintain high deployment velocity:
- The `main` branch is the sole source of truth and is always in a deployable state.
- **Continuous Integration (CI):** Every push to `main` (or any short-lived PR) triggers a GitHub Actions workflow that runs linting (`ruff`, `biome`), type checking (`mypy`, `tsc`), and testing (`pytest`, `vitest`).
- **Continuous Deployment (CD):** Once CI passes on the `main` branch, the pipeline automatically triggers deployments to Vercel and Render via API hooks.
- **Database Migrations:** Render is configured to run `alembic upgrade head` as a pre-deploy command to ensure the database schema is synced before the new backend code goes live.

## Consequences

- **Positive:** We have a fully automated, zero-touch deployment pipeline. Changes reach production in minutes, and we are guarded against shipping broken code by the CI checks. The services chosen provide a robust, production-like environment entirely on free tiers.
- **Negative:** We must migrate our backend from SQLite (`aiosqlite`) to PostgreSQL (`asyncpg`). This introduces a slight divergence between our local dev environment (which will still use in-memory SQLite for fast testing) and production, though SQLAlchemy abstracts most of this away.
