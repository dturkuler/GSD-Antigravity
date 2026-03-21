---
name: gsd
version: 1.27.0
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
- `gsd:add-backlog`
- `gsd:add-phase`
- `gsd:add-tests`
- `gsd:add-todo`
- `gsd:audit-milestone`
- `gsd:audit-uat`
- `gsd:autonomous`
- `gsd:check-todos`
- `gsd:cleanup`
- `gsd:complete-milestone`
- `gsd:debug`
- `gsd:discuss-phase`
- `gsd:do`
- `gsd:execute-phase`
- `gsd:fast`
- `gsd:gsd-tools`
- `gsd:health`
- `gsd:help`
- `gsd:insert-phase`
- `gsd:join-discord`
- `gsd:list-phase-assumptions`
- `gsd:map-codebase`
- `gsd:new-milestone`
- `gsd:new-project`
- `gsd:next`
- `gsd:note`
- `gsd:pause-work`
- `gsd:plan-milestone-gaps`
- `gsd:plan-phase`
- `gsd:plant-seed`
- `gsd:pr-branch`
- `gsd:profile-user`
- `gsd:progress`
- `gsd:quick`
- `gsd:reapply-patches`
- `gsd:remove-phase`
- `gsd:research-phase`
- `gsd:resume-work`
- `gsd:review-backlog`
- `gsd:review`
- `gsd:session-report`
- `gsd:set-profile`
- `gsd:settings`
- `gsd:ship`
- `gsd:stats`
- `gsd:thread`
- `gsd:ui-phase`
- `gsd:ui-review`
- `gsd:update`
- `gsd:validate-phase`
- `gsd:verify-work`

## System Overview

### 1. Phase-Based Development
The system enforces distinct phases. You typically cannot execute until you have planned.
- **Plan**: Define specs, tasks, and acceptance criteria. Output is a plan artifact.
- **Execute**: Write code to satisfy the specs. Driven by the plan artifact.
- **Verify**: Confirm the code meets criteria.

### 2. Available Commands
The following slash commands are available in this skill. Use them to drive the GSD process:

