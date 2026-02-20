# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
