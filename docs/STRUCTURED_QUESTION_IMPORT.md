# Structured Question Import

Structured question import lets the teacher prepare AP CSA Java FRQ-style practice questions outside the platform, convert them into JSON, and import them into the existing question bank.

This workflow is for private classroom preparation. It does not add PDF OCR, AI question generation, AI grading, or automatic test-case generation inside the platform.

## Why This Exists

Manually entering every practice question is slow. A structured import format gives a safer middle step:

1. Prepare or extract question content outside the platform.
2. Convert the content into a predictable JSON format.
3. Paste the JSON into the platform.
4. Validate it.
5. Import questions and test cases into the existing question bank.
6. Review imported questions before assigning them to students.

## Why Full PDF OCR Is Not Included Yet

PDF OCR is intentionally not part of the current classroom pilot. OCR can misread Java syntax, punctuation, array brackets, comparison operators, method names, and expected outputs.

The safer first step is structured import:

```text
PDF or document -> ChatGPT/manual cleanup -> structured JSON -> platform import
```

PDF text extraction and OCR can be considered later, after the structured format is stable.

## Import Format

The top-level JSON value must be an array of questions.

Each question uses fields compatible with the existing question and test case models.

```json
[
  {
    "title": "Find Maximum Value",
    "description": "Write a method that returns the maximum value in nums.",
    "course": "AP_CSA",
    "unit": "Array",
    "topic": "Array traversal",
    "skill": "Traversing arrays",
    "difficulty": "easy",
    "starter_code": "public class Solution {\n    public int solve(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}",
    "method_signature": "public int solve(int[] nums)",
    "estimated_minutes": 10,
    "source": "Teacher-created AP CSA practice",
    "test_cases": [
      {
        "name": "basic positive numbers",
        "input_json": "{\"nums\":[1,2,3]}",
        "expected_output": "3",
        "points": 2,
        "hidden": false
      },
      {
        "name": "negative numbers",
        "input_json": "{\"nums\":[-5,-2,-9]}",
        "expected_output": "-2",
        "points": 3,
        "hidden": true
      }
    ]
  }
]
```

Use teacher-created or properly licensed content. Do not commit copyrighted AP material into this repository.

## Field Explanations

- `title`: Required. Short question title shown in the question bank.
- `description`: Required. Main problem statement. This becomes the stored prompt.
- `course`: Optional. Use `AP_CSA` or `AP CSA`.
- `unit`: Required. Example: `Array`, `ArrayList`, `2D Array`, `Recursion`.
- `topic`: Optional. More specific topic label.
- `skill`: Optional. Skill label for filtering and analytics.
- `difficulty`: Required. Must be `easy`, `medium`, or `hard`.
- `starter_code`: Required. Java starter code shown to students.
- `method_signature`: Required. Used to validate and preserve the expected method signature in the prompt.
- `estimated_minutes`: Optional positive number.
- `source`: Optional. Example: `Teacher-created AP CSA practice`.
- `reference_solution`: Optional. Do not include if you do not want to store a solution.
- `test_cases`: Required non-empty array.

Each test case requires:

- `name`: Short label for the test.
- `input_json`: JSON string consumed by the Java runner.
- `expected_output`: Expected output as a string.
- `points`: Positive point value.
- `hidden`: Boolean. `false` for public tests, `true` for hidden tests.

## Validation Behavior

The import endpoint validates the entire batch before creating any questions.

If one question or test case is invalid, the batch is rejected and no questions are imported.

Common validation issues:

- missing `title`
- missing `description`
- missing `starter_code`
- missing `method_signature`
- no test cases
- non-positive test case points
- `hidden` is not a boolean
- invalid difficulty

## Testing Advice

Before using imported questions in class:

1. Import a small batch first.
2. Open each imported question in the question bank.
3. Review prompt wording and starter code.
4. Review public and hidden tests.
5. Create a small assignment with one imported question.
6. Log in as a student account.
7. Run public tests.
8. Submit a final answer.
9. Confirm teacher submissions and analytics still work.

Imported questions should always be reviewed before classroom use.
