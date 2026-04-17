---
name: gsd
version: 1.37.1
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
- `gsd:ai-integration-phase`
- `gsd:analyze-dependencies`
- `gsd:audit-fix`
- `gsd:audit-milestone`
- `gsd:audit-uat`
- `gsd:autonomous`
- `gsd:check-todos`
- `gsd:cleanup`
- `gsd:code-review`
- `gsd:code-review-fix`
- `gsd:complete-milestone`
- `gsd:debug`
- `gsd:discuss-phase`
- `gsd:do`
- `gsd:docs-update`
- `gsd:eval-review`
- `gsd:execute-phase`
- `gsd:explore`
- `gsd:extract_learnings`
- `gsd:fast`
- `gsd:forensics`
- `gsd:from-gsd2`
- `gsd:graphify`
- `gsd:gsd-tools`
- `gsd:health`
- `gsd:help`
- `gsd:import`
- `gsd:inbox`
- `gsd:insert-phase`
- `gsd:intel`
- `gsd:join-discord`
- `gsd:list-phase-assumptions`
- `gsd:list-workspaces`
- `gsd:manager`
- `gsd:map-codebase`
- `gsd:milestone-summary`
- `gsd:new-milestone`
- `gsd:new-project`
- `gsd:new-workspace`
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
- `gsd:remove-workspace`
- `gsd:research-phase`
- `gsd:resume-work`
- `gsd:review`
- `gsd:review-backlog`
- `gsd:scan`
- `gsd:secure-phase`
- `gsd:session-report`
- `gsd:set-profile`
- `gsd:settings`
- `gsd:ship`
- `gsd:sketch`
- `gsd:sketch-wrap-up`
- `gsd:spec-phase`
- `gsd:spike`
- `gsd:spike-wrap-up`
- `gsd:stats`
- `gsd:thread`
- `gsd:ui-phase`
- `gsd:ui-review`
- `gsd:undo`
- `gsd:update`
- `gsd:validate-phase`
- `gsd:verify-work`
- `gsd:workstreams`

## System Overview

### 1. Phase-Based Development
The system enforces distinct phases. You typically cannot execute until you have planned.
- **Plan**: Define specs, tasks, and acceptance criteria. Output is a plan artifact.
- **Execute**: Write code to satisfy the specs. Driven by the plan artifact.
- **Verify**: Confirm the code meets criteria.

### 2. Available Commands
The following slash commands are available in this skill. Use them to drive the GSD process:


### Atomic Commands
- **[`gsd:add-todo`](references/commands/atomic/add-todo.md)**: Capture idea or task as todo from current conversation context
- **[`gsd:check-todos`](references/commands/atomic/check-todos.md)**: List pending todos and select one to work on
- **[`gsd:cleanup`](references/commands/atomic/cleanup.md)**: Archive accumulated phase directories from completed milestones
- **[`gsd:do`](references/commands/atomic/do.md)**: Route freeform text to the right GSD command automatically
- **[`gsd:help`](references/commands/atomic/help.md)**: Show available GSD commands and usage guide
- **[`gsd:join-discord`](references/commands/atomic/join-discord.md)**: Join the GSD Discord community
- **[`gsd:note`](references/commands/atomic/note.md)**: Zero-friction idea capture. Append, list, or promote notes to todos.
- **[`gsd:session-report`](references/commands/atomic/session-report.md)**: Generate a session report with token usage estimates, work summary, and outcomes
- **[`gsd:ship`](references/commands/atomic/ship.md)**: Create PR, run review, and prepare for merge after verification passes
- **[`gsd:stats`](references/commands/atomic/stats.md)**: Display project statistics — phases, plans, requirements, git metrics, and timeline
- **[`gsd:thread`](references/commands/atomic/thread.md)**: Manage persistent context threads for cross-session work
- **[`gsd:undo`](references/commands/atomic/undo.md)**: Safe git revert. Roll back phase or plan commits using the phase manifest with dependency checks.

### Milestone Commands
- **[`gsd:add-backlog`](references/commands/milestone/add-backlog.md)**: Add an idea to the backlog parking lot (999.x numbering)
- **[`gsd:audit-milestone`](references/commands/milestone/audit-milestone.md)**: Audit milestone completion against original intent before archiving
- **[`gsd:complete-milestone`](references/commands/milestone/complete-milestone.md)**: Archive completed milestone and prepare for next version
- **[`gsd:milestone-summary`](references/commands/milestone/milestone-summary.md)**: Generate a comprehensive project summary from milestone artifacts for team onboarding and review
- **[`gsd:new-milestone`](references/commands/milestone/new-milestone.md)**: Start a new milestone cycle — update PROJECT.md and route to requirements
- **[`gsd:plan-milestone-gaps`](references/commands/milestone/plan-milestone-gaps.md)**: Create phases to close all gaps identified by milestone audit
- **[`gsd:plant-seed`](references/commands/milestone/plant-seed.md)**: Capture a forward-looking idea with trigger conditions — surfaces automatically at the right milestone
- **[`gsd:review-backlog`](references/commands/milestone/review-backlog.md)**: Review and promote backlog items to active milestone

