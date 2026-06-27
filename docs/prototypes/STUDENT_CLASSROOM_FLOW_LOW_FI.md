# Student Classroom Flow Low-Fi Prototype Handoff

## 1. Purpose

This low-fidelity prototype handoff freezes the student classroom flow before frontend implementation.  
It translates the approved OpenSpec change `openspec/changes/student-classroom-flow-prototype.md` into screen-level behavior and state definitions so implementation stays consistent, safe, and classroom-ready.

This is a prototype/spec artifact only. It is not implementation work.

## 2. Routes Covered

- `/student/assignments`
- `/student/assignments/[id]`
- `/student/questions/[id]`

## 3. User Flow Map

### 3.1 MCQ-first flow

Student login  
-> Student Assignments page  
-> Start Practice  
-> all-MCQ assignment opens MCQ exam mode  
-> answer / mark / navigate  
-> submit with unanswered warning if needed  
-> result summary  
-> return to assignments

### 3.2 FRQ flow

Student Assignments page  
-> FRQ assignment  
-> question list  
-> open FRQ coding page  
-> run public tests  
-> submit final answer  
-> view feedback

### 3.3 Mixed assignment fallback flow

Student Assignments page  
-> mixed assignment  
-> question list mode with mixed-type notice  
-> open each question individually

## 4. Screen Prototype: Student Assignments Page

### Goal

Help students understand what to practice next within seconds after login.

### Primary user

Student.

### Required data

- assignment id
- title
- due date (or no due date)
- question count
- optional short description/copy
- optional assignment type hint (MCQ / FRQ / mixed if available from existing data/copy strategy)

### Visible elements

- page title and short guidance text
- assignment cards
- title
- due date badge/text
- question count text
- clear `Start Practice` button/action

### Primary action

- `Start Practice` -> navigate to `/student/assignments/[id]`.

### Secondary action

- `Back to Dashboard` (only in empty state or optional page-level link).

### Empty state

- no assignments illustration/icon
- student-safe message: teacher will assign work soon
- `Back to Dashboard` action

### Loading state

- visible loading indicator/skeleton
- prevent accidental duplicate actions

### Error state

- concise load error message
- retry action
- fallback navigation (`Back to Dashboard`)

### Mobile layout notes

- assignment card stacks vertically
- `Start Practice` remains full-width and thumb-reachable
- due date and question count remain readable without truncating key info

### Forbidden elements

- fake completion progress (for example synthetic `0/0`)
- answer keys
- teacher-only controls
- copied AP/College Board/Bluebook branding or official UI mimicry

### ASCII wireframe

```text
+------------------------------------------------------------------+
| My Assignments                                                   |
| Complete your assigned AP CSA practice                           |
+------------------------------------------------------------------+
| [Card] Unit 2 MCQ Practice                                       |
| Due: 2026-07-01            Questions: 10                         |
| Type: Multiple Choice (if available)                             |
| [Start Practice]                                                 |
+------------------------------------------------------------------+
| [Card] Array Traversal FRQ                                       |
| Due: No due date             Questions: 3                        |
| Type: Free Response (if available)                               |
| [Start Practice]                                                 |
+------------------------------------------------------------------+
| (Empty state alternative: "No assignments yet" + Back button)    |
+------------------------------------------------------------------+
```

## 5. Screen Prototype: MCQ Exam Mode

### Goal

Provide focused all-MCQ assignment completion with clear progress and safe submission.

### Required data

- assignment title
- ordered MCQ question list
- choice labels/text
- local selected answers
- mark-for-review states
- current question index
- counters: answered/unanswered/marked

### Layout zones

1. Assignment/question header zone
2. Question prompt and choice zone
3. Navigator/counter zone
4. Action zone (`Previous`, `Mark`, `Next`, `Submit`)

### Question header

- assignment title
- current index and total count
- clear mode label (MCQ exam mode)

### Answer choice area

- one question at a time
- selectable options A/B/C/D...
- visible selected state
- disabled changes after submission

### Question navigator

- numbered question buttons
- active question highlight
- status coloring/markers for answered/marked/current

### Answered/Unanswered/Marked counters

- `Answered X / total`
- `Unanswered Y`
- `Marked for review Z`

### Mark-for-review behavior

- toggles per question pre-submit
- visible in navigator and counter
- locked after submit

### Previous/Next behavior

- bounded navigation
- `Previous` disabled at first question
- `Next` disabled at last question
- cannot alter answers once submission is finalized

### Submit behavior

- clear `Submit Assignment` CTA
- submit allowed from any question
- submission records current selected answers using existing one-by-one submit backend behavior

### Unanswered warning

- if unanswered > 0 and submit clicked, show confirmation warning before final submit

### Post-submit lock behavior

- lock answer changes
- lock mark-for-review toggle
- lock submit action (or convert to disabled/completed state)
- show result summary region

### Mobile layout notes

