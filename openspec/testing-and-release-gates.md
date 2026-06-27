# Testing and Release Gates

## Required Validation for Every Implementation Milestone

Run from `frontend/`:

```bash
npm run build
```

Run from repository root:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend python seed.py
python scripts/smoke_test.py
```

Required smoke-test final output:

```text
SMOKE TEST PASSED
```

If `scripts/mcq_smoke_test.py` exists and the change touches MCQ behavior, also run:

```bash
python scripts/mcq_smoke_test.py
```

## Manual Visual Checks

For every user-facing implementation milestone:

- Frontend is styled.
- Navbar works.
- Teacher navigation is hidden from students.
- Student assignment list is styled and readable.
- Student pages do not leak answers.
- MCQ exam mode is styled when relevant.
- Buttons, cards, badges, and alerts render correctly.
- No fake progress appears unless clearly backed by real data.
- Changed pages are screenshot-checked or manually inspected in browser.

## Manual Classroom Dry Run

For UX changes, run a small teacher/student dry run before classroom use:

- Teacher can log in.
- Student can log in.
- Assignment visibility matches class membership.
- FRQ run and submit work.
- MCQ submit works if affected.
- Teacher review and analytics still show submissions.
- Emergency fallback plan is known before class starts.

## Documentation Gate

Before implementation work:

- Confirm whether an OpenSpec change is required.
- Update or create the relevant spec before code.
- Keep one change focused on one main purpose.
- Avoid combining unrelated UI, backend, data model, and infrastructure work.

Before commit:

- Confirm changed files match the approved scope.
- Confirm source code was not changed for documentation-only milestones.
- Confirm no copyrighted classroom content or secrets were added.

## Future Recommended Tests

- Playwright E2E tests for teacher class setup, import, assignment creation, student FRQ, student MCQ, and teacher review.
- MCQ smoke test as a standard gate.
- Visual regression screenshots for core teacher/student pages.
- API contract tests for answer visibility and permission boundaries.
- Database migration tests once migration tooling is introduced.
