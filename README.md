# 🌌 GSD-Antigravity Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Antigravity Compatible](https://img.shields.io/badge/Antigravity-Compatible-purple.svg?logo=google&logoColor=white)](https://github.com/google-deepmind/antigravity)
[![NPM Version](https://img.shields.io/npm/v/gsd-antigravity-kit.svg?logo=npm)](https://www.npmjs.com/package/gsd-antigravity-kit)
[![Release Version](https://img.shields.io/badge/Release-v2.3.0-blue?style=flat-square)](https://github.com/dturkuler/GSD-Antigravity/releases/latest)

**GSD-Antigravity Kit** is the official bootstrapping and management utility for the Get Shit Done (GSD) protocol within the Antigravity AI framework. It serves as a high-performance **Installer** and **Skill Manager** that provisions, optimizes, and maintains GSD skills in your AG environment.

This project is a fork and adaptation of the brilliant work from the `gsd-build` organization, combining the foundation of [get-shit-done](https://github.com/gsd-build/get-shit-done) (GSD v1) with the advanced, modular capabilities of [gsd-2](https://github.com/gsd-build/gsd-2) (GSD v2).

---

## ⚡ Why GSD-Antigravity Kit?

Standard GSD is powerful, but this kit optimizes it specifically for the Antigravity ecosystem:

*   **Token Efficiency**: Refactored core engine uses 2-space indentation and modular inclusions, saving ~25KB of context space per turn.
*   **Context Control**: The `--include` flag allows sub-agents to request only specific parts of the project state.
*   **Native Integration**: 100% rebranded and path-mapped to live inside the `.agent/skills/` directory, avoiding collision with global installations.
*   **Tier 1 Skill Integration**: Native support for 7 advanced workflow skills ported directly from `gsd-2`.

---

## 💎 The GSD Experience (Powered by this Kit)

Once this kit installs the GSD Skill, it enables the **GSD Cycle** in your project:

1.  **Phase 1: Plan**: Deep-probe requirements, surface hidden assumptions, and generate serialized plans.
2.  **Phase 2: Execute**: Atomic, wave-based implementation where agents follow the plan without deviation.
3.  **Phase 3: Verify**: Systematic verification using quality gates and automated checks.

### 🎯 Included Skills

This kit comes bundled with a comprehensive set of standalone skills ported from `gsd-2`, adapted for the Antigravity artifact model. Each skill is designed for specific phases of development, from planning and design to coding, debugging, and review:

- **`accessibility`**: Audit and improve web accessibility following WCAG 2.1 guidelines.
- **`agent-browser`**: Browser automation CLI for AI agents.
- **`api-design`**: Design or review an HTTP/REST/GraphQL API for versioning, pagination, error shapes, idempotency, auth, and evolvability.
- **`best-practices`**: Apply modern web development best practices for security, compatibility, and code quality.
- **`btw`**: Ask a quick side question about your current work without derailing the main task.
- **`code-optimizer`**: Deep code optimization audit using parallel specialist agents.
- **`core-web-vitals`**: Optimize Core Web Vitals (LCP, INP, CLS) for better page experience and search ranking.
- **`create-gsd-extension`**: Create, debug, and iterate on GSD extensions (TypeScript modules that add tools, commands, event hooks, custom UI, and providers to GSD).
- **`create-mcp-server`**: Build, iterate, and evaluate Model Context Protocol (MCP) servers that expose external services as tools an LLM can call.
- **`create-skill`**: Expert guidance for creating, writing, building, and refining GSD skills.
- **`create-workflow`**: Conversational guide for creating valid YAML workflow definitions.
- **`debug-like-expert`**: Deep analysis debugging mode for complex issues.
- **`decompose-into-slices`**: Break a plan or milestone brief into independently-grabbable vertical slices (tracer bullets).
- **`dependency-upgrade`**: Plan, batch, and verify dependency upgrades safely.
- **`design-an-interface`**: Produce 3+ radically different designs for a module, API, or interface, compare them in prose, and synthesize a recommendation.
- **`forensics`**: Post-mortem a failed GSD auto-mode run.
- **`frontend-design`**: Create distinctive, production-grade frontend interfaces with high design quality.
- **`github-workflows`**: Work with GitHub Actions CI/CD workflows - read live syntax, monitor runs, and debug failures.
- **`grill-me`**: Relentless sequential interview that stress-tests a plan or design until every decision branch is resolved.
- **`handoff`**: Prepare a clean cross-session handoff so the next agent (or you tomorrow) can pick up exactly where you left off.
- **`lint`**: Lint and format code.
- **`make-interfaces-feel-better`**: Design engineering principles for making interfaces feel polished.
- **`observability`**: Add agent-first observability to code — structured logs, health endpoints, failure-state persistence, and explicit failure modes.
- **`react-best-practices`**: React and Next.js performance optimization guidelines from Vercel Engineering.
- **`review`**: Review code changes for security, performance, bugs, and quality.
- **`security-review`**: Threat-model-driven security review of a change, feature, or subsystem.
- **`spike-wrap-up`**: Package findings from a completed spike into a durable, project-local skill that auto-loads on future similar work.
- **`tdd`**: Test-driven development with red-green-refactor loops built around vertical slices (tracer bullets), not horizontal layers.
- **`test`**: Generate or run tests.
- **`userinterface-wiki`**: UI/UX best practices for web interfaces.
- **`verify-before-complete`**: Block completion claims until verification evidence has been produced in the current message.
- **`web-design-guidelines`**: Review UI code for Web Interface Guidelines compliance.
- **`web-quality-audit`**: Comprehensive web quality audit covering performance, accessibility, SEO, and best practices.
- **`write-docs`**: Collaborative document authoring workflow for proposals, technical specs, decision docs, README sections, ADRs, and long-form prose.
- **`write-milestone-brief`**: Synthesize the current conversation into a milestone brief (PRD).

---

## 🚀 Installation & Setup

Installation is handled via `npx` to automatically provision your current project root:

### 1️⃣ Provision the Kit
```bash
# In your project root:
npx gsd-antigravity-kit
```
> [!NOTE]
> The installer is now **interactive**. It will check for existing skills, offer to clean up old folders, and let you choose which skills (`gsd` or `gsd-converter`) to install.

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

### 3️⃣ Manual Installation of GSD Skill (Pre-Converted)
If you prefer to add the GSD skill to your project manually without using the converter:
- Simply create a `.agent/skills` directory in your project root and copy the `gsd` and Tier 1 skills from this repository into it.

---

## 🏗️ Project Architecture

This repository is structured to separate the kit's logic from the generated skill:

```text
.
├── .agent/
│   └── skills/
│       ├── gsd/                    # The Managed GSD Core Engine
│       ├── gsd-converter/          # The Conversion Logic
│       ├── frontend-design/        # Tier 1 Skill Ports...
│       ├── tdd/
│       ├── security-review/
│       ├── debug-like-expert/
│       ├── forensics/
│       ├── api-design/
│       └── verify-before-complete/
├── bin/                   # NPX Entrypoints
├── docs/                  # Kit Documentation & Knowledgebase
└── package.json           # Distribution Metadata
```

---

## 🙏 Credits & Acknowledgements

The **GSD-Antigravity Kit** stands on the shoulders of giants. We owe a massive debt of gratitude to the original creators who pioneered the spec-driven development movement:

### 🌟 The GSD Protocol
The core logic, philosophy, and original script engine were created by the **[gsd-build](https://github.com/gsd-build)** team. 

- **GSD v1 Foundation**: [get-shit-done](https://github.com/gsd-build/get-shit-done)
- **GSD v2 Advanced Skills**: [gsd-2](https://github.com/gsd-build/gsd-2)

Without their original architectures, strict workflows, and agentic design patterns, this kit would not exist.
