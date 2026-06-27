# Change: student-classroom-flow-prototype

## Problem

The student-facing classroom flow needs to be explicitly specified and prototyped before any further UI implementation work. Students should immediately understand what to do after login, how to start MCQ practice, how to start FRQ practice, how to submit, and how to return to assignments.

This change freezes target behavior for the student flow as a planning baseline so implementation can stay focused and consistent.

## Non-goals

- Do not modify frontend source code in this milestone.
- Do not modify backend source code in this milestone.
- Do not modify database models.
- Do not modify Java runner.
- Do not modify Docker or Tailwind configuration.
- Do not implement new features.
- Do not add a real timer.
- Do not add MCQ batch submit.
- Do not change grading logic.
- Do not change submission behavior.
- Do not redesign teacher flows.

## Affected users

- Student (primary).
- Teacher (indirectly), because predictable student flow improves classroom reliability.

## Current behavior

- Student assignment list exists and is accessible from student navigation.
- Assignment detail behavior branches by assignment composition:
  - All-MCQ assignment: opens MCQ exam mode.
  - Non-all-MCQ assignment (FRQ-only or mixed): opens question list mode.
- FRQ questions open through existing student coding page.
- FRQ coding page supports Java editing, public test run, and final submit.
- MCQ results display after submission with summary and per-question status.
- MCQ answers are currently submitted one-by-one (no batch submit).
- Real timer is not implemented.
- Mixed assignments use question list mode.

## Desired behavior

### A. Student Assignment List

- Show assignment title.
- Show due date.
- Show question count.
- Show clear `Start Practice` action.
- Do not show fake completion progress.
- Make assignment type understandable where feasible (for example via concise label/copy).

### B. All-MCQ Assignment

- Open MCQ exam mode.
- Show one question at a time.
- Show answered/unanswered count.
- Show mark-for-review count.
- Show question navigator.
- Warn before submit when unanswered questions exist.
- Show result summary after submission.
- Provide `Return to Assignments` action.

### C. FRQ Assignment

- Show question list for FRQ flow.
- Each FRQ opens coding page.
- Coding page supports writing Java.
- `Run` executes public tests.
- `Submit` executes final grading.
- Feedback is visible after submit.

### D. Mixed Assignment

- Use normal question list mode.
- Show clear mixed-type note.
- Do not attempt combined exam mode in this change.

### E. Security

- Student must not see MCQ answer key before submission.
- Student must not see `is_correct`.
- Student must not see `reference_solution`.
- Student must not see hidden `expected_output`.
- Student must not see teacher audit notes.

## Requirements

- WHEN a student opens `/student/assignments`, THE SYSTEM SHALL show assigned assignments with title, due date, question count, and a clear Start Practice action.
- WHEN a student opens `/student/assignments`, THE SYSTEM SHALL NOT display fake completion progress.
- WHEN a student opens an all-MCQ assignment, THE SYSTEM SHALL render MCQ exam mode.
- WHEN a student is in MCQ exam mode, THE SYSTEM SHALL show answered, unanswered, and mark-for-review counts.
- WHEN a student is in MCQ exam mode, THE SYSTEM SHALL provide question navigator controls.
- WHEN a student has unanswered MCQ questions and clicks Submit, THE SYSTEM SHALL show a confirmation warning.
- WHEN a student submits MCQ answers, THE SYSTEM SHALL show score summary and per-question status.
- WHEN a student finishes MCQ submission, THE SYSTEM SHALL provide a Return to Assignments action.
- WHEN a student opens an FRQ-only assignment, THE SYSTEM SHALL render question list mode.
- WHEN a student opens an FRQ question, THE SYSTEM SHALL render coding page with Run (public tests) and Submit (final grading).
- WHEN a student opens a mixed assignment, THE SYSTEM SHALL render question list mode with a mixed-question-type notice.
- WHEN student-facing payloads include questions, THE SYSTEM SHALL NOT expose `is_correct`, answer key, `reference_solution`, hidden `expected_output`, or teacher audit notes.
- WHEN a student is unauthorized or role-mismatched, THE SYSTEM SHALL show access denied or redirect behavior consistent with current role policy.

## Design

### Frontend pages affected (implementation phase)

- `frontend/src/app/student/assignments/page.tsx`
- `frontend/src/app/student/assignments/[id]/page.tsx`
- `frontend/src/app/student/questions/[id]/page.tsx`

### Backend APIs affected

- No backend API changes are required for this proposal baseline.
- Existing behavior is sufficient for this prototype spec:
  - `GET /assignments`
  - `GET /assignments/{id}`
  - `POST /submissions/run`
  - `POST /submissions/submit`
  - Existing student payload sanitization rules remain unchanged.

### Expected data needed by frontend

- Assignment list item: `id`, `title`, `due_at`, `question_count`, optional `description`.
- Assignment detail item: question list with `question_id`, `order`, `points`, `question.type`, `question.title`, `question.prompt`, `choices`.
- FRQ result payload: run/submit score, status, compile/runtime outputs, feedback test summary.
- MCQ result payload: submission score/max_score and status details used for post-submit summary.

### Answer visibility impact

- No change to policy.
- This proposal explicitly preserves current restrictions:
  - no `is_correct` or answer key before submission,
  - no `reference_solution` in student payloads,
  - no hidden expected output in student-facing data,
  - no teacher audit notes in student flow.