### Misc Commands
- **[`gsd:ai-integration-phase`](references/commands/misc/ai-integration-phase.md)**: Generate AI design contract (AI-SPEC.md) for phases that involve building AI systems — framework selection, implementation guidance from official docs, and evaluation strategy
- **[`gsd:audit-fix`](references/commands/misc/audit-fix.md)**: Autonomous audit-to-fix pipeline — find issues, classify, fix, test, commit
- **[`gsd:audit-uat`](references/commands/misc/audit-uat.md)**: Cross-phase audit of all outstanding UAT and verification items
- **[`gsd:eval-review`](references/commands/misc/eval-review.md)**: Retroactively audit an executed AI phase's evaluation coverage — scores each eval dimension as COVERED/PARTIAL/MISSING and produces an actionable EVAL-REVIEW.md with remediation plan
- **[`gsd:extract_learnings`](references/commands/misc/extract_learnings.md)**: Extract decisions, lessons, patterns, and surprises from completed phase artifacts
- **[`gsd:from-gsd2`](references/commands/misc/from-gsd2.md)**: Import a GSD-2 (.gsd/) project back to GSD v1 (.planning/) format
- **[`gsd:graphify`](references/commands/misc/graphify.md)**: Build, query, and inspect the project knowledge graph in .planning/graphs/
- **[`gsd:inbox`](references/commands/misc/inbox.md)**: Triage and review all open GitHub issues and PRs against project templates and contribution guidelines
- **[`gsd:next`](references/commands/misc/next.md)**: Automatically advance to the next logical step in the GSD workflow
- **[`gsd:progress`](references/commands/misc/progress.md)**: Check project progress, show context, and route to next action (execute or plan). Use --forensic to append a 6-check integrity audit after the standard report.
- **[`gsd:sketch-wrap-up`](references/commands/misc/sketch-wrap-up.md)**: Package sketch design findings into a persistent project skill for future build conversations
- **[`gsd:sketch`](references/commands/misc/sketch.md)**: Rapidly sketch UI/design ideas using throwaway HTML mockups with multi-variant exploration
- **[`gsd:spec-phase`](references/commands/misc/spec-phase.md)**: Socratic spec refinement — clarify WHAT a phase delivers with ambiguity scoring before discuss-phase. Produces a SPEC.md with falsifiable requirements locked before implementation decisions begin.
- **[`gsd:spike-wrap-up`](references/commands/misc/spike-wrap-up.md)**: Package spike findings into a persistent project skill for future build conversations
- **[`gsd:spike`](references/commands/misc/spike.md)**: Rapidly spike an idea with throwaway experiments to validate feasibility before planning
- **[`gsd:verify-work`](references/commands/misc/verify-work.md)**: Validate built features through conversational UAT

### Phase Commands
- **[`gsd:add-phase`](references/commands/phase/add-phase.md)**: Add phase to end of current milestone in roadmap
- **[`gsd:add-tests`](references/commands/phase/add-tests.md)**: Generate tests for a completed phase based on UAT criteria and implementation
- **[`gsd:discuss-phase`](references/commands/phase/discuss-phase.md)**: Gather phase context through adaptive questioning before planning. Use --all to skip area selection and discuss all gray areas interactively. Use --auto to skip interactive questions (Antigravity picks recommended defaults). Use --chain for interactive discuss followed by automatic plan+execute. Use --power for bulk question generation into a file-based UI (answer at your own pace).
- **[`gsd:execute-phase`](references/commands/phase/execute-phase.md)**: Execute all plans in a phase with wave-based parallelization
- **[`gsd:insert-phase`](references/commands/phase/insert-phase.md)**: Insert urgent work as decimal phase (e.g., 72.1) between existing phases
- **[`gsd:list-phase-assumptions`](references/commands/phase/list-phase-assumptions.md)**: Surface Antigravity's assumptions about a phase approach before planning
- **[`gsd:plan-phase`](references/commands/phase/plan-phase.md)**: Create detailed phase plan (PLAN.md) with verification loop
- **[`gsd:remove-phase`](references/commands/phase/remove-phase.md)**: Remove a future phase from roadmap and renumber subsequent phases
- **[`gsd:research-phase`](references/commands/phase/research-phase.md)**: Research how to implement a phase (standalone - usually use /gsd-plan-phase instead)
- **[`gsd:secure-phase`](references/commands/phase/secure-phase.md)**: Retroactively verify threat mitigations for a completed phase
- **[`gsd:ui-phase`](references/commands/phase/ui-phase.md)**: Generate UI design contract (UI-SPEC.md) for frontend phases
- **[`gsd:ui-review`](references/commands/phase/ui-review.md)**: Retroactive 6-pillar visual audit of implemented frontend code
- **[`gsd:validate-phase`](references/commands/phase/validate-phase.md)**: Retroactively audit and fill Nyquist validation gaps for a completed phase
- **[`gsd:workstreams`](references/commands/phase/workstreams.md)**: Manage parallel workstreams — list, create, switch, status, progress, complete, and resume

