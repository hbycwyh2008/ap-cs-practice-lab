# OpenSpec Baseline

This folder is the source of truth for spec-driven development on AP CS Practice Lab.

## How to Use This Folder

- Read `project.md` before changing product direction or public/private content policy.
- Read `current-state.md` before proposing new behavior.
- Read `architecture.md` before changing infrastructure, API boundaries, runner behavior, or deployment assumptions.
- Read `domain-model.md` before changing models, schemas, or persisted data.
- Read `roles-and-permissions.md` and `data-visibility-and-security.md` before changing any student/teacher view or payload.
- Read `user-flows.md` before changing classroom workflows.
- Read `api-contracts.md` before changing endpoints or frontend API types.
- Read `testing-and-release-gates.md` before validating and committing.
- Read `gap-analysis.md` to choose future work.
- Start future changes from `change-template.md`.

## Development Rules

- Do not implement large user-facing features without an OpenSpec change.
- Do not let Cursor invent behavior outside the approved spec.
- One change should have one main purpose.
- Specs should be updated before implementation.
- Design should be approved before code.
- Tasks should be small and reviewable.
- Build and smoke tests are required before commit.
- Manual classroom dry run is required for UX changes.

## Change Workflow

1. Choose one gap or problem.
2. Copy `change-template.md` into a named change document or proposal.
3. Fill in current behavior, desired behavior, requirements, design impact, tasks, acceptance criteria, validation, and rollback.
4. Review visibility/security impact before coding.
5. Implement only the approved scope.
6. Run required validation gates.
7. Commit only scoped changes.

## Scope Guard

Documentation-only milestones must not modify frontend, backend, database, Java runner, Docker, or Tailwind/PostCSS source files. Implementation milestones must list affected files and validation commands in the change spec before code changes begin.
