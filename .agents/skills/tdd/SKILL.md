---
name: tdd
description: Implement features or fix bugs test-first using red-green-refactor. Use when the user mentions TDD, "write tests first", "red-green-refactor", or wants to implement a GitHub issue.
---

# Test-Driven Development

## Philosophy

Tests should verify behavior through public interfaces, not implementation details. A good test reads like a specification — it describes what the system does, not how. These tests survive refactors because they don't care about internal structure.

## Anti-Pattern: Horizontal Slices

Do NOT write all tests first, then all implementation. Write one test, implement it, repeat — vertical slices via tracer bullets.

```
WRONG: RED: test1, test2, test3 → GREEN: impl1, impl2, impl3
RIGHT: test1 → impl1 → test2 → impl2 → test3 → impl3
```

## Workflow

### 1. Plan & Verify Worktree
- **Check Worktree**: Run `git worktree list` and verify you are inside the isolated worktree directory (e.g. `_worktrees/<name>`). Do not make changes in the default main workspace.
- **Parse Plan**: Parse `implementation_plan.md` alongside any scope defined in `$ARGUMENTS`. If no plan exists, fetch acceptance criteria from GitHub using `gh issue view <N>`.

### 2. Launch Test Watcher
To avoid polluting the parent context window with long, repetitive test runner outputs, run the `watch` subagent in a background `branch` workspace (isolated worktree). It runs in the background and sends you messages on file changes.

### 3. Tracer Bullet & Incremental Loop
For each behavior:
- Write next test → wait for `watch` notification showing it fails
- Write minimal code to pass → wait for `watch` notification showing it passes
- Mark the corresponding item as `[x]` in `task.md` to track progress
- One test at a time, no speculative features

### 4. Refactor
After all tests pass:
- Extract duplication
- Deepen modules (move complexity behind simple interfaces)
- Allow `test_watcher` to verify tests after each refactor step. Never refactor while RED.

### 5. Close
Upon completion, create a `walkthrough.md` artifact summarizing the work done. Offer to run `/ship` to merge and deploy the changes.

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```
