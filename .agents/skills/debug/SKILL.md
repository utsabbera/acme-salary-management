---
name: debug
description: Systematic diagnosis and fix for bugs, errors, regressions, and failing tests. Use when something is broken and the cause isn't obvious, or when the user pastes a stack trace, error message, or says "debug this".
---

Find the root cause. Fix it test-first.

## Core Principles

1. **Investigate before fixing.** Do not propose a fix until you can explain the full causal chain from trigger to symptom with no gaps.
2. **One change at a time.** Test one hypothesis, change one thing. Changing multiple things is shotgun debugging.
3. **Predictions for uncertain links.** If a step in the causal chain is uncertain, form a prediction — something else that must also be true. If the prediction is wrong but the fix "works", you patched a symptom.

## Phases

### 0. Triage

If `$ARGUMENTS` references a GitHub issue (`#N` or URL), fetch it with `gh issue view <N>` — read the full thread including comments.

**Trivial fast-path**: if the cause is immediately obvious (missing import, clear null dereference, typo), propose the one-line fix, confirm, apply, skip to Phase 4.

### 1. Investigate

Reproduce the bug first. Then:

1. Read the stack trace bottom-to-top — the root cause is upstream of the symptom.
2. Instrument boundaries around the suspect site: log actual values, don't assume them.
3. Walk the boundaries until valid input becomes invalid output — that transition is the root cause.

Check recent changes in suspect files: `git log --oneline -10 -- <file>`

### 2. Root Cause

Form hypotheses ranked by likelihood. For each:
- What is wrong and where (`file:line`)
- One concrete observation supporting it (log value, behavior delta, code reference)
- The causal chain from trigger to symptom
- For uncertain links: a prediction that must be true if the hypothesis is correct

**Gate**: do not proceed to Phase 3 until the full causal chain has no gaps.

Present findings: root cause, proposed fix, which tests to add, why existing tests didn't catch this.

Ask: **Fix it now** / **Diagnosis only**.

### 3. Fix

Check for uncommitted work (`git status`) before editing.

Test-first:
1. Write a failing test that captures the bug
2. Verify it fails for the right reason
3. Implement the minimal fix — root cause only, no drive-by cleanup
4. Verify the test passes
5. Run the full test suite

**On a failed fix**: explicitly invalidate the current hypothesis before forming a new one. After 3 failed attempts, step back and re-examine the causal chain.

### 4. Summary

```
## Debug Summary
Problem: [what was broken]
Root Cause: [causal chain with file:line]
Fix: [what changed — or "diagnosis only"]
Tests: [tests added/modified]
Confidence: [High / Medium / Low]
```

Offer to run `/pr` to ship the fix.
