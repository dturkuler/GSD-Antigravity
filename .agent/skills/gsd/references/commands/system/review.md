---
name: gsd:review
description: Request cross-AI peer review of phase plans from external AI CLIs
argument-hint: "--phase N [--gemini] [--antigravity] [--codex] [--opencode] [--all]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
gsd-source-version: 1.34.2
migration-date: 2026-04-08
---

<objective>
Invoke external AI CLIs (Gemini, Antigravity, Codex, OpenCode) to independently review phase plans.
Produces a structured REVIEWS.md with per-reviewer feedback that can be fed back into
planning via /gsd-plan-phase --reviews.

**Flow:** Detect CLIs → Build review prompt → Invoke each CLI → Collect responses → Write REVIEWS.md
</objective>

<execution_context>
@references/workflows/review.md
</execution_context>

<context>
Phase number: extracted from $ARGUMENTS (required)

**Flags:**
- `--gemini` — Include Gemini CLI review
- `--antigravity` — Include Antigravity CLI review (uses separate session)
- `--codex` — Include Codex CLI review
- `--opencode` — Include OpenCode review (uses model from user's OpenCode config)
- `--all` — Include all available CLIs
</context>

<process>
Execute the review workflow from @references/workflows/review.md end-to-end.
</process>
