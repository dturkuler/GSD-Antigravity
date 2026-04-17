---
name: gsd:do
description: Route freeform text to the right GSD command automatically
argument-hint: "<description of what you want to do>"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
gsd-source-version: 1.37.1
migration-date: 2026-04-18
---
<objective>
Analyze freeform natural language input and dispatch to the most appropriate GSD command.

Acts as a smart dispatcher — never does the work itself. Matches intent to the best GSD command using routing rules, confirms the match, then hands off.

Use when you know what you want but don't know which `/gsd-*` command to run.
</objective>

<execution_context>
@references/workflows/do.md
@references/docs/ui-brand.md
</execution_context>

<context>
$ARGUMENTS
</context>

<process>
Execute the do workflow from @references/workflows/do.md end-to-end.
Route user intent to the best GSD command and invoke it.
</process>
