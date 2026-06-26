# Teacher Classroom Operation Guide

This guide is for using AP CS Practice Lab in your own AP CSA classroom. It is not a public sales or beta invitation guide.

## 1. Create a Class

1. Log in with the teacher account.
2. Open the classes page.
3. Create a class for the current AP CSA section or pilot group.
4. Confirm the class appears in the class list.

Use clear class names such as `AP CSA Period 1` or `AP CSA Pilot Group`.

## 2. Bulk Create Students

1. Open the class detail page.
2. Use the bulk student creation workflow.
3. Choose the number of student accounts needed for the class.
4. Use anonymized prefixes instead of real student names.
5. Export the generated student credentials.

Keep the credential export somewhere private. Give each student only their own account.

## 3. Create or Review Questions

1. Open the question bank.
2. Review existing AP CSA FRQ practice questions.
3. Confirm each question has:
   - a clear prompt
   - starter code if needed
   - public test cases
   - hidden test cases where appropriate
   - correct unit, skill, and difficulty tags
4. Archive questions that should not be assigned.

For the first classroom pilot, prefer a small number of stable, already-tested questions.

## 4. Create Assignments

1. Open the assignment creation page.
2. Choose the class.
3. Select questions manually or use the existing auto-generation workflow.
4. Set a clear title and optional due date.
5. Create the assignment.
6. Log in as a test student or use a student account to confirm the assignment is visible.

## 5. Monitor Submissions

1. Open the submissions page.
2. Review recent final submissions.
3. Check score and max score.
4. For failed submissions, inspect compile output and runtime output.
5. Use errors as teaching signals:
   - syntax errors
   - wrong loop bounds
   - incorrect conditionals
   - missing edge cases
   - incomplete return logic

## 6. Use Analytics

Use the teacher dashboard analytics section to check:

- assignment completion
- question performance
- skill performance

These analytics are intended to help decide what to review next in class. They are not a replacement for reading student code.

## 7. Export CSV

1. Open the teacher dashboard.
2. Use the CSV export button in the analytics section.
3. Save the CSV locally for records.
4. Review completion and performance patterns after class.

## 8. Reset the Demo Environment If Needed

For a local pilot or demo reset:

1. Stop the stack:

```bash
docker compose down -v
```

2. Rebuild and start:

```bash
docker compose up --build -d
```

3. Seed the database:

```bash
docker compose exec backend python seed.py
```

4. Run the smoke test:

```bash
python scripts/smoke_test.py
```

Continue only if the smoke test prints:

```text
SMOKE TEST PASSED
```

## 9. Practical Pilot Advice

- Start with one class and one short assignment.
- Keep student accounts anonymized.
- Ask students to copy code before refreshing if they run into browser issues.
- Export analytics after class.
- Back up the database before resetting the environment.
