---
name: breakdown
description: Plan a feature as an Epic and vertical-slice issues. Produces issues.json and executes it via make issues. Use when the user says "break this down", "create issues for", "make tickets", or "kanban this". Also invoked by the /draft workflow.
---

Plan the feature as a structured set of GitHub issues, then execute the plan. This skill drafts the breakdown, shows it for review, then immediately creates the issues without waiting for a second approval.

## Process

### 0. Load config

Read `.agents/config.yml` to get `github.project_number` and `github.owner`.

### 1. Gather context

Work from whatever is in the conversation. If a Feature Brief artifact exists in the session, read it as the primary source. If the user passes an issue number, fetch it with `gh issue view <N>`.

### 2. Explore the codebase

Understand the current state. Issue titles and descriptions should use the project's domain vocabulary.

### 3. Resolve the Epic

**A. Epic explicitly referenced in conversation** → use it directly. Record `existing_number` in the output.

**B. No explicit epic** → fetch all open epics:
```bash
gh issue list --label epic --state open --json number,title,body
```
Present candidates to the user and ask to confirm, or propose creating a new one.

**C. Creating a new Epic** → draft the Epic body:

```markdown
## Problem Statement
## Solution
## User Stories
## Out of Scope
```

### 4. Draft vertical slices

Each issue is a thin, end-to-end slice — not a horizontal layer.

- Each slice delivers a complete path (schema → API → UI → tests) that is demoable on its own
- Prefactoring issues come first ("make the change easy, then make the easy change")
- Order by dependency: blockers first

### 5. Show the breakdown draft

Present the full breakdown as a markdown document before doing anything else:

```markdown
## Issue Breakdown: <Feature Name>

**Epic:** <title> (new) | #<number> (existing)

| # | Title | Labels | Blocked by |
|---|---|---|---|
| 1 | [Area] Title | feature | — |
| 2 | [Area] Title | chore | #1 |

### Issue Details

**1. [Area] Title**
> What to build: ...
> Acceptance criteria:
> - [ ] ...

**2. [Area] Title**
> ...
```

After showing the draft, ask: **"Does this breakdown look right? Any changes before I create the issues?"**

Iterate until the user approves.

### 6. Write issues.json and execute

Once approved, write `issues.json` to the session artifact directory using this schema:

```json
{
  "github": {
    "project_number": 3,
    "owner": "utsabbera"
  },
  "epic": {
    "existing_number": null,
    "title": "Feature Name",
    "body": "## Problem Statement\n...\n\n## Solution\n...\n\n## User Stories\n...\n\n## Out of Scope\n..."
  },
  "issues": [
    {
      "title": "[Area] Short imperative title",
      "labels": ["feature"],
      "body": "## What to build\n\n...\n\n## Acceptance criteria\n\n- [ ] Criterion 1",
      "blocked_by_titles": ["[Area] Other title that must exist first"]
    }
  ]
}
```

Notes:
- If linking to an existing epic, set `existing_number` to the issue number and leave `title`/`body` blank
- `blocked_by_titles` uses titles — `create_issues.py` resolves them to real numbers during creation
- Infer labels from: `feature`, `chore`, `bug`, `docs`

Immediately after writing, run:

```bash
make issues INPUT=<full-path-to-issues.json>
```

Do not wait or ask again — execute it directly.
