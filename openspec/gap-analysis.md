# Gap Analysis

## Gap Table

| Gap | Severity | Affected user | Suggested future change name | OpenSpec change required | Figma prototype required |
| --- | --- | --- | --- | --- | --- |
| Student assignment list may show fake placeholder progress or lacks real completion progress beyond question count. Current dedicated assignment list avoids fake `0/0`, but real progress is not implemented. | Medium | Student | real-student-assignment-progress | Yes | Optional |
| MCQ exam mode only supports all-MCQ assignments. | Medium | Student, teacher | mixed-assignment-mode-policy | Yes | Optional |
| Mixed assignment behavior needs clearer copy across all relevant pages and docs. | Low | Student | clarify-mixed-assignment-copy | Yes | Optional |
| MCQ answers are submitted one by one instead of batch submit. | Medium | Student, system | batch-mcq-assignment-submit | Yes | Optional |
| No real timer in MCQ exam mode. | Low | Student | mcq-exam-timer | Yes | Yes |
| No Playwright E2E tests. | High | System, teacher, student | add-core-playwright-e2e | Yes | No |
| No Figma-confirmed prototype for key screens. | Medium | Teacher, student | figma-core-screen-baseline | Yes | Yes |
| Some docs are not accessible as in-app clickable help. | Low | Teacher | in-app-help-doc-links | Yes | Optional |
| Release validation relies too much on `smoke_test.py` and not enough on manual classroom dry run. | Medium | Teacher, student | classroom-release-dry-run-gate | Yes | No |
| Cursor tasks previously combined too much scope. | High | System, maintainer | cursor-small-scope-workflow | Yes | No |

## Notes

- The student assignment list currently shows question count rather than fake completion progress. The remaining gap is real student progress tracking and consistent handling in all student surfaces.
- Mixed assignments are intentionally supported through normal question list mode. A future change may improve wording or add a richer combined flow, but that requires an approved OpenSpec change.
- Batch MCQ submit is the likely next architecture improvement for MCQ exam reliability.
- A real timer should not be added without design approval because it affects classroom expectations and submission semantics.
- Playwright coverage should focus first on the teacher setup, student FRQ, student MCQ, and teacher review paths.
