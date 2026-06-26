---
name: refactor
description: Plan a refactor via user interview, break it into tiny safe commits, and file a GitHub issue with the plan. Use when the user wants to restructure code, create a refactoring RFC, or says "I want to refactor".
---

## Process

### 1. Understand the problem

Ask the user for a detailed description of the problem and any initial ideas for solutions.

### 2. Explore the codebase

Verify their assertions and understand the current state. Look for existing test coverage in the area being refactored.

### 3. Consider alternatives

Present other approaches the user may not have considered. Ask whether they've weighed the trade-offs.

### 4. Hammer out scope

Work out exactly what changes and what stays the same. If test coverage is insufficient, ask what the testing plan is.

### 5. Break into tiny commits

Each commit should leave the codebase in a working state. Follow Martin Fowler's advice: "make the change easy, then make the easy change."

### 6. File a GitHub issue

```
gh issue create --title "refactor: <short description>" --body "..."
```

<refactor-plan-template>

## Problem Statement

The problem the developer is facing, from the developer's perspective.

## Solution

The chosen approach and why.

## Commits

The implementation plan broken into the tiniest safe commits possible. Each commit leaves the codebase working.

## Decision Document

- Modules to build or modify
- Interface changes
- Architectural decisions

No specific file paths or code snippets.

## Testing Decisions

- What makes a good test here (behavior, not implementation)
- Which modules to test
- Prior art in the codebase

## Out of Scope

What this refactor explicitly does not touch.

</refactor-plan-template>

After filing the issue, ask: "Implement now or save for later?"
