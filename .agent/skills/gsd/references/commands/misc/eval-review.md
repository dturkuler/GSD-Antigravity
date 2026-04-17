---
name: gsd:eval-review
description: Retroactively audit an executed AI phase's evaluation coverage — scores each eval dimension as COVERED/PARTIAL/MISSING and produces an actionable EVAL-REVIEW.md with remediation plan
argument-hint: "[phase number]"
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
Conduct a retroactive evaluation coverage audit of a completed AI phase.
Checks whether the evaluation strategy from AI-SPEC.md was implemented.
Produces EVAL-REVIEW.md with score, verdict, gaps, and remediation plan.
</objective>

<execution_context>
@references/workflows/eval-review.md
@references/docs/ai-evals.md
</execution_context>

<context>
Phase: $ARGUMENTS — optional, defaults to last completed phase.
</context>

<process>
Execute @references/workflows/eval-review.md end-to-end.
Preserve all workflow gates.
</process>
