---
name: orient
description: Bootstrap context on session start by gathering project status, active worktrees, recent git log, and open issues. Use when the user starts a session, or when you need to re-verify the active branch and workspace state.
argument-hint: "Path to a previous handoff summary file (optional)"
---

Glean the current repository context and present a structured session snapshot.

## Process

### 0. Load Handoff Context (Optional)
If a path to a previous handoff summary file is passed as an argument:
1. View that handoff file to understand the current task state, open issues, and planned work from the previous session.
2. Incorporate the handoff details into the context for planning next steps.

### 1. Gather git state
Run these commands to understand the git tree:
- `git branch --show-current` - to see the active branch name
- `git status` - to see any uncommitted changes in the active workspace
- `git worktree list` - to see all active worktrees and their locations
- `git log --oneline -10` - to see the recent commits on this branch

### 2. Read base guidelines
Read `README.md` to refresh your understanding of the tech stack, port conventions, database setup, and essential commands.

### 3. Fetch active issues
Run `gh issue list --assignee @me --json number,title,state` to fetch open issues assigned to you. If that fails or is not authenticated, fallback to a simple `gh issue list --limit 10`.

### 4. Present the Snapshot
Create a structured session snapshot in the chat using the following markdown format:

```markdown
## Session Snapshot

- **Active Branch**: `branch-name`
- **Working Tree**: `/path/to/worktree` (e.g. main workspace or `_worktrees/name`)
- **Uncommitted Changes**: [None / List of files]
- **Port Mapping**: Backend: `8000`, Frontend: `3000` (derived from backend/.env and frontend/.env.local if PORT exists, otherwise default)
- **Database URL**: `database-url` (derived from backend/.env)

### Recent Commits
1. [hash] Subject 1
2. [hash] Subject 2
...

### Open Issues
- #123 Title (assigned to me)
- ...
```

Do not edit files or plan any features during orientation. The goal is purely context gathering and self-alignment.
