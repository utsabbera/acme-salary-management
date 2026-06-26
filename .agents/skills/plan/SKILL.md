---
name: plan
description: Read an issue and create a concrete implementation plan as an artifact, seeking user approval before execution. Use when the user says "make a plan", "plan this issue", or "create an implementation plan".
---

Read the provided issue and create a concrete implementation plan.

## Process

### 1. Gather context

Work from whatever is in the conversation. If the user passes an issue number or URL, fetch it with `gh issue view <N>`.
Thoroughly research the task using research tools. Understand the codebase, dependencies, architecture, and implications of the requested changes.

### 2. Create Implementation Plan

Create or update an `implementation_plan.md` artifact with your findings and proposed approach. Include any open questions to clarify ambiguity, underspecified requirements, or design intent directly in the implementation plan. 

Set `request_feedback = true` and `user_facing = true` in the ArtifactMetadata.

Use the following format for the artifact:
```markdown
# [Goal Description]

Provide a brief description of the problem, any background context, and what the change accomplishes.

## User Review Required

Document anything that requires user review or feedback, for example, breaking changes or significant design decisions. Use GitHub alerts (IMPORTANT/WARNING/CAUTION) to highlight critical items.

## Open Questions

Any clarifying or design questions for the user that will impact the implementation plan. Use GitHub alerts (IMPORTANT/WARNING/CAUTION) to highlight critical items.

## Proposed Changes

Group files by component (e.g., package, feature area, dependency layer) and order logically (dependencies first). Separate components with horizontal rules for visual clarity.

### [Component Name]

Summary of what will change in this component, separated by files. For specific files, Use [NEW] and [DELETE] to demarcate new and deleted files, for example:

#### [MODIFY] [file basename](file:///absolute/path/to/modifiedfile)
#### [NEW] [file basename](file:///absolute/path/to/newfile)
#### [DELETE] [file basename](file:///absolute/path/to/deletedfile)

## Verification Plan

Summary of how you will verify that your changes have the desired effects.
```

### 3. Obtain User Approval

Stop execution and wait for the user's explicit approval before proceeding to execute the plan.
