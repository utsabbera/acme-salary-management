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

### 1. Plan

If `$ARGUMENTS` contains a GitHub issue number or URL, fetch acceptance criteria with `gh issue view <N>`.

If no argument is given, run `gh issue list --state open` and present unblocked issues. Ask the user which to work on.

- Confirm the public interface changes needed
- List the behaviors to test (not implementation steps)
- Get user approval on the plan

### 2. Tracer Bullet

Write ONE test that confirms ONE thing end-to-end. Run it — confirm it fails. Write minimal code to pass. Confirm it passes.

### 3. Incremental Loop

For each remaining behavior:
- Write next test → confirm it fails
- Write minimal code to pass → confirm it passes
- One test at a time, no speculative features

### 4. Refactor

After all tests pass:
- Extract duplication
- Deepen modules (move complexity behind simple interfaces)
- Run tests after each refactor step. Never refactor while RED.

### 5. Close

Run the full test suite. If an issue number was provided, offer: `gh issue close <N>`

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```
