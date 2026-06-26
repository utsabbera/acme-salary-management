---
name: research
description: Quick focused research — how something works in this codebase, what a library API does, where a pattern is used. Use instead of /deep-research when the question is bounded and specific.
---

Answer a specific technical question quickly.

## Process

1. Classify the question: codebase, library/API, or both.
2. For codebase: `grep` and `Read` to trace the relevant code path. Surface the 3-5 most relevant locations with file paths and line refs.
3. For library/API: fetch the specific doc section — one source, two max.
4. Output:

```
## Finding
<direct answer in 1-3 sentences>

## Sources
- path/to/file.ts:42 — <why relevant>
- https://docs.example.com/api#section — <what it says>

## Caveats
<only if something is uncertain or version-dependent>
```

Keep the answer under 300 words. If the question is too broad, suggest `/deep-research` instead.