### Project Commands
- **[`gsd:analyze-dependencies`](references/commands/project/analyze-dependencies.md)**: Analyze phase dependencies and suggest Depends on entries for ROADMAP.md
- **[`gsd:explore`](references/commands/project/explore.md)**: Socratic ideation and idea routing — think through ideas before committing to plans
- **[`gsd:import`](references/commands/project/import.md)**: Ingest external plans with conflict detection against project decisions before writing anything.
- **[`gsd:intel`](references/commands/project/intel.md)**: Query, inspect, or refresh codebase intelligence files in .planning/intel/
- **[`gsd:list-workspaces`](references/commands/project/list-workspaces.md)**: List active GSD workspaces and their status
- **[`gsd:map-codebase`](references/commands/project/map-codebase.md)**: Analyze codebase with parallel mapper agents to produce .planning/codebase/ documents
- **[`gsd:new-project`](references/commands/project/new-project.md)**: Initialize a new project with deep context gathering and PROJECT.md
- **[`gsd:new-workspace`](references/commands/project/new-workspace.md)**: Create an isolated workspace with repo copies and independent .planning/
- **[`gsd:remove-workspace`](references/commands/project/remove-workspace.md)**: Remove a GSD workspace and clean up worktrees
- **[`gsd:scan`](references/commands/project/scan.md)**: Rapid codebase assessment — lightweight alternative to /gsd-map-codebase

### System Commands
- **[`gsd:autonomous`](references/commands/system/autonomous.md)**: Run all remaining phases autonomously — discuss→plan→execute per phase
- **[`gsd:code-review-fix`](references/commands/system/code-review-fix.md)**: Auto-fix issues found by code review in REVIEW.md. Spawns fixer agent, commits each fix atomically, produces REVIEW-FIX.md summary.
- **[`gsd:code-review`](references/commands/system/code-review.md)**: Review source files changed during a phase for bugs, security issues, and code quality problems
- **[`gsd:debug`](references/commands/system/debug.md)**: Systematic debugging with persistent state across context resets
- **[`gsd:docs-update`](references/commands/system/docs-update.md)**: Generate or update project documentation verified against the codebase
- **[`gsd:fast`](references/commands/system/fast.md)**: Execute a trivial task inline — no subagents, no planning overhead
- **[`gsd:forensics`](references/commands/system/forensics.md)**: Post-mortem investigation for failed GSD workflows — analyzes git history, artifacts, and state to diagnose what went wrong
- **[`gsd:gsd-tools`](references/commands/system/gsd-tools.md)**: Direct access to GSD internal CLI tools for atomic operations (state, roadmap, phase, config, etc.)
- **[`gsd:health`](references/commands/system/health.md)**: Diagnose planning directory health and optionally repair issues
- **[`gsd:manager`](references/commands/system/manager.md)**: Interactive command center for managing multiple phases from one terminal
- **[`gsd:pause-work`](references/commands/system/pause-work.md)**: Create context handoff when pausing work mid-phase
- **[`gsd:pr-branch`](references/commands/system/pr-branch.md)**: Create a clean PR branch by filtering out .planning/ commits — ready for code review
- **[`gsd:profile-user`](references/commands/system/profile-user.md)**: Generate developer behavioral profile and create Antigravity-discoverable artifacts
- **[`gsd:quick`](references/commands/system/quick.md)**: Execute a quick task with GSD guarantees (atomic commits, state tracking) but skip optional agents
- **[`gsd:reapply-patches`](references/commands/system/reapply-patches.md)**: Reapply local modifications after a GSD update
- **[`gsd:resume-work`](references/commands/system/resume-work.md)**: Resume work from previous session with full context restoration
- **[`gsd:review`](references/commands/system/review.md)**: Request cross-AI peer review of phase plans from external AI CLIs
- **[`gsd:set-profile`](references/commands/system/set-profile.md)**: Switch model profile for GSD agents (quality/balanced/budget/inherit)
- **[`gsd:settings`](references/commands/system/settings.md)**: Configure GSD workflow toggles and model profile
- **[`gsd:update`](references/commands/system/update.md)**: Update GSD to latest version with changelog display


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
*Generated by gsd-converter on 2026-04-18*
