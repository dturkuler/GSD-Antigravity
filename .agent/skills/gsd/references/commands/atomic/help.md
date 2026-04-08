---
name: gsd:help
description: Show available GSD commands and usage guide
allowed-tools:
  - Read
gsd-source-version: 1.34.2
migration-date: 2026-04-08
---
<objective>
Display the complete GSD command reference.

Output ONLY the reference content below. Do NOT add:
- Project-specific analysis
- Git status or file context
- Next-step suggestions
- Any commentary beyond the reference
</objective>

<execution_context>
@references/workflows/help.md
</execution_context>

<process>
Output the complete GSD command reference from @references/workflows/help.md.
Display the reference content directly — no additions or modifications.
</process>
