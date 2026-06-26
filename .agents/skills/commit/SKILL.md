---
name: commit
description: Stage and commit changes with a well-crafted conventional commit message. Infers issue refs from branch name, considers logical commit groups. Use when the user is ready to commit.
---

## Process

### 1. Gather context

Run: `git status`, `git diff HEAD`, `git branch --show-current`, `git log --oneline -10`

If the working tree is clean, report nothing to commit and stop.

### 2. Determine commit message convention

Priority order:
1. `README.md` or `AGENTS.md` — if commit conventions are documented, follow them
2. Recent commit history — if a clear pattern emerges (conventional commits, ticket prefixes), match it
3. Default: conventional commits — `type(scope): description` where type is `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`

When `fix` and `feat` both seem to fit, prefer `fix` — reserve `feat` for capabilities the user could not previously accomplish.

### 3. Consider logical commit groups

Scan changed files for naturally distinct concerns. If files clearly group into separate logical changes, create separate commits. Keep it to 2-3 groups max — don't over-slice.

### 4. Stage and commit

Prefer staging specific files by name over `git add -A`. Use a heredoc:

```bash
git add file1 file2 && git commit -m "$(cat <<'EOF'
type(scope): subject line

Optional body explaining why, not what.
EOF
)"
```

Infer issue number in this order:
1. Conversation context — if an issue number was mentioned during this session, use it
2. Branch name — check `git branch --show-current` for a pattern like `123-feature-name` or `issue/123`
3. If neither found, omit the footer — do not guess

Do NOT add Co-Authored-By or attribution lines.

### 5. Confirm

Run `git status` after commit. Report the commit hash and subject line.
