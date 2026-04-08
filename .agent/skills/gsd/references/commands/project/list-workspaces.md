---
name: gsd:list-workspaces
description: List active GSD workspaces and their status
allowed-tools:
  - Bash
  - Read
gsd-source-version: 1.34.2
migration-date: 2026-04-08
---
<objective>
Scan `~/gsd-workspaces/` for workspace directories containing `WORKSPACE.md` manifests. Display a summary table with name, path, repo count, strategy, and GSD project status.
</objective>

<execution_context>
@references/workflows/list-workspaces.md
@references/docs/ui-brand.md
</execution_context>

<process>
Execute the list-workspaces workflow from @references/workflows/list-workspaces.md end-to-end.
</process>
