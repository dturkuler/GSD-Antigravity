# 🌌 GSD-Antigravity Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Antigravity Compatible](https://img.shields.io/badge/Antigravity-Compatible-purple.svg?logo=google&logoColor=white)](https://github.com/google-deepmind/antigravity)
[![NPM Version](https://img.shields.io/npm/v/gsd-antigravity-kit.svg?logo=npm)](https://www.npmjs.com/package/gsd-antigravity-kit)
[![Release Version](https://img.shields.io/badge/Release-v1.22.0-blue?style=flat-square)](https://github.com/dturkuler/GSD-Antigravity/releases/latest)

**GSD-Antigravity Kit** is the official bootstrapping and management utility for the [Get Shit Done (GSD)](https://github.com/glittercowboy/get-shit-done) protocol within the Antigravity AI framework. It serves as a high-performance **Installer** and **Skill Manager** that provision, optimizes, and maintains GSD skills in your AG environment.

---

## ⚡ Why GSD-Antigravity Kit?

Standard GSD is powerful, but this kit optimizes it specifically for the Antigravity ecosystem:

*   **Token Efficiency**: Refactored core engine uses 2-space indentation and modular inclusions, saving ~25KB of context space per turn.
*   **Context Control**: The `--include` flag allows sub-agents to request only specific parts of the project state (e.g., just the roadmap).
*   **Native Integration**: 100% rebranded and path-mapped to live inside the `.agent/skills/` directory, avoiding collision with global installations.

---

## 💎 The GSD Experience (Powered by this Kit)

Once this kit installs the GSD Skill, it enables the **GSD Cycle** in your project:

1.  **Phase 1: Plan**: Deep-probe requirements, surface hidden assumptions, and generate a serialized `.planning/PLAN.md`.
2.  **Phase 2: Execute**: Atomic, wave-based implementation where agents follow the plan without deviation.
3.  **Phase 3: Verify**: Conversational UAT to ensure the implementation matches the original intent.

### 🛠️ Advanced Tooling (Kit-Exclusives)
The kit automatically enhances the core `gsd-tools.cjs` engine with:
- **Smart Inclusion Engine**: Use `--include` flags to selectively embed context.
- **Hierarchical Artifact Discovery**: Automated lookup of phase-specific documents across nested directories.
- **Persona Profiles**: Pre-tuned AI model configurations (Quality, Balance, Budget) optimized for AG.

---

## 🚀 Installation & Setup

Installation is handled via `npx` to automatically provision your current project root:

### 1️⃣ Provision the Kit
```bash
# In your project root:
npx gsd-antigravity-kit
```

### 2️⃣ Initialize the GSD Engine
Run the converter script provided by the kit to fetch and package the GSD protocol:

**Option 1: In-AG Prompt (Recommended)**
```text
/gsd-converter
```

**Option 2: CLI**
```bash
py .agent/skills/gsd-converter/scripts/convert.py gsd
```

---

## 🏗️ Project Architecture

This repository is structured to separate the kit's logic from the generated skill:

```text
.
├── .agent/
│   └── skills/
│       ├── gsd-converter/ # The Conversion Logic (The "Kit" Engine)
│       └── gsd/           # The Managed GSD Skill (Generated/Modified by Kit)
├── bin/                   # NPX Entrypoints
├── docs/                  # Kit Documentation & Knowledgebase
└── package.json           # Distribution Metadata
```

---

## 🙏 Credits & Acknowledgements

The **GSD-Antigravity Kit** stands on the shoulders of giants. We owe a debt of gratitude to the original creators who pioneered the spec-driven development movement:

### 🌟 The GSD Protocol
The core logic, philosophy, and original script engine were created by **[glittercowboy](https://github.com/glittercowboy)**. Without the original [Get Shit Done (GSD)](https://github.com/glittercowboy/get-shit-done) system, this kit would have no engine to manage.

- **Source Code**: [GitHub Repository](https://github.com/glittercowboy/get-shit-done)
- **Documentation**: [The GSD Handbook](https://github.com/glittercowboy/get-shit-done/tree/main/.claude/get-shit-done)

---


