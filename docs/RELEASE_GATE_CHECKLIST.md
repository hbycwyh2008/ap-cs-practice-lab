# Release Gate Checklist

Use this checklist before committing or using a new implementation milestone in class. The authoritative validation policy lives in `openspec/testing-and-release-gates.md`.

## Automated Gates

From `frontend/`:

```bash
npm run build
```

From repository root:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend python seed.py
python scripts/smoke_test.py
```

Required final smoke-test output:

```text
SMOKE TEST PASSED
```

If MCQ behavior changed and `scripts/mcq_smoke_test.py` exists:

```bash
python scripts/mcq_smoke_test.py
```

## Manual Gates

- Frontend is styled.
- Navbar works.
- Teacher navigation is hidden from students.
- Student pages do not leak answers.
- No fake progress appears unless real data supports it.
- Changed pages are manually checked or screenshot-checked.
- Teacher can review submissions.
- Classroom fallback plan is available for UX changes.

## Scope Gate

- Verify changed files match the approved OpenSpec change.
- For documentation-only milestones, verify only documentation/spec files changed.
- For implementation milestones, verify source changes match the affected files listed in the OpenSpec change.
