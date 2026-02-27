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
`node .agent/skills/gsd/bin/gsd-tools.cjs <command> [args]`

### Available Commands:
{gsd_tools_help}

### Example
To analyze the roadmap:
`node .agent/skills/gsd/bin/gsd-tools.cjs roadmap analyze`
</process>