- navigator can wrap or scroll horizontally
- counters remain visible near top
- submit action remains visible and tappable
- avoid tiny touch targets for choice options and navigator

### Forbidden elements

- `is_correct` before submission
- answer key before submission
- `reference_solution`
- hidden `expected_output`
- teacher audit notes
- fake timer or misleading timer UI

### ASCII wireframe

```text
+----------------------------+--------------------------------------+
| Navigator                  | Unit 2 MCQ Practice                  |
| 1 2 3 4 5 ...              | Question 3 of 10                     |
| Answered 2 / 10            | ------------------------------------ |
| Unanswered 8               | Prompt text...                       |
| Marked 1                   | (A) Option text                      |
|                            | (B) Option text                      |
| [Previous] [Mark] [Next]   | (C) Option text                      |
| [Submit Assignment]        | (D) Option text                      |
+----------------------------+--------------------------------------+
```

## 6. Screen Prototype: MCQ Result Summary

### Required visible information

- total score (score/max)
- correct count
- unanswered count
- per-question status (correct/incorrect/unanswered)
- selected answer per question
- `Return to Assignments` button

### What should not be shown to students

- official answer key listing before policy permits
- `is_correct` raw field exposure
- teacher-only audit metadata
- hidden backend-only payload fields

### Mobile layout notes

- stack summary cards vertically
- keep status rows readable with concise labels
- return action remains visible without horizontal scrolling

### ASCII wireframe

```text
+------------------------------------------------------------------+
| Submission Results                                                |
| Total Score: 7/10   Correct: 7/10   Unanswered: 1                |
|------------------------------------------------------------------|
| Q1  Status: Correct     Selected: B        1/1                   |
| Q2  Status: Incorrect   Selected: A        0/1                   |
| Q3  Status: Unanswered  Selected: -        0/1                   |
| ...                                                              |
| [Return to Assignments]                                          |
+------------------------------------------------------------------+
```

## 7. Screen Prototype: FRQ Assignment Question List

### Required elements

- assignment title
- assignment description
- list of question cards/rows
- question type label (`FRQ` or `MCQ` in mixed lists)
- points
- `Open` action

### Back behavior

- explicit `Back to Assignments` action/link on page header area.

### Loading / empty / error states

- loading indicator before list is ready
- empty list message if no questions mapped
- error message with retry action on load failure

### Mobile layout notes

- question cards stack vertically
- labels and points remain legible
- `Open` action remains visible without hover dependency

### ASCII wireframe

```text
+------------------------------------------------------------------+
| [Back to Assignments]                                             |
| Assignment: Array Traversal FRQ                                   |
| Description: Practice core array methods                          |
|------------------------------------------------------------------|
| [Q1] Find Maximum Value     Type: FRQ   10 pts   [Open]          |
| [Q2] Count Even Numbers     Type: FRQ   10 pts   [Open]          |
| [Q3] Sum Positive Numbers   Type: FRQ   10 pts   [Open]          |
+------------------------------------------------------------------+
```

## 8. Screen Prototype: FRQ Coding Page Entry

### Core sections

- prompt area
- starter code / code editor area
- `Run Public Tests` button
- `Submit Final Answer` button
- feedback panel
- `Back to Assignment` button

### Public vs final feedback distinction

- `Run Public Tests` uses public checks only.
- `Submit Final Answer` uses final grading path.
- UI should clearly distinguish run feedback vs final submission feedback state.

### Hidden test safety

- hidden expected outputs are never exposed in student-facing feedback.
- hidden failures may appear as sanitized messages only.

### Mobile / narrow-screen notes

- prompt and editor stack vertically
- action buttons remain reachable
- feedback panel stays readable without requiring desktop width

### ASCII wireframe

```text
+------------------------------------------------------------------+
| [Back to Assignment]                                              |
| Question: Find Maximum Value                                      |
|------------------------------------------------------------------|
| Prompt                                                            |
| ...                                                               |
|------------------------------------------------------------------|
| Code Editor (starter code preloaded)                              |
| public class Solution { ... }                                     |
|------------------------------------------------------------------|
| [Run Public Tests]   [Submit Final Answer]                        |
|------------------------------------------------------------------|
| Feedback Panel                                                    |
| - public run result / final result                                |
+------------------------------------------------------------------+
```

## 9. Screen Prototype: Mixed Assignment Fallback

### Required behavior

- show clear mixed-question-type notice
- use normal question list mode
- show each item with type label (`MCQ` / `FRQ`)
- no combined exam mode
- `Open` action routes to existing question flow per question

### ASCII wireframe

```text
+------------------------------------------------------------------+
| Assignment: Mixed Practice Set                                    |
| Notice: This assignment contains mixed question types.            |
| Open each question individually.                                  |
|------------------------------------------------------------------|
| [Q1] Loop Trace Concept      Type: MCQ    1 pt    [Open]         |
| [Q2] Array Traversal Method  Type: FRQ   10 pts   [Open]         |
| [Q3] Condition Check         Type: MCQ    1 pt    [Open]         |
+------------------------------------------------------------------+
```

