---
name: wrap
description: End-of-session sync — extract project context and update GitHub issue states. Use at the end of a work session or after completing a significant feature.
---

Scan the current conversation for durable project learnings, then improve the persistent project artifacts and GitHub state.

## Process

### 1. Scan for learnings

Categorize findings into two buckets:

- **Project context** — decisions, constraints, or goals not captured elsewhere → write or update an ADR in `docs/decisions/` or PRD in `docs/requirements.md`
- **GitHub state** — issues resolved in this session → close or comment; follow-ups discovered → create new issues

*(Note: To persist behavioral rules or skill improvements, do NOT use this wrap skill. Instead, advise the user to use the `/learn` slash command.)*

### 2. Propose changes

Show a summary of what will be changed before touching anything:

```
GitHub: close #14, comment on #22 with outcome
Context: update docs/requirements.md or add ADR for auth approach
```

### 3. Apply with confirmation

Ask "Apply these updates?" then write the files and run the `gh` commands.

Don't duplicate content already captured in other artifacts — reference by URL or path instead.
