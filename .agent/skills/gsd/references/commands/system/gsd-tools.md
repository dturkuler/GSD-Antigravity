---
name: gsd:gsd-tools
description: Direct access to GSD internal CLI tools for atomic operations (state, roadmap, phase, config, etc.)
allowed-tools:
  - run_command
gsd-source-version: 1.37.1
migration-date: 2026-04-18
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
#### Atomic Commands:
  state load                         Load project config + state
  state json                         Output STATE.md frontmatter as JSON
  state update <field> <value>       Update a STATE.md field
  state get [section]                Get STATE.md content or section
  state patch --field val ...        Batch update STATE.md fields
  state begin-phase --phase N --name S --plans C  Update STATE.md for new phase start
  state signal-waiting --type T --question Q --options "A|B" --phase P  Write WAITING.json signal
  state signal-resume                Remove WAITING.json signal
  resolve-model <agent-type>         Get model for agent based on profile
  find-phase <phase>                 Find phase directory by number
  commit <message> [--files f1 f2] [--no-verify]   Commit planning docs
  commit-to-subrepo <msg> --files f1 f2  Route commits to sub-repos
  verify-summary <path>              Verify a SUMMARY.md file
  generate-slug <text>               Convert text to URL-safe slug
  current-timestamp [format]         Get timestamp (full|date|filename)
  list-todos [area]                  Count and enumerate pending todos
  verify-path-exists <path>          Check file/directory existence
  config-ensure-section              Initialize .planning/config.json
  history-digest                     Aggregate all SUMMARY.md data
  summary-extract <path> [--fields]  Extract structured data from SUMMARY.md
  state-snapshot                     Structured parse of STATE.md
  phase-plan-index <phase>           Index plans with waves and status
  websearch <query>                  Search web via Brave API (if configured)
[--limit N] [--freshness day|week|month]

#### Phase Operations:
  phase next-decimal <phase>         Calculate next decimal phase number
  phase add <description> [--id ID]   Append new phase to roadmap + create dir
  phase insert <after> <description> Insert decimal phase after existing
  phase remove <phase> [--force]     Remove phase, renumber all subsequent
  phase complete <phase>             Mark phase done, update state + roadmap

#### Roadmap Operations:
  roadmap get-phase <phase>          Extract phase section from ROADMAP.md
  roadmap analyze                    Full roadmap parse with disk status
  roadmap update-plan-progress <N>   Update progress table row from disk (PLAN vs SUMMARY counts)

#### Requirements Operations:
  requirements mark-complete <ids>   Mark requirement IDs as complete in REQUIREMENTS.md
Accepts: REQ-01,REQ-02 or REQ-01 REQ-02 or [REQ-01, REQ-02]

#### Milestone Operations:
  milestone complete <version>       Archive milestone, create MILESTONES.md
[--name <name>]
[--archive-phases]               Move phase dirs to milestones/vX.Y-phases/

#### Validation:
  validate consistency               Check phase numbering, disk/roadmap sync
  validate health [--repair]         Check .planning/ integrity, optionally repair
  validate agents                    Check GSD agent installation status

#### Progress:
  progress [json|table|bar]          Render progress in various formats

#### Todos:
  todo complete <filename>           Move todo from pending to completed

#### UAT Audit:
  audit-uat                           Scan all phases for unresolved UAT/verification items
  uat render-checkpoint --file <path> Render the current UAT checkpoint block

#### Open Artifact Audit:
  audit-open [--json]                 Scan all .planning/ artifact types for unresolved items

#### Intel:
  intel query <term>             Query intel files for a term
  intel status                   Show intel file freshness
  intel update                   Trigger intel refresh (returns agent spawn hint)
  intel diff                     Show changed intel entries since last snapshot
  intel snapshot                 Save current intel state as diff baseline
  intel patch-meta <file>        Update _meta.updated_at in an intel file
  intel validate                 Validate intel file structure
  intel extract-exports <file>   Extract exported symbols from a source file

#### Scaffolding:
  scaffold context --phase <N>       Create CONTEXT.md template
  scaffold uat --phase <N>           Create UAT.md template
  scaffold verification --phase <N>  Create VERIFICATION.md template
  scaffold phase-dir --phase <N>     Create phase directory
  --name <name>

#### Frontmatter CRUD:
  frontmatter get <file> [--field k] Extract frontmatter as JSON
  frontmatter set <file> --field k   Update single frontmatter field
  --value jsonVal
  frontmatter merge <file>           Merge JSON into frontmatter
  --data '{json}'
  frontmatter validate <file>        Validate required fields
  --schema plan|summary|verification

#### Verification Suite:
  verify plan-structure <file>       Check PLAN.md structure + tasks
  verify phase-completeness <phase>  Check all plans have summaries
  verify references <file>           Check @-refs + paths resolve
  verify commits <h1> [h2] ...      Batch verify commit hashes
  verify artifacts <plan-file>       Check must_haves.artifacts
  verify key-links <plan-file>       Check must_haves.key_links
  verify schema-drift <phase> [--skip]  Detect schema file changes without push

#### Template Fill:
  template fill summary --phase N    Create pre-filled SUMMARY.md
[--plan M] [--name "..."]
[--fields '{json}']
  template fill plan --phase N       Create pre-filled PLAN.md
[--plan M] [--type execute|tdd]
[--wave N] [--fields '{json}']
  template fill verification         Create pre-filled VERIFICATION.md
  --phase N [--fields '{json}']

#### State Progression:
  state advance-plan                 Increment plan counter
  state record-metric --phase N      Record execution metrics
  --plan M --duration Xmin
[--tasks N] [--files N]
  state update-progress              Recalculate progress bar
  state add-decision --summary "..."  Add decision to STATE.md
[--phase N] [--rationale "..."]
[--summary-file path] [--rationale-file path]
  state add-blocker --text "..."     Add blocker
[--text-file path]
  state resolve-blocker --text "..." Remove blocker
  state record-session               Update session continuity
  --stopped-at "..."
[--resume-file path]
  Compound Commands (workflow-specific initialization):
  init execute-phase <phase>         All context for execute-phase workflow
  init plan-phase <phase>            All context for plan-phase workflow
  init new-project                   All context for new-project workflow
  init new-milestone                 All context for new-milestone workflow
  init quick <description>           All context for quick workflow
  init resume                        All context for resume-project workflow
  init verify-work <phase>           All context for verify-work workflow
  init phase-op <phase>              Generic phase operation context
  init todos [area]                  All context for todo workflows
  init milestone-op                  All context for milestone operations
  init map-codebase                  All context for map-codebase workflow
  init progress                      All context for progress workflow

#### Documentation:
  docs-init                            Project context for docs-update workflow

#### Learnings:
  learnings list                       List all global learnings (JSON)
  learnings query --tag <tag>          Query learnings by tag
  learnings copy                       Copy from current project's LEARNINGS.md
  learnings prune --older-than <dur>   Remove entries older than duration (e.g. 90d)
  learnings delete <id>                Delete a learning by ID
  GSD-2 Migration:
  from-gsd2 [--path <dir>] [--force] [--dry-run]
  Import a GSD-2 (.gsd/) project back to GSD v1 (.planning/) format

### Example
To analyze the roadmap:
`node .agent/skills/gsd/bin/gsd-tools.cjs roadmap analyze`
</process>
