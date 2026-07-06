---
name: ideate
description: Stress-test a plan or idea through relentless Socratic dialogue, then produce a Feature Brief artifact. Use when the user wants to challenge assumptions before committing to a direction, or says "grill me", "stress-test this", "poke holes", or "think through".
---

**The goal of this skill is a Feature Brief artifact.** The Socratic Q&A is the means to get there — use it to surface every decision needed to write a complete, unambiguous brief.

## Interview Process

Ask one question at a time. Wait for the answer before asking the next. If a question can be answered by exploring the codebase, do that instead of asking.

Cover these areas in order, skipping any that are already clear from context:

1. **Problem** — What's broken or missing? Who feels the pain? What's the current workaround?
2. **Users & actors** — Who uses this feature and in what role?
3. **Solution shape** — What does the happy path look like end-to-end?
4. **Scope boundary** — What is explicitly NOT included in this iteration?
5. **Technical decisions** — Schema changes? API contracts? Which modules are affected?
6. **Testing approach** — What makes a good test for this? What behaviour matters most?
7. **Risks & assumptions** — What could go wrong? What are we assuming is true?

For each question, provide your recommended answer. Push back if an answer conflicts with existing architecture or data integrity principles.

Once all areas are resolved, write:

## Synthesis
**What's solid**: [decisions that held up under questioning]
**What's fragile**: [assumptions that still need validation]
**Suggested next step**: [single clearest action to take]

---

## Output: Feature Brief

The Feature Brief is the primary output of this skill. Immediately after the Synthesis, synthesize everything discussed in the conversation into a Feature Brief artifact and save it to the session artifact directory. Do NOT wait for the user to ask.

Name the file `feature_brief_<slug>.md` where `<slug>` is a lowercase hyphenated version of the feature name.

```markdown
# Feature Brief: <Feature Name>

## Problem Statement

The problem the user is facing, from the user's perspective.

## Solution

The solution, from the user's perspective.

## User Stories

Numbered list. Format: "As a <actor>, I want <feature>, so that <benefit>." Be extensive — cover all aspects of the feature.

## Implementation Decisions

- Modules to build or modify
- Interface changes
- Architectural decisions
- Schema changes, API contracts

No file paths or code snippets unless a snippet encodes a decision more precisely than prose.

## Testing Decisions

- What makes a good test for this feature (behaviour, not implementation)
- Which modules to test
- Prior art in the codebase

## Out of Scope

What this Feature Brief explicitly does not cover.

## Further Notes

Anything else relevant.
```

After saving, tell the user the Feature Brief is ready and stop. The `/draft` workflow handles what comes next.
