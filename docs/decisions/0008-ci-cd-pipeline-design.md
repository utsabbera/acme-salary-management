# ADR 0011: CI/CD Pipeline Design

## Context

With the hosting stack decided in ADR 0003 (Vercel + Render + Neon), we need to design
the GitHub Actions pipeline that acts as the quality gate and continuous deployment
mechanism for this monorepo. The pipeline must satisfy several competing concerns:

- **Efficiency:** A frontend-only change should not trigger a backend deploy, and
  vice versa. Running unnecessary CI and triggering unnecessary deploys wastes free-tier
  CI minutes and increases the feedback loop.
- **Safety:** No code that fails linting, type checking, or tests should reach production.
- **Simplicity:** The pipeline should be a single, readable file. Multiple files with
  `workflow_run` dependencies are harder to reason about and have known edge cases
  (e.g., `workflow_run` runs in the base-branch context, not the PR branch context).
- **Consistency:** Both stacks (backend and frontend) should follow the same structural
  pattern within the same orchestrator.

Several design questions were explicitly evaluated during implementation:

1. Should lint, typecheck, and tests be split into parallel jobs within each stack?
2. Should CI and CD live in separate workflow files?
3. How do we achieve per-stack path filtering in a single workflow file?
4. Should Render be deployed via its native Git integration or via a deploy hook?
5. Should the backend be containerised with Docker for deployment?

## Decision

### Single orchestrator file with a `detect-changes` job

We use a single `deploy.yml` workflow file. GitHub Actions does not support `paths` filters
at the job level — only at the workflow trigger level. To achieve per-stack filtering in a
single file, we introduce a `detect-changes` job using `dorny/paths-filter`. This job
always runs and emits two boolean outputs (`backend`, `frontend`). All downstream jobs
gate on these outputs.

The DAG is:

```
detect-changes
      │
      ├── backend-checks   [if backend changed]
      │         └── deploy-backend   [if CI passed + push to main]
      │
      └── frontend-checks  [if frontend changed]
                └── deploy-frontend  [if CI passed + push to main]
```

**Alternative considered:** Two separate workflow files (`ci-backend.yml`,
`ci-frontend.yml`) with native trigger-level `paths` filters. Rejected because the
`deploy` step would then require a `workflow_run` trigger to coordinate the two, which
is brittle and runs in the wrong branch context on PRs.

### Sequential steps within each stack's CI job

Lint, type checking, and tests run as sequential steps inside a single job per stack
(not as separate parallel jobs). Each GitHub Actions job incurs ~45–90 seconds of runner
setup (checkout, dependency install). For this project, all three checks complete in
under 5 seconds total. Splitting them into parallel jobs would triple the setup cost
for zero runtime benefit.

This decision should be revisited if the test suite grows beyond ~5 minutes of runtime,
at which point parallelising tests vs. lint/typecheck would be worthwhile.

### Render deployed via Deploy Hook, not native Git integration

Render's native "auto-deploy from Git" mode redeploys on every push to the linked
branch, regardless of whether CI passed. To enforce the CI guard, we use a Render
**Deploy Hook** URL that is called from the `deploy-backend` job only after
`backend-checks` succeeds. Render does not poll the repository or any container
registry — it only deploys when it receives an HTTP POST to the hook URL.

### No Docker for production deployment

The repository includes a `backend/Dockerfile` and `docker-compose.yml` for local
development parity (local Postgres via Compose mirrors the Neon production database).
However, we deploy to Render using its native Python runtime rather than a Docker image.

Reasons:
- Render's native runtime handles dependency installation (`uv sync`) without requiring
  a container registry, image build steps, or tag management in CI.
- Vercel does not support Docker at all; using Render's native runtime keeps both
  deployment mechanisms consistent in style (both are triggered by a single HTTP call or
  CLI command from the pipeline, with no image artifacts to manage).
- The complexity of building, pushing, and pinning Docker image tags in CI is not
  justified by the requirements of this project.

The Dockerfile remains in the repository as documentation and for potential future use.

### Vercel deployed via the 3-step CLI pattern

The frontend is deployed using the Vercel CLI's recommended production pattern:

```
vercel pull --yes --environment=production   # fetch project config
vercel build --prod                          # build locally on the runner
vercel deploy --prebuilt --prod             # upload the pre-built output
```

This is preferred over `vercel --prod` (single command) because it separates the build
from the upload, making build failures easier to diagnose and keeping the deploy step
fast (no redundant build on Vercel's servers).

## Consequences

- **Positive:** Each stack is fully independent. A backend-only change runs only backend
  CI and triggers only a backend deploy. Frontend changes are never delayed by backend
  CI failures.
- **Positive:** The CI guard is enforced at the pipeline level — Render and Vercel only
  receive a deploy signal after the relevant checks pass.
- **Positive:** A single `deploy.yml` file is the complete, readable source of truth for
  the entire delivery pipeline.
- **Negative:** The `detect-changes` job adds ~10 seconds of overhead on every run.
  This is an acceptable tradeoff for the path-filtering capability it enables.
- **Negative:** GitHub's `paths` filter at the workflow trigger level is not used, which
  means the workflow itself is always triggered on every push to `main`. The filtering
  happens inside the workflow, not before it starts.
