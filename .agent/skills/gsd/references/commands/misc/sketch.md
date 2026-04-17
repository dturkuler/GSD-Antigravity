---
name: gsd:sketch
description: Rapidly sketch UI/design ideas using throwaway HTML mockups with multi-variant exploration
argument-hint: "<design idea to explore> [--quick]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
gsd-source-version: 1.37.1
migration-date: 2026-04-18
---
<objective>
Explore design directions through throwaway HTML mockups before committing to implementation.
Each sketch produces 2-3 variants for comparison. Sketches live in `.planning/sketches/` and
integrate with GSD commit patterns, state tracking, and handoff workflows.

Does not require `/gsd-new-project` — auto-creates `.planning/sketches/` if needed.
</objective>

<execution_context>
@references/workflows/sketch.md
@references/docs/ui-brand.md
@references/docs/sketch-theme-system.md
@references/docs/sketch-interactivity.md
@references/docs/sketch-tooling.md
@references/docs/sketch-variant-patterns.md
</execution_context>

<runtime_note>
**Copilot (VS Code):** Use `vscode_askquestions` wherever this workflow calls `AskUserQuestion`.
</runtime_note>

<context>
Design idea: $ARGUMENTS

**Available flags:**
- `--quick` — Skip mood/direction intake, jump straight to decomposition and building. Use when the design direction is already clear.
</context>

<process>
Execute the sketch workflow from @references/workflows/sketch.md end-to-end.
Preserve all workflow gates (intake, decomposition, variant evaluation, MANIFEST updates, commit patterns).
</process>
