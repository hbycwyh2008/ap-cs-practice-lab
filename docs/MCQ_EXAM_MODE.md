# MCQ Exam Mode (AP-style Practice)

This document describes the AP-style multiple-choice exam practice mode for students.

The goal is to provide a focused, exam-like practice flow for AP CSA classroom use, without copying official exam branding or official UI assets.

## Teacher View vs Student View

Teacher question detail (`/teacher/questions/[id]`):

- Shows prompt and choices.
- May include teacher-oriented notes for answer-key auditing.
- Shows student submissions for review.

Student exam mode (`/student/assignments/[id]` when assignment is all MCQ):

- Shows one question at a time.
- Shows question navigator and answer progress.
- Supports mark-for-review.
- Does **not** show answer key before submission.
- Does **not** show teacher audit text.
- Does **not** show teacher submission management panels.

Student list view (`/student/assignments`):

- Shows assignment title, due date, and question count.
- Does **not** show fake completion progress when real completion data is unavailable.

## Student Workflow

1. Open assignment page.
2. If assignment questions are all multiple-choice, exam mode opens automatically.
3. If assignment contains mixed MCQ + FRQ, the normal question list opens with a mixed-type note.
4. Choose the best answer for each question.
5. Optionally mark questions for review.
6. Navigate with Previous/Next or question-number buttons.
7. Submit assignment when finished.
8. If unanswered questions remain, confirm submission in browser prompt.
9. View score summary and per-question result status (correct/incorrect/unanswered).

## Teacher Setup Workflow

1. Import MCQ bank from `/teacher/questions/import-mcq`.
2. Verify imported questions in question bank.
3. Create an assignment selecting desired MCQ questions.
4. Assign to class and ask students to complete in exam mode.
5. Review student submissions in teacher views.

## Answer Visibility Policy

- Correct answers are stored server-side.
- Student submissions are graded server-side.
- Students do not receive answer key before final submission.
- Student-facing assignment/question payloads do not include `reference_solution`.
- Student-facing MCQ choices do not include `is_correct`.
- Post-submit student view includes:
  - total score
  - correct/incorrect/unanswered status
  - selected answer
- Teacher review remains separate from student exam mode.

## Assignment Type Handling

- All-MCQ assignments: MCQ exam mode.
- FRQ-only assignments: existing coding question list flow.
- Mixed assignments (MCQ + FRQ): supported through question list mode only in this milestone.
- Mixed mode does not attempt a combined MCQ exam workflow.

## Manual Dry Run

Use the dedicated checklist in [MCQ_EXAM_MODE_DRY_RUN.md](./MCQ_EXAM_MODE_DRY_RUN.md).

## Current Limitations

- No real timer yet (UI may show placeholder copy only).
- Batch submit for all MCQ answers is not implemented yet; submissions are sent one by one.

## 40-question AP-style Practice Sets

- AP-style classroom practice is often configured as a 40-question set.
- Imported banks may contain more than 40 questions (for example 41+).
- Teacher should select the desired number of questions when creating assignments.
- The exam mode UI supports any assignment question count and does not assume exactly 40.

## Branding and Compliance Note

- This mode is for AP-style practice only.
- Do not claim this is the official AP or Bluebook interface.
- Do not copy official College Board branding, logos, or UI assets.
