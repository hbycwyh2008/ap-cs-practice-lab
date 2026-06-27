# Student Classroom Flow Figma Brief

## 1) Design Goal

This brief defines a Figma-ready visual design direction for student classroom flow screens in AP CS Practice Lab. The UI must support live classroom use where students and teachers need immediate clarity.

Primary goal:

- Students should understand what to do within 5 seconds after opening a page.

Secondary goals:

- Reduce classroom confusion.
- Make primary actions obvious.
- Make assignment metadata readable.
- Avoid fake progress.
- Avoid exam-platform imitation.
- Keep UI calm, trustworthy, and student-friendly.
- Preserve answer visibility security.

This is a design/spec artifact only. It does not authorize frontend/backend/database/runner behavior changes.

## 2) Design Principles

- Classroom-first clarity.
- One primary action per screen.
- Strong visual hierarchy.
- Low cognitive load.
- Student-safe language.
- No fake metrics.
- No official AP / College Board / Bluebook branding.
- No hidden-answer leakage.
- Mobile usable, desktop optimized.
- Teacher can explain the flow verbally in class.

## 3) Visual Style Direction

Design direction:

- Clean academic dashboard, modern but not flashy, calm classroom SaaS style.

Style guidance:

- Background: very light slate / neutral background.
- Cards: white cards with soft border and subtle shadow.
- Primary action: clearly visible button.
- Warning states: amber, not aggressive red unless destructive.
- Overdue state: red only for overdue.
- Success/result state: green but restrained.
- Text: high contrast and readable.
- Spacing: generous for high school readability.
- Icons: simple educational/productivity icons, no decorative overload.

Explicit rule:

- Do not mimic AP Classroom, College Board, or Bluebook visual identity.

## 4) Design Tokens

Use these tokens in Figma as a baseline system. Minor visual tuning is allowed if contrast and hierarchy improve.

### Color Tokens

- `color.page.background`: `#F8FAFC`
- `color.card.background`: `#FFFFFF`
- `color.border.default`: `#E2E8F0`
- `color.text.primary`: `#0F172A`
- `color.text.secondary`: `#334155`
- `color.text.muted`: `#64748B`
- `color.button.primary`: `#2563EB`
- `color.button.primary.hover`: `#1D4ED8`
- `color.button.secondary`: `#E2E8F0`
- `color.state.success`: `#15803D`
- `color.state.warning`: `#D97706`
- `color.state.error`: `#DC2626`
- `color.state.info`: `#0369A1`

### Typography Tokens

- `type.page.title`: 32 / 40, Semibold
- `type.section.title`: 24 / 32, Semibold
- `type.card.title`: 20 / 28, Semibold
- `type.body`: 16 / 24, Regular
- `type.metadata`: 14 / 20, Medium
- `type.button`: 16 / 20, Semibold
- `type.helper.small`: 13 / 18, Regular

### Spacing and Radius Tokens

- `space.page.desktop.margin`: 48
- `space.page.mobile.margin`: 16
- `space.card.padding`: 24
- `space.section.gap`: 24
- `space.element.gap`: 12
- `size.button.height`: 44
- `radius.card`: 12

### Component Inventory

- App page shell
- Page header
- Assignment card
- Status badge
- Primary button
- Secondary button
- Empty state
- Loading state
- Error state
- Question navigator button
- MCQ choice card
- Result summary card
- Feedback panel

## 5) Required Figma Frames

The Figma file must include exactly these frame names:

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

Each frame section below includes route, viewport, purpose, user goal, layout, required content, primary/secondary actions, forbidden elements, visual hierarchy notes, acceptance criteria, and a detailed Figma prompt.

---

## 6) Frame 01: Student Assignments - Default

- Route: `/student/assignments`
- Viewport: Desktop 1440 x 1024
- Purpose: Entry point to current student work.
- User goal: Pick an assignment and begin quickly.
- Layout description:
  - Existing top navigation area (assumed already present).
  - Page header area with title + short guidance text.
  - Vertical assignment card list.
  - Each card shows title, optional description, due date or `No due date`, question count, optional type label, and `Start Practice`.
