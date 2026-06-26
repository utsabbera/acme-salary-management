---
name: review
description: Two-axis review — Standards (repo conventions) and Spec (matches the issue/PRD?). Works on working diff by default, or pass a branch/SHA/PR number. Use before committing or before opening a PR.
---

Two-axis review of the diff:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue or PRD?

Both axes run as parallel sub-agents so they don't pollute each other's context.

## Process

### 1. Pin the diff

- No argument: use `git diff HEAD` (working changes)
- With argument (branch, SHA, PR number): use `git diff <arg>...HEAD`

Confirm the diff is non-empty before spawning sub-agents.

### 2. Find the spec

Look in this order:
1. A path passed as argument
2. A PRD file under `docs/prd/` matching the branch or feature name
3. Issue refs in conversation context, branch name, or recent commits (`#N`, `Closes #N`) — fetch with `gh issue view <N>` and use the issue body as the spec
4. If nothing found, the Spec sub-agent reports "no spec available"

### 3. Find the standards

Look for `README.md` and `AGENTS.md` in the repo root.

### 4. Spawn both sub-agents in parallel

**Standards sub-agent**: Given the diff and standards files — report every place the diff violates a documented standard. Cite the rule. Distinguish hard violations from judgement calls. Under 400 words.

**Spec sub-agent**: Given the diff and spec — report: (a) requirements missing or partial; (b) behavior in the diff not asked for (scope creep); (c) requirements that look implemented but are wrong. Quote the spec line for each finding. Under 400 words.

### 5. Aggregate

Present findings under `## Standards` and `## Spec` headings verbatim. End with a one-line summary: total findings per axis and the worst issue within each.

## Why two axes

A change can pass one axis and fail the other:
- Follows every standard but implements the wrong thing → Standards pass, Spec fail
- Does exactly what the issue asked but breaks conventions → Spec pass, Standards fail

Reporting them separately stops one axis from masking the other.
