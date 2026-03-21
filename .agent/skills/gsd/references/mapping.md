# Path Mapping Reference

When converting from a standard GSD installation to an Antigravity Skill, paths are refactored to ensure the skill is self-contained and portable.

## Directory Mapping

| Source GSD Path | Target Skill Path | Purpose |
|-----------------|-------------------|---------|
| `.antigravity/commands/gsd/` | `references/commands/` | Interactive slash commands |
| `.antigravity/get-shit-done/references/` | `references/docs/` | Static domain knowledge and guides |
references/workflows/` | `references/workflows/` | Multi-step procedural logic |
references/agents/` | `references/agents/` | Specialized sub-agent system prompts |
assets/templates/` | `assets/templates/` | File boilerplate (PROJECT.md, etc.) |

## String Replacements (Regex)

The conversion script performs the following replacements within `.md` and `.json` files:

1. **File Inclusion Syntax (`@`)**
   - `@references/commands/` -> `@references/commands/`
   - `@references/docs/` -> `@references/docs/`
   - `@references/workflows/` -> `@references/workflows/`
   - `@assets/templates/` -> `@assets/templates/`
   - `@references/agents/` -> `@references/agents/`

2. **Programmatic Paths (e.g., in `Task()` calls)**
references/agents/` -> `references/agents/`
assets/templates/` -> `assets/templates/`
references/workflows/` -> `references/workflows/`

## Project Context
References to `@.planning/` are **preserved**, as these refer to the active project's local planning directory, not the skill's own resources.
