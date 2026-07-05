---
name: plan
description: Read an issue, spawn explore subagents to research the relevant parts of the codebase, and create an implementation plan artifact. Use when the user says "make a plan", "plan this issue", or "create an implementation plan".
argument-hint: "Issue number or URL"
---

Read the provided issue, research the codebase using specialized subagents, and create a concrete implementation plan.

## Process

### 1. Fetch Issue Context
- Extract the issue number `N` from the argument or context.
- Run `gh issue view <N> --json number,title,body,labels` to retrieve the issue spec.

### 2. Run Parallel Research
- **Infer scopes** from the issue before spawning agents:
  - Check the issue **labels** for domain hints (e.g. `frontend`, `backend`, `api`, `ui`, `infra`, `db`).
  - Check the issue **title and body** for explicit directory names or clear domain signals (e.g. mentions of `backend/`, `frontend/`, specific modules).
- **Spawn `explore` subagents** based on what you find:
  - If one or more clear scopes are identified → spawn one `explore` agent per scope in parallel, passing each agent its scope and the issue details.
  - If no clear scopes are found → spawn a **single unscopped** `explore` agent over the full project root.
- Wait for all agents' summaries to resolve before proceeding.

### 3. Create the Implementation Plan
Create or update an `implementation_plan.md` artifact. Set `request_feedback = true` and `user_facing = true` in the ArtifactMetadata.

Use the following format for the artifact:
```markdown
# Implementation Plan - [Goal Description]

- **Active Worktree**: `_worktrees/<name>` (Verify current worktree via `git worktree list`)
- **Target Branch**: `feat/<desc>` (Verify current branch via `git branch --show-current`)

Provide a brief description of the problem, any background context, and what the change accomplishes.

Break down the implementation into numbered, logical phases (e.g., Phase 1: Database Models, Phase 2: API Endpoints, Phase 3: Frontend Integration).

## User Review Required

Document anything that requires user review or feedback. Use GitHub alerts (IMPORTANT/WARNING/CAUTION) to highlight critical items.

## Open Questions

Any clarifying or design questions for the user. Use GitHub alerts (IMPORTANT/WARNING/CAUTION) to highlight critical items.

## Proposed Changes

Group files by component and order logically (dependencies first). Separate components with horizontal rules.

### [Component Name]

Summary of changes, separated by files:
#### [MODIFY] [file basename](file:///absolute/path/to/modifiedfile)
#### [NEW] [file basename](file:///absolute/path/to/newfile)
#### [DELETE] [file basename](file:///absolute/path/to/deletedfile)

## Verification Plan

Summary of how you will verify that your changes have the desired effects.
```

### 4. Obtain User Approval
- Stop execution and wait for the user's explicit approval on the plan.
- **Auto-Trigger TDD**: Once the user approves the implementation plan, immediately proceed to invoke the `tdd` skill (or `/tdd` command) to begin development, following the approved plan.
