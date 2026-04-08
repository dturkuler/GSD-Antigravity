---
name: gsd:remove-workspace
description: Remove a GSD workspace and clean up worktrees
argument-hint: "<workspace-name>"
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
gsd-source-version: 1.34.2
migration-date: 2026-04-08
---
<context>
**Arguments:**
- `<workspace-name>` (required) — Name of the workspace to remove
</context>

<objective>
Remove a workspace directory after confirmation. For worktree strategy, runs `git worktree remove` for each member repo first. Refuses if any repo has uncommitted changes.
</objective>

<execution_context>
@references/workflows/remove-workspace.md
@references/docs/ui-brand.md
</execution_context>

<process>
Execute the remove-workspace workflow from @references/workflows/remove-workspace.md end-to-end.
</process>