- Required content:
  - Header title: `My Assignments`
  - Guidance text for AP CSA practice context
  - At least 3 assignment cards in mock content
  - Overdue label style for overdue example
- Primary action: `Start Practice`
- Secondary action: Optional subtle `Back to Dashboard` link in header area
- Forbidden elements:
  - Fake `0/0` completed
  - Fake percentage complete
  - Fake progress bar
  - Answer data
  - Teacher controls
  - AP/College Board/Bluebook branding or lookalike styling
- Visual hierarchy notes:
  - Page title largest.
  - Assignment titles strong and scannable.
  - Metadata secondary.
  - `Start Practice` button visually dominant per card.
- Acceptance criteria:
  - Student identifies next click within 5 seconds.
  - Card metadata remains readable at normal classroom viewing distance.
  - No fake progress indicators appear.

### Figma Prompt (Frame 01)

Create a desktop frame `01 Student Assignments - Default` at 1440x1024 for route `/student/assignments`. Use a calm classroom SaaS style with a very light slate page background and white cards with soft border/shadow. Keep top navigation reserved at top. Add page header: title `My Assignments` and short guidance text about starting assigned AP CSA practice. Place a vertical list of assignment cards with generous spacing. Each card must include assignment title, optional one-line description, metadata row (`Due <date>` or `No due date`, `Questions <count>`, optional type label like `MCQ` or `FRQ`), and a clear primary button `Start Practice`. Make title and CTA dominant; metadata secondary. Include one overdue example using restrained red badge only for overdue. Do not include progress bars, percentages, fake completion, answer keys, teacher controls, timers, or official AP/Bluebook branding.

---

## 7) Frame 02: Student Assignments - Empty

- Route: `/student/assignments`
- Viewport: Desktop 1440 x 1024
- Purpose: Friendly no-data state.
- User goal: Understand no assignment is currently available.
- Layout description:
  - Header remains visible.
  - Centered empty-state card below header.
  - Placeholder icon area, title, helper text, secondary button.
- Required content:
  - Title: `No assignments yet`
  - Helper text: `Your teacher has not assigned practice yet.`
  - Secondary action: `Back to Dashboard`
- Primary action: None (state is informational)
- Secondary action: `Back to Dashboard`
- Forbidden elements:
  - Alarmist or error-red styling
  - Fake sample assignments presented as real
  - Teacher-only controls
- Visual hierarchy notes:
  - Empty-state title stands out.
  - Helper copy supports confidence.
  - Secondary action visible but not dominant.
- Acceptance criteria:
  - Student quickly understands there is no task yet.
  - Tone remains calm and non-alarming.

### Figma Prompt (Frame 02)

Create desktop frame `02 Student Assignments - Empty` at 1440x1024 for route `/student/assignments`. Keep same shell style as default assignments frame. Show page header and place a centered empty-state card. Add friendly neutral icon placeholder, title `No assignments yet`, and helper text `Your teacher has not assigned practice yet.` Include secondary button `Back to Dashboard`. Use calm tone, no warning red, no fake assignment rows, no teacher controls, no branding imitation.

---

## 8) Frame 03: Student Assignments - Loading

- Route: `/student/assignments`
- Viewport: Desktop 1440 x 1024
- Purpose: Clear loading feedback.
- User goal: Know content is loading now.
- Layout description:
  - Header area skeleton or loading text.
  - 2-3 skeleton assignment cards.
  - No stale card content.
- Required content:
  - Loading placeholders for title/guidance
  - 2-3 card skeletons with button skeleton area
- Primary action: None while loading
- Secondary action: None while loading
- Forbidden elements:
  - Fake real assignment data
  - Old stale data shown as current
  - Interactive CTA that implies ready state
- Visual hierarchy notes:
  - Keep skeleton structure aligned to final layout.
  - Maintain readable spacing for continuity.
