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

## Student Workflow

1. Open assignment page.
2. If assignment questions are all multiple-choice, exam mode opens automatically.
3. Choose the best answer for each question.
4. Optionally mark questions for review.
5. Navigate with Previous/Next or question-number buttons.
6. Submit assignment when finished.
7. View score summary and per-question result status (correct/incorrect/unanswered).

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
- Post-submit student view includes:
  - total score
  - correct/incorrect/unanswered status
  - selected answer
- Teacher review remains separate from student exam mode.

## 40-question AP-style Practice Sets

- AP-style classroom practice is often configured as a 40-question set.
- Imported banks may contain more than 40 questions (for example 41+).
- Teacher should select the desired number of questions when creating assignments.
- The exam mode UI supports any assignment question count and does not assume exactly 40.

## Branding and Compliance Note

- This mode is for AP-style practice only.
- Do not claim this is the official AP or Bluebook interface.
- Do not copy official College Board branding, logos, or UI assets.
