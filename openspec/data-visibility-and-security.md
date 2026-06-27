# Data Visibility and Security

## Student Pre-submission Prohibitions

Students must not receive before submission:

- MCQ `is_correct`.
- MCQ answer key.
- `reference_solution`.
- Hidden `expected_output`.
- Teacher audit notes.
- Proprietary answer explanations.

## Student Allowed Data

Students may receive:

- Question prompt.
- Choice label and choice text.
- Starter code for FRQ questions.
- Public test input and public test feedback.
- Score.
- Selected answer after submission.
- Correct/incorrect/unanswered status after final MCQ submission.
- Sanitized hidden-test result message such as "Hidden test failed" after grading.

## Teacher Allowed Data

Teachers may receive:

- Own class data.
- Own student account data.
- Own question bank data.
- Question audit information.
- Own assignment data.
- Own class/student submissions.
- Hidden expected outputs for review.
- Analytics for own classes/assignments/questions.
- CSV exports for owned classes and analytics.

## Current Enforcement

- `MultipleChoiceChoiceRead` omits `is_correct`.
- Student question and assignment payloads null `reference_solution`.
- Student test-case reads omit hidden expected outputs.
- Submission feedback sanitizes hidden details for students.
- Teacher routes use `require_teacher`.
- Ownership checks limit class, question, assignment, submission, and analytics access.

## Private Classroom Content Policy

Private classroom databases may contain teacher-owned or properly licensed content for internal instruction. That content must not be committed to the public repository unless it is original, synthetic, public-domain, or otherwise explicitly safe to publish.

## Public Repository Content Safety Policy

The public repository must not include:

- Copied official AP or College Board question text.
- Copied TestDaily or third-party question text.
- Answer key dumps.
- Proprietary question banks.
- PDF screenshots from copyrighted sources.
- Copied lecture explanations.
- Real classroom secrets, tokens, passwords, or production environment files.

The public repository may include:

- Original teacher-created sample prompts.
- Synthetic sample prompts and test cases.
- Taxonomy and tagging standards.
- Platform source code and documentation.

## AP / College Board / Bluebook Branding Policy

- Use "AP CSA practice" and "AP-style practice" only as descriptive classroom language.
- Do not use official AP, College Board, or Bluebook logos.
- Do not copy official AP Classroom or Bluebook UI.
- Do not imply endorsement or official status.
- Keep any official material references as private teacher context, not committed content.

## Secret Management Policy

- Never commit `.env`, `.env.production`, API keys, JWT secrets, database passwords, or real account credentials.
- Production must set a strong `SECRET_KEY`.
- Production must set `ENABLE_PUBLIC_REGISTER=false`.
- Production CORS must be restricted to intended frontend domains.
- Demo credentials in seed data are for local/private testing only.

## Security Risks to Track

- Backend Docker socket access is required for the current Java runner and is a privileged operational risk.
- Public registration must remain disabled outside local demos.
- No password reset or account recovery exists.
- No full audit log exists for teacher actions.
- No rate limiting exists for login, submissions, or runner calls.
