---
name: gsd:progress
description: Check project progress, show context, and route to next action (execute or plan). Use --forensic to append a 6-check integrity audit after the standard report.
argument-hint: "[--forensic]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
  - SlashCommand
gsd-source-version: 1.37.1
migration-date: 2026-04-18
---
<objective>
Check project progress, summarize recent work and what's ahead, then intelligently route to the next action - either executing an existing plan or creating the next one.

Provides situational awareness before continuing work.
</objective>

<execution_context>
@references/workflows/progress.md
</execution_context>

<process>
Execute the progress workflow from @references/workflows/progress.md end-to-end.
Preserve all routing logic (Routes A through F) and edge case handling.
</process>