- **[`gsd:add-backlog`](references/commands/add-backlog.md)**: Add an idea to the backlog parking lot (999.x numbering)
- **[`gsd:add-phase`](references/commands/add-phase.md)**: Add phase to end of current milestone in roadmap
- **[`gsd:add-tests`](references/commands/add-tests.md)**: Generate tests for a completed phase based on UAT criteria and implementation
- **[`gsd:add-todo`](references/commands/add-todo.md)**: Capture idea or task as todo from current conversation context
- **[`gsd:audit-milestone`](references/commands/audit-milestone.md)**: Audit milestone completion against original intent before archiving
- **[`gsd:audit-uat`](references/commands/audit-uat.md)**: Cross-phase audit of all outstanding UAT and verification items
- **[`gsd:autonomous`](references/commands/autonomous.md)**: Run all remaining phases autonomously — discuss→plan→execute per phase
- **[`gsd:check-todos`](references/commands/check-todos.md)**: List pending todos and select one to work on
- **[`gsd:cleanup`](references/commands/cleanup.md)**: Archive accumulated phase directories from completed milestones
- **[`gsd:complete-milestone`](references/commands/complete-milestone.md)**: Archive completed milestone and prepare for next version
- **[`gsd:debug`](references/commands/debug.md)**: Systematic debugging with persistent state across context resets
- **[`gsd:discuss-phase`](references/commands/discuss-phase.md)**: Gather phase context through adaptive questioning before planning. Use --auto to skip interactive questions (Antigravity picks recommended defaults).
- **[`gsd:do`](references/commands/do.md)**: Route freeform text to the right GSD command automatically
- **[`gsd:execute-phase`](references/commands/execute-phase.md)**: Execute all plans in a phase with wave-based parallelization
- **[`gsd:fast`](references/commands/fast.md)**: Execute a trivial task inline — no subagents, no planning overhead
- **[`gsd:gsd-tools`](references/commands/gsd-tools.md)**: Direct access to GSD internal CLI tools for atomic operations (state, roadmap, phase, config, etc.)
- **[`gsd:health`](references/commands/health.md)**: Diagnose planning directory health and optionally repair issues
- **[`gsd:help`](references/commands/help.md)**: Show available GSD commands and usage guide
- **[`gsd:insert-phase`](references/commands/insert-phase.md)**: Insert urgent work as decimal phase (e.g., 72.1) between existing phases
- **[`gsd:join-discord`](references/commands/join-discord.md)**: Join the GSD Discord community
- **[`gsd:list-phase-assumptions`](references/commands/list-phase-assumptions.md)**: Surface Antigravity's assumptions about a phase approach before planning
- **[`gsd:map-codebase`](references/commands/map-codebase.md)**: Analyze codebase with parallel mapper agents to produce .planning/codebase/ documents
- **[`gsd:new-milestone`](references/commands/new-milestone.md)**: Start a new milestone cycle — update PROJECT.md and route to requirements
- **[`gsd:new-project`](references/commands/new-project.md)**: Initialize a new project with deep context gathering and PROJECT.md
- **[`gsd:next`](references/commands/next.md)**: Automatically advance to the next logical step in the GSD workflow
- **[`gsd:note`](references/commands/note.md)**: Zero-friction idea capture. Append, list, or promote notes to todos.
- **[`gsd:pause-work`](references/commands/pause-work.md)**: Create context handoff when pausing work mid-phase
- **[`gsd:plan-milestone-gaps`](references/commands/plan-milestone-gaps.md)**: Create phases to close all gaps identified by milestone audit
- **[`gsd:plan-phase`](references/commands/plan-phase.md)**: Create detailed phase plan (PLAN.md) with verification loop
- **[`gsd:plant-seed`](references/commands/plant-seed.md)**: Capture a forward-looking idea with trigger conditions — surfaces automatically at the right milestone
- **[`gsd:pr-branch`](references/commands/pr-branch.md)**: Create a clean PR branch by filtering out .planning/ commits — ready for code review
- **[`gsd:profile-user`](references/commands/profile-user.md)**: Generate developer behavioral profile and create Antigravity-discoverable artifacts
- **[`gsd:progress`](references/commands/progress.md)**: Check project progress, show context, and route to next action (execute or plan)
- **[`gsd:quick`](references/commands/quick.md)**: Execute a quick task with GSD guarantees (atomic commits, state tracking) but skip optional agents
- **[`gsd:reapply-patches`](references/commands/reapply-patches.md)**: Reapply local modifications after a GSD update
- **[`gsd:remove-phase`](references/commands/remove-phase.md)**: Remove a future phase from roadmap and renumber subsequent phases
- **[`gsd:research-phase`](references/commands/research-phase.md)**: Research how to implement a phase (standalone - usually use /gsd:plan-phase instead)
- **[`gsd:resume-work`](references/commands/resume-work.md)**: Resume work from previous session with full context restoration
- **[`gsd:review-backlog`](references/commands/review-backlog.md)**: Review and promote backlog items to active milestone
- **[`gsd:review`](references/commands/review.md)**: Request cross-AI peer review of phase plans from external AI CLIs
- **[`gsd:session-report`](references/commands/session-report.md)**: Generate a session report with token usage estimates, work summary, and outcomes
- **[`gsd:set-profile`](references/commands/set-profile.md)**: Switch model profile for GSD agents (quality/balanced/budget/inherit)
- **[`gsd:settings`](references/commands/settings.md)**: Configure GSD workflow toggles and model profile
- **[`gsd:ship`](references/commands/ship.md)**: Create PR, run review, and prepare for merge after verification passes
- **[`gsd:stats`](references/commands/stats.md)**: Display project statistics — phases, plans, requirements, git metrics, and timeline
- **[`gsd:thread`](references/commands/thread.md)**: Manage persistent context threads for cross-session work
- **[`gsd:ui-phase`](references/commands/ui-phase.md)**: Generate UI design contract (UI-SPEC.md) for frontend phases
- **[`gsd:ui-review`](references/commands/ui-review.md)**: Retroactive 6-pillar visual audit of implemented frontend code
- **[`gsd:update`](references/commands/update.md)**: Update GSD to latest version with changelog display
- **[`gsd:validate-phase`](references/commands/validate-phase.md)**: Retroactively audit and fill Nyquist validation gaps for a completed phase
- **[`gsd:verify-work`](references/commands/verify-work.md)**: Validate built features through conversational UAT

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
*Generated by gsd-converter on 2026-03-21*
