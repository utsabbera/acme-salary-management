---
trigger: always_on
---

# Workflow and Boundaries

These rules define how the agent operates, its boundaries, and the expected step-by-step workflow.

## 1. Collaborative Execution First (Plan-Act-Reflect)

When starting a new task or phase, NEVER jump directly into modifying source code files. Instead, you must strictly follow a "Human-in-the-Loop" workflow:

- **Task Artifact Creation**: Parse the implementation plan and the user's specific prompt (e.g., "Implement Phase 1") to define the scope. Create a artifact that outlines the exact steps, tests to be written, and interfaces to be designed.
- **Verification Pause**: Explicitly halt execution and ask the user to review and approve the `task.md` checklist before proceeding to edit any source code.
- **Execution Tracking**: During execution, update the `task.md` artifact by checking off items as they are completed to provide observable progress.
- **Summary**: Upon completing the scope, summarize the work done using a `walkthrough.md` artifact.

## 2. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
` ` `
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
` ` `

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 3. Pace and Discussion Phase

**Do Not Rush to Execution:** When the user is clearly in a discussion or ideation phase (e.g., asking conceptual questions, running `/ideate` or `/grill-me`, or debating architecture), strictly stay in discussion mode. Do NOT generate implementation plans, write code, or prompt the user to "Proceed to execution" until the user explicitly signals that the discussion is fully resolved and they are ready to build.

## 4. Context Retrieval (Pre-flight Checklist)

**MANDATORY FIRST STEP: Always read the `README.md` file.**
Before you do any planning, execution, or even answering complex questions about the project, you MUST read the `README.md` to understand the directory structure and essential commands. This is your absolute source of truth.

**Always check existing documentation before planning.**
When starting a new feature, planning an architecture change, or running project commands for the first time, proactively use the `list_dir` and `view_file` tools to check the `docs/` directory for any existing conventions or constraints that might apply to your task. If you're unsure how a subsystem works, check `docs/decisions/` before assuming a default architecture.

## 5. Subagent Definition and Invocation

Whenever a skill or instruction specifies running, invoking, or using a subagent by name (e.g., `explore`, `reproduce`, `watch`, `verify`, `audit`, `validate`):
1. **Locate Template**: Locate the corresponding Markdown template file in `.agents/subagents/<name>.md`.
2. **Parse Frontmatter**: Read the template file and parse its YAML frontmatter to extract the boolean settings for permissions:
   - `enable_write_tools`
   - `enable_mcp_tools`
   - `enable_subagent_tools`
3. **Extract System Prompt**: Use the remaining Markdown content (everything after the ending `---` separator) as the `system_prompt` parameter.
4. **Define Subagent**: Call the `define_subagent` tool with the extracted prompt and parameters.
5. **Invoke Subagent**: Invoke the defined subagent using the `invoke_subagent` tool.