### State handling expectations

- **Loading state:** clear loading indicator for assignment list/detail/question pages.
- **Empty state:** assignment list empty message with student-safe guidance.
- **Error state:** concise retry-friendly error message when assignment/question loading or submission fails.
- **Access denied state:** keep role-boundary redirect/access-denied behavior aligned with current permissions.

### Mobile / narrow-screen notes

- Primary actions (`Start Practice`, `Submit`, navigation buttons) must remain visible and tappable.
- Question navigator should remain usable on narrow screens (wrap/scroll as needed).
- Status counters (answered/unanswered/marked) must remain readable without truncation.
- Result summary and return action must be visible without requiring desktop-only layout.

### Prototype requirement (Figma / low-fi)

- Figma prototype is required before implementation because this is a core student workflow that affects classroom clarity.
- Low-fi ASCII wireframes in this spec are preliminary structure guidance only.
- Implementation should start only after Figma flow approval and linkage in this change.

## Wireframes

### 1) Student Assignments page (low-fi)

```text
+--------------------------------------------------------------+
| My Assignments                                               |
| Practice AP CSA assignments                                  |
+--------------------------------------------------------------+
| [Assignment Card]                                            |
| Title: Unit 2 MCQ Practice                                   |
| Due: 2026-07-01      Questions: 10      Type: MCQ            |
| [Start Practice]                                             |
+--------------------------------------------------------------+
| [Assignment Card]                                            |
| Title: Array FRQ Drill                                       |
| Due: No due date      Questions: 3      Type: FRQ            |
| [Start Practice]                                             |
+--------------------------------------------------------------+
```

### 2) MCQ Exam Mode page (low-fi)

```text
+----------------------+---------------------------------------+
| Navigator            | Assignment: Unit 2 MCQ Practice      |
| Q1 Q2 Q3 Q4 ...      | Question 3 of 10                     |
| Answered 2 / 10      | Prompt text...                       |
| Unanswered 8         | (A) ...                              |
| Marked 1             | (B) ...                              |
|                      | (C) ...                              |
| [Prev] [Mark] [Next] | (D) ...                              |
| [Submit Assignment]  |                                       |
+----------------------+---------------------------------------+
```

### 3) MCQ Result Summary section (low-fi)

```text
+--------------------------------------------------------------+
| Submission Results                                           |
| Total Score: 7/10    Correct: 7/10    Unanswered: 1         |
| Q1 Correct   Selected: B   1/1                                |
| Q2 Incorrect Selected: A   0/1                                |
| ...                                                          |
| [Return to Assignments]                                      |
+--------------------------------------------------------------+
```

### 4) FRQ Assignment Question List (low-fi)

```text
+--------------------------------------------------------------+
| Assignment: Array FRQ Drill                                  |
| Questions                                                    |
| 1) Find Maximum Value      FRQ     10 pts   [Open]          |
| 2) Count Even Numbers      FRQ     10 pts   [Open]          |
| 3) Sum Positive Numbers    FRQ     10 pts   [Open]          |
+--------------------------------------------------------------+
```

### 5) FRQ Coding Page entry point (low-fi)

```text
+--------------------------------------------------------------+
| [Back to Assignment]   Question: Find Maximum Value          |
| Prompt ...                                                    |
| ------------------------------------------------------------ |
| Code Editor                                                   |
| public class Solution { ... }                                |
| ------------------------------------------------------------ |
| [Run Public Tests]   [Submit Final Answer]                   |
| Results / Feedback panel                                     |
+--------------------------------------------------------------+
```

### 6) Mixed Assignment fallback (low-fi)

```text
+--------------------------------------------------------------+
| Assignment: Mixed Practice Set                               |
| Note: This assignment contains mixed question types.         |
| Open each question individually.                              |
| 1) MCQ: Loop Tracing             [Open]                      |
| 2) FRQ: Array Traversal          [Open]                      |
| 3) MCQ: Condition Check          [Open]                      |
+--------------------------------------------------------------+
```

## Tasks

1. Freeze student flow intent in this OpenSpec change file.
2. Confirm the flow and security requirements with teacher/operator.
3. Produce Figma prototype for all listed student states and transitions.
4. Map Figma states to concrete UI tasks (separate follow-up change).
5. Create implementation change proposal after Figma approval (not in this milestone).

## Acceptance criteria

### Manual acceptance criteria (for future implementation validation)

- Student can log in and reach assignment list.
- Assignment list shows title, due date, question count, and clear Start Practice action.
- Assignment list does not show fake completion progress.
- All-MCQ assignment opens MCQ exam mode with counts and navigator.
- MCQ submit warns on unanswered questions.
- MCQ post-submit summary shows score and per-question status.
- FRQ assignment opens question list and each FRQ opens coding page.
- FRQ coding page supports Run (public) and Submit (final) with visible feedback.
- Mixed assignment shows fallback note and list mode (no combined exam mode).
- Student never sees answer key, `is_correct`, `reference_solution`, hidden expected output, or teacher audit notes before submission.
- Mobile/narrow-screen layout remains usable for assignment list, exam mode controls, and return navigation.
- Student can return to assignment list after MCQ submission.
- Student pages remain styled and navigable.

## Validation commands

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

## Rollback plan

This is a spec-only milestone.

- Delete or revert `openspec/changes/student-classroom-flow-prototype.md`.
- No production source rollback is needed.
