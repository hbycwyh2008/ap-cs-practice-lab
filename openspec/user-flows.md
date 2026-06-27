# User Flows

## A. Teacher First Setup

1. Teacher logs in.
2. Teacher opens Classes & Students.
3. Teacher creates a class.
4. Teacher opens class details.
5. Teacher bulk-creates student accounts.
6. System returns temporary passwords once.
7. Teacher exports or records credentials.
8. Teacher distributes credentials to students.

## B. Teacher Question Bank

1. Teacher opens Question Bank.
2. Teacher imports MCQ JSON through Import MCQ or FRQ JSON through Import FRQ.
3. System validates import payload.
4. System creates teacher-owned questions and related choices/test cases.
5. Teacher reviews imported questions in Question Bank.
6. Teacher filters by taxonomy fields such as unit, topic, skill, type, difficulty, practice type, FRQ type, error pattern, and visibility.
7. Teacher archives questions that should not be used in new assignments.
8. Teacher restores archived questions when needed.

## C. Teacher Assignment

1. Teacher opens Assignments.
2. Teacher creates a new assignment.
3. Teacher selects a class they own.
4. Teacher selects active questions manually or uses auto-generation filters.
5. System validates class ownership and question ownership.
6. System publishes the assignment to the selected class.
7. Teacher confirms the assignment appears in assignment list.
8. Teacher may log in as or preview with a test student to confirm visibility.

## D. Student FRQ

1. Student logs in.
2. Student opens assignment list.
3. Student opens an FRQ or mixed assignment.
4. System renders normal question list mode.
5. Student opens a question.
6. Student writes Java code.
7. Student runs public tests.
8. System executes public tests in the Docker Java runner and returns public feedback.
9. Student submits final answer.
10. System executes full tests server-side and stores final submission.
11. Student views permitted feedback.

## E. Student MCQ

1. Student logs in.
2. Student opens assignment list.
3. Student opens an all-MCQ assignment.
4. System renders MCQ exam mode.
5. Student answers questions.
6. Student may mark questions for review.
7. Student submits assignment.
8. If unanswered questions remain, browser confirmation appears.
9. System submits selected answers one by one through final submission endpoint.
10. System grades MCQ answers server-side.
11. Student views score summary, selected answers, and correct/incorrect/unanswered status.

## F. Teacher Review

1. Teacher opens Submissions.
2. Teacher filters by class and/or assignment.
3. Teacher reviews scores and feedback.
4. Teacher opens Analytics.
5. Teacher reviews assignment completion, question performance, and skill aggregation.
6. Teacher exports analytics CSV for offline review.

## G. Emergency Classroom Fallback

Login problem:

- Verify email/password exactly.
- Confirm student belongs to the intended class.
- Bulk-create replacement account if needed.

Runner problem:

- Ask students to copy code before retrying.
- Check backend and Docker status.
- Restart Docker Compose if needed.
- Run seed and smoke test before continuing.

Frontend styling problem:

- Use frontend style troubleshooting checklist.
- Rebuild frontend or reset stale Docker volumes.
- Continue only after styled login/dashboard pages are visible.

MCQ submit problem:

- Ask student not to refresh until answer selections are recorded manually.
- Teacher may collect answers on paper or a spreadsheet.
- Re-run smoke checks before using MCQ mode again.

Paper/PDF/manual collection fallback:

- Distribute printed or PDF practice outside the app.
- Collect answers manually.
- Enter or grade scores outside the platform for that session.
