---
name: gsd:sketch-wrap-up
description: Package sketch design findings into a persistent project skill for future build conversations
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
Curate sketch design findings and package them into a persistent project skill that Antigravity
auto-loads when building the real UI. Also writes a summary to `.planning/sketches/` for
project history. Output skill goes to `./.antigravity/skills/sketch-findings-[project]/` (project-local).
</objective>

<execution_context>
@references/workflows/sketch-wrap-up.md
@references/docs/ui-brand.md
</execution_context>

<runtime_note>
**Copilot (VS Code):** Use `vscode_askquestions` wherever this workflow calls `AskUserQuestion`.
</runtime_note>

<process>
Execute the sketch-wrap-up workflow from @references/workflows/sketch-wrap-up.md end-to-end.
Preserve all curation gates (per-sketch review, grouping approval, ANTIGRAVITY.md routing line).
</process>
