---
name: breakdown
description: Break a PRD, spec, or feature description into independently-grabbable GitHub Issues using vertical slices. Use when the user says "break this down", "create issues for", "make tickets", or "kanban this".
---

Break the plan into independently-grabbable issues using vertical slices (tracer bullets).

## Process

### 1. Gather context

Work from whatever is in the conversation. If the user passes an issue number or URL, fetch it with `gh issue view <N>`.

### 2. Explore the codebase

Understand the current state. Issue titles and descriptions should use the project's domain vocabulary.

### 3. Draft vertical slices

Each issue is a thin slice through ALL integration layers end-to-end — not a horizontal layer slice.

- Each slice delivers a narrow but complete path (schema → API → UI → tests)
- A completed slice is demoable or verifiable on its own
- Prefactoring issues come first ("make the change easy, then make the easy change")

### 4. Quiz the user

Present the proposed breakdown. For each slice show title and blockers. Ask if the granularity feels right. Iterate until approved.

### 5. Publish in dependency order

Blockers first, so you can reference real issue numbers in "Blocked by".

```
gh issue create --title "[Area] Short imperative title" --label "feature" --body "..."
```

Infer label from: `feature`, `chore`, `bug`, `docs`.

<issue-template>
## PRD

Link to the source PRD if one exists: `docs/prd/<slug>.md § <relevant section>`

## What to build

Concise description of this vertical slice — end-to-end behavior, not layer-by-layer. No file paths or code snippets unless a prototype produced a snippet that encodes a decision more precisely than prose.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- #<issue> or "None — can start immediately"
</issue-template>
