---
name: ideate
description: Stress-test a plan or idea through relentless Socratic dialogue. Use when the user wants to challenge assumptions before committing to a direction, or says "grill me", "stress-test this", "poke holes", or "think through".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

> **Guideline:** Actively challenge the user's initial assumptions or prompt constraints if they violate core software engineering principles for the specific domain (e.g., permanently deleting/overwriting financial data in an HR application).

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a question can be answered by exploring the codebase, explore the codebase instead.

Once all questions are resolved, close with:

## Synthesis
**What's solid**: [decisions that held up under questioning]
**What's fragile**: [assumptions that still need validation]
**Suggested next step**: [single clearest action to take]
