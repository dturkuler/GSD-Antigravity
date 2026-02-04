# 🌌 GSD-to-Antigravity Converter

![GSD Workflow Concept](gsd_workflow_concept_1770173213268.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/downloads/)
[![Antigravity Compatible](https://img.shields.io/badge/Antigravity-Compatible-purple.svg?logo=google&logoColor=white)](https://github.com/google-deepmind/antigravity)

**GSD-to-Antigravity Converter** is a high-performance migration utility for the Antigravity AI framework. It transforms standard GSD (Get Shit Done) installations into portable Antigravity Skills by automating path refactoring, rebranding, and skill packaging.

---

## 💎 Core Philosophy: The GSD Cycle

Most AI development fails because it jumps straight from **intent** to **code**. GSD-Antigravity enforces a non-negotiable protocol:

1.  **Plan Phase**: Deep-probe requirements, surface hidden assumptions, and generate a serialized `.planning/PLAN.md`.
2.  **Execute Phase**: Atomic, wave-based implementation where agents follow the plan without deviation.
3.  **Verify Phase**: Conversational User Acceptance Testing (UAT) to ensure the implementation matches the original intent.

---

## ✨ Key Features

### 🛠️ Hierarchical Planning
Automatically generates deeply nested project structures, including requirements, architectures, and pitfall analyses before coding begins.

### 🤖 Multi-Agent Orchestration
Spawns specialized sub-agents with distinct personas:
- **Researchers**: Investigate 2025-standard tech stacks and ecosystem pitfalls.
- **Roadmappers**: Build multi-phase project arcs.
- **Plan Checkers**: Audit plans to catch logic gaps before execution.

### 🔄 Legacy Migration (`gsd-converter`)
Includes a zero-config automation script to migrate standard GSD installations into the portable Antigravity Skill format.

---

## 🧰 The GSD Toolbox

Once installed, the following primary commands drive your project:

| Command | Action | Deep Philosophy |
| :--- | :--- | :--- |
| `gsd:new-project` | **Initialize** | Context gathering → Research → Roadmap |
| `gsd:plan-phase` | **Blueprint** | Resolve ambiguity into actionable tasks |
| `gsd:execute-phase` | **Build** | Wave-based, parallel agent execution |
| `gsd:verify-work` | **UAT** | Human-in-the-loop verification |
| `gsd:map-codebase` | **Audit** | Reverse-engineer existing architecture |
| `gsd:progress` | **Status** | State management and next-step routing |

---

## 🚀 Speed-to-Code

### 1️⃣ Prerequisites
- **Antigravity** core installed.
- **Node.js** (for npx) & **Python 3.8+**.

### 2️⃣ Installation & Setup

Installation is handled via `npx` to automatically provision the `.agent` folder into your current project:

```bash
# In your project root:
npx gsd-antigravity-kit
```

# Then initialize the GSD engine:

**Option 1: In-App (Recommended)**
Run `.agent/skills/gsd-converter/SKILL.md` directly in the Antigravity prompt.

**Option 2: CLI**
```bash
py .agent/skills/gsd-converter/scripts/convert.py gsd
```

**Option 3: Manual Clone**
Alternatively, you can clone the repository manually:
```bash
git clone https://github.com/glittercowboy/GSD-Antigravity.git
cd GSD-Antigravity
py .agent/skills/gsd-converter/scripts/convert.py gsd
```

### 3️⃣ Start Your First Project
```bash
# Within the Antigravity interface:
gsd:new-project
```

### 🔄 Updating the GSD Skill
When a new version of GSD is released, you can refresh your local installation by running the `gsd-converter` script again. This will automatically:
- **Clean**: Delete the existing `.agent/skills/gsd/` folder to ensure a clean slate.
- **Fetch**: Download the latest source files via `npx`.
- **Rebuild**: Re-apply Antigravity branding and path refactoring to generate the updated skill set.

```bash
# To update:
py .agent/skills/gsd-converter/scripts/convert.py gsd
```

---

## 📂 Project Architecture

```text
.
├── .agent/
│   └── skills/
│       ├── gsd/           # Generated GSD Skill (Commands & Agents)
│       └── gsd-converter/ # Migration Tools
├── README.md              # You are here
├── LICENSE                # MIT
└── CONTRIBUTING.md        # How to extend GSD
```

---

## 🙏 Acknowledgements

A huge thank you to **[glittercowboy](https://github.com/glittercowboy)** for the original [Get Shit Done (GSD)](https://github.com/glittercowboy/get-shit-done/tree/main) system. His visionary work on spec-driven hierarchical planning provided the essential logic and inspiration for this Antigravity adaptation.

---

## 🔗 Resources & Support

- 📜 **Documentation**: [docs/](.agent/skills/gsd/references/docs/)
- 🗺️ **Roadmap Management**: [ROADMAP.md](.agent/skills/gsd/assets/templates/roadmap.md)
- 💬 **Community**: Join our Discord for GSD strategy and pattern sharing.

---

*Engineered for excellence by the Antigravity Team. 🌌*
