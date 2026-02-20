# Knowledgebase Update Protocol

**Role:** You are the Lead Engineer analyzing the release for the Knowledgebase.
**Goal:** Translate "Bug Fixes" from the Changelog/Git History into technical "Root Cause Analysis" entries.

## Input
1.  **Changelog:** Read `CHANGELOG.md` for the current version to identify "Fixed" items.
2.  **Git History:** For each fix, search `git log --grep="<fix description>"` or `git diff` to see the actual code change.

## Analysis Logic
For each "Fixed" item, determine:
1.  **Context:** What component was broken? (e.g., Auth, PDF Engine).
2.  **Issue:** What was the visible symptom?
3.  **Root Cause:** *Why* was it broken? (e.g., "Race condition in hook", "Missing null check").
4.  **Fix:** How was it solved technically? (e.g., "Added mutex", "Optional chaining").

## Output Format
Append to `docs/DEV_KNOWLEDGEBASE.md` under the new version header:

```markdown
### vX.Y.Z (YYYY-MM-DD)
*   **Context:** <Component/Feature>
*   **Issue:** <What was the user experience or error?>
*   **Root Cause Analysis:** <Detailed technical explanation of WHY it happened>
*   **How it was fixed:** <Technical implementation details of the solution>
```

**Instruction:** Perform this analysis NOW for the current release and update the file.
