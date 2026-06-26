# Reference to Original Question Workflow

Use this workflow when you have AP CSA reference materials but need original, classroom-safe practice questions.

## Safe Workflow

1. Read reference material.
2. Identify the knowledge point.
3. Identify the question pattern.
4. Do not copy original wording.
5. Write a new teacher-created question.
6. Create answer key or test cases.
7. Add taxonomy tags.
8. Import into private database.
9. Only publish if the question is original.

## Practical Notes

- Extract the skill, not the sentence.
- Keep examples synthetic and teacher-authored.
- Do not store copyrighted passages in repo docs or JSON samples.
- Set `source_type` and `visibility` explicitly before sharing.

## Reusable Prompt for ChatGPT

Use this prompt outside the platform when drafting teacher-created material:

```text
Convert the following concept into an original AP CSA-style teacher-created practice question.
Do not copy the source wording.
Preserve only the skill being tested.
Return JSON only, and include:
- unit
- topic
- skill
- type
- difficulty
- practice_type
- frq_type
- error_pattern
- recommended_use
- source_type
- visibility

For coding questions, include starter_code, method_signature, and test_cases.
For MCQ, include choices and answer label.
Use synthetic examples only.
```

## Publication Safety Gate

Before commit:

- Confirm wording is original.
- Confirm no copied answer key explanation exists.
- Confirm visibility is correct (`PRIVATE_CLASSROOM` unless intended as public sample).
