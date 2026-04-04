---
name: gsd
version: 1.32.0
description: "Antigravity GSD (Get Stuff Done) - A spec-driven hierarchical planning and execution system. Triggers on project planning, phase management, and GSD slash commands."
---

# GSD

## Purpose

The Antigravity GSD (Get Stuff Done) skill implements a rigid, spec-driven hierarchy for managing software development tasks. It enforces a separation of concerns between Planning, Execution, and Verification phases to reduce context switching and improve reliability.

## When to Use This Skill

This skill should be used when:
1.  **Starting a Project**: Initializing a new codebase or feature set with a clear structure.
2.  **Planning Work**: Breaking down vague requirements into actionable, verified specifications.
3.  **Executing Tasks**: Implementing code based on approved specs without context switching.
4.  **Managing State**: Tracking progress through defined phases (Plan -> Execute -> Verify).

**Triggers:**
- Keywords: "plan phase", "execute phase", "new project spec", "gsd", "gsd-tools"
- Commands: 
- `gsd:gsd-add-backlog`
- `gsd:gsd-add-phase`
- `gsd:gsd-add-tests`
- `gsd:gsd-add-todo`
- `gsd:gsd-analyze-dependencies`
- `gsd:gsd-audit-milestone`
- `gsd:gsd-audit-uat`
- `gsd:gsd-autonomous`
- `gsd:gsd-check-todos`
- `gsd:gsd-cleanup`
- `gsd:gsd-complete-milestone`
- `gsd:gsd-debug`
- `gsd:gsd-discuss-phase`
- `gsd:gsd-do`
- `gsd:gsd-docs-update`
- `gsd:gsd-execute-phase`
- `gsd:gsd-fast`
- `gsd:gsd-forensics`
- `gsd:gsd-health`
- `gsd:gsd-help`
- `gsd:gsd-insert-phase`
- `gsd:gsd-join-discord`
- `gsd:gsd-list-phase-assumptions`
- `gsd:gsd-list-workspaces`
- `gsd:gsd-manager`
- `gsd:gsd-map-codebase`
- `gsd:gsd-milestone-summary`
- `gsd:gsd-new-milestone`
- `gsd:gsd-new-project`
- `gsd:gsd-new-workspace`
- `gsd:gsd-next`
- `gsd:gsd-note`
- `gsd:gsd-pause-work`
- `gsd:gsd-plan-milestone-gaps`
- `gsd:gsd-plan-phase`
- `gsd:gsd-plant-seed`
- `gsd:gsd-pr-branch`
- `gsd:gsd-profile-user`
- `gsd:gsd-progress`
- `gsd:gsd-quick`
- `gsd:gsd-reapply-patches`
- `gsd:gsd-remove-phase`
- `gsd:gsd-remove-workspace`
- `gsd:gsd-research-phase`
- `gsd:gsd-resume-work`
- `gsd:gsd-review-backlog`
- `gsd:gsd-review`
- `gsd:gsd-secure-phase`
- `gsd:gsd-session-report`
- `gsd:gsd-set-profile`
- `gsd:gsd-settings`
- `gsd:gsd-ship`
- `gsd:gsd-stats`
- `gsd:gsd-thread`
- `gsd:gsd-tools`
- `gsd:gsd-ui-phase`
- `gsd:gsd-ui-review`
- `gsd:gsd-update`
- `gsd:gsd-validate-phase`
- `gsd:gsd-verify-work`
- `gsd:gsd-workstreams`

## System Overview

### 1. Phase-Based Development
The system enforces distinct phases. You typically cannot execute until you have planned.
- **Plan**: Define specs, tasks, and acceptance criteria. Output is a plan artifact.
- **Execute**: Write code to satisfy the specs. Driven by the plan artifact.
- **Verify**: Confirm the code meets criteria.

### 2. Available Commands
The following slash commands are available in this skill. Use them to drive the GSD process:

- **[`gsd:gsd-add-backlog`](references/commands/gsd-add-backlog.md)**: Add an idea to the backlog parking lot (999.x numbering)
- **[`gsd:gsd-add-phase`](references/commands/gsd-add-phase.md)**: Add phase to end of current milestone in roadmap
- **[`gsd:gsd-add-tests`](references/commands/gsd-add-tests.md)**: Generate tests for a completed phase based on UAT criteria and implementation
- **[`gsd:gsd-add-todo`](references/commands/gsd-add-todo.md)**: Capture idea or task as todo from current conversation context
- **[`gsd:gsd-analyze-dependencies`](references/commands/gsd-analyze-dependencies.md)**: Analyze phase dependencies and suggest Depends on entries for ROADMAP.md
- **[`gsd:gsd-audit-milestone`](references/commands/gsd-audit-milestone.md)**: Audit milestone completion against original intent before archiving
- **[`gsd:gsd-audit-uat`](references/commands/gsd-audit-uat.md)**: Cross-phase audit of all outstanding UAT and verification items
- **[`gsd:gsd-autonomous`](references/commands/gsd-autonomous.md)**: Run all remaining phases autonomously — discuss→plan→execute per phase
- **[`gsd:gsd-check-todos`](references/commands/gsd-check-todos.md)**: List pending todos and select one to work on
- **[`gsd:gsd-cleanup`](references/commands/gsd-cleanup.md)**: Archive accumulated phase directories from completed milestones
- **[`gsd:gsd-complete-milestone`](references/commands/gsd-complete-milestone.md)**: Archive completed milestone and prepare for next version
- **[`gsd:gsd-debug`](references/commands/gsd-debug.md)**: Systematic debugging with persistent state across context resets
- **[`gsd:gsd-discuss-phase`](references/commands/gsd-discuss-phase.md)**: Gather phase context through adaptive questioning before planning. Use --auto to skip interactive questions (Antigravity picks recommended defaults). Use --chain for interactive discuss followed by automatic plan+execute. Use --power for bulk question generation into a file-based UI (answer at your own pace).
- **[`gsd:gsd-do`](references/commands/gsd-do.md)**: Route freeform text to the right GSD command automatically
- **[`gsd:gsd-docs-update`](references/commands/gsd-docs-update.md)**: Generate or update project documentation verified against the codebase
- **[`gsd:gsd-execute-phase`](references/commands/gsd-execute-phase.md)**: Execute all plans in a phase with wave-based parallelization
- **[`gsd:gsd-fast`](references/commands/gsd-fast.md)**: Execute a trivial task inline — no subagents, no planning overhead
- **[`gsd:gsd-forensics`](references/commands/gsd-forensics.md)**: Post-mortem investigation for failed GSD workflows — analyzes git history, artifacts, and state to diagnose what went wrong
- **[`gsd:gsd-health`](references/commands/gsd-health.md)**: Diagnose planning directory health and optionally repair issues
- **[`gsd:gsd-help`](references/commands/gsd-help.md)**: Show available GSD commands and usage guide
- **[`gsd:gsd-insert-phase`](references/commands/gsd-insert-phase.md)**: Insert urgent work as decimal phase (e.g., 72.1) between existing phases
- **[`gsd:gsd-join-discord`](references/commands/gsd-join-discord.md)**: Join the GSD Discord community
- **[`gsd:gsd-list-phase-assumptions`](references/commands/gsd-list-phase-assumptions.md)**: Surface Antigravity's assumptions about a phase approach before planning
- **[`gsd:gsd-list-workspaces`](references/commands/gsd-list-workspaces.md)**: List active GSD workspaces and their status
- **[`gsd:gsd-manager`](references/commands/gsd-manager.md)**: Interactive command center for managing multiple phases from one terminal
- **[`gsd:gsd-map-codebase`](references/commands/gsd-map-codebase.md)**: Analyze codebase with parallel mapper agents to produce .planning/codebase/ documents
- **[`gsd:gsd-milestone-summary`](references/commands/gsd-milestone-summary.md)**: Generate a comprehensive project summary from milestone artifacts for team onboarding and review
- **[`gsd:gsd-new-milestone`](references/commands/gsd-new-milestone.md)**: Start a new milestone cycle — update PROJECT.md and route to requirements
- **[`gsd:gsd-new-project`](references/commands/gsd-new-project.md)**: Initialize a new project with deep context gathering and PROJECT.md
- **[`gsd:gsd-new-workspace`](references/commands/gsd-new-workspace.md)**: Create an isolated workspace with repo copies and independent .planning/
- **[`gsd:gsd-next`](references/commands/gsd-next.md)**: Automatically advance to the next logical step in the GSD workflow
- **[`gsd:gsd-note`](references/commands/gsd-note.md)**: Zero-friction idea capture. Append, list, or promote notes to todos.
- **[`gsd:gsd-pause-work`](references/commands/gsd-pause-work.md)**: Create context handoff when pausing work mid-phase
- **[`gsd:gsd-plan-milestone-gaps`](references/commands/gsd-plan-milestone-gaps.md)**: Create phases to close all gaps identified by milestone audit
- **[`gsd:gsd-plan-phase`](references/commands/gsd-plan-phase.md)**: Create detailed phase plan (PLAN.md) with verification loop
- **[`gsd:gsd-plant-seed`](references/commands/gsd-plant-seed.md)**: Capture a forward-looking idea with trigger conditions — surfaces automatically at the right milestone
- **[`gsd:gsd-pr-branch`](references/commands/gsd-pr-branch.md)**: Create a clean PR branch by filtering out .planning/ commits — ready for code review
- **[`gsd:gsd-profile-user`](references/commands/gsd-profile-user.md)**: Generate developer behavioral profile and create Antigravity-discoverable artifacts
- **[`gsd:gsd-progress`](references/commands/gsd-progress.md)**: Check project progress, show context, and route to next action (execute or plan)
- **[`gsd:gsd-quick`](references/commands/gsd-quick.md)**: Execute a quick task with GSD guarantees (atomic commits, state tracking) but skip optional agents
- **[`gsd:gsd-reapply-patches`](references/commands/gsd-reapply-patches.md)**: Reapply local modifications after a GSD update
- **[`gsd:gsd-remove-phase`](references/commands/gsd-remove-phase.md)**: Remove a future phase from roadmap and renumber subsequent phases
- **[`gsd:gsd-remove-workspace`](references/commands/gsd-remove-workspace.md)**: Remove a GSD workspace and clean up worktrees
- **[`gsd:gsd-research-phase`](references/commands/gsd-research-phase.md)**: Research how to implement a phase (standalone - usually use /gsd-plan-phase instead)
- **[`gsd:gsd-resume-work`](references/commands/gsd-resume-work.md)**: Resume work from previous session with full context restoration
- **[`gsd:gsd-review-backlog`](references/commands/gsd-review-backlog.md)**: Review and promote backlog items to active milestone
- **[`gsd:gsd-review`](references/commands/gsd-review.md)**: Request cross-AI peer review of phase plans from external AI CLIs
- **[`gsd:gsd-secure-phase`](references/commands/gsd-secure-phase.md)**: Retroactively verify threat mitigations for a completed phase
- **[`gsd:gsd-session-report`](references/commands/gsd-session-report.md)**: Generate a session report with token usage estimates, work summary, and outcomes
- **[`gsd:gsd-set-profile`](references/commands/gsd-set-profile.md)**: Switch model profile for GSD agents (quality/balanced/budget/inherit)
- **[`gsd:gsd-settings`](references/commands/gsd-settings.md)**: Configure GSD workflow toggles and model profile
- **[`gsd:gsd-ship`](references/commands/gsd-ship.md)**: Create PR, run review, and prepare for merge after verification passes
- **[`gsd:gsd-stats`](references/commands/gsd-stats.md)**: Display project statistics — phases, plans, requirements, git metrics, and timeline
- **[`gsd:gsd-thread`](references/commands/gsd-thread.md)**: Manage persistent context threads for cross-session work
- **[`gsd:gsd-tools`](references/commands/gsd-tools.md)**: Direct access to GSD internal CLI tools for atomic operations (state, roadmap, phase, config, etc.)
- **[`gsd:gsd-ui-phase`](references/commands/gsd-ui-phase.md)**: Generate UI design contract (UI-SPEC.md) for frontend phases
- **[`gsd:gsd-ui-review`](references/commands/gsd-ui-review.md)**: Retroactive 6-pillar visual audit of implemented frontend code
- **[`gsd:gsd-update`](references/commands/gsd-update.md)**: Update GSD to latest version with changelog display
- **[`gsd:gsd-validate-phase`](references/commands/gsd-validate-phase.md)**: Retroactively audit and fill Nyquist validation gaps for a completed phase
- **[`gsd:gsd-verify-work`](references/commands/gsd-verify-work.md)**: Validate built features through conversational UAT
- **[`gsd:gsd-workstreams`](references/commands/gsd-workstreams.md)**: Manage parallel workstreams — list, create, switch, status, progress, complete, and resume

