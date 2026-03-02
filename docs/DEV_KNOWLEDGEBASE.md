# Developer Knowledgebase (RCA)

This document tracks technical Root Cause Analysis (RCA) for bug fixes in the **gsd-antigravity-kit** project. Its purpose is to prevent regression and document technical debt resolutions.

---

## Technical Analysis History

### v1.22.3 (2026-03-03)
*   **Context:** GSD Skill CLI invocation across SKILL.md, gsd-tools.md, and gsd-tools.cjs
*   **Issue:** AI agents generated bare `gsd-tools scaffold uat --phase 29` instead of `node .agent/skills/gsd/bin/gsd-tools.cjs scaffold uat --phase 29`, resulting in `Command 'gsd-tools' not found`.
*   **Root Cause Analysis:** 
    *   `gsd-tools` is not installed globally via `npm link` or as a PATH binary. It only exists as a local `.cjs` script inside the skill's `bin/` directory.
    *   The usage header in `gsd-tools.cjs` had `Usage: node gsd-tools.cjs` which was ambiguous — AI agents interpreted this as a globally available command.
    *   No documentation or reference files explicitly warned that `gsd-tools` must be invoked via `node .agent/skills/gsd/bin/gsd-tools.cjs`.
*   **How it was fixed:**
    *   Updated the `gsd-tools.cjs` usage header comment to show the full project-relative path.
    *   Updated the error message in the fallback `if (!command)` handler.
    *   Added `CRITICAL` warning blocks to `gsd-tools.md` (both live and converter asset).
    *   Added Best Practice #5 (`CLI Invocation`) to both `SKILL.md` and `gsd_skill_template.md`.
    *   Updated the `CONDENSED_HEADER` in `optimize-gsd-tools.cjs` to inject the correct path during future conversions.

### v1.22.2 (2026-03-03)
*   **Context:** `optimize-gsd-tools.cjs` (GSD Converter Script)
*   **Issue:** `parseIncludeFlag` missing in `gsd-tools.cjs` after conversion.
*   **Root Cause Analysis:** 
    *   The optimizer script checked `!gsdContent.includes('parseIncludeFlag')` to decide whether to inject the `require` statement. 
    *   Since `parseIncludeFlag` had already been injected earlier in the switch case router, that condition evaluated to false, skipping the import injection.
*   **How it was fixed:**
    *   Changed the checking condition to explicitly examine if `parseIncludeFlag } = require` existed rather than just the generic variable string.
    *   Also modified the injection method to seamlessly inject into the existing `require('./lib/core.cjs')` instead of clumsily appending a new statement.

### v1.22.1 (2026-03-03)
*   **Context:** `gsd-converter` (`convert.py`)
*   **Issue:** Optimizer script failed with `ENOTDIR` error during post-processing.
*   **Root Cause Analysis:** 
    *   The `convert.py` script was passing the absolute path of `gsd-tools.cjs` to the `optimize-gsd-tools.cjs` script.
    *   The optimizer script expects a directory path (the `bin` directory) as it needs to recurse through `bin/` and `bin/lib/` to format all `.cjs` files.
*   **How it was fixed:**
    *   Modified `convert.py` to resolve the directory name (`os.path.dirname`) of the `gsd_tools_path` before passing it to the optimizer process.
    *   This ensures the optimizer successfully finds and formats all modular engine components.

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
