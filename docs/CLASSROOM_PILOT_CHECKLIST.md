# Classroom Pilot Checklist

This checklist is for a private AP CSA classroom pilot where the teacher uses AP CS Practice Lab with their own students for Java FRQ practice.

## A. Teacher Setup

- Create a class for the pilot group.
- Bulk create anonymized student accounts for the class.
- Export student credentials and prepare them for distribution.
- Create new questions or review existing AP CSA FRQ practice questions.
- Create an assignment from the question bank.
- Confirm the assignment appears for the intended student accounts.

## B. Student Workflow

- Open the classroom site URL.
- Log in with the provided student account.
- View the student dashboard.
- Open the assigned practice assignment.
- Read the question prompt carefully.
- Write Java code in the editor.
- Run public tests to check basic behavior.
- Submit the final answer when ready.

## C. Teacher Review Workflow

- Open the teacher submissions page.
- Review student final submissions.
- Check scores and max scores.
- Check compile output and runtime output when a submission fails.
- Review analytics for assignment completion and question performance.
- Export CSV results for local record keeping.

## D. Before-Class Checklist

- Server is running.
- Database is seeded or contains the expected class data.
- Teacher account login works.
- Student account login works.
- At least one assignment is visible to students.
- Java runner is working.
- `python scripts/smoke_test.py` passes.

## E. In-Class Troubleshooting

- Student cannot log in:
  - Confirm the student is using the exact generated email and password.
  - Check whether the student account belongs to the expected class.
  - If needed, create a new temporary student account.

- Assignment is not visible:
  - Confirm the assignment was created for the correct class.
  - Confirm the student account belongs to that class.
  - Refresh the student dashboard.

- Code has a compile error:
  - Check class name, method signature, braces, semicolons, and Java syntax.
  - Ask the student to read the compile output before changing logic.

- Run button fails:
  - Refresh the page and try again.
  - Confirm backend and Java runner containers are running.
  - Run the smoke test if the issue affects multiple students.

- Submit button fails:
  - Confirm the student is still logged in.
  - Try refreshing the page and submitting again.
  - Check backend logs if the issue affects multiple students.

- Browser refresh issue:
  - Ask the student to refresh the page once.
  - If the editor content matters, have the student copy their code before refreshing.

- Docker/backend down:
  - Check container status.
  - Restart the stack with Docker Compose if needed.
  - Re-run `python scripts/smoke_test.py` after recovery.

## F. After-Class Checklist

- Export analytics CSV.
- Review common wrong answers and compile errors.
- Decide the next assignment or follow-up question set.
- Back up the database before making major changes or resetting the environment.
