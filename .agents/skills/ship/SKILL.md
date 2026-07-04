---
name: ship
description: Validate, local squash-merge, direct-push to main, sync GitHub outcomes, and clean up the current worktree. Use when you are ready to merge and deploy your feature.
argument-hint: "Name of the local feature branch (optional)"
---

Perform local checks, rebase, squash-merge, push to main, sync GitHub, and clean up the worktree.

## Process

### 1. Verify Local Build & Tests
Run `make check` to run typechecks, lint, and coverage tests. If any step fails, stop and direct the user to `/debug`.

### 2. Check OpenAPI Schema Sync
Run `make gen-client` and check if there are unstaged changes in `frontend/src/client` or `openapi.json` via `git status`. If there are, commit them before shipping, or regenerate the client and alert the user.

### 2.5 Run AI Review Gate
Run the `review` skill on the current diff to perform the 3-axis subagent review (spec alignment, code quality, and testing compliance). If the subagents flag any critical issues or architectural deviations, pause and address them before shipping.

### 3. Fetch and Rebase
Fetch the latest commits from origin `main` and rebase your current branch:
```bash
git fetch origin main:main
git rebase main
```

### 4. Local Squash & Merge to Main
Checkout the local `main` branch, merge the feature branch with squash, and commit:
```bash
git checkout main
git merge --squash <feature-branch-name>
# Commit with a conventional message matching the task context.
# Ensure the body contains "Closes #<id>" so GitHub automatically closes the issue on push.
git commit -m "type(scope): subject

Closes #<id>"
```

### 5. Push to Main
Push the commit directly to origin `main`:
```bash
git push origin main
```
This triggers the pre-push test hook to verify the code and the remote build pipeline.

### 6. GitHub Sync
- Post an outcome summary comment on the closed issue (using `gh issue comment <N> --body "..."`).
- Scan the conversation, ADRs, or task list for any deferred backlog items or out-of-scope tasks. Prompt the user to create follow-up GitHub issues or create them via `gh issue create`.
- Verify the issue is closed successfully.

### 7. Persist Learnt Rules
Check if any new agent behaviors, stack patterns, or configurations were learned during the session. Remind the user to run the `/learn` command to save them.

### 8. Cleanup Worktree
Remove the local worktree and delete the local feature branch using the Makefile clean target:
```bash
make worktree-clean name=<name>
```