- Acceptance criteria:
  - Student can distinguish loading from empty and error.
  - No fake data appears.

### Figma Prompt (Frame 03)

Create desktop frame `03 Student Assignments - Loading` at 1440x1024 for route `/student/assignments`. Use same page shell and spacing as default frame, but replace all content with skeletons: header skeleton bars and 2-3 assignment card skeletons including metadata lines and CTA placeholder. No stale text, no fake assignment names, no interactive buttons, no error messaging.

---

## 9) Frame 04: Student Assignments - Error

- Route: `/student/assignments`
- Viewport: Desktop 1440 x 1024
- Purpose: Recoverable load failure state.
- User goal: Retry quickly or return safely.
- Layout description:
  - Header remains visible.
  - Prominent error card under header.
  - Message, helper text, primary and secondary actions.
- Required content:
  - Title/message: `Couldn’t load assignments`
  - Helper text: `Unable to load assignments right now. Please try again.`
  - Buttons: `Retry` (primary), `Back to Dashboard` (secondary)
- Primary action: `Retry`
- Secondary action: `Back to Dashboard`
- Forbidden elements:
  - Technical stack traces
  - Blaming tone
  - Teacher-only links
- Visual hierarchy notes:
  - Error title obvious.
  - Retry action visually strongest.
  - Secondary action available but quieter.
- Acceptance criteria:
  - Student can recover in one click.
  - Message is clear and non-technical.

### Figma Prompt (Frame 04)

Create desktop frame `04 Student Assignments - Error` at 1440x1024 for route `/student/assignments`. Keep consistent shell and header. Add a centered/upper-middle error card with message `Couldn’t load assignments` and helper text `Unable to load assignments right now. Please try again.` Include primary button `Retry` and secondary button `Back to Dashboard`. Use restrained error color accents only; keep calm student-safe tone. Do not show technical details or stack traces.

---

## 10) Frame 05: MCQ Exam Mode - In Progress

- Route: `/student/assignments/[id]`
- Viewport: Desktop 1440 x 1024
- Purpose: Focused one-question-at-a-time MCQ practice.
- User goal: Answer, navigate, review, submit.
- Layout description:
  - Assignment header with title and mode label `Multiple Choice Practice`.
  - Progress text: `Question 3 of 10`.
  - Left/side panel for navigator and counters.
  - Main panel for prompt and choice cards.
  - Bottom action row for `Previous`, `Mark for Review`, `Next`.
  - Visible `Submit Assignment` CTA.
- Required content:
  - Counters: `Answered 2 / 10`, `Unanswered 8`, `Marked for review 1`
  - Navigator numbered buttons (1..10)
  - MCQ prompt and 4 large choice cards
- Primary action: `Next` during flow; `Submit Assignment` as end action
- Secondary action: `Previous`, `Mark for Review`
- Forbidden elements:
  - Timer UI (if no real timer implemented)
  - Answer key before submission
  - `is_correct`
  - `reference_solution`
  - Hidden expected output
  - Teacher audit notes
  - Official exam platform imitation
- Visual hierarchy notes:
  - Prompt and active choice area dominate.
  - Submit clearly visible but not distracting during each question.
  - Counters concise and easy to scan.
- Acceptance criteria:
  - Student can navigate and answer without ambiguity.
  - Question status visibility reduces confusion.
  - No answer leak or fake timer UI.

### Figma Prompt (Frame 05)

Create desktop frame `05 MCQ Exam Mode - In Progress` at 1440x1024 for route `/student/assignments/[id]`. Design a two-column classroom exam-style layout that is original and not a Bluebook/AP clone. Header shows assignment title and mode label `Multiple Choice Practice`, plus progress `Question 3 of 10`. Left/side panel contains numbered question navigator and counters: `Answered 2 / 10`, `Unanswered 8`, `Marked for review 1`. Main panel displays one MCQ prompt and large clickable answer choice cards A/B/C/D with clear selected state. Bottom action row: `Previous`, `Mark for Review`, `Next`. Include a clear `Submit Assignment` button visible in layout. Do not include timer UI, answer key, `is_correct`, reference solution, hidden outputs, or teacher-only notes.

