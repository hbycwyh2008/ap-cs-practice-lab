# Figma Handoff Spec

This project does not require a Figma prototype for every change. When a change affects important classroom UX, the design should be approved before code and referenced from the OpenSpec change.

## When Figma Is Required

Create or update a Figma prototype when the change affects:

- A new major teacher or student workflow.
- MCQ exam mode layout or timing behavior.
- Assignment creation workflow.
- Student assignment list progress/attempt states.
- Navigation redesign.
- Any screen that may confuse students during a live class.

## When Figma Is Optional

Figma is optional for:

- Backend-only fixes.
- Test-only changes.
- Documentation-only changes.
- Small copy changes that do not alter layout or workflow.

## OpenSpec Linkage

Every Figma-backed change should include this information in the OpenSpec change:

- Figma file or frame link.
- Affected frontend pages.
- Required states, such as loading, empty, success, error, and access denied.
- Student/teacher role differences.
- Answer visibility notes if the screen displays assessment content.
- Manual visual checks required before release.

## Design Constraints

- Do not copy AP, College Board, AP Classroom, or Bluebook branding.
- Keep language to "AP CSA practice" or "AP-style practice".
- Use original UI patterns aligned with the existing app.
- Preserve teacher/student role boundaries from `openspec/roles-and-permissions.md`.
