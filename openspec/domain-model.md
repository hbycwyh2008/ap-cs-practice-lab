# Domain Model

## User

Purpose: represents a teacher or student account.

Key fields:

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `class_id`
- `created_at`

Ownership rules:

- Teachers are independent owners of classes, questions, and assignments.
- Students belong to one class through `class_id`.

Visibility rules:

- Users can read their own `/auth/me` identity.
- Teachers may see anonymized student account data for classes they own.
- Student identities in analytics are intentionally reduced to display labels such as `Student #<id>`.

Known limitations:

- No password reset flow.
- No OAuth/SSO.
- No admin role.

## SchoolClass

Purpose: groups students under a teacher for assignment targeting.

Key fields:

- `id`
- `name`
- `school_year`
- `teacher_id`
- `created_at`

Ownership rules:

- A class belongs to one teacher.
- Only the owning teacher may create students for, export, or manage that class.

Visibility rules:

- Teacher sees owned classes.
- Student may see only their own class metadata.

Known limitations:

- No class archival or transfer workflow.

## Question

Purpose: stores FRQ coding prompts and MCQ prompts as teacher-owned question bank items.

Key fields:

- `id`
- `title`
- `course`
- `unit`
- `topic`
- `difficulty`
- `type`
- `prompt`
- `starter_code`
- `reference_solution`
- `max_points`
- `skill`
- `practice_type`
- `frq_type`
- `error_pattern`
- `recommended_use`
- `source_type`
- `visibility`
- `estimated_minutes`
- `source`
- `is_active`
- `created_by`

Ownership rules:

- A question belongs to the teacher who created or imported it.
- Teachers can assign only their own active questions.

Visibility rules:

- Teachers see their own full question records.
- Students can access only questions assigned to their class.
- Student-facing question payloads must null `reference_solution`.

Known limitations:

- FRQ runner currently supports one method signature.
- Taxonomy fields are flexible text enums, not a normalized taxonomy table.

## MultipleChoiceChoice

Purpose: stores answer choices for MCQ questions.

Key fields:

- `id`
- `question_id`
- `label`
- `text`
- `is_correct`
- `created_at`

Ownership rules:

- Choices belong to a question.
- The owning teacher controls the parent question.

Visibility rules:

- Students may receive `label` and `text`.
- Students must not receive `is_correct`.
- Server-side grading may read `is_correct`.

Known limitations:

- No answer explanation model.
- No batch MCQ submission model.

## TestCase

Purpose: stores public and hidden FRQ test cases.

Key fields:

- `id`
- `question_id`
- `name`
- `input_json`
- `expected_output`
- `is_hidden`
- `points`
- `created_at`

Ownership rules:

- Test cases belong to questions.
- The owning teacher controls the parent question.

Visibility rules:

- Students may receive public test inputs.
- Students must not receive hidden test cases or expected outputs.
- Teachers may see expected outputs during review.

Known limitations:

- Inputs currently support `{"nums": [...]}` for `int[]`.

## Assignment

Purpose: publishes selected questions to a class.

Key fields:

- `id`
- `title`
- `description`
- `class_id`
- `created_by`
- `due_at`
- `created_at`

Ownership rules:

- Assignment belongs to a teacher and targets one class.
- Assignment creation validates class ownership and question ownership.

Visibility rules:

- Teacher sees owned assignments.
- Student sees assignments for their class.

Known limitations:

- No per-student release rules.
- No assignment archive state.

## AssignmentQuestion

Purpose: joins assignments to questions with order and point values.

Key fields:

- `id`
- `assignment_id`
- `question_id`
- `order`
- `points`

Ownership rules:

- Managed through the parent assignment by the owning teacher.

Visibility rules:

- Student sees assignment-question links only for assignments in their class.

Known limitations:

- Mixed assignments are supported only through list mode, not unified exam mode.

## Submission

Purpose: records practice runs and final submissions.

Key fields:

- `id`
- `student_id`
- `assignment_id`
- `question_id`
- `code`
- `status`
- `score`
- `max_score`
- `feedback_json`
- `compile_output`
- `runtime_output`
- `is_final`
- `created_at`

Ownership rules:

- Submission belongs to the submitting student.
- Teacher can view submissions for assignments they own.

Visibility rules:

- Student sees own submissions only.
- Teacher sees submissions for own assignments/classes.
- Hidden feedback is sanitized for students.

Known limitations:

- MCQ exam mode creates per-question submissions, not a single batch assignment attempt.