---

## 11) Frame 06: MCQ Exam Mode - Unanswered Submit Warning

- Route: `/student/assignments/[id]`
- Viewport: Desktop 1440 x 1024
- Purpose: Confirmation before final submit with unanswered questions.
- User goal: Decide whether to review or submit now.
- Layout description:
  - Same MCQ exam background context as Frame 05.
  - Centered confirmation modal/dialog overlay.
  - Clear title, helper text, two actions.
- Required content:
  - Title: `Submit with unanswered questions?`
  - Helper: `You still have unanswered questions. You can go back and review them, or submit now.`
  - Primary: `Submit Anyway`
  - Secondary: `Go Back`
- Primary action: `Submit Anyway`
- Secondary action: `Go Back`
- Forbidden elements:
  - Scary/hostile language
  - Destructive red style for non-destructive decision
  - Exposure of answers in modal
- Visual hierarchy notes:
  - Modal title and decision buttons prominent.
  - Maintain calm amber warning tone.
- Acceptance criteria:
  - Student understands consequence and options immediately.
  - Modal is clear and non-threatening.

### Figma Prompt (Frame 06)

Create desktop frame `06 MCQ Exam Mode - Unanswered Submit Warning` at 1440x1024 for route `/student/assignments/[id]`. Reuse in-progress MCQ screen as dimmed background. Add centered modal with title `Submit with unanswered questions?` and helper text `You still have unanswered questions. You can go back and review them, or submit now.` Add primary button `Submit Anyway` and secondary button `Go Back`. Tone must be clear and calm with warning amber accent, not aggressive red, and no answer details shown.

---

## 12) Frame 07: MCQ Exam Mode - Submitted Result Summary

- Route: `/student/assignments/[id]`
- Viewport: Desktop 1440 x 1024
- Purpose: Show post-submit outcome clearly.
- User goal: Understand result and return.
- Layout description:
  - Result summary card centered in content area.
  - Top metrics row and per-question status list.
  - Return action at bottom.
- Required content:
  - Total score
  - Correct count
  - Unanswered count
  - Per-question status labels: `Correct`, `Incorrect`, `Unanswered`
  - Selected answer for each question
  - `Return to Assignments` button
- Primary action: `Return to Assignments`
- Secondary action: Optional `Review Questions` local link if non-interactive
- Forbidden elements:
  - Raw backend-only fields
  - Teacher-only metadata
  - Hidden grading internals not meant for students
- Visual hierarchy notes:
  - Score summary first.
  - Per-question rows legible and compact.
  - Return button prominent near bottom.
- Acceptance criteria:
  - Student can interpret performance quickly.
  - Results clear without exposing backend internals.

### Figma Prompt (Frame 07)

Create desktop frame `07 MCQ Exam Mode - Submitted Result Summary` at 1440x1024 for route `/student/assignments/[id]`. Show a clear summary card with top metrics: total score, correct count, unanswered count. Below, include per-question status list with labels `Correct`, `Incorrect`, `Unanswered` and selected answer shown per row. Add primary button `Return to Assignments`. Use restrained success/error/warning colors for statuses. Do not expose raw backend fields, hidden grading internals, or teacher-only data.

---

## 13) Frame 08: FRQ Assignment Question List

- Route: `/student/assignments/[id]`
- Viewport: Desktop 1440 x 1024
- Purpose: FRQ assignment entry list.
- User goal: Choose a coding question to open.
- Layout description:
  - `Back to Assignments` link in top area.
  - Assignment title and description.
  - Question cards list with label, points, and `Open`.
- Required content:
  - Each question card shows title, `FRQ` type label, points, and `Open`.
  - At least 3 question examples.
- Primary action: `Open`
- Secondary action: `Back to Assignments`
- Forbidden elements:
  - MCQ exam-mode controls on this screen
  - Timer UI
  - Teacher-only actions
