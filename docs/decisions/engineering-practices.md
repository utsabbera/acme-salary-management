# Engineering Practices: Monorepo & Trunk-Based Development

## Context

For the ACME Salary Management project, we need an engineering workflow that maximizes iteration speed, minimizes integration overhead, and ensures that the frontend and backend are always in sync. The project consists of a FastAPI backend and a Next.js frontend, which share API contracts via OpenAPI.

We needed to decide on the repository structure (multi-repo vs. monorepo) and the branching strategy (GitFlow/feature branches vs. Trunk-Based Development).

## Decision

We have adopted a **Monorepo** structure combined with **Trunk-Based Development (TBD)**.

### 1. The Monorepo
Both the `frontend` and `backend` codebases reside in this single repository, orchestrated by a unified `Makefile`.

**Why:**
- **Atomic Commits:** Changes that affect both the API and the UI (e.g., adding a new field to a database model and displaying it on the frontend) can be made in a single, atomic commit. This guarantees that `main` is never in a state where the frontend expects an API change that hasn't been merged yet.
- **Unified Tooling:** We can run `make lint`, `make typecheck`, and `make test` across the entire stack simultaneously.
- **Contract Synchronization:** When the backend OpenAPI spec changes, the frontend API client (`@hey-api/openapi-ts`) can be regenerated instantly in the same workspace without needing to publish packages or cross-reference branches across repositories.

### 2. Trunk-Based Development (TBD)
We use `main` as our sole long-lived branch and the direct unit of deployment.

**Why:**
- **Eliminate Merge Hell:** Long-running feature branches inevitably lead to painful merge conflicts, especially in a fast-moving MVP phase. By merging to `main` at least daily (or even multiple times a day), integration issues are caught and resolved immediately.
- **Continuous Deployment:** Every push to `main` triggers our CI pipeline. If tests pass, the code is automatically deployed to Render and Vercel. 
- **Feature Flags over Branches:** If a feature requires multiple days of work, we merge the incomplete code into `main` but hide it behind a feature flag or keep it unlinked in the UI. The code is continuously integrated and tested, even if it is not yet visible to the user.

## Consequences

- **Positive:** Deployment velocity is maximized. Integration bugs are caught immediately. A single developer can easily orchestrate full-stack changes without context switching between repositories or managing complex PR dependencies.
- **Negative:** The CI pipeline must be extremely fast and reliable. A broken test on `main` stops all deployments for the entire project and must be fixed as an immediate priority. Additionally, developers must be disciplined about using feature flags for incomplete work.
