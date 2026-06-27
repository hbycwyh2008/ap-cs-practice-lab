# Current State

This document reverse-specs the implemented system as of Milestone 4.9. It describes what exists now and does not authorize new feature work by itself.

## Teacher Features

- Login with email/password and JWT-backed session.
- Teacher dashboard with class, assignment, platform status, command center shortcuts, and analytics summaries.
- Class creation.
- Bulk anonymized student account creation for a teacher-owned class.
- Student credential CSV export without passwords after initial bulk-create display.
- Question bank listing with active/archived sections.
- Question bank filters by unit, topic, skill, question type, difficulty, practice type, FRQ type, error pattern, and visibility.
- FRQ structured JSON import.
- MCQ structured JSON import.
- Manual assignment creation by selecting active questions.
- Auto-generated assignment creation from teacher-owned active questions and taxonomy filters.
- Submissions review with class and assignment filters.
- Teacher analytics covering assignment completion, question performance, and skill aggregation.
- Analytics CSV export.

## Student Features

- Login with email/password and JWT-backed session.
- Student dashboard and assignment list.
- Assignment cards show title, due date, and question count; they do not show fake completion progress when real completion data is unavailable.
- FRQ practice through the existing question list and question-solving flow.
- Java public test runs through `/submissions/run`.
- Final FRQ submission through `/submissions/submit`.
- MCQ exam mode when an assignment contains only multiple-choice questions.
- MCQ answer selection, question navigation, mark-for-review, unanswered warning, and post-submit score summary.
- Mixed MCQ + FRQ or FRQ-only assignments use normal question list mode.

## System Features

- FastAPI backend with SQLModel models and Pydantic schemas.
- Next.js frontend with TypeScript, Tailwind CSS, and shadcn-style UI components.
- PostgreSQL 16 database in Docker Compose.
- Docker-based Java runner using Eclipse Temurin JDK 17.
- Role-based access control for teacher and student flows.
- Student-facing payload sanitization for hidden expected outputs and `reference_solution`.
- MCQ grading server-side using stored `MultipleChoiceChoice.is_correct`.
- Core smoke test in `scripts/smoke_test.py`.
- Optional MCQ smoke test in `scripts/mcq_smoke_test.py`.

## Current Scope Constraints

- FRQ Java runner supports `public int solve(int[] nums)` only.
- MCQ exam mode is intended for all-MCQ assignments only.
- Mixed assignments are supported through question list mode, not combined exam mode.
- There is no real MCQ timer.
- MCQ submissions are sent one by one through `/submissions/submit`.
- The project does not currently include full Playwright E2E coverage.
