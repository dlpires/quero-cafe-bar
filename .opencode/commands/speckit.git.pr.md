---
description: Create a GitHub Pull Request for the current feature branch using gh CLI
model: opencode/deepseek-v4-flash-free
---

<!-- Extension: git -->
<!-- Config: .specify/extensions/git/ -->
# Create GitHub Pull Request

Create a GitHub Pull Request for the current feature branch using the `gh` CLI. The PR title and body are auto-generated from the spec directory and commit log.

## User Input

```text
$ARGUMENTS
```

Supports:

| Argument | Description |
|----------|-------------|
| `--draft` | Create as a draft PR |
| `--base <branch>` | Target base branch (default: `development`) |
| `--title "..."` | Override auto-generated title |
| `--body "..."` | Override auto-generated body |

## Prerequisites

Run each check below in order. Fail immediately if any check fails.

### 1. Git repository

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

If exit code != 0, output:

```
[pr] Error: Not a Git repository. Run this command from within a Git repository.
```

### 2. `gh` CLI installed

```bash
gh --version
```

If exit code != 0, output:

```
[pr] Error: GitHub CLI (gh) is not installed.
[pr] Install it with: winget install --id GitHub.cli
[pr] Then authenticate: gh auth login
```

### 3. `gh` authenticated

```bash
gh auth status 2>&1
```

If exit code != 0, output:

```
[pr] Error: Not authenticated with GitHub CLI.
[pr] Run: gh auth login
```

### 4. Clean working tree

```bash
git status --porcelain
```

If output is not empty, output:

```
[pr] Error: You have uncommitted changes. Commit or stash them before creating a PR.
```

## Extract Branch Information

```bash
git rev-parse --abbrev-ref HEAD
```

Validate the branch follows feature branch naming (sequential or timestamp format):

- **Sequential**: `^[0-9]{3,}-` (e.g., `010-list-pagination`, `042-fix-bug`)
- **Timestamp**: `^\d{8}-\d{6}-` (e.g., `20260319-143022-feature-name`)

If the branch does not match either pattern, output a warning but continue:

```
[pr] ⚠ Current branch '<branch>' does not follow feature branch naming.
```

Extract the numeric prefix and slug from the branch name:

- **Sequential**: prefix = first `N` digits (e.g., `010`), slug = everything after the first `-`
- **Timestamp**: prefix = the full `YYYYMMDD-HHMMSS` portion, slug = everything after the second `-`

Set variables:
- `BRANCH_NAME` = current branch
- `PREFIX` = extracted numeric/timestamp prefix
- `SLUG` = extracted slug
- `BASE_BRANCH` = `development` (or user override via `--base`)

## Build PR Title

If `--title` was provided, use that value directly.

Otherwise, compose the title as:

```
[<PREFIX>] <Feature name>
```

The feature name is derived by:
1. Looking for `specs/<PREFIX>-*/spec.md` → extract the first `# ` heading
2. Fallback: convert `SLUG` from kebab-case to Title Case (e.g., `list-pagination` → `List Pagination`)
3. Fallback: use `SLUG` as-is

## Build PR Body

If `--body` was provided, use that value directly.

Otherwise, compose the body from these sources in order:

### Source 1: Spec directory

Check if `specs/<PREFIX>-*/` exists. If so:

- **spec.md**: Read the file and extract the Overview section (everything between the first `# ` heading and `## ` heading, or the first 50 lines, whichever is shorter)
- **tasks.md**: Read the file and list all completed tasks (look for `- [x]` items or any content under `## Done`)
- **plan.md**: Read the first 20 lines if available

### Source 2: Commit log

```bash
git log --oneline <BASE_BRANCH>..HEAD
```

If the spec directory is found, format the body as:

```
## Overview

<extracted spec overview>

## Changes

<list of commits from git log, one per line>

## Implementation Details

- <describe key files changed, derived from git diff --stat or similar>

---

**Checklist:**
- [ ] Tests pass (`yarn test` / `npm test`)
- [ ] Lint passes (`yarn lint` / `npm run lint`)
- [ ] Migrations run (`yarn migrate`)
```

If the spec directory is NOT found, use `gh pr create --fill` (auto-generate from commits) as a fallback and output a warning:

```
[pr] ⚠ No spec directory found for prefix '<PREFIX>'. Using auto-fill from commits.
```

## Create the PR

Build the command:

```bash
gh pr create --base <BASE_BRANCH> --title "<TITLE>" --body "<BODY>" [--draft]
```

Add `--draft` if the user passed `--draft` in `$ARGUMENTS`.

## Output

If successful, `gh` outputs the PR URL. Relay it to the user:

```
[pr] ✓ Pull Request created: <URL>
```

If `gh` exits with a non-zero code, output the error:

```
[pr] Error: Failed to create Pull Request.
<stderr from gh>
```

## Graceful Degradation

- If `gh` is not installed or authenticated, provide clear instructions and abort — do not attempt fallback workflows
- If the branch is not a feature branch, warn but still proceed (the user may have their own naming convention)
- If no spec directory exists, fall back to `--fill` mode and warn
- If the base branch does not exist locally, `gh pr create` will still work (it resolves on GitHub)
