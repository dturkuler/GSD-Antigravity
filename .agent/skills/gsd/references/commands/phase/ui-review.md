---
name: gsd:ui-review
description: Retroactive 6-pillar visual audit of implemented frontend code
argument-hint: "[phase]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
gsd-source-version: 1.37.1
migration-date: 2026-04-18
---
<objective>
Conduct a retroactive 6-pillar visual audit. Produces UI-REVIEW.md with
graded assessment (1-4 per pillar). Works on any project.
Output: {phase_num}-UI-REVIEW.md
</objective>

<execution_context>
@references/workflows/ui-review.md
@references/docs/ui-brand.md
</execution_context>

<context>
Phase: $ARGUMENTS — optional, defaults to last completed phase.
</context>

<process>
Execute @references/workflows/ui-review.md end-to-end.
Preserve all workflow gates.
</process>
