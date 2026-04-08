# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-04-08

### Added
- **GSD Sync 1.34.2**: Synchronized with the latest GSD core (v1.34.2), featuring enhanced initialization signatures and improved state tracking.
- **Interactive Skill Installer**: Restored and validated the `npx gsd-antigravity-kit` installer (bin/install.js) to be fully interactive. It now supports:
    - **Smart Detection**: Identifies existing `.agent/skills/` and offers a safe removal/reinstall flow.
    - **Granular Installation**: Users can choose to install only specific skills (`gsd` or `gsd-converter`).
    - **Zero-Dependency Core**: Lightweight installation using only Node.js built-ins.
- **Distribution Whitelisting**: Implemented a `"files"` whitelist in `package.json` to exclude non-essential development documentation and caches from the NPM package, resulting in a cleaner, faster download.

## [1.32.1] - 2026-04-08

### Changed
- **Release Orchestration**: Finalized the `release-manager` orchestrator for zero-manual distribution.
- **Command Registry**: Synchronized `commands.json` with the latest skill-driven architecture.


### Added
- feat: modernize release-manager with zero-manual automation


### Changed
- **Full GSD Parity 1.30.0**: Synchronized the Kit with the core GSD protocol (v1.30.0), ensuring full transparency and version alignment for all Antigravity users.
- **Enhanced GSD Converter**: 
    - Improved signature verification in `init.cjs` during migration.
    - Robust handling of updated modular logic in `bin/lib/` for better dependency tracking.
    - Reinforced rebranding consistency across all migrated agent prompts.

## [1.28.0] - 2026-03-23


### Changed
- **Full GSD Parity 1.28.0**: Aligned the Kit version with the core GSD protocol (v1.28.0) to ensure transparency and version synchronization for end-users.
- **Improved Injection Logic**: Refined the `gsd-converter` to ensure all advanced features (Smart Inclusions, Artifact Discovery) are modularly injected during the migration process.

## [1.27.3] - 2026-03-23

### Added
- **GSD Sync 1.28.0**: Synchronized with the latest GSD core (v1.28.0), featuring enhanced initialization signatures and improved state tracking.
- **Enhanced Feature Injection**: The `gsd-converter` now injects advanced features like `discoverPhaseArtifacts`, `MODEL_PROFILES`, and `Smart Inclusions` into the generated `gsd` skill's core library.

## [1.27.2] - 2026-03-21

