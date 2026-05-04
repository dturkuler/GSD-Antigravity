# RED/GREEN/REFACTOR Workflow

This workflow enforces a strict Test-Driven Development (TDD) cycle. Each phase must be completed and verified before moving to the next.

## Phase 1: RED (Write Failing Tests)
- **Action:** Read the task or requirement to implement.
- **Action:** Write test file(s) outlining the expected behavior using descriptive test names.
- **Action:** Run the tests.
- **Rule:** ALL new tests MUST fail. If a new test passes without implementation, it is either testing the wrong thing, testing existing functionality, or trivially true.
- **Gate:** Confirm that all new tests fail with meaningful assertion errors. Do not proceed until you have a failing test.

## Phase 2: GREEN (Minimum Implementation)
- **Action:** Write the *absolute minimum* amount of production code required to make the failing tests pass.
- **Rule:** Do NOT refactor. Do NOT optimize. Do NOT add speculative features or make "while I'm here" changes.
- **Action:** Run the tests.
- **Gate:** Confirm that ALL tests (both new and existing) pass. There must be zero test failures and zero regressions.

## Phase 3: REFACTOR (Clean Up)
- **Action:** Improve the quality of the code you just wrote.
  - Extract helper functions or classes.
  - Rename variables for clarity.
  - Reduce duplication (DRY).
  - Improve algorithmic efficiency.
- **Rule:** Run the test suite after *every* single refactoring step.
- **Rule:** If any test fails, immediately UNDO the last refactoring step and try a different approach.
- **Gate:** Confirm that all tests still pass after refactoring is complete.

## Phase 4: COVERAGE (Verify)
- **Action:** Run the test coverage report for the modified modules.
- **Action:** Verify that line coverage meets the project target (default: 80%).
- **Rule:** If coverage is below the target, identify uncovered branches or lines and repeat the RED/GREEN cycle specifically to cover those cases.
- **Gate:** Confirm that the coverage target is met.

## Phase 5: COMMIT (Save State)
- **Action:** Commit the verified code.
- **Rule:** Use a conventional commit message referencing the task.
  - Format: `feat(<scope>): <description>` or `test(<scope>): <description>`
- **Gate:** Code is successfully committed and the repository is clean. You may now return to Phase 1 for the next requirement.
