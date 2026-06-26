# Compact Practice Set Design

This guide helps build high-quality AP CSA practice sets for one classroom knowledge point at a time.

## Core Rule for One Knowledge Point

Recommended baseline set:

- 2 basic MCQ
- 2 medium MCQ
- 1 common-mistake MCQ
- 1 coding drill or FRQ small function

For high-value topics, add:

- 1 full FRQ-style question

## Why Compact Sets Work

- Students get focused repetition without overload.
- Teachers can quickly identify misconceptions.
- Analytics become actionable for next-step remediation.

## Example 1: for loop traversal

Practice set:

- MCQ loop execution count
- MCQ array traversal output
- MCQ off-by-one error
- FRQ small function: count even numbers
- Edge-case drill: empty/single-element input if supported

Suggested tags:

- unit: Unit 2 or Unit 4 (depending on context)
- topic: for loop traversal
- skill: loop tracing
- error_pattern: OFF_BY_ONE

## Example 2: ArrayList remove while traversing

Practice set:

- MCQ ArrayList remove behavior
- MCQ index shift after remove
- Debugging drill
- FRQ_Q3 small ArrayList method

Suggested tags:

- unit: Unit 4
- topic: ArrayList traversal and mutation
- skill: safe removal logic
- frq_type: FRQ_Q3_ARRAYLIST
- error_pattern: ARRAYLIST_REMOVE_SHIFT

## Example 3: 2D array traversal

Practice set:

- MCQ row-major traversal
- MCQ column-major traversal
- MCQ nested loop bounds
- FRQ_Q4 small 2D array algorithm

Suggested tags:

- unit: Unit 4
- topic: 2D array traversal
- skill: nested loops with indices
- frq_type: FRQ_Q4_2D_ARRAY
- error_pattern: ARRAY_INDEX_OUT_OF_BOUNDS

## Sequencing Strategy

1. Start with `FIRST_PRACTICE` or `WARM_UP`.
2. Assign `HOMEWORK` compact set.
3. Review analytics for low-skill or high-error tags.
4. Push `REMEDIATION` set targeting exact error patterns.
5. End with `QUIZ` or `FRQ_DRILL`.

## Quality Checklist

- Each question has clear tags: unit/topic/skill/type/difficulty.
- At least one item targets a known error pattern.
- At least one item checks edge cases.
- Public tests are helpful but not exhaustive.
- Difficulty mix matches class readiness.
