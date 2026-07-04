---
trigger: model_decision
---

# Code Quality and Architecture

These rules define what "good" code looks like and how to approach modifications to the existing codebase.

## 1. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 2. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 3. Self-Explanatory Code over Comments

**No redundant comments:** Code should be inherently self-explanatory. Rely on clean, descriptive naming conventions and structural clarity (like the Arrange-Act-Assert pattern in tests) rather than inline comments. Do not write comments that simply state *what* the code is doing (e.g., `# 1. Create an employee`).

**Exceptions where comments are encouraged:**
- **Docstrings:** Module, class, or function-level docstrings that describe purpose, inputs, and outputs.
- **The "Why":** Explanations for complex business logic, mathematical formulas, or non-obvious workarounds for bugs.
- **Actionable Notes:** Explicit `TODO`, `FIXME`, or `NOTE` comments for temporary or pending work.

## 4. Strict Type Safety and Linting

**No escape hatches for types or linters.**

- Never use `as any`, `@ts-ignore`, or linter suppressions (like `// biome-ignore`) as a workaround for difficult type constraints, especially when writing test mocks.
- Instead of using `any` to mock complex objects or API responses, properly satisfy the structural typing using utility types (e.g., `as unknown as ReturnType<typeof functionName>` or `Awaited<ReturnType<typeof functionName>>`).
- Find the root cause of the type or lint issue and refactor properly rather than suppressing it.
