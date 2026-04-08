---
name: gsd:undo
description: "Safe git revert. Roll back phase or plan commits using the phase manifest with dependency checks."
argument-hint: "--last N | --phase NN | --plan NN-MM"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
gsd-source-version: 1.34.2
migration-date: 2026-04-08
---

<objective>
Safe git revert — roll back GSD phase or plan commits using the phase manifest, with dependency checks and a confirmation gate before execution.

Three modes:
- **--last N**: Show recent GSD commits for interactive selection
- **--phase NN**: Revert all commits for a phase (manifest + git log fallback)
- **--plan NN-MM**: Revert all commits for a specific plan
</objective>

<execution_context>
@references/workflows/undo.md
@references/docs/ui-brand.md
@references/docs/gate-prompts.md
</execution_context>

<context>
$ARGUMENTS
</context>

<process>
Execute the undo workflow from @references/workflows/undo.md end-to-end.
</process>
