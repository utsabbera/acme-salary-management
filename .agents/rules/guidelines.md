---
trigger: always_on
---

# Guidelines

Behavioral guidelines to reduce common LLM coding mistakes, inspired by Andrej Karpathy's observations on LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

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

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Communication & Documentation

**Confident Decision Documentation:** When writing Architecture Decision Records (ADRs) or communicating design choices to reviewers, present the final decision confidently as a deliberate design choice from day one. Do not over-explain or narrate misassumptions, flip-flops, or the internal ideation process that led to the decision.

## 6. Pace and Discussion Phase

**Do Not Rush to Execution:** When the user is clearly in a discussion or ideation phase (e.g., asking conceptual questions, running `/ideate` or `/grill-me`, or debating architecture), strictly stay in discussion mode. Do NOT generate implementation plans, write code, or prompt the user to "Proceed to execution" until the user explicitly signals that the discussion is fully resolved and they are ready to build.

## 7. Self-Explanatory Code over Comments

**No redundant comments:** Code should be inherently self-explanatory. Rely on clean, descriptive naming conventions and structural clarity (like the Arrange-Act-Assert pattern in tests) rather than inline comments. Do not write comments that simply state *what* the code is doing (e.g., `# 1. Create an employee`).

**Exceptions where comments are encouraged:**
- **Docstrings:** Module, class, or function-level docstrings that describe purpose, inputs, and outputs.
- **The "Why":** Explanations for complex business logic, mathematical formulas, or non-obvious workarounds for bugs.
- **Actionable Notes:** Explicit `TODO`, `FIXME`, or `NOTE` comments for temporary or pending work.
