# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.21.1] - 2026-02-27

### Changed
- **Sync with GSD 1.21.1**: Updated core skill to match GSD's latest patch, including Windows path fixes and milestone calculation improvements.
- **Badge Update**: Synchronized README version badges.

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
