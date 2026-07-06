# Draft Workflow

Orchestrate the full feature planning ceremony: stress-test the idea, produce a Feature Brief, plan the issues, and generate `issues.json` ready for `make issues`.

## Steps

### Step 1 — Ideation

Run the `ideate` skill in full:
- Conduct the Socratic Q&A (one question at a time, codebase exploration where useful)
- Produce the Synthesis block
- Generate the Feature Brief artifact (`feature_brief_<slug>.md`)

### Gate 1 — Feature Brief Approval

Present the Feature Brief to the user. Ask:

> **Does this Feature Brief match your vision?**
> Reply `yes` to continue to issue planning, or describe what needs to change.

If the user requests changes, update the Feature Brief artifact and re-present. Repeat until approved. Do not proceed to Step 2 until the user explicitly approves.

### Step 2 — Issue Planning

Run the `breakdown` skill using the approved Feature Brief as primary context:
- Resolve the Epic (existing or new)
- Draft vertical slices and quiz the user on granularity
- Iterate until the plan is approved

### Gate 2 — Issue Plan Approval

Present the final issue plan (Epic + all slices with blockers). Ask:

> **Approve this plan to generate issues.json?**
> Reply `yes` to write the file, or describe what needs to change.

If the user requests changes, revise the plan and re-present. Do not write `issues.json` until the user explicitly approves.

### Step 3 — Output

The `breakdown` skill writes `issues.json` to the session artifact directory and prints the exact `make issues INPUT=<path>` command.

The workflow is complete. The user runs `make issues` at their discretion.