- Visual hierarchy notes:
  - Assignment title first, then question list.
  - `Open` button clear on each row/card.
  - FRQ label visually explicit.
- Acceptance criteria:
  - Student recognizes coding-practice list mode (not MCQ exam mode).
  - Open action is obvious for each question.

### Figma Prompt (Frame 08)

Create desktop frame `08 FRQ Assignment Question List` at 1440x1024 for route `/student/assignments/[id]`. Add top `Back to Assignments` link, assignment title, and short description. Then design a vertical list of question cards. Each card includes question title, type label `FRQ`, points, and `Open` button. Emphasize that this is coding practice list mode, not MCQ exam mode. No timer, no answer content, no teacher controls.

---

## 14) Frame 09: FRQ Coding Page Entry

- Route: `/student/questions/[id]`
- Viewport: Desktop 1440 x 1024
- Purpose: FRQ coding workspace entry.
- User goal: Read prompt, write code, run tests, submit final answer.
- Layout description:
  - `Back to Assignment` link at top.
  - Question title.
  - Prompt panel.
  - Code editor panel placeholder.
  - Action row with `Run Public Tests` and `Submit Final Answer`.
  - Feedback panel below.
- Required content:
  - Distinct labels for run-vs-submit actions.
  - Feedback panel title and sample result rows.
- Primary action: `Run Public Tests` during practice; `Submit Final Answer` as final action
- Secondary action: `Back to Assignment`
- Forbidden elements:
  - Hidden expected outputs
  - Reference solution
  - Teacher-only notes
- Visual hierarchy notes:
  - Prompt and editor are dominant content blocks.
  - Action distinction between practice and final grading is explicit.
- Acceptance criteria:
  - Student clearly understands difference between run and submit.
  - No hidden-answer leakage in UI.

### Figma Prompt (Frame 09)

Create desktop frame `09 FRQ Coding Page Entry` at 1440x1024 for route `/student/questions/[id]`. Include `Back to Assignment` link, question title, prompt panel, large code editor panel placeholder, action row with two clear buttons: `Run Public Tests` and `Submit Final Answer`, and a feedback panel. Visually distinguish `Run Public Tests` as practice feedback and `Submit Final Answer` as final grading action. Do not show hidden expected outputs, reference solutions, or teacher-only notes.

---

## 15) Frame 10: Mixed Assignment Fallback

- Route: `/student/assignments/[id]`
- Viewport: Desktop 1440 x 1024
- Purpose: Safe mixed-type assignment handling.
- User goal: Open each question individually with clear type context.
- Layout description:
  - Assignment title.
  - Notice banner:
    - `This assignment contains mixed question types. Open each question individually.`
  - Question list with type labels and points.
- Required content:
  - Each item includes question title, `MCQ` or `FRQ` label, points, `Open` button.
- Primary action: `Open`
- Secondary action: `Back to Assignments`
- Forbidden elements:
  - Combined MCQ+FRQ exam mode UI
  - Fake combined progress
  - Teacher-only controls
- Visual hierarchy notes:
  - Mixed-type notice is visible and immediate.
  - Type labels are easy to scan in list.
- Acceptance criteria:
  - Student understands there is no combined exam mode.
  - Question-level open flow is obvious.

### Figma Prompt (Frame 10)

Create desktop frame `10 Mixed Assignment Fallback` at 1440x1024 for route `/student/assignments/[id]`. Show assignment title and a visible notice: `This assignment contains mixed question types. Open each question individually.` Add list rows/cards where each item has question title, type label `MCQ` or `FRQ`, points, and `Open` button. Keep layout calm and clear. Do not design any combined MCQ+FRQ exam mode.

---

## 16) Frame 11: Mobile Student Assignments

- Route: `/student/assignments`
- Viewport: Mobile 390 x 844
- Purpose: Mobile-first assignment list usability.
- User goal: Start assignment quickly on phone.
- Layout description:
  - Compact header and guidance text.
  - Vertical assignment cards.
  - Metadata stacked clearly.
  - Full-width `Start Practice` button per card.
