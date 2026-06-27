# Student Classroom Flow Figma Handoff

## Figma File

- File name: `AP CS Practice Lab - Student Classroom Flow Prototype`
- File URL: [https://www.figma.com/design/2613giwowDWu26nNERbvPV](https://www.figma.com/design/2613giwowDWu26nNERbvPV)
- File key: `2613giwowDWu26nNERbvPV`

## Frame Inventory (Required 12 Frames)

All frames below were created as editable design layers via Figma MCP `use_figma` (not screenshots).

1. `01 Student Assignments - Default`  
   [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-2)
2. `02 Student Assignments - Empty`  
   [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-4)
3. `03 Student Assignments - Loading`  
   [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-6)
4. `04 Student Assignments - Error`  
   [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-8)
5. `05 MCQ Exam Mode - In Progress`  
   [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-10)
6. `06 MCQ Exam Mode - Unanswered Submit Warning`  
   [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-12)
7. `07 MCQ Exam Mode - Submitted Result Summary`  
   [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-14)
8. `08 FRQ Assignment Question List`  
   [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-16)
9. `09 FRQ Coding Page Entry`  
   [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-18)
10. `10 Mixed Assignment Fallback`  
    [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-20)
11. `11 Mobile Student Assignments`  
    [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-22)
12. `12 Mobile MCQ Exam Mode`  
    [Open frame](https://www.figma.com/design/2613giwowDWu26nNERbvPV?node-id=1-24)

## Editability Confirmation

- Frames were created with Figma MCP write calls (`create_new_file` + `use_figma`).
- Elements are editable native Figma nodes (frames, text layers, rectangles/cards/buttons), not static image imports.

## Design Scope and Guardrails Applied

- Design-only execution (no frontend/backend/database/runner/Docker/Tailwind source changes).
- Used calm academic dashboard direction from `docs/design/STUDENT_CLASSROOM_FLOW_FIGMA_BRIEF.md`.
- Preserved constraints:
  - no fake progress
  - no fake timer
  - no AP/College Board/Bluebook branding or UI imitation
  - no answer-leak content
  - no teacher-only controls in student screens

## Current Gate Status

Figma gate from `openspec/changes/student-classroom-flow-figma-gate.md` is **partially satisfied**:

- Actual editable Figma file exists.
- All 12 required frame names now exist.
- Frontend implementation remains blocked until **human review/approval** of these frames and explicit approval linkage in future implementation prompts.

## Limitations / Notes

- This is an initial generated visual baseline intended for review and refinement.
- Visual polish, spacing fine-tuning, and typography micro-adjustments may still be needed during human design review.
- No screenshot/export artifacts were generated in this task.

## Repository Change Confirmation

- No production source code was changed.
- This handoff file is the only repository artifact added for this task.
