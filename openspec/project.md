# Project

## Name

AP CS Practice Lab

## Purpose

AP CS Practice Lab is a private classroom platform for AP Computer Science A practice. It helps a teacher publish Java FRQ-style coding questions and AP-style multiple-choice questions, assign them to a class, collect student work, auto-grade submissions, and review class progress.

## Primary Users

- Teacher: creates classes, anonymized student accounts, question bank content, assignments, and reviews submissions and analytics.
- Student: logs in with a classroom account, opens assigned practice, runs public FRQ tests, submits final FRQ or MCQ answers, and reviews permitted feedback.

## Classroom Use Context

This project is for the owner's own private AP CSA classroom use. It is optimized for small-scale classroom dry runs and beta use, not large multi-school production.

## Current Product Stage

The project is a beta/private classroom MVP. It has a working Next.js frontend, FastAPI backend, PostgreSQL database, Docker-based Java runner, teacher/student roles, FRQ and MCQ workflows, analytics, and smoke tests. Production deployment remains small-scale and must follow the documented VPS/Docker Compose constraints.

## Non-goals

- Not an official AP, College Board, or Bluebook product.
- Not a replacement for AP Classroom.
- Not a public commercial exam platform in its current form.
- Not a multi-tenant school-wide SaaS yet.
- No PDF OCR in the current baseline.
- No AI question generation in the current baseline.
- No rubric-based AP FRQ scoring in the current baseline.
- No real MCQ timer in the current baseline.

## Public/Private Content Policy

The public repository must not include copied copyrighted question text, answer keys, PDF screenshots, proprietary question banks, or proprietary classroom materials.

Allowed public content:

- Platform source code.
- Documentation and taxonomy.
- Teacher-created original samples.
- Synthetic sample questions and test cases.
- Import format examples that are clearly original.

Private classroom database content may include teacher-owned or licensed materials only when those materials are kept private and are not committed to the public repository.

## AP-style Practice Language Policy

The product may use phrases such as "AP CSA practice" and "AP-style practice" to describe classroom-aligned study workflows. It must not claim to be official AP, College Board, AP Classroom, or Bluebook software, and must not copy official AP/Bluebook branding, UI, logos, screenshots, or proprietary wording.
