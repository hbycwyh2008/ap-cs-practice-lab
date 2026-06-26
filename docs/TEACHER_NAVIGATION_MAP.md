# Teacher Navigation Map

This document defines the classroom-focused navigation structure for AP CS Practice Lab.

## Teacher Navigation

Top-level teacher menu:

- Dashboard (`/dashboard`)
- Classes & Students (`/teacher/classes`)
- Question Bank (`/teacher/questions`)
- Import FRQ (`/teacher/questions/import`)
- Import MCQ (`/teacher/questions/import-mcq`)
- Assignments (`/teacher/assignments`)
- Submissions (`/teacher/submissions`)
- Analytics (`/teacher/analytics`)
- Help / Docs (`/teacher/help`)

Notes:

- Navigation is role-specific. Teacher links are not shown to students.
- Active state supports subroutes. Example: `/teacher/questions/12` highlights Question Bank.

## Student Navigation

Top-level student menu:

- Dashboard (`/dashboard`)
- Assignments (`/student/assignments`)
- Practice (`/student/practice`)
- Logout

Teacher-only pages are not included in student navigation.

## Common Teacher Workflows

### A) Class Setup

1. Login
2. Open `Classes & Students`
3. Create class (`/teacher/classes/new`)
4. Open class detail (`/teacher/classes/{id}`)
5. Bulk create student accounts
6. Export student CSV

### B) Build and Assign MCQ/FRQ

1. Login
2. Import MCQ (`/teacher/questions/import-mcq`) or Import FRQ (`/teacher/questions/import`)
3. Verify in Question Bank (`/teacher/questions`)
4. Create assignment (`/teacher/assignments/new`)

### C) Review Progress

1. Open Submissions (`/teacher/submissions`)
2. Open Analytics (`/teacher/analytics`)
3. Export CSV from analytics pages

### D) FRQ-first flow

1. Question Bank
2. Import FRQ
3. Create assignment
4. Review submissions

## Route Purpose Summary

- `/dashboard`: Teacher command center (quick actions + dashboard stats + analytics section)
- `/teacher/classes`: Class index and class management entry
- `/teacher/classes/new`: Create class
- `/teacher/classes/{id}`: Bulk student creation and credential export
- `/teacher/questions`: Question Bank list and archive/restore
- `/teacher/questions/new`: Manual question creation
- `/teacher/questions/import`: Structured FRQ import
- `/teacher/questions/import-mcq`: Structured MCQ import
- `/teacher/assignments`: Assignment list
- `/teacher/assignments/new`: Assignment creation (manual/auto)
- `/teacher/submissions`: Submission review with filters
- `/teacher/analytics`: Analytics overview and CSV export
- `/teacher/help`: Workflow shortcuts and navigation aid

## Role Boundaries

- Teacher-only:
  - class management
  - imports
  - assignments management
  - submissions
  - analytics
- Student-only:
  - assignment practice
  - student question solving pages

The app should keep teacher guidance and audit notes on teacher pages only, not in student practice views.
