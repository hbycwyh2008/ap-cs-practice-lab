# Change: student-classroom-flow-implementation-plan

## 1. Purpose

This implementation plan converts the approved student classroom flow prototype into small, safe, reviewable implementation milestones.  
It is a planning/spec artifact only and does not authorize broad redesign or backend behavior changes outside approved scope.

## 2. Implementation Principles

- One milestone changes one primary screen or flow.
- No backend API changes unless explicitly approved by a future OpenSpec change.
- No fake progress.
- No fake timer.
- No answer leaks.
- No teacher controls on student pages.
- No official AP / College Board / Bluebook branding.
- No combined MCQ + FRQ exam mode.
- Keep changes small and reviewable.
- Run build and smoke tests before commit.
- Screenshot-check changed pages for visual sanity.

## 3. Current Approved Prototype Source

- `openspec/changes/student-classroom-flow-prototype.md`
- `docs/prototypes/STUDENT_CLASSROOM_FLOW_LOW_FI.md`

## 4. Proposed Implementation Milestones

### Milestone 5.3: Student Assignments Page Polish

**Problem**

The student entry page should be immediately understandable and should avoid misleading progress visuals.

**Affected route**

- `/student/assignments`

**Affected files**

- `frontend/src/app/student/assignments/page.tsx`
- `frontend/src/lib/api.ts` (only if required for existing type alignment)

**Explicit non-goals**

- Do not modify MCQ exam mode.
- Do not modify FRQ coding page.
- Do not modify backend grading.
- Do not add progress calculations unless real data exists.
- Do not add backend API fields.

**Implementation tasks**

1. Align card content and action hierarchy with approved prototype.
2. Ensure title, due date, question count, and `Start Practice` are clearly visible.
3. Remove/avoid fake progress displays.
4. Improve loading, empty, and error states only within this route.
5. Ensure narrow-screen usability for assignment cards and CTA.

**Manual acceptance criteria**

- Student understands where to click within 5 seconds.
- Every card shows title, due date, question count, and `Start Practice`.
- No fake completion progress is shown.
- Empty/loading/error states are clear and recoverable.
- Layout remains usable on mobile width.

**Automated validation**

- `npm run build`
- `python scripts/smoke_test.py`

**Answer visibility checks**

- No answer-related data appears on assignment list cards.
- No teacher-only controls appear.

**Rollback plan**

- Revert only assignment list page changes and any type-only alignment related to this milestone.
- Keep backend/API behavior untouched.

---

### Milestone 5.4: MCQ Exam Mode UI Polish

**Problem**

The all-MCQ flow needs clearer progress, navigation, submission clarity, and post-submit summary while preserving existing grading/submission behavior.

**Affected route**

- `/student/assignments/[id]` (all-MCQ mode only)

**Affected files**

- `frontend/src/app/student/assignments/[id]/page.tsx`

**Explicit non-goals**

- Do not change MCQ grading.
- Do not expose answer key before submission.
- Do not expose `is_correct`.
- Do not add official AP/Bluebook styling.
- Do not redesign teacher pages.
- Do not add real timer.
- Do not add batch submit.

**Implementation tasks**

1. Align header, counters, navigator, and action layout with prototype.
2. Keep one-question-at-a-time interaction clear.
3. Ensure unanswered confirmation warning behavior is clear and consistent.
4. Ensure post-submit lock behavior and summary presentation are clear.
5. Ensure `Return to Assignments` action is obvious post-submit.
6. Tune mobile layout for navigator/counters/actions.

**Manual acceptance criteria**

- All-MCQ assignment opens exam mode.
- Answered/unanswered/marked counters are visible and accurate.
- Navigator behavior is understandable.
- Submit warning appears when unanswered questions remain.
- Post-submit summary shows score and per-question status.
- Return navigation is easy to find.

**Automated validation**

- `npm run build`
- `python scripts/smoke_test.py`
- `python scripts/mcq_smoke_test.py`

**Answer visibility checks**

- No `is_correct` before submission.
- No answer key before submission.
- No `reference_solution`.
- No hidden expected output.
- No teacher audit notes.

**Rollback plan**

- Revert MCQ-mode UI changes in assignment detail page only.
- Keep backend submit/grading behavior unchanged.

---

### Milestone 5.5: FRQ Assignment List and Coding Entry Polish

**Problem**

FRQ path should clearly communicate question entry, run-vs-submit distinction, and return navigation without altering runner/grading logic.

**Affected routes**

- `/student/assignments/[id]` (non-all-MCQ question list mode)
- `/student/questions/[id]`

**Affected files**

- `frontend/src/app/student/assignments/[id]/page.tsx`
- `frontend/src/app/student/questions/[id]/page.tsx`

**Explicit non-goals**

- Do not change runner behavior.
- Do not change hidden test behavior.
- Do not expose hidden expected outputs.
- Do not rewrite code editor.
- Do not modify backend APIs.

**Implementation tasks**

