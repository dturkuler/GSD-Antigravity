# Forensic Analysis Workflow

This workflow guides the AI through investigating a process failure or state corruption event.

## Phase 1: Scene Preservation
- Immediately snapshot the current state to prevent further data loss or corruption.
- If necessary, use `git stash` or create a backup branch to preserve the working directory state before beginning the investigation.

## Phase 2: Evidence Collection
- Gather all relevant artifacts and metadata:
  - **Git History:** Analyze recent commits (`git log --oneline -20`).
  - **Git Changes:** Examine uncommitted or recently committed changes (`git diff HEAD~5..HEAD`).
  - **State Artifacts:** Review the current and historical `.planning/STATE.md`.
  - **Planning Artifacts:** Inspect recent Phase Plans and Summaries.
  - **Execution Logs:** Review CI/CD logs or terminal output if available.

## Phase 3: Timeline Reconstruction
- Build a chronological, step-by-step timeline of events leading up to the failure.
- Map Git commits to GSD phase executions to align the codebase state with the project state.

## Phase 4: Anomaly Detection
- Identify deviations from the expected workflow or baseline:
  - Missing or incomplete plan/summary files.
  - Inconsistencies between `STATE.md` and the actual project progress.
  - Orphaned branches or unexpected merge conflicts.
  - Skipped verification steps or ignored quality gates.
  - Out-of-order phase execution.

## Phase 5: Root Cause Analysis (5-Whys)
- Use the 5-Whys technique to trace the identified anomalies back to their absolute origin.
- Example: 
  1. *Why did the build fail?* (Because a dependency was missing) 
  2. *Why was it missing?* (Because `package.json` wasn't committed) 
  3. *Why wasn't it committed?* (Because the execution phase crashed halfway) ...etc.

## Phase 6: Impact Assessment
- Determine the full blast radius of the failure.
- What was affected? (e.g., lost code, corrupted state, broken upstream dependencies, deployed regressions).

## Phase 7: Recovery Plan
- Propose specific, safe, and verifiable steps to restore the project to a correct and consistent state.
- Include Git commands (e.g., `git reset`, `git cherry-pick`) and state updates required.

## Phase 8: Prevention Recommendations
- Suggest concrete process improvements, automated checks, or skill enhancements to prevent the failure from recurring.

## Phase 9: Report Assembly
- Compile all findings into the structured report using `@references/templates/forensics-report-template.md`.
