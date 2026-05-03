# Universal Completion Checklist

Use this checklist during Phase 6 of the Verification Gate Workflow to determine the final PASS/FAIL verdict.

## Implementation
- [ ] All files designated in the plan have been created or modified.
- [ ] All Acceptance Criteria defined in the plan have been met.
- [ ] No placeholder code or `TODO` comments remain in the implemented feature.

## Quality Gates
- [ ] `npm test` passes completely.
- [ ] `npm run lint` passes with zero errors.
- [ ] Prettier/Formatting checks pass without violations.
- [ ] Existing tests continue to pass (no regressions).

## Documentation & State
- [ ] Relevant documentation (README, API Spec, UI Spec) is updated.
- [ ] A Summary Markdown file for the completed task/plan is generated.
- [ ] `.planning/STATE.md` is updated accurately.

*(If any box cannot be checked with confidence based on execution evidence, the verification fails).*
