---
name: gsd:gsd-tools
description: Direct access to GSD internal CLI tools for atomic operations (state, roadmap, phase, config, etc.)
allowed-tools:
  - run_command
---

<objective>
Provide direct execution of the `gsd-tools.cjs` CLI for low-level or atomic operations that aren't wrapped in high-level workflows.
</objective>

<execution_context>
.agent/skills/gsd/bin/gsd-tools.cjs
</execution_context>

<process>
Execute the requested `gsd-tools` command using Node.js.

### Usage
**CRITICAL**: `gsd-tools` is NOT globally installed. You MUST ALWAYS invoke it using the exact `node` path below. Never run `gsd-tools` alone.
`node .agent/skills/gsd/bin/gsd-tools.cjs <command> [args]`

### Available Commands:
Commands: state, resolve-model, find-phase, commit, verify-summary, generate-slug,
current-timestamp, list-todos, verify-path-exists, config-ensure-section, config-set,
config-get, history-digest, phases, roadmap, requirements, phase, milestone,
validate, progress, todo, scaffold, phase-plan-index, state-snapshot, summary-extract,
websearch, frontmatter, verify, template, init
Run with gsd:help command args for detailed usage of each command.

### Example
To analyze the roadmap:
`node .agent/skills/gsd/bin/gsd-tools.cjs roadmap analyze`
</process>