### Fixed
- **Linux Execution**: Restored the missing `#!/usr/bin/env node` shebang in the installer, fixing "Syntax error: "(" unexpected" failures on Linux/Unix servers.

## [1.27.0] - 2026-03-21

### Added
- **GSD Sync 1.27.0**: Synchronized with the latest GSD core (v1.27.0), featuring enhanced initialization signatures and improved state tracking.
- **Interactive Skill Installer**: Refactored `npx gsd-antigravity-kit` to be fully interactive. It now supports:
    - **Smart Detection**: Identifies existing `.agent/skills/` and offers a safe removal/reinstall flow.
    - **Granular Installation**: Users can choose to install only specific skills (`gsd` or `gsd-converter`).
    - **Zero-Dependency Core**: Lightweight installation using only Node.js built-ins.
- **Distribution Whitelisting**: Implemented a `"files"` whitelist in `package.json` to exclude non-essential development documentation and caches from the NPM package, resulting in a cleaner, faster download.

### Fixed
- **Path Resolution Logic**: Patched `gsd-converter` to robustly handle absolute path prefixes (e.g., `C:/projects/...`) during migration, ensuring valid skill-relative references in all command files.
- **Branding Consistency**: Reinforced "Antigravity" rebranding across all migrated GSD references, eliminating legacy `.claude` mentions in command execution contexts.

## [1.25.1] - 2026-03-16

### Added
- **GSD Sync 1.25.1**: Full synchronization with the latest GSD core, featuring optimized model profiles and enhanced state consistency.
- **Selective Inclusion Engine**: Injected `parseIncludeFlag`, `applyIncludes`, and `buildPhaseBase` into the core CLI, enabling granular context management via the `--include` flag.
- **Artifact Discovery**: Integrated `discoverPhaseArtifacts` for automated detection of hierarchical project files, improving context gathering automation.

### Changed
- **Skill Optimization**: Applied advanced refactoring via `gsd-converter`, reducing script overhead through 2-space indentation and condensed headers.
- **Improved Portability**: Enhanced regex-based path mapping for even more robust environment isolation in Antigravity.

## [1.24.0] - 2026-03-15

### Added
- **Major GSD Sync**: Synchronized with GSD `1.24.0`, bringing full support for the new modular engine and enhanced state management workflows.
- **Improved Phase Operations**: Added native support for `phase insert`, `phase remove`, and `phase-plan-index` through the modular CLI.
- **New Init Workflows**: Expanded `init` command to support `milestone-op`, `phase-op`, and `roadmap-op` for safer state transitions.

### Changed
- **Modular DRY Refactoring**: The monolithic `gsd-tools.cjs` has been completely refactored into a DRY architecture. Core logic is now modularized within `bin/lib/*.cjs`, significantly improving maintainability and reducing the primary script overhead.
- **Automated Help Generation**: `gsd-converter` now automatically populates `help-manifest.json` with detailed subcommand metadata, enabling rich interactive help via the `--help` flag.

## [1.22.6] - 2026-03-13

### Added
- **Help System Integration**: `gsd-converter` now generates a `help-manifest.json` and injects a dynamic help system into `gsd-tools.cjs`. Users can run `node gsd-tools.cjs --help <command>` for detailed subcommand usage.
- **Nyquist Validation**: Retroactive validation is now supported via `gsd:validate-phase`. `nyquist_validation` is now enabled by default in new project templates.

### Changed
- **Config Directory Discovery**: Improved robustness of config directory detection (Antigravity/Gemini/OpenCode) across all hooks, now respecting `CLAUDE_CONFIG_DIR`.
- **Semantic Configuration**: Migrated "depth" terminology to "granularity" (coarse/standard/fine) for better alignment with GSD specifications.
- **Git Ignore Handling**: Updated `isGitIgnored` to use `--no-index`, ensuring correct behavior for files tracked before being ignored.

### Fixed
- **Windows UTF-8 Stability**: Enforced UTF-8 encoding for Python and Node.js subprocesses on Windows to eliminate character mangling.
- **Multi-word Commit Messages**: Fixed the `commit` command in `gsd-tools.cjs` to correctly capture multi-word messages across different shell environments.
- **Hook Reliability**: Added 3-second stdin timeout guards to `gsd-statusline.js` and `gsd-context-monitor.js` to prevent hanging on Windows/Git Bash.

## [1.22.5] - 2026-03-09

### Changed
- **Maintenance**: General synchronization and maintenance release.

## [1.22.4] - 2026-03-03

### Added
- **Resource Migration**: Updated `gsd-converter` to explicitly migrate the `mapping.md` documentation into the target `gsd` skill for better user reference.

### Fixed
- **Terminal & Encoding Polish**: Resolved character mangling (`âœ…`) and output overlap in `gsd-converter` by enforcing UTF-8 and improving stdout flushing.
- **Robust Path Refactoring**: Improved regex-based path refactoring to handle Windows backslashes more safely, preventing potential `undefined` path segments.
- **GSD Skill Update**: Synchronized with GSD 1.22.4, ensuring full Antigravity rebranding and optimization across all migrated files.

## [1.22.3] - 2026-03-03

### Fixed
- **CLI Path Resolution**: Added explicit warnings across `SKILL.md`, `gsd-tools.md`, and the `gsd-tools.cjs` header that `gsd-tools` is NOT globally installed. AI agents must invoke it as `node .agent/skills/gsd/bin/gsd-tools.cjs <command>` — never as bare `gsd-tools`.
- **Converter Template**: Updated both the converter asset (`gsd-tools.md` template) and the `gsd_skill_template.md` to include the CLI invocation warning, ensuring future conversions also receive the fix.

## [1.22.2] - 2026-03-03

### Fixed
- **Optimizer Import Bug**: Fixed a bug where the `parseIncludeFlag` import injection in `optimize-gsd-tools.cjs` was incorrectly failing its condition check, resulting in `parseIncludeFlag` not being imported in `gsd-tools.cjs`.

## [1.22.1] - 2026-03-03

### Changed
- **GSD Skill Update**: Synchronized with GSD 1.22.1, ensuring full Antigravity rebranding and optimization across all migrated files.

### Fixed
- **Optimizer Path Bug**: Fixed a critical bug in `gsd-converter's` `convert.py` where it passed the file path of `gsd-tools.cjs` instead of the `bin` directory to the optimizer script, causing directory-level processing to fail.

## [1.22.0] - 2026-03-01

### Added
- **Smart Inclusion Engine**:
  - Injected `parseIncludeFlag()`, `applyIncludes()`, and `buildPhaseBase()` into `gsd-tools.cjs` to support the `--include` flag for granular context management.
  - Added `MODEL_PROFILES` for optimized model selection.
- **Artifact Discovery**:
  - Automated phase document lookup via `discoverPhaseArtifacts()` in the core engine.

### Changed
- **GSD Skill Update**: Synchronized with GSD 1.22.0, ensuring full Antigravity rebranding and optimization across all migrated files.
- **Performance Optimization**: 
  - Refactored `gsd-tools.cjs` with 2-space indentation and condensed headers, reducing script size by ~25KB.
  - Improved regex-based path refactoring for more robust environment isolation.

## [1.21.1] - 2026-02-27
## [1.21.0] - 2026-02-27

### Added
- **Dynamic `gsd-tools` Discovery**:
  - `gsd-converter` now dynamically parses `gsd-tools.cjs` comments to generate up-to-date Antigravity command documentation.
  - Automates the inclusion of new GSD commands without manual script updates.
- **Enhanced Path Refactoring**:
  - Implemented robust regex-based path mapping to handle all `.claude` and shell-relative path variants (`@./.claude`, `~/.claude`, etc.).
  - Ensures a 100% self-contained skill environment in Antigravity.
- **Automatic Cleanup**:
  - The converter now automatically purges legacy `.bak` and temporary files during the migration process.

### Changed
- **Release Manager Sync**: Updated the release workflow to enforce GSD synchronization and dynamic help verification before tagging.
- **GSD Skill Architecture**: Refactored the internal skill structure to mirror GSD 1.21.0's modular `hooks/` and `bin/lib/` organization.

## [1.0.2] - 2026-02-20

### Added
- **`gsd-converter` Automation**:
  - Now automatically refactors and enhances `gsd-tools.cjs` during the migration process.
- **`gsd-tools.cjs` Enhancements** (Injected via Converter):
  - **Selective Inclusion Engine**: Injected `parseIncludeFlag`, `applyIncludes`, and `buildPhaseBase` to support the new `--include` CLI flag.
  - **Contextual Awareness**: Added `discoverPhaseArtifacts` for automated detection of hierarchical project files.
  - **Persona-Based Model Profiles**: Implemented `MODEL_PROFILES` mapping to optimize AI model selection.

## [1.0.1] - 2026-02-20

### Added
- **Core Skill System**: Established the `.agent/skills/` directory structure for modular Antigravity agents.
- **`gsd-converter` Skill**: Implemented a zero-config automation script to migrate legacy GSD installations into the portable Antigravity Skill format.
- **Release Manager Skill**: Orchestrated a multi-phase release workflow for Node.js/NPM, including GitHub CLI (`gh`) integration and NPM publication logic.
- **GH CLI Integration**: Bundled `gh.exe` within the release-manager skill folder for portable environment support.
- **NPX Distribution**: Added `bin/install.js` to enable seamless installation via `npx gsd-antigravity-kit`.
- **Project Structure**: Established standard configurations including `.gitignore`, `package.json`, and initial project documentation.

### Changed
- **Rebranding**: Completed full migration from "Claude" to "Antigravity" terminology across all scripts and prompts.
- **Script Optimization**: Refactored core GSD tool scripts to reduce complexity and file size without sacrificing functionality.

### Documentation
- Created `README.md` with the new "GSD Cycle" philosophy (Plan, Execute, Verify).
- Initialized `CHANGELOG.md` to track project evolution.
- Created `docs/DEV_KNOWLEDGEBASE.md` for technical Root Cause Analysis (RCA).

**Git range:** `1a7e252` → `HEAD`
