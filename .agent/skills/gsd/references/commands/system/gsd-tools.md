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
Commands: state, roadmap, requirements, phase, milestone, todo, workstream,
find-phase, resolve-model, commit, verify, template, init, check-commit,
stats, audit-uat, uat, agent-skills, phases, docs-init, scan-sessions,
extract-messages, profile-sample, write-profile, generate-antigravity-profile,
generate-antigravity-md, history-digest, progress, scaffold, state-snapshot
  Run with gsd:help <command> for detailed usage.

### Example
To analyze the roadmap:
`node .agent/skills/gsd/bin/gsd-tools.cjs roadmap analyze`
</process>
