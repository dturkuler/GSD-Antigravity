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
#### Atomic Commands:
state load                         Load project config + state
state json                         Output STATE.md frontmatter as JSON
state update <field> <value>       Update a STATE.md field
state get [section]                Get STATE.md content or section
state patch --field val ...        Batch update STATE.md fields
resolve-model <agent-type>         Get model for agent based on profile
find-phase <phase>                 Find phase directory by number
commit <message> [--files f1 f2]   Commit planning docs
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
phase add <description>            Append new phase to roadmap + create dir
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

#### Progress:
progress [json|table|bar]          Render progress in various formats

#### Todos:
todo complete <filename>           Move todo from pending to completed

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

#### Compound Commands (workflow-specific initialization):
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

### Example
To analyze the roadmap:
`node .agent/skills/gsd/bin/gsd-tools.cjs roadmap analyze`
</process>
