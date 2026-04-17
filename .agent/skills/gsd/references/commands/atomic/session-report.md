---
name: gsd:session-report
description: Generate a session report with token usage estimates, work summary, and outcomes
allowed-tools:
  - Read
  - Bash
  - Write
gsd-source-version: 1.37.1
migration-date: 2026-04-18
---
<objective>
Generate a structured SESSION_REPORT.md document capturing session outcomes, work performed, and estimated resource usage. Provides a shareable artifact for post-session review.
</objective>

<execution_context>
@references/workflows/session-report.md
</execution_context>

<process>
Execute the session-report workflow from @references/workflows/session-report.md end-to-end.
</process>
