---
name: wrap
description: End-of-session sync — extract learnings from the conversation and improve memory files, skill files, CLAUDE.md, and GitHub issue states. Use at the end of a work session or after completing a significant feature.
---

Scan the current conversation for durable learnings, then improve the persistent artifacts that future sessions depend on.

## Process

### 1. Scan for learnings

Categorize findings into four buckets:

- **Preferences** — user corrections to Claude's behavior or approach → update `CLAUDE.md`
- **Skill improvements** — patterns or gaps discovered → update the relevant skill file
- **Project context** — decisions, constraints, or goals not captured elsewhere → write or update a memory file
- **GitHub state** — issues resolved in this session → close or comment; follow-ups discovered → create new issues

### 2. Propose changes

Show a summary of what will be changed before touching anything:

```
CLAUDE.md: add "prefer X over Y"
skills/tdd/SKILL.md: add note about Jest mock pattern used today
GitHub: close #14, comment on #22 with outcome
Memory: update project context with decision on auth approach
```

### 3. Apply with confirmation

Ask "Apply these updates?" then write the files and run the `gh` commands.

Don't duplicate content already captured in other artifacts — reference by URL or path instead.
