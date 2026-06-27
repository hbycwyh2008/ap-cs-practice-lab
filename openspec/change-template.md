# Change: <change-name>

## Problem

What user or system problem are we solving?

## Non-goals

What should not be changed?

## Affected users

Teacher / student / admin / system

## Current behavior

What happens now?

## Desired behavior

What should happen after the change?

## Requirements

Use clear testable requirements.

Example format:

- WHEN a student opens an all-MCQ assignment, THE SYSTEM SHALL render MCQ exam mode.
- WHEN a student opens a mixed assignment, THE SYSTEM SHALL render normal question list mode.
- WHEN a student views choices before submission, THE SYSTEM SHALL NOT expose `is_correct`.

## Design

Include:

- frontend pages affected
- backend APIs affected
- data model impact
- permission impact
- answer visibility impact
- testing impact

## Tasks

Break implementation into small tasks.

## Acceptance criteria

List manual and automated checks.

## Validation commands

List exact commands.

## Rollback plan

How to undo safely if the change breaks the app.