### 3. Directory Structure
The skill uses a standardized directory structure for portability and organization:
- `references/commands/`: Executable slash command definitions.
- `references/agents/`: Specialized agent prompts and personas used by the commands.
- `references/workflows/`: Step-by-step standard operating procedures and guidelines.
- `references/docs/`: Contextual documentation and guides on the GSD philosophy.
- `assets/templates/`: Reusable file structures for plans, tasks, and reports.

## Reference Files

For detailed instructions, consult the following resources:

### [Commands Reference](references/commands/)
List of all available slash commands and their detailed arguments. Look here to understand how to invoke specific GSD actions.

### [Workflow Guides](references/workflows/)
Standard procedures for common development tasks. These documents describe the "how-to" for the GSD process.

### [Agent Definitions](references/agents/)
Capabilities and personas of the specialized agents. Useful for understanding who does what in the multi-agent setup.

### [Documentation](references/docs/)
General documentation on the GSD philosophy, usage patterns, and configuration.

## Best Practices

1.  **Follow the Sequence**: Do not skip the Planning phase. A good plan saves hours of debugging.
2.  **Use Templates**: Leverage `assets/templates/` for consistent file structures.
3.  **Update State**: Keep the project state synchronized using `/gsd:progress`.
4.  **One Context**: Keep separate contexts (channels/threads) for Planning vs Execution to avoid contamination.
5.  **CLI Invocation**: `gsd-tools` is **NOT** a global command. Always invoke it with the full node path: `node .agent/skills/gsd/bin/gsd-tools.cjs <command> [args]`. Never run `gsd-tools` bare.

---
*Generated by gsd-converter on 2026-04-05*
