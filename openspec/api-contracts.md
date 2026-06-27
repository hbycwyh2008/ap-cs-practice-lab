# API Contracts

This is a human-readable contract baseline. It does not generate or replace OpenAPI code.

## Auth

Primary user: logged-out users, teacher, student.

Purpose:

- Register users when public registration is enabled.
- Login with form or JSON credentials.
- Return current authenticated user.

Endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/login/json`
- `GET /auth/me`

Constraints:

- Production must disable public registration.
- Login returns bearer JWT token.
- `/auth/me` requires authentication.

## Classes

Primary user: teacher; student read access is limited to own class.

Purpose:

- List classes.
- Create teacher-owned classes.
- Get class detail with student count.
- Bulk-create anonymized student accounts.
- Export student roster CSV.

Endpoints:

- `GET /classes`
- `POST /classes`
- `GET /classes/{class_id}`
- `POST /classes/{class_id}/students/bulk-create`
- `GET /classes/{class_id}/students/export.csv`

Constraints:

- Teachers can manage only own classes.
- Students can read only their own class metadata.
- Bulk create and CSV export are teacher-only.
- Temporary passwords are returned only during bulk creation.
- CSV export excludes passwords.

## Questions

Primary user: teacher; student read access is limited to assigned questions.

Purpose:

- Manage teacher-owned question bank.
- Import structured FRQ questions and test cases.
- Import structured MCQ questions and choices.
- Archive/restore questions.

Endpoints:

- `GET /questions`
- `POST /questions`
- `POST /questions/import`
- `POST /questions/import-mcq`
- `GET /questions/{question_id}`
- `PUT /questions/{question_id}`
- `DELETE /questions/{question_id}`
- `POST /questions/{question_id}/restore`

Constraints:

- Teacher writes require teacher role.
- Teacher can update/archive/restore only own questions.
- Student can read only assigned questions.
- Student-facing question payload must set `reference_solution` to null.
- Student-facing MCQ choices must not expose `is_correct`.

## FRQ Import

Primary user: teacher.

Purpose:

- Convert structured JSON into FRQ question records and test cases.

Important constraints:

- Top-level payload is a list of questions.
- Each question requires prompt source fields, starter code, method signature, and at least one test case.
- `hidden` must be a strict boolean.
- Import content must be original or private/licensed and not copied from copyrighted sources into the public repository.

## MCQ Import

Primary user: teacher.

Purpose:

- Convert structured MCQ bank JSON into multiple-choice question records and answer choices.

Important constraints:

- Top-level payload is an object with `questions`.
- Each question type must be `multiple_choice`.
- Choice labels must be unique per question.
- `answer.label` must match one choice label.
- Correctness is stored server-side as `MultipleChoiceChoice.is_correct`.

## Assignments

Primary user: teacher and student.

Purpose:

- List assignments.
- Create assignments.
- Auto-generate assignments from taxonomy filters.
- Fetch assignment detail.
- Update/delete teacher-owned assignments.

Endpoints:

- `GET /assignments`
- `POST /assignments`
- `POST /assignments/generate`
- `GET /assignments/{assignment_id}`
- `PUT /assignments/{assignment_id}`
- `DELETE /assignments/{assignment_id}`

Constraints:

- Teachers see and manage assignments they created.
- Students see assignments for their own class.
- Assignment creation validates class ownership, question ownership, and question active state.
- Student assignment detail must sanitize question data.
- Assignment list includes `question_count`.

## Submission Run

Primary user: student for FRQ practice; teacher may use backend behavior where permitted.

Endpoint:

- `POST /submissions/run`

Purpose:

- Run public FRQ tests before final submission.

Constraints:

- Question must be part of the assignment.
- Student must belong to the assignment class.
- MCQ questions are rejected by run endpoint and must use final submit.
- Public-only feedback runs public tests while max score reflects the full question.
- Hidden expected outputs must not be exposed to students.

## Final Submit

Primary user: student.

Endpoint:

- `POST /submissions/submit`

Purpose:

- Submit final FRQ code or MCQ selected label.

Constraints:

- Question must be part of the assignment.
- Student must belong to the assignment class.
- FRQ final submit runs full tests server-side.
- MCQ final submit grades selected label server-side.
- Student response is sanitized.

## Submissions

Primary user: teacher and student.

Endpoints:

- `GET /submissions`
- `GET /submissions/{submission_id}`

Purpose:

- Teacher reviews class/assignment submissions.
- Student reads own submissions.

Constraints:

- Students see only own submissions.
- Teachers see submissions for owned assignments.
- Teacher filters include class, assignment, student, question, and final-only where implemented.
- Hidden details are shown only when teacher context allows.

## Analytics

Primary user: teacher.

Endpoints:

- `GET /analytics`
- `GET /analytics/export.csv`

Purpose:

- Provide assignment completion, question performance, skill aggregation, and CSV export.

Constraints:

- Teacher-only.
- Analytics are scoped to teacher-owned classes, assignments, and questions.
- Student identifiers in not-completed lists are anonymized display labels, not emails.
