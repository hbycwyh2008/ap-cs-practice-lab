# Cursor Work Rules

Cursor must follow the OpenSpec baseline in `openspec/` before implementing user-facing changes.

## Rules

- Read the relevant OpenSpec documents before changing behavior.
- Do not rewrite the app from scratch.
- Do not replace the architecture without an approved OpenSpec change.
- Do not let Cursor invent product behavior outside the approved spec.
- Keep one task focused on one main purpose.
- Prefer small, reviewable edits.
- Keep frontend, backend, database, Java runner, Docker, and Tailwind changes out of documentation-only tasks.
- Check answer visibility any time student-facing APIs or pages change.
- Do not expose MCQ answer keys, `is_correct`, `reference_solution`, hidden expected outputs, or teacher audit notes to students before submission.
- Do not commit copied AP/College Board/Bluebook/proprietary content.

## Required Before Code

- Identify the relevant baseline file in `openspec/`.
- Use `openspec/change-template.md` for non-trivial changes.
- Confirm validation commands from `openspec/testing-and-release-gates.md`.
- Confirm rollback plan for risky changes.

## Required Before Commit

- Run required validation.
- Confirm changed files match the requested scope.
- Confirm no secrets or copyrighted content were added.
- For source changes, confirm the behavior still matches OpenSpec.
