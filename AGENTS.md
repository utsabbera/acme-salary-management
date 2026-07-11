# ACME Salary Management - Agent Guidelines

This is an `AGENTS.md` file, which serves as a centralized source of truth for all AI coding agents working on this project. Agents should read this file to understand project boundaries, best practices, and where to find project-specific configuration.

## System Overview
ACME Salary Management is a full-stack HR software for managing salaries across multiple countries.
- **Backend:** FastAPI (Python 3.13), SQLAlchemy 2 (async), SQLite/PostgreSQL.
- **Frontend:** Next.js 16 (React 19), TypeScript 6, Tailwind CSS 4, shadcn/ui.
- **API Client:** Generated via `hey-api/openapi-ts`.

## Agent Configuration Directory (`.agents/`)
While this file serves as the high-level guide, all granular configuration for agents resides in the `.agents/` directory.
- **`rules/`**: Contains absolute rules for agent behavior (e.g., `workflow-and-boundaries.md`, `communication.md`, `stack-conventions.md`). **Agents MUST read and strictly follow these rules.**
- **`skills/`**: Specialized skills (`/draft`, `/build`, `/ship`, `/debug`, etc.) with their own `SKILL.md` instructions.
- **`subagents/`**: Configurations and prompts for specialized subagents (e.g., `explore`, `reproduce`, `visual_auditor`).
- **`hooks.json` & `mcp_config.json`**: Configurations for agent hooks and the Model Context Protocol (MCP).

## Core Boundaries and Guardrails
1. **No Rushing to Execution:** Always adopt a "Human-in-the-Loop" workflow. Create a plan or checklist artifact and explicitly halt for user approval before modifying source code.
2. **Context First:** Always read the root `README.md` before planning or executing. Proactively check `docs/decisions/` and `docs/architecture.md` before assuming default architecture.
3. **Subagent Delegation:** When a task matches a subagent's responsibility (e.g., running `explore` for broad research, `reproduce` for bugs), invoke the appropriate subagent by parsing its template from `.agents/subagents/`.
4. **Makefile is the Orchestrator:** Rely on the `Makefile` for all standard commands (`make dev`, `make test`, `make lint`, `make typecheck`, `make migrate`).
5. **Testing Strictness:** Integration tests are the default for FastAPI routes using `AsyncClient` and a real test database. Unit tests are strictly for complex, isolated business logic. Tests must be grouped into logical classes.

## Development Workflow
This project uses a highly structured agent-assisted workflow divided into distinct phases:
1. **`/draft` (Planning Phase):** Ideate with the user through Socratic Q&A to build a Feature Brief, then break it down into vertical slices (issues).
2. **Setup Phase:** Use `/orient` and `make worktree` to isolate the workspace for the new issue.
3. **`/build` (Implementation Phase):** Follow Test-Driven Development (TDD) strictly: Red -> Green -> Refactor. Use the `debug`, `review`, and `design` skills in the inner loop as needed.
4. **`/ship` (Shipping Phase):** Run `make check`, schema sync, and a 3-axis review (spec, quality, test intent) before squash merging to `main`.

*For more details on the workflow, read [docs/workflow.md](docs/workflow.md).*

## Communication Style
- Act as an equal, highly capable collaborative partner.
- Do not adopt a subservient or overly apologetic tone.
- When documenting design choices (like ADRs) or communicating decisions, present them confidently as deliberate choices rather than narrating the internal ideation process.

---
**Note to Agent:** You are operating in a well-defined environment. Let the `.agents/rules/` and `docs/` govern your behavior. When in doubt, stop and ask the user.
