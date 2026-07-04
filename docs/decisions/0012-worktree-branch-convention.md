# ADR 0012: Git Worktree and Ephemeral Branch Convention

## Context
ADR 0004 established Trunk-Based Development (TBD) with direct-to-main pushes. While this was optimal for a solo developer working sequentially, it introduces bottlenecks for parallel agentic development:
1. **Working Tree Collisions**: Multiple parallel agent sessions cannot safely edit, test, or stash files in the same directory.
2. **SQLite Database Contention**: SQLite is a single-file database. Parallel processes running tests and seeding database rows on the same file results in lock contention, test database cross-pollution, or deadlocks.
3. **Network Port Conflicts**: Parallel frontend/backend dev processes conflict on default network ports (:3000, :8000).

To solve parallel isolation, a branching strategy is needed. However, raising PRs on GitHub introduces significant latency ("CI tax" waiting for remote runs), which slows down a solo developer.

## Decision
1. **Ephemeral Branch & Local Squash Convention**: For non-trivial tasks and concurrent agent sessions, work will be isolated to ephemeral local branches (`<type>/<short-desc>`). Instead of raising a PR on GitHub, the agent will:
   - Sync with origin `main`: `git fetch origin main:main`
   - Rebase their feature branch on top of `main`
   - Merge the feature branch into local `main` using squash: `git checkout main && git merge --squash <branch>`
   - Commit the squashed changes as a single conventional commit
   - Push the updated `main` branch directly to origin
2. **Local Pre-Push Gatekeeper**: We will rely on `lefthook`'s `pre-push` hook to run full test suites (Vitest + Pytest) locally before `git push` is allowed to execute. This prevents pushing broken code to origin `main`.
3. **Git Worktree Isolation**: Parallel sessions will execute in dedicated git worktrees mapped to `_worktrees/<type>-<short-desc>`.
4. **Database and Port Isolation**: Each worktree is self-contained:
   - A dedicated `.env` file copied from `.env.example`
   - Port offsets to prevent network socket conflicts
   - A worktree-specific SQLite database file named `dev-<worktree-name>.db` (e.g., `DATABASE_URL=sqlite:///./dev-feat-ai-query.db`)

## Consequences
- **Positive**: Enables isolated, parallel agentic workflows. Keeps the git history of `main` clean and linear through local squash merges. Bypasses the network latency and overhead of creating/merging GitHub PRs.
- **Negative**: Pushing directly to `main` relies on local machines executing the `pre-push` test suite; environment discrepancies between local and CI could occasionally lead to post-push test failures on `main`.
