# Roles and Permissions

## Logged-out Users

May access:

- Public landing page.
- Login page.
- Beta notice/help pages intended for public viewing.

Must not access:

- Teacher dashboard or teacher routes.
- Student assignment or question routes.
- API data requiring authentication.

## Teacher

Teacher permissions:

- Manage own classes.
- Bulk-create students for own classes.
- Export student lists for own classes.
- Manage own questions.
- Import FRQ and MCQ questions into own question bank.
- Archive and restore own questions.
- Create assignments for own classes.
- Select only own active questions for assignments.
- View submissions from own assignments/classes.
- View analytics for own assignments/classes.
- Export analytics CSV for own assignments/classes.

Teacher restrictions:

- Cannot manage another teacher's classes.
- Cannot assign another teacher's questions.
- Cannot view another teacher's assignment submissions.

## Student

Student permissions:

- View assignments for own class.
- Open assigned questions only.
- Run public tests for assigned FRQ questions.
- Submit final answers for assigned FRQ questions.
- Submit assigned MCQ answers.
- View own scores and allowed feedback.

Student restrictions:

- Cannot see teacher-only navigation.
- Cannot access teacher-only routes.
- Cannot create classes, questions, assignments, or analytics.
- Cannot open questions outside their assigned class assignments.
- Cannot submit questions outside their assignments.
- Cannot see answer keys before submission.
- Cannot see MCQ `is_correct`.
- Cannot see `reference_solution`.
- Cannot see hidden expected outputs.
- Cannot see teacher audit notes.

## Permission Enforcement Points

- Frontend navigation hides teacher links from students.
- Backend `require_teacher` protects teacher-only write/read endpoints.
- Class endpoints enforce teacher ownership or student class membership.
- Question endpoints restrict students to assigned question IDs.
- Assignment endpoints restrict students to own class assignments and teachers to owned assignments.
- Submission endpoints restrict students to own submissions and teachers to owned assignment submissions.
- Analytics endpoints require teacher role.
