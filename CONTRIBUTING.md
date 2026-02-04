# Contributing to GSD-Antigravity

Thank you for your interest in contributing to GSD-Antigravity! We welcome contributions that improve the reliability, efficiency, and extensibility of our GSD system.

## 🚀 Getting Started

1. **Fork the repository** and create your branch from `main`.
2. **Follow the Skill Spec**: All changes to skills must adhere to the Antigravity Skill specification found in [.agent/skills/skill-developer/SKILL.md](.agent/skills/skill-developer/SKILL.md).
3. **Draft your changes**: Whether it's a new command, an agent prompt improvement, or a bug fix in the converter.

## 🛠️ Development Guidelines

- **Maintain Hierarchy**: Ensure any new commands fit into the Plan -> Execute -> Verify workflow.
- **Spec-Driven**: Use the provided templates in `assets/templates` when creating new project artifacts.
- **Rebranding**: If adding new commands, ensure they follow the `gsd:` prefix nomenclature.
- **Testing**: Before submitting a PR, verify your skill by running the `gsd-converter` script to ensure it packages correctly.

## 📋 Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable.
2. Ensure any new dependencies are clearly documented.
3. Your PR will be reviewed by the maintainers for compliance with GSD core principles.

## 💬 Community

Join our Discord or open an issue for architectural discussions before making major changes.

---

*Happy Coding!*
