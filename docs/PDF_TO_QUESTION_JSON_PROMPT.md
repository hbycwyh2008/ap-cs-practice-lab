# PDF to Question JSON Prompt

Use this prompt with ChatGPT when you paste AP CSA FRQ-style text or your own screenshots/transcriptions. Do not paste copyrighted AP content into this repository.

This prompt is for converting teacher-provided material into the structured import format. It should not ask ChatGPT to invent official scoring claims or generate hidden content that was not requested.

## Reusable Prompt

```text
You are helping me convert AP CSA Java FRQ-style practice material into structured JSON for my private classroom practice platform.

Important constraints:
- Output only valid JSON.
- The top-level JSON value must be an array of question objects.
- Do not include Markdown fences in the final output.
- Do not claim that the question is official College Board material.
- Do not invent official scoring guidelines.
- Preserve the programming task, required method signature, starter code, public tests, hidden tests, and edge cases from the material I provide.
- If the source material is missing a test case, create only simple teacher-review placeholder tests and mark them clearly in the test name.
- Do not include copyrighted passage text beyond what I provide for my private classroom preparation.

Use this exact JSON shape:

[
  {
    "title": "Short question title",
    "description": "Student-facing problem statement.",
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
        "name": "public basic case",
        "input_json": "{\"nums\":[1,2,3]}",
        "expected_output": "3",
        "points": 2,
        "hidden": false
      },
      {
        "name": "hidden edge case",
        "input_json": "{\"nums\":[-5,-2,-9]}",
        "expected_output": "-2",
        "points": 3,
        "hidden": true
      }
    ]
  }
]

Field rules:
- title is required.
- description is required.
- starter_code is required.
- method_signature is required.
- difficulty must be "easy", "medium", or "hard".
- test_cases must contain at least one test case.
- Each test case must include name, input_json, expected_output, points, and hidden.
- points must be positive.
- hidden must be true or false.
- input_json must be a JSON string matching the platform runner input convention.

Now convert the material below into the JSON format.

Material:
[PASTE MY TEACHER-PREPARED FRQ TEXT OR TRANSCRIPTION HERE]
```

## Review Checklist After ChatGPT Responds

Before importing the JSON:

- Confirm the JSON parses.
- Confirm the method signature matches the starter code.
- Confirm the input JSON shape matches the Java runner expectation.
- Confirm expected outputs are correct.
- Confirm public tests are appropriate for students to see.
- Confirm hidden tests check edge cases.
- Confirm the prompt does not include copyrighted AP content that should not be stored.
- Confirm the question is appropriate for your class before assigning it.

## Notes

This workflow is not PDF OCR. It is a manual or ChatGPT-assisted conversion step outside the platform.

Do not use this prompt to ask ChatGPT to generate official AP scoring claims. Use it only to produce structured classroom practice data that you will review.