- Required content:
  - At least 2 cards with due/No due date examples.
  - Optional type label if available.
- Primary action: `Start Practice`
- Secondary action: Optional top/back navigation
- Forbidden elements:
  - Horizontal scrolling
  - Fake progress
  - Tiny tap targets
- Visual hierarchy notes:
  - Card title and CTA dominate.
  - Metadata stays readable in stacked form.
- Acceptance criteria:
  - No horizontal overflow.
  - Primary CTA always visible and tappable.

### Figma Prompt (Frame 11)

Create mobile frame `11 Mobile Student Assignments` at 390x844 for route `/student/assignments`. Build compact page header and vertical stack of assignment cards with clear spacing. In each card, stack metadata lines (`Due` or `No due date`, question count, optional type label). Use full-width `Start Practice` button with adequate tap area. Ensure no horizontal scrolling and no fake progress indicators.

---

## 17) Frame 12: Mobile MCQ Exam Mode

- Route: `/student/assignments/[id]`
- Viewport: Mobile 390 x 844
- Purpose: Complete MCQ flow on narrow screen.
- User goal: Answer, navigate, and submit without confusion.
- Layout description:
  - Compact assignment header and question progress.
  - Counters stacked/compact.
  - Navigator wraps or scrolls horizontally.
  - Prompt area and large tap-friendly choice cards.
  - Sticky or always discoverable action area.
- Required content:
  - `Question X of Y` indicator
  - Counters (answered/unanswered/marked)
  - Navigator buttons
  - `Previous`, `Mark for Review`, `Next`, `Submit Assignment`
- Primary action: `Next` during flow, `Submit Assignment` at completion
- Secondary action: `Previous`, `Mark for Review`
- Forbidden elements:
  - Tiny tap targets
  - Hidden submit button
  - Fake timer
  - Any answer leaks
- Visual hierarchy notes:
  - Prompt + selected choice state remain focal.
  - Submit remains visible but not intrusive.
- Acceptance criteria:
  - Student can complete flow without zooming.
  - Submit action is always discoverable.
  - No answer visibility violations.

### Figma Prompt (Frame 12)

Create mobile frame `12 Mobile MCQ Exam Mode` at 390x844 for route `/student/assignments/[id]`. Design compact but clear layout: assignment header, progress `Question X of Y`, stacked or compact counters, question navigator that wraps or horizontally scrolls, prompt area, and large tappable answer choice cards. Add clear action controls for `Previous`, `Mark for Review`, `Next`, and an accessible `Submit Assignment` (sticky or always discoverable). Do not include timer UI, tiny controls, hidden submit behavior, or answer-leak content.

---

## 18) Copy-Paste Prompt for Figma AI / Designer

Use this full prompt directly in Figma AI or send to a designer:

Create a multi-frame prototype named `AP CS Practice Lab - Student Classroom Flow Prototype` for a private AP CSA classroom platform. This is a student-facing classroom workflow, not an official exam product. Visual style must be a clean academic dashboard: modern but calm, trustworthy, and student-friendly. Use very light neutral/slate background, white cards with soft border and subtle shadow, high contrast text, generous spacing, simple productivity/education icons, restrained success/warning/error colors, and obvious primary actions. Avoid decorative overload. Do not mimic AP Classroom, College Board, or Bluebook branding or UI.

Core goals: students understand what to do within 5 seconds, reduce classroom confusion, make primary actions obvious, keep metadata readable, avoid fake progress, preserve answer visibility security.

Apply these design principles: classroom-first clarity, one primary action per screen, strong visual hierarchy, low cognitive load, student-safe language, no fake metrics, no hidden-answer leakage, mobile usable and desktop optimized, and teacher-explainable flow.

Create exactly these 12 frames with matching names and routes:

