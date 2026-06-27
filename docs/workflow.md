# Development Workflow

This document outlines the agent-assisted development workflow used in this project, designed to maintain high code quality, clear planning, and structured execution. The workflow is divided into three main phases: Planning, Implementation, and Wrap-up.

## 1. New Requirement (Planning Phase)
When a new requirement is introduced, we follow a structured planning process to ensure clarity and scope management before any code is written.

- **Ideate**: We use the `ideate` skill to engage in Socratic dialogue and stress-test ideas. This helps clarify ambiguous requirements, resolve design decisions, and solidify the approach.
- **Epic**: Once the idea is clear, we use the `epic` skill to synthesize the conversation into a Product Requirements Document (PRD) and file it as a high-level Epic in GitHub.
- **Breakdown**: Finally, the `breakdown` skill is used to take the Epic and slice it into small, independently-grabbable vertical slices (GitHub Issues). This enables incremental delivery and testability.

## 2. Implementation Phase
Once issues are broken down and ready for work, we transition into execution.

- **Plan**: For a selected issue, we use the `plan` skill. This agent performs a deep dive into the codebase, researches the necessary changes, and produces an `implementation_plan.md` artifact. Execution pauses for user approval.
- **TDD (Test-Driven Development)**: Once the plan is approved, we use the `tdd` skill to implement the changes using a red-green-refactor cycle. The agent writes a failing test for a vertical slice, implements minimal code to pass it, refactors, and repeats.
- **Inner Loop Activities**: During TDD, we seamlessly integrate other specialized skills:
  - `review` for automated standards and spec compliance checks.
  - `commit` to logically group and stage changes with conventional commit messages.
  - `debug` for diagnosing complex test failures or regressions.
  - `refactor` to restructure code safely while tests are green.

## 3. End of Session (Wrap-up Phase)
At the end of a work session, we ensure all state is captured and learnings are persisted.

- **Wrap**: The `wrap` skill is invoked to scan the conversation for durable project learnings. It updates project artifacts (like ADRs or requirements docs) and synchronizes the GitHub state by closing completed issues or creating follow-ups.
- **Learn**: We use the `/learn` slash command to persist any new agent behavioral rules, coding patterns, or skill improvements discovered during the session. This ensures the AI assistant becomes more capable over time.

---
*Note: This workflow is supported by custom agent skills located in the `.agents/skills` directory, ensuring consistent and reproducible interactions.*
