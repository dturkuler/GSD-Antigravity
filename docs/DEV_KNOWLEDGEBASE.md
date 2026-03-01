# Developer Knowledgebase (RCA)

This document tracks technical Root Cause Analysis (RCA) for bug fixes in the **gsd-antigravity-kit** project. Its purpose is to prevent regression and document technical debt resolutions.

---

## Technical Analysis History

### v1.22.0 (2026-03-01)
*   **Context:** `gsd-tools.cjs` (GSD Core Engine Optimization)
*   **Issue:** Token overhead and high script size (~125KB) impacting agent context limits.
*   **Root Cause Analysis:** 
    *   Legacy indentation (4 spaces) and large diagnostic headers consumed excessive context space in agent prompts.
    *   Monolithic inclusion of state and roadmap metadata made context windows unmanageable for long phases.
*   **How it was fixed:**
    *   **Whitespace Optimization**: Refactored the core engine with 2-space indentation and LF line endings during the migration, reducing the file size by approximately 20-25KB.
    *   **Modular Inclusions**: Injected `applyIncludes` logic to allow subagents to slice the state file (e.g., `--include roadmap` or `--include state`) instead of loading the entire object.
    *   **Dynamic Command Discovery**: Automated command list generation in `SKILL.md` to ensure documentation matches the actual capabilities of the CLI tools.

### v1.21.1 (2026-02-27)
### v1.0.2 (2026-02-20)
*   **Context:** `gsd-tools.cjs` (Core Engine)
*   **Issue:** Legacy script was monolithic, lacked contextual flexibility, and had high token overhead for large phases.
*   **Root Cause Analysis:** Standard GSD scripts didn't support partial file embedding or hierarchical artifact discovery, forcing agents to either read too much or too little context. 
*   **How it was fixed:** 
    *   **Automated via `gsd-converter`**: The converter now dynamically injects a modular helper system (`parseIncludeFlag`, `applyIncludes`) into `gsd-tools.cjs`.
    *   Added regex-based `discoverPhaseArtifacts` to traverse `.planning/` and phase subdirectories automatically.
    *   Introduced the `--include` flag (e.g., `--include state,roadmap`) to allow sub-agents to request only necessary context, optimizing token usage.
    *   Injected `MODEL_PROFILES` to centralize model selection logic keyed by GSD role.