1) `01 Student Assignments - Default` (`/student/assignments`, desktop 1440x1024): header + guidance, assignment cards with title, optional description, due date or No due date, question count, optional type label, and dominant `Start Practice`. No fake progress bars/percentages.
2) `02 Student Assignments - Empty` (`/student/assignments`, desktop 1440x1024): centered empty-state card with icon placeholder, title `No assignments yet`, helper `Your teacher has not assigned practice yet.`, and `Back to Dashboard`.
3) `03 Student Assignments - Loading` (`/student/assignments`, desktop 1440x1024): header skeleton and 2-3 skeleton cards; no stale/fake data.
4) `04 Student Assignments - Error` (`/student/assignments`, desktop 1440x1024): error card with `Couldn’t load assignments`, helper text, primary `Retry`, secondary `Back to Dashboard`.
5) `05 MCQ Exam Mode - In Progress` (`/student/assignments/[id]`, desktop 1440x1024): assignment header, mode label `Multiple Choice Practice`, progress `Question 3 of 10`, navigator, counters (`Answered 2 / 10`, `Unanswered 8`, `Marked for review 1`), main prompt, large choice cards, `Previous`, `Mark for Review`, `Next`, and `Submit Assignment`. No timer if not implemented.
6) `06 MCQ Exam Mode - Unanswered Submit Warning` (`/student/assignments/[id]`, desktop 1440x1024): modal over MCQ background with title `Submit with unanswered questions?`, helper text, `Submit Anyway`, `Go Back`.
7) `07 MCQ Exam Mode - Submitted Result Summary` (`/student/assignments/[id]`, desktop 1440x1024): result summary card with total score, correct count, unanswered count, per-question status list (`Correct`, `Incorrect`, `Unanswered`), selected answers, and `Return to Assignments`.
8) `08 FRQ Assignment Question List` (`/student/assignments/[id]`, desktop 1440x1024): back link, assignment title/description, question cards with `FRQ` label, points, and `Open`.
9) `09 FRQ Coding Page Entry` (`/student/questions/[id]`, desktop 1440x1024): back link, title, prompt panel, code editor panel, `Run Public Tests`, `Submit Final Answer`, feedback panel. Make run vs submit distinction explicit.
10) `10 Mixed Assignment Fallback` (`/student/assignments/[id]`, desktop 1440x1024): mixed-type notice `This assignment contains mixed question types. Open each question individually.`, list with question title, `MCQ`/`FRQ` label, points, `Open`. No combined exam mode.
11) `11 Mobile Student Assignments` (`/student/assignments`, mobile 390x844): compact header, vertical cards, stacked metadata, full-width `Start Practice`, no horizontal scroll.
12) `12 Mobile MCQ Exam Mode` (`/student/assignments/[id]`, mobile 390x844): compact header, progress, compact counters, wrapped/scrollable navigator, large tappable choice cards, visible action area, accessible `Submit Assignment`.

Global forbidden content across frames:
- Fake progress, fake completion percentages, fake timer
- Answer key before submission
- `is_correct`, `reference_solution`, hidden expected outputs, teacher-only notes
- Teacher controls on student pages
- Official AP/College Board/Bluebook branding or direct UI imitation

Maintain calm classroom tone, clear hierarchy, and high readability for high school students.

---

## 19) Implementation Handoff Rules

Frontend implementation for student classroom flow remains blocked until all conditions are met:

- An actual Figma file URL exists.
- Frame names match this brief exactly.
- Student Assignments frames are reviewed.
- MCQ frames are reviewed.
- Mobile frames are reviewed.
- Future implementation prompts reference approved frame URL and frame name.

Required in each future implementation prompt:

- Approved Figma URL
- Exact frame name
- Target route
- Allowed files
- Explicit non-goals
- Answer visibility checks
- Mobile acceptance checks

## 20) Scope and Change Control

- Allowed file for this task: `docs/design/STUDENT_CLASSROOM_FLOW_FIGMA_BRIEF.md`
- This document is design/spec only.
- No production logic, grading behavior, submission behavior, or backend contract changes are authorized by this brief.
