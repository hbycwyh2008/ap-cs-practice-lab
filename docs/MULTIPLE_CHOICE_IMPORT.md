# Multiple Choice Question Import

Multiple-choice import is a separate workflow from Java FRQ coding question import. Use it for AP CSA multiple-choice practice in a private classroom.

This workflow does not add PDF OCR, AI question generation, or AI grading.

## Supported JSON Shape

The import page accepts a top-level object with a `questions` array:

```json
{
  "title": "AP Computer Science A Practice Question Bank",
  "section": "I — Multiple Choice",
  "question_count": 2,
  "questions": [
    {
      "id": 1,
      "section": "I",
      "type": "multiple_choice",
      "prompt": "Which expression is true when n is even?",
      "choices": [
        { "label": "A", "text": "n / 2 == 0" },
        { "label": "B", "text": "n % 2 == 0" },
        { "label": "C", "text": "n % 2 == 1" },
        { "label": "D", "text": "n == 2" }
      ],
      "answer": {
        "label": "B",
        "text": "n % 2 == 0"
      }
    }
  ]
}
```

Optional top-level defaults are also supported:

- `course`, default `AP_CSA`
- `unit`, default `Multiple Choice`
- `topic`, default `Multiple Choice`
- `skill`, default `AP CSA multiple choice`
- `difficulty`, default `medium`
- `estimated_minutes`, default `2`
- `source`, default uses the bank title
- `max_points`, default `1`

## Answer Field

The `answer` object should be included in the teacher import JSON.

The platform stores the correct answer server-side and uses it for grading. The correct answer is not returned to students when they open the question.

## Teacher vs Student Visibility

Teacher:

- Can import the JSON containing the answer key.
- Can see the question and choices in the question bank.
- Should keep the source JSON private because it contains answers.

Student:

- Can see the prompt and choices.
- Can select one answer and submit.
- Sees score after submission.
- Does not see the correct answer before submission.

## Import Steps

1. Log in as the teacher.
2. Open `/teacher/questions/import-mcq`.
3. Paste the multiple-choice JSON.
4. Click **Validate JSON**.
5. Fix any validation errors.
6. Click **Import**.
7. Return to the question bank.
8. Confirm imported questions appear.
9. Add imported questions to an assignment.
10. Test with a student account before class.

## Manual Review Checklist

Before assigning imported MCQs:

- Confirm each prompt is readable.
- Confirm every question has at least two choices.
- Confirm labels are unique, such as `A`, `B`, `C`, `D`.
- Confirm `answer.label` matches one of the choices.
- Confirm the answer key is correct.
- Confirm no copyrighted material has been committed to the repository.
- Confirm the assignment is visible to the correct student class.

## Warning

Do not share the JSON import file with students if it includes the `answer` field.

Keep answer-key JSON files private. If students need a handout, create a separate version without answers.
