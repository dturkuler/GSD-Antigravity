# Verification Gate Workflow

This workflow guides the AI through the strict checklist required to mark a task or phase as complete.

## Phase 1: Retrieve Specification
- Load the original specification (e.g., Phase Plan, API Spec, UI Spec, or Task Requirements).
- Read the explicit Acceptance Criteria defined in the spec.

## Phase 2: Implementation Check
- Verify that all files listed to be created or modified in the plan actually exist in the filesystem.
- Cross-reference the implemented code against the specification to ensure no requirements were skipped.

## Phase 3: Test Check
- Run the test suite (`npm test` or equivalent).
- Verify that ALL tests pass.
- Verify that code coverage meets the project's target (if applicable).
- Check that the implementation hasn't caused existing tests to fail (Regression Check).

## Phase 4: Lint & Format Check
- Run the project's linter (`npm run lint`).
- Run the project's formatter check (`npm run format:check` or equivalent).
- Verify that there are ZERO linting errors or formatting violations.

## Phase 5: Documentation Check
- Ensure that any public-facing API changes are reflected in the API Spec or README.
- Ensure that any new components are documented in the UI Spec.
- Check that `STATE.md` accurately reflects the current status of the project.

## Phase 6: Verdict Generation
- Compare the gathered evidence against the universal `@references/checklists/completion-checklist.md` and the specific Acceptance Criteria.
- **PASS**: All checks pass and evidence is present.
- **FAIL**: One or more checks fail, or evidence is missing.

## Phase 7: Gate Enforcement
- **If PASS**: Proceed to mark the task/phase as complete. Generate the Summary Artifact.
- **If FAIL**: DO NOT mark the task complete. List the specific failing checks (e.g., "Lint error in utils.js", "Missing tests for edge case X"). Proceed to fix the issues, then restart this Verification Workflow from Phase 1.
