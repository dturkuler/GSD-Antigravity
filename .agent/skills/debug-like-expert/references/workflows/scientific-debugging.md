# Scientific Debugging Workflow

This workflow guides the AI through a rigorous, hypothesis-driven debugging process.

## Phase 1: Reproduce
- Attempt to reliably reproduce the bug based on the provided report or context.
- Document the exact steps required to trigger the issue.
- If the bug cannot be reproduced, gather more information before proceeding.

## Phase 2: Observe
- Gather factual data without drawing conclusions.
- Collect error messages, stack traces, log outputs, and relevant environment details.
- Identify the exact point of failure in the codebase.

## Phase 3: Hypothesize
- Formulate **exactly ONE** clear hypothesis about the root cause.
- State the hypothesis explicitly (e.g., "The error occurs because the `userId` is undefined when passed to the database query").
- Do not proceed to experimentation until a clear hypothesis is formed.

## Phase 4: Experiment
- Design a minimal, targeted experiment to confirm or refute the hypothesis.
- Example experiments: Adding strategic logging, using a debugger breakpoint, modifying input data, or isolating a specific function.
- Execute the experiment.

## Phase 5: Analyze
- Evaluate the results of the experiment against the hypothesis.
- **If hypothesis is confirmed:** Proceed to Phase 6 (Fix).
- **If hypothesis is refuted:** Discard the hypothesis. Return to Phase 2 (Observe) to gather more data and formulate a new hypothesis.

## Phase 6: Fix
- Design and apply the minimal code change necessary to address the confirmed root cause.
- Do not bundle unrelated refactoring or "cleanups" with the bug fix.

## Phase 7: Verify
- Run the original reproduction case established in Phase 1.
- Confirm the bug is completely resolved.

## Phase 8: Regression Test
- Write an automated test that specifically targets the root cause.
- This test must fail without the fix applied and pass with the fix.

## Phase 9: Document
- Complete the Debug Log using `@references/templates/debug-log-template.md`.
- Ensure all hypotheses tested (both confirmed and refuted) are documented.
