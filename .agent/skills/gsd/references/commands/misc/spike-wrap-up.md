---
name: gsd:spike-wrap-up
description: Package spike findings into a persistent project skill for future build conversations
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
Curate spike experiment findings and package them into a persistent project skill that Antigravity
auto-loads in future build conversations. Also writes a summary to `.planning/spikes/` for
project history. Output skill goes to `./.antigravity/skills/spike-findings-[project]/` (project-local).
</objective>

<execution_context>
@references/workflows/spike-wrap-up.md
@references/docs/ui-brand.md
</execution_context>

<runtime_note>
**Copilot (VS Code):** Use `vscode_askquestions` wherever this workflow calls `AskUserQuestion`.
</runtime_note>

<process>
Execute the spike-wrap-up workflow from @references/workflows/spike-wrap-up.md end-to-end.
Preserve all curation gates (per-spike review, grouping approval, ANTIGRAVITY.md routing line).
</process>
