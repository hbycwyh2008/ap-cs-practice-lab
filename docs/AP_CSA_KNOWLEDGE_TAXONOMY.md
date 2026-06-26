# AP CSA Knowledge Taxonomy

This taxonomy is for organizing AP CSA practice in a classroom-safe way without copying copyrighted source text.

## Purpose

- Build compact, targeted practice sets by knowledge point.
- Keep question tags consistent across FRQ and MCQ workflows.
- Support the loop: knowledge point -> assignment -> submission -> analytics -> follow-up practice.

## Unit Taxonomy

### Unit 1: Using Objects and Methods

- primitive types
- variables
- expressions
- assignment statements
- casting
- Math class
- String methods
- method calls
- object creation
- constructor calls

### Unit 2: Selection and Iteration

- boolean expressions
- relational operators
- if statements
- if / else
- else if chains
- nested if
- compound boolean expressions
- De Morgan's law
- while loops
- for loops
- nested loops
- loop tracing
- common algorithms
- off-by-one errors

### Unit 3: Class Creation

- class and object concepts
- instance variables
- constructors
- methods
- return types
- parameters
- access modifiers
- encapsulation
- static
- this keyword
- scope
- class design
- method overloading

### Unit 4: Data Collections

- array creation
- array access
- array traversal
- enhanced for loop
- common array algorithms
- ArrayList creation
- ArrayList methods
- ArrayList traversal
- add/remove while traversing
- common ArrayList algorithms
- 2D array creation
- 2D array access
- row-major traversal
- column-major traversal
- nested loops with 2D arrays
- searching
- selection sort
- recursion

## FRQ Types

- `FRQ_Q1_METHOD_CONTROL`: methods and control structures
- `FRQ_Q2_CLASS`: class writing / class design
- `FRQ_Q3_ARRAYLIST`: ArrayList algorithms
- `FRQ_Q4_2D_ARRAY`: 2D array algorithms
- `NONE`: non-FRQ or not applicable

## Practice Types

- `MCQ_TRACE_OUTPUT`
- `MCQ_CONCEPT_CHECK`
- `MCQ_ERROR_ANALYSIS`
- `MCQ_CODE_COMPLETION`
- `MCQ_DESIGN_REASONING`
- `FRQ_SMALL_FUNCTION`
- `FRQ_FULL_RESPONSE`
- `DEBUGGING_DRILL`
- `EDGE_CASE_DRILL`

## Common Error Patterns

- `OFF_BY_ONE`
- `ASSIGNMENT_VS_EQUALITY`
- `INTEGER_DIVISION`
- `STRING_COMPARISON`
- `ARRAY_INDEX_OUT_OF_BOUNDS`
- `ARRAYLIST_REMOVE_SHIFT`
- `NULL_REFERENCE`
- `SCOPE_ERROR`
- `MISSING_RETURN`
- `WRONG_INITIAL_VALUE`
- `LOOP_CONDITION_ERROR`
- `HIDDEN_EDGE_CASE_FAILED`

## Recommended Use Cases

- `FIRST_PRACTICE`
- `WARM_UP`
- `HOMEWORK`
- `QUIZ`
- `EXAM_REVIEW`
- `FRQ_DRILL`
- `REMEDIATION`
- `CHALLENGE`

## Source and Visibility Tags

### Source Type

- `TEACHER_CREATED`
- `SYNTHETIC`
- `LICENSED_PRIVATE`
- `PUBLIC_DOMAIN`
- `OFFICIAL_REFERENCE_ONLY`

### Visibility

- `PUBLIC_SAMPLE`
- `PRIVATE_CLASSROOM`
- `INTERNAL_REVIEW`

## Tagging Minimum for New Questions

For practical classroom use, each new question should include:

- `unit`
- `topic`
- `skill`
- `type`
- `difficulty`
- `practice_type` (if applicable)
- `frq_type` (if applicable, else `NONE`)
- `visibility`
- `source_type`

## Default Policy for Legacy Content

If old questions do not have taxonomy metadata yet, use safe defaults:

- `frq_type = NONE`
- `source_type = TEACHER_CREATED`
- `visibility = PRIVATE_CLASSROOM`
