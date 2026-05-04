# Design Contract Workflow

This workflow guides the process of creating a UI specification (design contract) before implementation begins.

## 1. Discovery
- Gather requirements for the UI feature.
- Identify target users and their primary goals.
- Define success metrics for the interface.

## 2. Component Inventory
- Break down the UI into a hierarchy of components using atomic design principles:
  - **Organisms:** Complex sections (e.g., Header, UserProfile)
  - **Molecules:** Groups of UI elements functioning together (e.g., SearchForm, UserCard)
  - **Atoms:** Basic building blocks (e.g., Button, Input, Icon)

## 3. Interaction Design
- Define the state machine for each interactive component.
- Explicitly describe behavior for the following states:
  - Idle
  - Hover
  - Active/Focused
  - Disabled
  - Error
  - Loading

## 4. Design Tokens
- Establish the visual foundation for the UI:
  - **Color Palette:** Primary, secondary, semantic (success, error), and neutral colors.
  - **Typography Scale:** Headings, body text, small print.
  - **Spacing System:** Margins, padding, layout gaps.
  - **Breakpoints:** Mobile, tablet, desktop thresholds.

## 5. Accessibility Audit
- Ensure WCAG 2.1 AA compliance for all components:
  - **Focus Order:** Logical tab sequence.
  - **ARIA Labels:** Proper labeling for screen readers.
  - **Contrast Ratios:** Ensure text and interactive elements have sufficient contrast.
  - **Keyboard Navigation:** All functionality must be keyboard-accessible.

## 6. Specification Assembly
- Compile all findings and decisions into a single document.
- Use the `@references/templates/ui-spec-template.md` to structure the final `UI-SPEC.md` artifact.

## 7. Review Gate
- Present the completed `UI-SPEC.md` to the user.
- Await explicit user approval before proceeding to any implementation or coding tasks.
