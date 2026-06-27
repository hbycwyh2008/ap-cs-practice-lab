# Development Workflow

AP CS Practice Lab now uses the OpenSpec baseline in `openspec/` as the source of truth for product behavior and implementation scope.

## Standard Flow

1. Read the relevant baseline specs in `openspec/`.
2. Create or update an OpenSpec change using `openspec/change-template.md`.
3. Confirm problem, non-goals, affected users, requirements, design impact, permissions, answer visibility, testing, and rollback.
4. Implement only the approved scope.
5. Run the validation commands in `openspec/testing-and-release-gates.md`.
6. Confirm changed files match the approved scope before commit.

## Scope Rules

- One change should have one main purpose.
- Do not combine unrelated UI, backend, runner, Docker, and documentation work.
- Do not invent behavior outside the approved spec.
- For documentation-only milestones, do not modify production source code.

## Required Reading

- Project purpose and content policy: `openspec/project.md`
- Current implementation baseline: `openspec/current-state.md`
- Architecture and infrastructure assumptions: `openspec/architecture.md`
- Data model: `openspec/domain-model.md`
- Permissions and answer visibility: `openspec/roles-and-permissions.md`, `openspec/data-visibility-and-security.md`
- Validation gates: `openspec/testing-and-release-gates.md`
