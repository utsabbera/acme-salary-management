---
name: ship
description: Orchestrate the full shipping ceremony from validation and review to merging and cleanup.
---

# Ship Workflow

Orchestrate the full shipping ceremony: validate, review, merge, push, sync GitHub, and clean up the worktree.

## Steps

### Step 1 — Verify Local Build & Tests

Run `make check` to execute typechecks, lint, and coverage tests.

If any step fails: stop immediately and direct the user to `/debug`. Do not proceed until `make check` is fully green.

### Step 2 — Check OpenAPI Schema Sync

Run `make gen-client` and check for unstaged changes in `frontend/src/client` or `openapi.json` via `git status`.

If there are unstaged changes: commit them before proceeding, or alert the user to regenerate the client manually.

### Step 3 — AI Review Gate

Run the `review` skill on the current diff to perform the 3-axis review:
- **Spec alignment** — does the implementation match the issue/acceptance criteria?
- **Code quality & performance** — correctness, edge cases, no regressions
- **Test intent** — are tests meaningful and covering the right behavior?

If the review flags any critical issues or architectural deviations: stop and address them before continuing.

### Gate — Review Approval

Ask the user:

> **Review complete. Any issues to address before shipping?**
> Reply `ship it` to proceed, or describe what needs fixing.

### Step 4 — Fetch and Rebase

Fetch the latest commits from origin `main` and rebase:

```bash
git fetch origin main:main
git rebase main
```

Resolve any conflicts with the user before continuing.

### Step 5 — Local Squash Merge & Push

Checkout `main`, squash merge the feature branch, and push:

```bash
git checkout main
git merge --squash <feature-branch-name>
git commit -m "type(scope): subject

Closes #<id>"
git push origin main
```

Ensure the commit body contains `Closes #<id>` so GitHub automatically closes the issue on push. This triggers the pre-push test hook and remote build pipeline.

### Step 6 — GitHub Sync

- Post an outcome summary comment on the closed issue:
  ```bash
  gh issue comment <N> --body "..."
  ```
- Scan the conversation, ADRs, and task list for any deferred backlog items or out-of-scope tasks. Prompt the user to create follow-up GitHub issues, or create them via `gh issue create`.
- Verify the issue is closed successfully.

### Step 7 — Persist Learnt Rules

Check if any new agent behaviors, stack patterns, or configurations were learned during this session. Remind the user to run `/learn` to save them permanently.

### Step 8 — Cleanup Worktree

Remove the local worktree and delete the local feature branch:

```bash
make worktree-clean name=<name>
```

Ask the user for the worktree name if not clear from context.
