# Private Classroom Dry Run

This checklist is for a small private AP CSA classroom dry run with 3-5 students. The goal is to verify the classroom workflow before using the platform with a full class.

## A. Before Class

- Confirm the app is running.
- Confirm the teacher account works.
- Create or confirm one class for the dry run.
- Bulk create 3-5 student accounts.
- Export or save student login credentials.
- Confirm at least one AP CSA assignment exists.
- Confirm the Java runner works.
- Run the smoke test:

```bash
python scripts/smoke_test.py
```

Continue only if it prints:

```text
SMOKE TEST PASSED
```

## B. Teacher Setup Flow

1. Log in as the teacher.
2. Open the classes page.
3. Create a class for the dry run if one does not already exist.
4. Bulk create 3-5 student accounts for that class.
5. Download, export, or copy the generated student credentials.
6. Open the question bank.
7. Confirm AP CSA questions exist and are active.
8. Create an assignment.
9. Assign questions to the dry run class.
10. Confirm the assignment is visible from a student account.

## C. Student Test Flow

Repeat this flow for each test student:

1. Open the classroom site.
2. Log in with the provided student account.
3. Open the dashboard.
4. Open the assignment.
5. Read the question.
6. Write a correct Java solution.
7. Run public tests.
8. Submit the final answer.
9. Log out.

## D. Error-Case Test Flow

Test at least these cases during the dry run:

- Wrong password:
  - Try logging in with an incorrect password.
  - Confirm login fails clearly.

- Code that does not compile:
  - Submit or run code with an obvious Java syntax error.
  - Confirm compile output is visible.

- Code that compiles but fails tests:
  - Run code with incorrect logic.
  - Confirm test failure feedback is visible.

- Student refreshes the page:
  - Refresh while on the assignment page.
  - Confirm the student can return to the assignment.

- Student tries to access an unassigned assignment if possible:
  - Use a student account from another class or direct URL if available.
  - Confirm access is blocked or the assignment is not visible.

## E. Teacher Review Flow

1. Open the submissions page.
2. Confirm student submissions appear.
3. Check each score.
4. Check compile output for failed compile attempts.
5. Check runtime output for failed or partial submissions.
6. Open dashboard analytics.
7. Confirm assignment completion stats update.
8. Confirm question performance stats update.
9. Export CSV.
10. Save the CSV locally for review.

## F. In-Class Emergency Plan

- Student cannot log in:
  - Check the exact email and password.
  - Confirm the student is using the correct account.
  - Create a replacement student account if needed.

- Assignment is not visible:
  - Confirm the assignment is assigned to the student's class.
  - Confirm the student account belongs to that class.
  - Refresh the student dashboard.

- Run button fails:
  - Ask the student to refresh once.
  - Check whether the backend is running.
  - Check whether the Java runner is available.
  - Run the smoke test if multiple students are affected.

- Submit button fails:
  - Ask the student to copy their code before refreshing.
  - Refresh and try again.
  - Check backend logs if the issue affects multiple students.

- Java runner fails:
  - Restart the Docker stack if needed.
  - Re-run `python scripts/smoke_test.py`.
  - Continue only after the smoke test passes.

- Backend is down:
  - Check Docker container status.
  - Restart with Docker Compose.
  - Re-run seed if the database was reset.
  - Re-run the smoke test.

- Frontend is down:
  - Check the frontend container.
  - Restart Docker Compose.
  - Confirm the login page loads.

## G. After-Class Review

- Export CSV.
- Write down common compile errors.
- Write down common logic errors.
- Decide the next practice question.
- Back up the database if deployed.
