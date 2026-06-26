---
name: prd
description: Turn the current conversation into a PRD and file it as a GitHub Epic issue. Use when the user wants to formalize a feature into a spec. No re-interview — synthesizes what's already been discussed.
---

Take the current conversation and produce a PRD. Do NOT interview the user — synthesize what you already know.

1. Explore the repo briefly to understand the current state relevant to this feature.
2. Update the central `docs/requirements.md` file by appending ONLY the high-level User Stories for this new feature. Keep it high-level (the "North Star").
3. Create a GitHub Epic issue using the `gh` CLI containing the detailed PRD using the template below:
   `gh issue create --title "[Epic] <Feature Name>" --label "epic" --body "..."`

<prd-template>

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
- Schema changes
- API contracts

No specific file paths or code snippets unless a prototype produced a snippet that encodes a decision more precisely than prose — inline only the decision-rich parts.

## Testing Decisions

- What makes a good test for this feature (behavior, not implementation)
- Which modules to test
- Prior art in the codebase

## Out of Scope

What this PRD explicitly does not cover.

## Further Notes

Anything else relevant.

</prd-template>
