# Change: student-classroom-flow-figma-gate

## 1. Decision

Further student classroom flow frontend implementation is blocked until an actual Figma prototype is created and approved.

The existing commit `1c4fc967629fa9fb77a0679ef25e2c5fa8ed3ffb` is treated as a small pre-Figma implementation and must not be expanded until Figma approval is complete.

Do not revert `1c4fc967629fa9fb77a0679ef25e2c5fa8ed3ffb` unless the app is broken.

## 2. Reason

- OpenSpec defines behavior and constraints.
- Markdown low-fi prototype documents structure.
- But behavior spec plus low-fi markdown is not enough to evaluate visual quality and UX clarity.
- Classroom software requires high visual clarity before implementation.
- Students must understand what to do within 5 seconds.
- Teachers must be able to explain the flow during a live class.
- Therefore, actual Figma frames are required before any additional student UI implementation.

## 3. Required Figma Frames

- 01 Student Assignments - Default
- 02 Student Assignments - Empty
- 03 Student Assignments - Loading
- 04 Student Assignments - Error
- 05 MCQ Exam Mode - In Progress
- 06 MCQ Exam Mode - Unanswered Submit Warning
- 07 MCQ Exam Mode - Submitted Result Summary
- 08 FRQ Assignment Question List
- 09 FRQ Coding Page Entry
- 10 Mixed Assignment Fallback
- 11 Mobile Student Assignments
- 12 Mobile MCQ Exam Mode

## 4. Figma Approval Criteria

The Figma prototype must demonstrate all of the following:

- clear visual hierarchy
- obvious primary actions
- readable assignment cards
- clear assignment metadata
- no fake progress
- no fake timer
- clear MCQ navigation
- clear answered/unanswered/marked counters
- clear submit warning
- clear result summary
- clear Return to Assignments action
- clear FRQ Run Public Tests vs Submit Final Answer distinction
- clear mixed-assignment fallback
- usable mobile layout
- no official AP / College Board / Bluebook branding
- no student-visible answer leaks
- no teacher-only controls in student pages

## 5. Implementation Gate

### Milestone 5.3 Student Assignments Page Polish may continue only after:

- actual Figma prototype exists
- Student Assignments default frame is approved
- Student Assignments empty/loading/error frames are approved
- Mobile Student Assignments frame is approved
- implementation prompt references the approved Figma frame link

### Milestone 5.4 MCQ Exam Mode UI Polish may start only after:

- MCQ Exam Mode in-progress frame is approved
- MCQ unanswered submit warning frame is approved
- MCQ submitted result summary frame is approved
- Mobile MCQ Exam Mode frame is approved
- implementation prompt references the approved Figma frame link

### Milestone 5.5 FRQ Assignment List and Coding Entry Polish may start only after:

- FRQ Assignment Question List frame is approved
- FRQ Coding Page Entry frame is approved

### Milestone 5.6 Mixed Assignment Fallback Polish may start only after:

- Mixed Assignment Fallback frame is approved

## 6. Current Implementation Status

- `frontend/src/app/student/assignments/page.tsx` has already received a small polish commit before Figma approval.
- This page must not be further modified until the Figma gate is satisfied.
- Current implementation is a temporary working state, not final UI/UX approval.

## 7. Required Future Implementation Prompt Rule

Every future student UI implementation prompt must include:

- approved Figma file URL
- approved frame name
- affected route
- affected file
- explicit non-goals
- answer visibility checks
- mobile acceptance criteria
- screenshot/manual check requirement

## 8. Figma File Requirement

An editable Figma design file is required.

Suggested Figma file name:

`AP CS Practice Lab - Student Classroom Flow Prototype`

The design file must include all required frames before frontend implementation continues.
