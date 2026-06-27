# Student Assignments V3 Review

## 1) Purpose

This document reviews visual direction exploration only for the student assignments route (`/student/assignments`).
It is not production implementation, does not change product behavior, and does not authorize frontend coding yet.

## 2) Options Summary

### Option A: Calm Academic SaaS

- Design intent: deliver a clean, trustworthy classroom dashboard with soft hierarchy and low visual noise.
- Strengths: very safe visual language, clear metadata scanning, straightforward card structure, low cognitive load.
- Weaknesses: may feel slightly conservative compared to modern SaaS benchmarks.
- Best use case: classrooms that prioritize calm and consistency over visual richness.

### Option B: Modern Product Dashboard

- Design intent: provide a more polished SaaS look while preserving student clarity and classroom calm.
- Strengths: strongest visual polish, better top-level hierarchy via summary header panel, clearer CTA emphasis, refined badge treatment.
- Weaknesses: slightly higher visual complexity than Option A/C; requires disciplined implementation to avoid over-styling.
- Best use case: when we want a product-grade look while still keeping student-first readability.

### Option C: Focused Classroom Practice

- Design intent: maximize instructional clarity and immediate student action in live classroom settings.
- Strengths: best “what to do next” clarity, strongest readability and action hierarchy, highly mobile-friendly.
- Weaknesses: least decorative; may feel less “premium SaaS” than Option B.
- Best use case: high-tempo class sessions where teacher verbal guidance is central.

## 3) Recommendation

Recommended option: **Option B: Modern Product Dashboard**.

Why:

- It gives the strongest improvement in perceived quality versus current prototype.
- It keeps assignment metadata and `Start Practice` action clear within 5 seconds.
- It remains compatible with classroom constraints (no fake progress, no timer, no answer leakage, no exam-platform imitation).
- It can be implemented incrementally using existing Next.js + Tailwind + shadcn-style patterns without requiring architecture changes.

## 4) Human Review Checklist

- Which option looks most professional?
- Which option is easiest for students to understand at first glance?
- Which option is easiest to implement with existing Next.js + Tailwind + shadcn-style components?
- Which option should become the approved Figma direction?

## 5) Next Step After Approval

After one visual direction is approved, create polished Figma frames only for:

- `01 Student Assignments - Default`
- `02 Student Assignments - Empty`
- `03 Student Assignments - Loading`
- `04 Student Assignments - Error`
- `11 Mobile Student Assignments`

Do not expand to MCQ/FRQ until the Student Assignments visual direction is approved.