## 10. Figma Handoff Section

## Figma Frames To Create

### 01 Student Assignments - Default

- route: `/student/assignments`
- state: default with multiple assignments
- required UI elements: header, assignment cards, due date, question count, Start Practice
- acceptance criteria: student can identify next click in under 5 seconds; no fake progress
- notes for Cursor implementation later: keep action hierarchy simple; preserve existing role boundaries

### 02 Student Assignments - Empty

- route: `/student/assignments`
- state: no assignments
- required UI elements: empty copy, icon/illustration, Back to Dashboard
- acceptance criteria: student clearly understands there is no current assignment
- notes for Cursor implementation later: avoid teacher wording and avoid dead-end page

### 03 Student Assignments - Loading

- route: `/student/assignments`
- state: loading
- required UI elements: loading indicator/skeleton placeholders
- acceptance criteria: no confusing stale data during load
- notes for Cursor implementation later: prevent duplicate navigation clicks while loading

### 04 Student Assignments - Error

- route: `/student/assignments`
- state: data fetch error
- required UI elements: concise error message, retry action, safe fallback link
- acceptance criteria: student can recover without re-login in common transient failures
- notes for Cursor implementation later: keep message non-technical

### 05 MCQ Exam Mode - In Progress

- route: `/student/assignments/[id]`
- state: all-MCQ assignment active
- required UI elements: prompt, choices, navigator, counters, mark-for-review, prev/next, submit
- acceptance criteria: student can answer and navigate without ambiguity
- notes for Cursor implementation later: no timer invention; no answer leaks

### 06 MCQ Exam Mode - Unanswered Submit Warning

- route: `/student/assignments/[id]`
- state: submit clicked with unanswered questions
- required UI elements: warning/confirm dialog copy
- acceptance criteria: student explicitly confirms before final submit
- notes for Cursor implementation later: use clear language, no destructive ambiguity

### 07 MCQ Exam Mode - Submitted Result Summary

- route: `/student/assignments/[id]`
- state: submitted
- required UI elements: total score, correct count, unanswered count, per-question status, selected answer, return button
- acceptance criteria: student can interpret outcome and return to assignments
- notes for Cursor implementation later: lock edits after submission

### 08 FRQ Assignment Question List

- route: `/student/assignments/[id]`
- state: FRQ-only or non-all-MCQ list mode
- required UI elements: assignment info, question cards, type, points, Open action
- acceptance criteria: student can pick and open desired FRQ question
- notes for Cursor implementation later: preserve mixed fallback logic

### 09 FRQ Coding Page Entry

- route: `/student/questions/[id]`
- state: FRQ coding entry
- required UI elements: prompt, editor, Run Public Tests, Submit Final Answer, feedback panel, back link
- acceptance criteria: run-vs-submit difference is obvious
- notes for Cursor implementation later: keep hidden test outputs sanitized

### 10 Mixed Assignment Fallback

- route: `/student/assignments/[id]`
- state: mixed MCQ+FRQ
- required UI elements: mixed-type notice, list with MCQ/FRQ labels, Open actions
- acceptance criteria: student understands combined exam mode is not used
- notes for Cursor implementation later: do not create new mixed exam behavior

### 11 Mobile Student Assignments

- route: `/student/assignments`
- state: mobile layout
- required UI elements: stacked cards, readable metadata, thumb-friendly Start Practice
- acceptance criteria: no clipped key text and no hidden primary action
- notes for Cursor implementation later: prioritize vertical flow and large touch targets

### 12 Mobile MCQ Exam Mode

- route: `/student/assignments/[id]`
- state: mobile in-progress MCQ
- required UI elements: compact navigator/counters, readable options, persistent submit discoverability
- acceptance criteria: student can complete MCQ flow on narrow screens without confusion
- notes for Cursor implementation later: avoid dense controls that require desktop precision

## 11. Implementation Boundary

## What Cursor Must Not Invent Later

- no new backend API unless a future OpenSpec change explicitly approves it
- no fake progress
- no fake timer
- no official AP/College Board/Bluebook branding
- no answer leaks
- no teacher controls in student pages
- no combined MCQ + FRQ exam mode unless a future OpenSpec change approves it
- no broad redesign beyond the approved prototype

## 12. Acceptance Checklist

- [ ] student can understand where to click within 5 seconds
- [ ] assignment type is clear
- [ ] MCQ submit is clear and safe
- [ ] FRQ run vs submit distinction is clear
- [ ] mixed assignment behavior is clear
- [ ] answer visibility is safe
- [ ] mobile layout is usable
- [ ] teacher can explain the flow in class
- [ ] no fake data is presented as real progress
