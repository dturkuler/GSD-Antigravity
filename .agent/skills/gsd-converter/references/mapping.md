# Path Mapping Reference

When converting from a standard GSD installation to an Antigravity Skill, paths are refactored to ensure the skill is self-contained and portable.

## Directory Mapping

| Source GSD Path | Target Skill Path | Purpose |
|-----------------|-------------------|---------|
| `.claude/commands/gsd/` | `references/commands/` | Interactive slash commands |
| `.claude/get-shit-done/references/` | `references/docs/` | Static domain knowledge and guides |
| `.claude/get-shit-done/workflows/` | `references/workflows/` | Multi-step procedural logic |
| `.claude/agents/` | `references/agents/` | Specialized sub-agent system prompts |
| `.claude/get-shit-done/templates/` | `assets/templates/` | File boilerplate (PROJECT.md, etc.) |

## String Replacements (Regex)

The conversion script performs the following replacements within `.md` and `.json` files:

1. **File Inclusion Syntax (`@`)**
   - `@./.claude/commands/gsd/` -> `@references/commands/`
   - `@./.claude/get-shit-done/references/` -> `@references/docs/`
   - `@./.claude/get-shit-done/workflows/` -> `@references/workflows/`
   - `@./.claude/get-shit-done/templates/` -> `@assets/templates/`
   - `@./.claude/agents/` -> `@references/agents/`

2. **Programmatic Paths (e.g., in `Task()` calls)**
   - `./.claude/agents/` -> `references/agents/`
   - `./.claude/get-shit-done/templates/` -> `assets/templates/`
   - `./.claude/get-shit-done/workflows/` -> `references/workflows/`

## Project Context
References to `@.planning/` are **preserved**, as these refer to the active project's local planning directory, not the skill's own resources.
