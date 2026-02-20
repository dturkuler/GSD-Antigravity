# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-20

### Added
- **Core Skill System**: Established the `.agent/skills/` directory structure for modular Antigravity agents.
- **`gsd-converter` Skill**: Implemented a zero-config automation script to migrate legacy GSD installations into the portable Antigravity Skill format.
- **Release Manager Skill**: Orchestrated a multi-phase release workflow for Node.js/NPM, including GitHub CLI (`gh`) integration and NPM publication logic.
- **NPX Distribution**: Added `bin/install.js` to enable seamless installation via `npx gsd-antigravity-kit`.
- **Project Structure**: Established standard configurations including `.gitignore`, `package.json`, and initial project documentation.

### Changed
- **Rebranding**: Completed full migration from "Claude" to "Antigravity" terminology across all scripts and prompts.
- **Script Optimization**: Refactored core GSD tool scripts to reduce complexity and file size without sacrificing functionality.

### Documentation
- Created `README.md` with the new "GSD Cycle" philosophy (Plan, Execute, Verify).
- Initialized `CHANGELOG.md` to track project evolution.

**Git range:** `1a7e252` → `HEAD`
