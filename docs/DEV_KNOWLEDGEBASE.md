# Developer Knowledgebase (RCA)

This document tracks technical Root Cause Analysis (RCA) for bug fixes in the **gsd-antigravity-kit** project. Its purpose is to prevent regression and document technical debt resolutions.

---

## Technical Analysis History

### v1.27.0 (2026-03-21)
*   **Context:** `bin/install.js` (Interactive Installer) and `gsd-converter` (`convert.py`)
*   **Issue:** Lack of user control during GSD skill installation; risk of overwriting local modifications; and broken absolute path references in migrated commands.
*   **Root Cause Analysis:** 
    - The previous installer was a blind "copy-all" script, leading to potential data loss if a user had local skill changes.
    - Path resolution in `convert.py` failed on absolute paths because regexes didn't account for anything between the `@` symbol and the `.claude/` directory.
*   **How it was fixed:**
    - **Interactive Installer**: Refactored `bin/install.js` to use `readline`. It now detects existing folders, prompts for removal, and allows granular selection of which skills to install.
    - **Robust Path Regex**: Updated `convert.py` with non-greedy wildcards (`r'@.*?\.claude/...'`) to capture absolute drive paths, correctly replacing them with skill-relative `@references/` tags.
    - **Distribution Optimization**: Added a `"files"` whitelist to `package.json` to exclude non-essential source files (`.claude/`) from the distributed NPM package.

### v1.25.1 (2026-03-16)
*   **Context:** `gsd-tools.cjs` (Selective Inclusion and Artifact Discovery)
*   **Issue:** Lack of standardized context slicing and automated artifact traversal in the core GSD engine, leading to inconsistent context gathering across different subagents.
*   **Root Cause Analysis:** 
    - The core engine was missing a unified way to handle partial context loading, forcing agents to either load the entire state or manually parse it.
    - Artifact discovery relied on static paths which didn't always account for deeply nested or dynamically named phase directories.
*   **How it was fixed:**
    - **Smart Inclusions**: Injected `parseIncludeFlag`, `applyIncludes`, and `buildPhaseBase` into `gsd-tools.cjs`. This allows the `--include` flag to dynamically filter state/roadmap data, significantly reducing token overhead for long-running workflows.
    - **Automated Discovery**: Integrated `discoverPhaseArtifacts()` to automatically traverse the `.planning/` hierarchy, ensuring that all relevant requirements, plans, and implementation notes are available to the agent without manual specification.
    - **Model Profile Injection**: Injected a centralized `MODEL_PROFILES` object to ensure consistent model selection (e.g., using better models for planning and cheaper ones for simple tasks) across the entire GSD toolchain.

### v1.24.0 (2026-03-15)
*   **Context:** `gsd-tools.cjs` (Engine Modernization)
*   **Issue:** Technical debt in the core engine; increasing complexity of the monolithic `gsd-tools.cjs` script; and lack of granular control over phase/milestone state transitions.
*   **Root Cause Analysis:** 
    - The monolithic design of `gsd-tools.cjs` was becoming difficult to audit and extend, leading to duplication of logic across commands.
    - Previous `init` workflows were too coarse-grained, making it difficult to perform atomic state updates for complex roadmap changes.
*   **How it was fixed:**
    - **Modularization (DRY)**: Refactored `gsd-tools.cjs` to delegate all command implementation to a dedicated library in `bin/lib/`. This reduced the main router file size and centralized error handling and state management.
    - **Internal Library**: Created specialized modules: `phase.cjs` for roadmap manipulation, `init.cjs` for workflow bootstrapping, and `verify.cjs` for project health checks.
    - **Enhanced Init Router**: Added multiple specialized init workflows (`milestone-op`, `phase-op`, `roadmap-op`) to provide agents with precise control over project structure modifications.

### v1.22.6 (2026-03-13)
*   **Context:** `gsd-tools.cjs` and `gsd-converter`
*   **Issue:** Missing detailed CLI help for subcommands; character encoding issues on Windows; hung terminal processes; and deprecated configuration keys.
*   **Root Cause Analysis:** 
    - The `gsd-tools.cjs` lacked an internal help system, relying on external documentation that wasn't always accessible to sub-agents.
    - Windows `cp1252` encoding caused mangling of Unicode status markers in Python and Node.js output.
    - Synchronous blocking on `stdin` in hooks caused terminal hangs in environments where `stdin` didn't close properly (e.g., Git Bash on Windows).
    - Hardcoded GSD home paths didn't account for newer "Antigravity" or "Gemini" branding in local configuration directories.
*   **How it was fixed:**
    - **Help Manifest**: Implemented a dynamic `help-manifest.json` generation in `convert.py` and a `--help` interceptor in `gsd-tools.cjs`.
    - **Encoding Stability**: Enforced UTF-8 for `stdout`/`stderr` in `convert.py` and passed `encoding: 'utf-8'` to `execSync`/`spawn` calls.
    - **Timeout Guards**: Added 3-second `setTimeout` exits for `gsd-statusline.js` and `gsd-context-monitor.js` to prevent deadlock if `stdin` stays open.
    - **Branding-Neutral Paths**: Refactored config directory lookup to check for `.antigravity`, `.gemini`, and `.opencode`, supporting the `CLAUDE_CONFIG_DIR` environment variable.
    - **Semantic Migration**: Automatically migrates the `depth` configuration key to the more descriptive `granularity`.

### v1.22.4 (2026-03-03)
*   **Context:** `gsd-converter` (`convert.py` and `optimize-gsd-tools.cjs`)
*   **Issue:** Terminal output characters mangled (`âœ…`) and version summary overlapped with optimizer logs.
*   **Root Cause Analysis:** 
    - Windows terminal encoding defaults (CP1252/437) didn't support UTF-8 checkmarks.
    - Race condition between `npx` status-line updates (`\r`) and Python `print()` statements.
    - Subprocess output from `node` was being captured without explicit encoding, leading to character mapping errors.
*   **How it was fixed:**
    - **UTF-8 Enforcement**: Added `sys.stdout.reconfigure(encoding='utf-8')` to the converter script.
    - **Logging Cleanliness**: Improved subprocess output handling with explicit newlines and `sys.stdout.flush()`.
    - **Resource Deployment**: Explicitly configured the converter to migrate `mapping.md` to the target skill.
    - **Path Refactoring**: Safely handled Windows backslashes in regex replacements to prevent `undefined` segments.

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