1. Improve FRQ list readability (labels, points, open action clarity).
2. Ensure back-navigation to assignments is explicit and consistent.
3. Clarify `Run Public Tests` vs `Submit Final Answer` on coding entry.
4. Preserve current FRQ functionality while improving instructional clarity.
5. Verify mobile usability for list and coding entry.

**Manual acceptance criteria**

- FRQ assignments show clear list mode.
- Student can open FRQ questions easily.
- Run-vs-submit distinction is obvious.
- Back to assignment/assignments flow is clear.
- No confusion between public and final feedback.

**Automated validation**

- `npm run build`
- `python scripts/smoke_test.py`

**Answer visibility checks**

- Hidden expected outputs remain hidden to students.
- No teacher-only notes appear.

**Rollback plan**

- Revert FRQ list and coding entry UI-only changes.
- Preserve existing run/submit backend behavior.

---

### Milestone 5.6: Mixed Assignment Fallback Polish

**Problem**

Mixed assignments need explicit fallback copy and labels so students do not expect a combined exam mode.

**Affected route**

- `/student/assignments/[id]` (mixed assignment list mode)

**Affected files**

- `frontend/src/app/student/assignments/[id]/page.tsx`

**Explicit non-goals**

- Do not build combined MCQ+FRQ exam mode.
- Do not add new backend endpoints.
- Do not change assignment composition logic unless explicitly approved by a future spec change.

**Implementation tasks**

1. Ensure mixed-type notice text is clear and visible.
2. Ensure each item has a type label (`MCQ`/`FRQ`).
3. Ensure open action keeps existing per-question route behavior.
4. Confirm fallback behavior in narrow-screen layout.

**Manual acceptance criteria**

- Mixed assignments clearly indicate mixed question types.
- Student understands to open each question individually.
- Type labels are visible and correct.
- No combined exam mode appears.

**Automated validation**

- `npm run build`
- `python scripts/smoke_test.py`
- `python scripts/mcq_smoke_test.py` (to verify no regression in MCQ-safe behavior)

**Answer visibility checks**

- Same student safety boundaries remain enforced in mixed path.

**Rollback plan**

- Revert mixed-mode presentation copy/layout changes only.
- Preserve branching logic behavior.

---

### Milestone 5.7: Student Flow E2E Validation

**Problem**

Student classroom flow currently relies heavily on manual verification and smoke scripts; E2E coverage should validate key UX and safety paths.

**Affected routes**

- `/student/assignments`
- `/student/assignments/[id]`
- `/student/questions/[id]`

**Affected files**

- Playwright test files and config under test directories (exact paths to be defined in milestone scope).
- No production behavior changes in this milestone.

**Explicit non-goals**

- Do not implement new product behavior in this milestone.
- Do not rely on copyrighted content.
- Do not include real student data.

**Implementation tasks**

1. Add/document Playwright tests for assignment list flow.
2. Add/document tests for all-MCQ flow.
3. Add/document tests for unanswered submit warning.
4. Add/document tests for result summary and return navigation.
5. Add/document tests for FRQ open flow.
6. Add/document tests for mixed fallback flow.
7. Add/document answer visibility assertions where feasible.

**Manual acceptance criteria**

- E2E suite exercises student primary routes reliably.
- Test outcomes are understandable for classroom release decisions.
- Tests avoid introducing behavior not in approved prototype.

**Automated validation**

- `npm run build`
- `python scripts/smoke_test.py`
- `python scripts/mcq_smoke_test.py`
- Playwright command(s) defined during milestone planning

**Answer visibility checks**

- E2E assertions confirm no key pre-submit leak behaviors.

**Rollback plan**

- Revert test-only files if unstable.
- Keep production behavior unchanged.

## 5. Recommended Order

1. Milestone 5.3 Student Assignments Page Polish
2. Milestone 5.4 MCQ Exam Mode UI Polish
3. Milestone 5.5 FRQ Assignment List and Coding Entry Polish
4. Milestone 5.6 Mixed Assignment Fallback Polish
5. Milestone 5.7 Student Flow E2E Validation

Why Student Assignments comes first:

- It is the entry point for every student flow.
- It is lower risk than MCQ exam mode changes.
- It helps verify routing and assignment metadata clarity before deeper interaction polish.

## 6. Next Implementation Prompt Should Be

The next coding task should only implement:

**Milestone 5.3 Student Assignments Page Polish**

and should only touch:

- `frontend/src/app/student/assignments/page.tsx`
- `frontend/src/lib/api.ts` only if required for existing type alignment

It should not touch backend unless the implementation milestone discovers required data is missing and a separate approved OpenSpec change explicitly allows that backend work.

## 7. Validation Commands (For Future Implementation Milestones)

From `frontend`:

```bash
cd frontend
npm run build
```

From repo root:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend python seed.py
python scripts/smoke_test.py
```

If `scripts/mcq_smoke_test.py` exists:

```bash
python scripts/mcq_smoke_test.py
```
