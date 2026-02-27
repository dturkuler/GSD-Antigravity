# Developer Knowledgebase (RCA)

This document tracks technical Root Cause Analysis (RCA) for bug fixes in the **gsd-antigravity-kit** project. Its purpose is to prevent regression and document technical debt resolutions.

---

## Technical Analysis History

### v1.21.1 (2026-02-27)
*   **Context:** `gsd-converter` (Kit Engine) & `gsd` Skill Refactoring
*   **Issue:** Internal path leaks (`.claude/`) and dynamic command documentation drift.
*   **Root Cause Analysis:** 
    *   Legacy GSD codebases relied on home-directory paths (`~/.claude/`) and hardcoded script paths that broke when ported to Antigravity's local `.agent/skills/` structure.
    *   Command documentation was static, requiring manual updates every time the GSD upstream binary added new capabilities.
*   **How it was fixed:**
    *   **Advanced Regex Refactoring**: Updated `convert.py` with multi-pass regex to catch all variants of `.claude` (including `@./.claude`, `~/.claude`, etc.) and remap them to the project-relative `.agent/skills/gsd` path.
    *   **Dynamic Command Extraction**: Implemented a JSDoc parser in the converter that reads `gsd-tools.cjs` help comments directly to generate `gsd-tools.md` at runtime.
    *   **Windows Path Normalization**: Synced with GSD 1.21.1 upstream fixes to ensure forward-slash consistency and shell argument escaping on Windows hosts.

### v1.0.2 (2026-02-20)
*   **Context:** `gsd-tools.cjs` (Core Engine)
*   **Issue:** Legacy script was monolithic, lacked contextual flexibility, and had high token overhead for large phases.
*   **Root Cause Analysis:** Standard GSD scripts didn't support partial file embedding or hierarchical artifact discovery, forcing agents to either read too much or too little context. 
*   **How it was fixed:** 
    *   **Automated via `gsd-converter`**: The converter now dynamically injects a modular helper system (`parseIncludeFlag`, `applyIncludes`) into `gsd-tools.cjs`.
    *   Added regex-based `discoverPhaseArtifacts` to traverse `.planning/` and phase subdirectories automatically.
    *   Introduced the `--include` flag (e.g., `--include state,roadmap`) to allow sub-agents to request only necessary context, optimizing token usage.
    *   Injected `MODEL_PROFILES` to centralize model selection logic keyed by GSD role.
