# Question Import Dry Run Checklist

Use this checklist to verify the structured question import workflow before using imported questions in class.

## A. Import Test

- Log in as the teacher.
- Open `/teacher/questions/import`.
- Paste the contents of `docs/sample-question-import.json`.
- Click **Validate JSON**.
- Confirm the JSON validates successfully.
- Click **Import**.
- Confirm the success message appears.
- Confirm the imported question count is 3.

## B. Question Bank Test

- Open the question bank.
- Confirm the imported questions appear:
  - Find Maximum Value
  - Sum Positive Numbers
  - Count Even Numbers
- Confirm course, unit, topic, skill, and difficulty display correctly where shown.
- Open each imported question.
- Confirm the prompt is readable.
- Confirm the starter code is present.
- Confirm the required method signature is included in the prompt.
- Confirm test cases exist for each question.
- Confirm each question has public and hidden tests.

## C. Assignment Test

- Create an assignment using one or more imported questions.
- Assign it to the dry run class.
- Confirm the assignment appears in the teacher assignment list.
- Confirm the assignment is visible to a student in that class.

## D. Student Test

- Log in as a student.
- Open the assignment.
- Open one imported question.
- Write a correct solution.
- Run public tests.
- Confirm public tests pass.
- Submit the final answer.
- Confirm the final score is shown.

## E. Teacher Review Test

- Open submissions.
- Confirm the student submission appears.
- Check the score.
- Check compile output if there was a compile error.
- Check runtime output if relevant.
- Open dashboard analytics.
- Confirm assignment completion stats update.
- Confirm question performance stats update.
- Export CSV.

## F. Failure Cases

Test these cases on the import page before relying on the workflow:

- Invalid JSON:
  - Remove a comma or bracket.
  - Confirm validation fails clearly.

- Missing title:
  - Remove `title` from one question.
  - Confirm the batch is rejected.

- Missing test cases:
  - Set `test_cases` to an empty array.
  - Confirm the batch is rejected.

- Invalid points:
  - Set a test case `points` value to `0` or a negative number.
  - Confirm the batch is rejected.

- Malformed `input_json`:
  - Change `input_json` to a malformed JSON string.
  - Confirm the teacher catches it during review or during a test run.
  - Fix the import data before classroom use.

If any failure case imports partial data, stop and investigate before using the import workflow with real classroom questions.
