---
name: review
description: Three-axis review — Spec (functional), Quality/Perf (technical), and Test/Intent (architecture). Works on working diff by default, or pass a branch/SHA/PR number. Use before shipping.
argument-hint: "Branch name, commit SHA, or PR number (optional)"
---

Three-axis review of the diff to isolate functional correctness, technical quality, and test/architectural validity.

Both axes run as parallel sub-agents so they don't pollute each other's context.

## Process

### 1. Pin the diff
- No argument: use `git diff HEAD` (working changes)
- With argument (branch, SHA, PR number): use `git diff <arg>...HEAD`
Confirm the diff is non-empty before proceeding.

### 2. Find the Spec, Standards, and ADRs
- **Spec**: Look for issue references in conversation, branch name (`123-feat`), or recent commits. Fetch issue body via `gh issue view <N>` (or inspect local PRD under `docs/prd/`).
- **Standards**: Read `.agents/rules/stack-conventions.md`, `README.md`, and `.agents/rules/code-quality-and-architecture.md`.
- **ADRs**: Read ADR files under `docs/decisions/`.

### 3. Run Subagents in Parallel
Run the `verify`, `audit`, and `validate` subagents concurrently in `inherit` workspaces, passing them the diff, spec, standards, and ADR files as context.

### 4. Aggregate Findings
Compile the responses verbatim under:
- `## Spec Alignment`
- `## Code Quality & Performance`
- `## Testing & Architecture`

Provide a high-level summary at the end.
