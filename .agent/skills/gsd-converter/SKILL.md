---
name: gsd-converter
description: "A tool for converting standard GSD (Get Shit Done) installations into the Antigravity Skill format. Use this skill when you want to migrate `.claude/gsd` commands, agents, and templates into a portable, spec-driven skill structure for Claude Code."
---

# GSD to Antigravity Skill Converter

This skill provides the logic and resources to package a locally installed GSD system into a structured Antigravity Skill.

## Why Convert?
1. **Portability**: Skills can be shared and loaded across different projects more easily than local `.claude` commands.
2. **Spec-Driven**: Leverages the Antigravity spec-driven coding system for better reliability.
3. **Organized**: Separates commands, documentation, workflows, and templates into clear directories.

## Conversion Workflow

1. **Cleanup**: Deletes existing `.agent/skills/gsd/` folder to ensure a clean slate.

2. **Installation**: Runs `npx get-shit-done-cc --claude --local --force-statusline` to fetch/refresh the source files in `.claude/`.

3. **Detection**: The skill locates the fresh GSD files:
   - Commands: `.claude/commands/gsd/`
   - Docs/Workflows: `.claude/get-shit-done/`
   - Agents: `.claude/agents/`

4. **Initialization**: Re-creates the target skill structure in `.agent/skills/gsd/`.

5. **Migration**:
   - Copies command markdown files to `references/commands/`.
   - Copies reference docs to `references/docs/`.
   - Copies workflows to `references/workflows/`.
   - Copies agents to `references/agents/`.
   - Copies templates to `assets/templates/`.

6. **Refactoring**:
   - Rewrites file inclusion paths (e.g., `@./.claude/...`) to the new skill-relative format (e.g., `@references/...`).
   - Updates `Task()` prompt paths for subagents.
   - **Rebranding**: Automatically converts "Claude" and "Claude Code" mentions to "Antigravity" throughout all migrated files.

7. **Optimization & Enhancement** (gsd-tools.cjs):
    - Runs `optimize-gsd-tools.cjs` to apply DRY refactoring and **injection of advanced features**:
      - Converts 4-space indentation to 2-space + LF line endings (~25KB savings).
      - Condenses the 124-line header comment to 12 lines.
      - **Injected Feature: Smart Inclusions**: Adds `parseIncludeFlag()`, `applyIncludes()`, and `buildPhaseBase()` to handle the `--include` flag.
      - **Injected Feature: Artifact Discovery**: Adds `discoverPhaseArtifacts()` for automated lookup of phase documents.
      - **Injected Feature: Model Profiles**: Adds `MODEL_PROFILES` for optimized model selection.
      - Refactors existing commands to utilize these new helper functions.

8. **Packaging**: Generates a comprehensive `SKILL.md` using the `assets/gsd_skill_template.md` template, ensuring compliance with skill-developer best practices.

## Usage

Run the conversion script:
```bash
python .agent/skills/gsd-converter/scripts/convert.py <target-skill-name>
```

Refer to `references/mapping.md` for details on how paths are translated.
