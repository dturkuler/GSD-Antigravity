---
name: gsd:validate-phase
description: Retroactively audit and fill Nyquist validation gaps for a completed phase
argument-hint: "[phase number]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
gsd-source-version: 1.34.2
migration-date: 2026-04-08
---
<objective>
Audit Nyquist validation coverage for a completed phase. Three states:
- (A) VALIDATION.md exists — audit and fill gaps
- (B) No VALIDATION.md, SUMMARY.md exists — reconstruct from artifacts
- (C) Phase not executed — exit with guidance

Output: updated VALIDATION.md + generated test files.
</objective>

<execution_context>
@references/workflows/validate-phase.md
</execution_context>

<context>
Phase: $ARGUMENTS — optional, defaults to last completed phase.
</context>

<process>
Execute @references/workflows/validate-phase.md.
Preserve all workflow gates.
</process>
