# Development Workflow

This document outlines the agent-assisted development workflow used in this project, designed to maintain high code quality, clear planning, and structured execution. The workflow is divided into four main phases: Planning, Isolation & Setup, Implementation, and Shipping & Wrap-up.

## 1. New Requirement (Planning Phase)
When a new requirement is introduced, we follow a structured planning process to ensure clarity and scope management before any code is written.

- **Ideate**: We use the `ideate` skill and the `/grill-me` slash command to engage in Socratic dialogue and stress-test ideas. This helps clarify ambiguous requirements, resolve design decisions, and solidify the approach.
- **Epic**: Once the idea is clear, we use the `epic` skill to synthesize the conversation into a Product Requirements Document (PRD) and file it as a high-level Epic in GitHub.
- **Breakdown**: Finally, the `breakdown` skill is used to take the Epic and slice it into small, independently-grabbable vertical slices (GitHub Issues). This enables incremental delivery and testability.

## 2. Isolation & Setup Phase
Before starting any implementation work, the developer or agent must orient themselves and isolate their workspace.

- **Orient**: At the start of every session, invoke the `/orient` skill (optionally passing the path to the previous session's handoff file) to get a snapshot of the current active branches, worktrees, recent commits, and assigned issues.
- **Isolate**: Create a dedicated git worktree for the task by running:
  ```bash
  make worktree name=<worktree-name> branch=<branch-name> [PORT_OFFSET=1]
  ```
  This creates an isolated workspace under `_worktrees/<worktree-name>` checking out the feature branch, sets up worktree-specific environment files, configures non-conflicting network ports, and spins up a dedicated SQLite database to avoid process and file locks.

## 3. Implementation Phase
Once the isolated worktree is prepared, transition into execution.

- **Plan**: For a selected issue, we use the `plan` skill. This agent performs a deep dive into the codebase, researches the necessary changes, and produces an `implementation_plan.md` artifact. Execution pauses for user approval.
- **Goal-Driven Execution**: For tasks requiring extensive autonomous work, we use the `/goal` slash command. This empowers the agent to work relentlessly and thoroughly until the objective is achieved, without stopping prematurely.
- **TDD (Test-Driven Development)**: Once the plan is approved, we use the `tdd` skill to implement the changes using a red-green-refactor cycle. The agent writes a failing test for a vertical slice, implements minimal code to pass it, refactors, and repeats.
- **Inner Loop Activities**: During TDD, we seamlessly integrate other specialized skills and tooling:
  - **Browser (Playwright MCP)**: Use the Playwright MCP server tools to interactively verify UI changes, capture screenshots, and record dev workflows inside the isolated ports.
  - `review` for automated standards and spec compliance checks.
  - `commit` to logically group and stage changes with conventional commit messages.
  - `debug` for diagnosing complex test failures or regressions.
  - `refactor` to restructure code safely while tests are green.
  - **File-scoped Hooks**: Tool-execution hooks automatically run `biome check` and `ruff check` on every file write to catch lint/type errors immediately.

## 4. Shipping & Wrap-up Phase
At the end of a task or session, we merge our changes and clean up our workspace.

- **Ship**: Before merging, run `make check` locally to ensure all tests, lint, and typechecks pass. Rebase the feature branch on top of `main`, squash-merge locally into `main` (`git merge --squash`), and commit. Pushing to `main` at origin runs git hooks to prevent regressions, which then triggers auto-deployment to production.
- **Handoff (Mid-Session)**: If the task is incomplete and context needs to be passed to a new agent or developer session, run the `/handoff` skill to generate a structured relay baton document.
- **Wrap (End-of-Session)**: The `wrap` skill is invoked at the end of a session to scan the conversation for durable project learnings, update ADRs or requirements docs, close completed issues, and output a summary note detailing the exact resume commands for the next session.
- **Learn**: We use the `/learn` slash command to persist any new agent behavioral rules, coding patterns, or skill improvements discovered during the session. This ensures the AI assistant becomes more capable over time.

---
*Note: This workflow is supported by custom agent skills located in the `.agents/skills` directory and git hooks, ensuring consistent and reproducible interactions.*
