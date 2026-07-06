# Build Workflow

Orchestrate the full implementation cycle: produce an implementation plan, then drive the red-green-refactor TDD loop until all tests pass and the user is satisfied.

## Steps

### Step 1 — Implementation Planning

Run the `plan` skill:
- Read the GitHub issue (ask the user for the issue number if not provided)
- Explore the relevant parts of the codebase
- Produce a detailed implementation plan artifact

### Gate — Plan Approval

Present the implementation plan to the user. Ask:

> **Does this implementation plan look right?**
> Reply `yes` to begin implementation, or describe what needs to change.

If the user requests changes, revise the plan and re-present. Do not begin implementation until explicitly approved.

### Step 2 — TDD Implementation Loop

Run the `tdd` skill and drive the loop actively:

1. Write the failing test(s) for the next slice (red)
2. Implement the minimum code to make the test pass (green)
3. Refactor for clarity and correctness
4. Run the full test suite — if failures exist, fix them before moving on
5. Repeat for the next slice until all acceptance criteria are covered

Do not hand off to the developer mid-loop. Drive the loop to completion.

### Completion

Once all tests are passing and all acceptance criteria are met, present a summary:
- Slices implemented
- Tests written and passing
- Any deferred items or follow-up issues to file

Ask the user if they are ready to `/ship`.
