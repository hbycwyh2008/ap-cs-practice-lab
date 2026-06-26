# Future Question Import Workflow

Full PDF OCR is not part of the current classroom pilot.

For the pilot, the priority is a stable classroom workflow: teacher setup, student practice, auto-grading, submissions, analytics, and CSV export. Question import should be added carefully later so it does not destabilize the grading path.

## Recommended Future Direction

Start with structured bulk import before considering OCR.

Recommended workflow:

1. Prepare AP CSA FRQ material outside the platform.
2. Convert the material into a structured format such as JSON or Markdown.
3. Review the structured content for accuracy.
4. Import the structured questions into the platform.
5. Add or verify test cases manually.
6. Use the imported questions in assignments.

## Why Structured Import First

Structured import is easier to validate than raw PDF OCR. It can require explicit fields such as:

- title
- course
- unit
- topic
- skill
- difficulty
- prompt
- starter code
- reference solution, if available
- public test cases
- hidden test cases
- max points

This reduces ambiguity and makes it easier to catch mistakes before students see the question.

## Possible JSON Shape

```json
{
  "title": "Array Traversal Practice",
  "course": "AP_CSA",
  "unit": "Array",
  "topic": "Traversal",
  "skill": "traversal",
  "difficulty": "easy",
  "prompt": "Write a method that finds the maximum value in an array.",
  "starter_code": "public class Solution {\\n  public static int max(int[] nums) {\\n    // TODO\\n  }\\n}",
  "max_points": 10,
  "test_cases": [
    {
      "name": "positive values",
      "input_json": "{\"nums\":[1,3,2]}",
      "expected_output": "3",
      "is_hidden": false,
      "points": 5
    }
  ]
}
```

## Role of ChatGPT or Manual Conversion

A teacher or ChatGPT can convert AP CSA FRQ material into the structured format. The teacher should still review:

- prompt wording
- method signatures
- starter code
- expected outputs
- hidden test coverage
- point values

The platform should not blindly trust generated imports.

## Later PDF Text Extraction

After structured import is stable, PDF text extraction can be considered as a convenience layer.

PDF text extraction may help when the PDF has selectable text. Even then, the output should still be reviewed and converted into the structured import format before saving questions.

## OCR as a Later Fallback

OCR should be a later fallback, not the first implementation.

OCR can introduce subtle errors in:

- Java symbols
- punctuation
- method names
- array brackets
- comparison operators
- indentation
- test case values

For classroom use, incorrect imported code or prompts are more dangerous than slow manual entry. The safest path is structured import first, PDF text extraction later, and OCR only if truly needed.
