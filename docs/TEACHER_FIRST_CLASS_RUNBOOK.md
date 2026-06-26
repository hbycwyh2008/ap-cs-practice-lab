# Teacher First Class Runbook

This runbook is for the first private classroom use of AP CS Practice Lab with your own AP CSA students.

## 10 Minutes Before Class

- Confirm the site loads.
- Confirm the teacher account can log in.
- Confirm the dry run class exists.
- Confirm 3-5 student accounts are ready.
- Confirm credentials are ready to distribute.
- Confirm one assignment is visible for the class.
- Confirm the Java runner works.
- Run:

```bash
python scripts/smoke_test.py
```

Start the classroom activity only if the result includes:

```text
SMOKE TEST PASSED
```

## What to Say at the Beginning

Suggested opening:

> Today we are testing a Java FRQ practice system. Use only the account I give you. Public tests help you debug, but they are not all the tests. Read compiler and test feedback carefully before asking for help.

Remind students:

- This is for AP CSA Java practice.
- Public tests are only visible checks.
- Final submission should happen after they review their code.
- If the page has an issue, they should copy their code before refreshing.

## Distribute Accounts

- Give each student one account.
- Do not let students share accounts.
- Keep a teacher copy of all generated credentials.
- If a student cannot log in, give them a replacement account or reset the dry run account.

## First Run Timing

Suggested timing for the first 3-5 student dry run:

- 3 minutes: login and open dashboard
- 2 minutes: open assignment and read prompt
- 15-20 minutes: code and run public tests
- 3 minutes: final submission
- 5 minutes: quick discussion of common errors

Adjust timing based on question difficulty.

## When to Tell Students to Submit

Tell students to submit when:

- most students have run public tests at least once
- students have had time to fix compile errors
- there are 3-5 minutes left in the activity

If a student is still stuck, ask them to submit their best current version so you can review the error afterward.

## What to Watch During Class

- Students logging into the wrong account.
- Students not opening the correct assignment.
- Compile errors caused by changed method signatures.
- Students assuming public tests are the full grade.
- Students refreshing before copying code.
- Multiple students seeing the same infrastructure error.

If multiple students hit the same platform issue, pause the activity and check Docker/backend status before continuing.

## What to Check After Class

- Open submissions.
- Confirm each test student has a final submission.
- Review scores.
- Review compile output and runtime output for failed attempts.
- Open dashboard analytics.
- Export CSV.
- Record common compile errors.
- Record common logic errors.
- Decide whether the next assignment should review the same skill or move forward.

## Feedback to Collect

Ask students:

- Could you log in without help?
- Could you find the assignment?
- Was the prompt readable?
- Was the code editor usable?
- Did public test feedback help?
- What confused you?
- Did anything crash or freeze?

Keep notes after the first class so the next classroom run can be smoother.
