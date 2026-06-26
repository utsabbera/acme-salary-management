---
name: wrap
description: End-of-session sync — extract learnings from the conversation and improve memory files, skill files, CLAUDE.md, and GitHub issue states. Use at the end of a work session or after completing a significant feature.
---

Scan the current conversation for durable learnings, then improve the persistent artifacts that future sessions depend on.

## Process

### 1. Scan for learnings

Categorize findings into four buckets:

- **Preferences** — user corrections to Claude's behavior or approach → update `.agents/rules/`
- **Skill improvements** — patterns or gaps discovered → update the relevant skill file
- **Project context** — decisions, constraints, or goals not captured elsewhere → write or update an ADR in `docs/decisions/` or PRD in `docs/requirements.md`
- **GitHub state** — issues resolved in this session → close or comment; follow-ups discovered → create new issues

### 2. Propose changes

Show a summary of what will be changed before touching anything:

```
Rules: add "prefer X over Y" to guidelines.md
skills/tdd/SKILL.md: add note about Jest mock pattern used today
GitHub: close #14, comment on #22 with outcome
Context: update docs/requirements.md or add ADR for auth approach
```

### 3. Apply with confirmation

Ask "Apply these updates?" then write the files and run the `gh` commands.

Don't duplicate content already captured in other artifacts — reference by URL or path instead.
