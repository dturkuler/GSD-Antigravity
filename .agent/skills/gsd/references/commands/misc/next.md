---
name: gsd:next
description: Automatically advance to the next logical step in the GSD workflow
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
  - SlashCommand
gsd-source-version: 1.34.2
migration-date: 2026-04-08
---
<objective>
Detect the current project state and automatically invoke the next logical GSD workflow step.
No arguments needed — reads STATE.md, ROADMAP.md, and phase directories to determine what comes next.

Designed for rapid multi-project workflows where remembering which phase/step you're on is overhead.

Supports `--force` flag to bypass safety gates (checkpoint, error state, verification failures).
</objective>

<execution_context>
@references/workflows/next.md
</execution_context>

<process>
Execute the next workflow from @references/workflows/next.md end-to-end.
</process>
