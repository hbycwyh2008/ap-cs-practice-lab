# AP CS Practice Lab

A teaching platform MVP for **AP Computer Science A** FRQ practice. Teachers publish Java coding problems, students submit solutions, and the system automatically compiles, runs tests in a Docker sandbox, scores submissions, and stores results.

Future versions will extend to AP Computer Science Principles (AP CSP).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.12 |
| Database | PostgreSQL 16 |
| ORM | SQLModel |
| Auth | JWT (email + password) |
| Code Runner | Docker sandbox (Eclipse Temurin JDK 17) |
| Deployment | docker-compose |

## Project Structure

```
ap-cs-practice-lab/
├── frontend/          # Next.js web app
├── backend/           # FastAPI REST API
├── runner/            # Java runner Docker image
├── database/          # PostgreSQL init scripts
├── scripts/           # Setup helpers
├── docker-compose.yml
└── README.md
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Docker must be running (the backend invokes `docker run` for Java grading)

## Quick Start

```bash
cd ap-cs-practice-lab

# Start all services (builds postgres, java-runner, backend, frontend)
docker compose up --build -d

# Seed demo data
docker compose exec backend python seed.py

# Verify the full core flow (teacher/student login -> submit -> 10/10)
python scripts/smoke_test.py
```

Or use the helper script (Linux/macOS):

```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

Open **http://localhost:3000** in your browser.

> **Windows users:** run `docker compose` from a **WSL2** terminal. The backend
> bind-mounts a host temp directory (`/tmp/ap-cs-practice-lab-java-runs`) that
> the Docker daemon must resolve as a host path; WSL2 makes this work cleanly.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Teacher | teacher@example.com | password123 |
| Student | student@example.com | password123 |

Seed data includes:
- Class: **AP CSA Period 1** (2026-2027)
- **6** sample questions (Array unit, various skills/difficulties)
- Assignment: **Array Traversal Practice**

## Testing the First FRQ Auto-Grading

1. Log in as **student@example.com**
2. Go to **My Assignments** → **Array Traversal Practice**
3. Click **Find Maximum Value**
4. Edit the code to solve the problem:

```java
public class Solution {
    public int solve(int[] nums) {
        int max = nums[0];
        for (int n : nums) {
            if (n > max) max = n;
        }
        return max;
    }
}
```

5. Click **Run Public Tests** — should pass 2/2 public tests (4/10 pts)
6. Click **Submit Final Answer** — should score 10/10 (includes hidden tests)
7. Log in as **teacher@example.com** → **Submissions** to see full results

## Local Development (without Docker for frontend/backend)

### Database

```bash
docker compose up -d postgres
```

### Backend

```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL=postgresql://apcs:apcs_secret@localhost:5432/ap_cs_practice
python seed.py
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

### Java Runner

The backend requires the runner image and Docker socket access:

```bash
docker build -t ap-cs-java-runner ./runner
```

## API Documentation

With the backend running, visit **http://localhost:8000/docs** for interactive Swagger UI.

Key endpoints:
- `POST /auth/login/json` — Login
- `GET /questions` — List questions
- `POST /submissions/run` — Run public tests (practice)
- `POST /submissions/submit` — Final submission with full grading

## Java Runner Security

Student code runs inside an isolated Docker container with:

| Restriction | Value |
|-------------|-------|
| Network | `--network none` (no internet) |
| Memory | 256 MB |
| CPU | 0.5 cores |
| PIDs | 64 process limit |
| Timeout | 5 seconds (subprocess level) |
| Filesystem | Temp directory only, cleaned after each run |
| User | Non-root `runner` user inside container |

The runner:
1. Writes `Solution.java` to a unique temp directory
2. Generates `Main.java` per test case calling `Solution.solve(int[])`
3. Compiles with `javac` inside the container
4. Runs `java Main` and compares integer output
5. Deletes the temp directory after completion

Handled edge cases: compile errors, runtime exceptions, infinite loops (timeout), invalid output format.

### Host temp directory (bind mount)

The backend invokes `docker run` through the host Docker socket, so the per-run
temp directory must be a path the Docker daemon can see on the **host**. The
backend container and the host therefore share the same absolute path via a bind
mount:

```yaml
backend:
  environment:
    JAVA_RUNNER_TMP_DIR: /tmp/ap-cs-practice-lab-java-runs
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - /tmp/ap-cs-practice-lab-java-runs:/tmp/ap-cs-practice-lab-java-runs
```

Each grading run creates `/tmp/ap-cs-practice-lab-java-runs/<uuid>`, mounts it
into the Java runner container, and deletes it afterward. This replaces the
earlier named-volume approach, which the Docker daemon could not resolve to a
host path.

## Database Reset (Development)

This MVP does **not** use Alembic migrations. When model fields change, reset
the local database:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend python seed.py
```

Production deployments should add Alembic in a future milestone.

## Milestone 2: Auto-Generated Assignments

Teachers can auto-generate AP CSA assignments from the question bank using tags:

- **unit** — e.g. Array, ArrayList, 2D Array
- **difficulty** — easy, medium, hard
- **skill** — e.g. traversal, selection
- **is_active** — only active questions are eligible
- **question_count** — how many questions to include
- **include_recent_questions** — whether to allow questions already used in prior assignments

Auto-generate and manual assignment creation both require that every selected
question belongs to the current teacher and is active (`is_active == true`).

### Question Lifecycle (Milestone 2.6)

Questions are **soft-deleted** (archived), never hard-deleted:

| Action | Endpoint | Effect |
|--------|----------|--------|
| Archive | `DELETE /questions/{id}` | Sets `is_active = false`. Question remains in DB. |
| Restore | `POST /questions/{id}/restore` | Sets `is_active = true`. |

- Archived questions are excluded from `POST /assignments/generate`.
- Archived questions cannot be added to new assignments (returns 400).
- Existing assignments and submissions referencing the question are **not affected**.
- Teachers can restore an archived question at any time.
- The teacher question list shows all questions with **Active** / **Archived** badges.

## Milestone 3: Teacher Analytics

Teachers can view comprehensive analytics to track student progress and identify areas for improvement.

### Analytics Features (Milestone 3.1 - Beta Trial Readiness)

**GET /analytics** returns:

1. **Assignment Completion Stats**
   - `attempted_students` — students who have any submission (practice or final)
   - `completed_students` — students who have submitted a **final** submission
   - `attempt_rate` — percentage of students who attempted
   - `completion_rate` — percentage of students who completed (final submit)
   - `not_completed_students` — list of students who haven't finalized, displayed as `Student #123` (no email)

2. **Question Performance**
   - Submission count, average score, pass rate per question

3. **Skill Aggregation**
   - Average score and question count by skill (e.g., traversal, selection)

**CSV Export:**

- `GET /analytics/export.csv` — download assignment completion data as CSV
- Includes: assignment_id, title, total/attempted/completed students, rates

**Privacy:**
- Student identifiers use numeric IDs (`Student #42`) instead of emails
- No unnecessary personal information (phone numbers, parent contacts, photos) is collected
- Suitable for beta trial with demo or anonymized accounts

### Beta Trial Best Practices

During the beta trial phase:
- Teachers should use demo student accounts (e.g., `student1@demo.edu`)
- Avoid entering unnecessary personal information
- Student emails are not displayed in analytics or public demos
- See `/beta-notice` page for complete data collection and privacy information

## Milestone 3.2: Beta Onboarding

**Anonymized Student Accounts** for beta trial without collecting real student data.

### Bulk Create Students

**POST /classes/{class_id}/students/bulk-create**

```json
{
  "count": 10,
  "prefix": "student"
}
```

Response:
```json
{
  "created": [
    {
      "id": 123,
      "name": "Student #1",
      "email": "student-001@class-1.demo",
      "temporary_password": "aBc12Xyz",
      "class_id": 1
    }
  ],
  "count": 10
}
```

**Important:**
- Temporary passwords are shown **only once** during creation
- Teachers should copy/save credentials immediately
- Use for beta trial with anonymized accounts
- Accounts use demo emails like `student-001@class-1.demo`

### Export Student List

**GET /classes/{class_id}/students/export.csv**

Downloads student roster as CSV (excludes passwords).

### Student Count Display

- Teacher class list displays `student_count` so teachers can verify anonymized accounts were created successfully
- `student_count` only counts users with `role = STUDENT`
- Updates automatically after bulk-create

### Beta Trial Recommendations

✅ **Do:**
- Use bulk-created anonymized accounts
- Demo emails (e.g., `student-001@class-1.demo`)
- Copy temporary passwords immediately after creation

❌ **Don't:**
- Collect real student emails during beta
- Show student emails in screenshots/demos
- Use teacher registration in production (enable only for local dev)

### Security

- `/auth/register` is for **local development only**
- Production beta should disable public teacher registration
- Teachers verified manually before account creation
- Students created only by their class teacher

## Milestone 3.3: Beta Launch Safety

**Production-Ready Configuration** for small-scale beta deployment.

### Security Configuration

**Required Environment Variables for Production:**

```bash
# CRITICAL: Change these in production
SECRET_KEY=your-secure-random-key-here
APP_ENV=production

# Public Registration
ENABLE_PUBLIC_REGISTER=false

# CORS Origins (your deployed frontend URL)
CORS_ORIGINS=https://your-frontend-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Configuration Rules

**Public Registration:**
- **Development**: Can enable with `ENABLE_PUBLIC_REGISTER=true` for testing
- **Beta/Production**: **MUST** be disabled (`ENABLE_PUBLIC_REGISTER=false`)
- Teachers should be created manually or via admin/seed process
- Students should be created through anonymized bulk-create by their teacher

**Secret Key:**
- Development default: `dev-secret-key-change-in-production`
- Production: **MUST** be changed to a secure random key
- Application will **refuse to start** if `APP_ENV=production` and secret key is still the default

**CORS Origins:**
- Development default: `http://localhost:3000,http://127.0.0.1:3000`
- Production: Set to your deployed frontend URL(s), comma-separated
- Example: `CORS_ORIGINS=https://app.example.com,https://www.example.com`

### Security Checklist

Before beta launch:
- ✅ Set `SECRET_KEY` to a secure random value
- ✅ Set `APP_ENV=production`
- ✅ Set `ENABLE_PUBLIC_REGISTER=false`
- ✅ Set `CORS_ORIGINS` to your frontend domain
- ✅ Do not expose demo credentials in public screenshots
- ✅ Do not collect or expose real student data

### Local Development

For local development and testing, use the provided defaults in `docker-compose.yml`:

```yaml
environment:
  APP_ENV: development
  ENABLE_PUBLIC_REGISTER: "true"
  CORS_ORIGINS: http://localhost:3000,http://127.0.0.1:3000
```

See `.env.example` for all configuration options.

## Milestone 3.4: Deployment Readiness

**Production deployment preparation** with comprehensive documentation and configuration management.

### Deployment Documentation

Comprehensive guides for deploying to production:

- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment guide with security checklist
- **[Beta Demo Flow](docs/BETA_DEMO_FLOW.md)** - Complete walkthrough for demonstrating the platform

### Environment Variables

**Backend Configuration:**

All configuration is managed through environment variables. See `.env.example` for complete list.

Critical production settings:
```bash
SECRET_KEY=your-secure-random-key-here       # MUST change from default
APP_ENV=production                           # Enables production checks
ENABLE_PUBLIC_REGISTER=false                 # Disables public registration
CORS_ORIGINS=https://your-domain.com         # Set to frontend URL
DATABASE_URL=postgresql://...                # Production database
```

**Frontend Configuration:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000    # Local development
NEXT_PUBLIC_API_URL=https://api.your-domain.com  # Production
```

### Docker & Java Runner Requirements

**⚠️ CRITICAL:** This MVP requires Docker-based Java code execution.

**Deployment platform must support:**
- Docker socket access (`/var/run/docker.sock`), OR
- Equivalent secure container execution strategy

Without Docker access, Java auto-grading will not function.

### Pre-Deployment Verification

**Always run the full smoke test before going live:**

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend python seed.py
python scripts/smoke_test.py
```

Expected output: `SMOKE TEST PASSED`

### Security Checklist

Before beta launch:
- ✅ Change `SECRET_KEY` to secure random value
- ✅ Set `APP_ENV=production`
- ✅ Set `ENABLE_PUBLIC_REGISTER=false`
- ✅ Configure `CORS_ORIGINS` to deployed frontend URL
- ✅ Use secure database credentials
- ✅ Verify HTTPS for both frontend and backend
- ✅ Run smoke test on production environment
- ✅ Review [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)

### Beta Demo Guide

For demonstrating the platform to potential users, see [Beta Demo Flow](docs/BETA_DEMO_FLOW.md).

**Quick demo flow:**
1. Login as teacher
2. Create class and bulk-create anonymized students
3. Auto-generate or create assignment
4. Login as student and submit solution
5. View teacher analytics and export CSV
6. Show privacy notice page

### Known Limitations (Beta MVP)

- Single-school deployment only
- Teacher accounts must be created manually or via seed
- No password reset mechanism
- No OAuth/SSO integration
- Docker socket access required for Java runner
- Desktop browser recommended (not mobile-optimized)

### Production Support

- **Health Check:** `GET /health` endpoint for monitoring
- **Logs:** Monitor for Java runner timeouts, database issues, CORS errors
- **Backup:** Regular PostgreSQL database backups recommended
- **Rollback:** Keep previous Docker images for quick rollback

## Milestone 3.5: Public Demo Polish

**UI/UX improvements** for public demonstrations, beta teacher recruitment, and social media content.

### Landing Page

Redesigned homepage (`/`) with clear value proposition:
- Platform overview and features
- Current beta scope (AP CSA only, no AI feedback yet)
- Teacher and student workflow explanations
- Privacy-first beta trial messaging
- Quick links to login and beta notice

### Login Page Enhancements

Demo account guidance displayed prominently:
- **Teacher Demo:** `teacher@example.com` / `password123`
- **Student Demo:** `student@example.com` / `password123`
- Beta trial badge
- Privacy warning: "Do not use real student data in public demos or screenshots"

### Dashboard Demo Flow

Teacher dashboard includes a **Beta Demo Flow** card with step-by-step guidance:
1. Create or open a class
2. Bulk-create anonymized students
3. Create or auto-generate an assignment
4. Ask students to run public tests and submit
5. Review analytics and export CSV

Quick links to Classes, Assignments, and Beta Notice pages.

### Demo Content Creation

**[Xiaohongshu Demo Script](docs/XIAOHONGSHU_DEMO_SCRIPT.md)** - Complete guide for creating public demo videos:
- 60-second demo script (Chinese & English)
- Video title ideas for social media
- Privacy checklist before recording
- Suggested captions and hashtags
- Post-production checklist
- Engagement tips and follow-up content ideas

### Privacy-First Public Demos

**Critical guidelines for screenshots and recordings:**
- ✅ Use demo accounts only (`teacher@example.com`, `student@example.com`)
- ✅ Use anonymized student accounts (`student-001@class-X.demo`)
- ❌ Do not show real student names or emails
- ❌ Do not show tokens, env files, or SECRET_KEY
- ❌ Do not show school internal data
- ❌ Do not show AP exam real questions

### Target Audience

- AP CSA / Java teachers in international schools
- CS educators evaluating auto-grading tools
- EdTech enthusiasts and open-source contributors
- Beta trial participants

### Quick Demo Flow

For a 60-second demo video:
1. **0-5s:** Pain point (manual grading is tedious)
2. **5-15s:** Teacher dashboard overview
3. **15-25s:** Auto-generate assignment
4. **25-40s:** Student submission and auto-grading
5. **40-50s:** Teacher analytics and CSV export
6. **50-60s:** Beta trial invitation

See [XIAOHONGSHU_DEMO_SCRIPT.md](docs/XIAOHONGSHU_DEMO_SCRIPT.md) for detailed script.

## Milestone 3.6: Beta Invite Package

**Comprehensive documentation** for beta trial recruitment, teacher onboarding, and feedback collection.

### Beta Trial Documentation

Complete package for small-scale beta testing with AP CSA teachers:

- **[Beta Trial Invitation](docs/BETA_TRIAL_INVITE.md)** - Comprehensive invitation document
  - Platform overview and features
  - Target audience and ideal participants
  - Current beta scope and limitations
  - Privacy expectations and data handling
  - Beta benefits and post-beta roadmap
  - Contact information and selection criteria
  
- **[Beta Trial Teacher Guide](docs/BETA_TRIAL_TEACHER_GUIDE.md)** - Step-by-step operational guide
  - 12-step walkthrough from login to feedback
  - Creating classes and bulk-creating students
  - Assignment creation (manual and auto-generate)
  - Student submission workflow
  - Dashboard analytics and CSV export
  - Troubleshooting common issues
  - Important reminders and tips

- **[Beta Trial Feedback Form](docs/BETA_TRIAL_FEEDBACK_FORM.md)** - Structured feedback collection
  - 45 questions across 10 sections
  - Platform usability assessment
  - Auto-grading effectiveness
  - Teacher analytics value
  - Privacy and beta experience
  - Open-ended improvement suggestions
  - Ready to copy into Google Forms / 腾讯问卷 / Feishu Forms

- **[Xiaohongshu Beta Post](docs/XIAOHONGSHU_BETA_POST.md)** - Social media recruitment content
  - 5 title options for Chinese social media
  - Professional and casual content versions
  - Comment management templates
  - DM response templates
  - Privacy checklist and hashtag strategy
  - Risk management and legal considerations

### Beta Trial Parameters

**Recommended Scale:**
- 3-5 teachers
- 5-20 students per teacher
- 2-4 weeks duration
- 1-2 Java Array assignments

**Privacy-First Approach:**
- Anonymized student accounts (`student-001@class-X.demo`)
- No real student personal information collected
- Transparent data handling during beta
- Clear privacy guidelines in all documentation

### Feedback Collection

**Structured Feedback Form includes:**
- Platform usability (login, class creation, assignments)
- Auto-grading effectiveness (public/hidden tests)
- Teacher analytics value (completion rates, question performance)
- Privacy and beta experience
- Feature prioritization for post-beta roadmap
- Net Promoter Score (would recommend to colleagues?)

**Qualitative Feedback:**
- Biggest pain points
- Most/least useful features
- Feature requests
- Student informal feedback
- Technical issues encountered

### Social Media Recruitment

**Xiaohongshu (小红书) Strategy:**
- Clear, honest positioning (beta trial, not production)
- Privacy-first messaging (anonymized accounts)
- No exaggerated claims (auto-grading, not AI magic)
- Target: AP CSA / Java teachers in international schools
- Emphasis on small-scale, free beta with genuine feedback request

**Key Messages:**
- Small-scale beta (3-5 teachers)
- Free during beta period
- Privacy protection with anonymized accounts
- Open-source transparency
- Focused on AP CSA Java FRQs only

### Contact & Selection

**Beta Trial Recruitment:**
- By invitation or application
- Selection criteria: commitment to feedback, willingness to use anonymized accounts
- Support provided throughout trial
- Post-trial data handling clearly communicated

**Timeline:**
- Applications reviewed on rolling basis
- Selected teachers notified within 1 week
- Beta trial begins upon teacher confirmation
- Feedback due within 1 week of trial completion

## Milestone 3.7: Real Deployment Decision

**Deployment strategy evaluation** for small-scale beta trial.

### Deployment Approach

**Recommended for First Beta:**

🎯 **Single VPS + Docker Compose**

For the first small-scale beta trial (3-5 teachers, 5-20 students per teacher), deploy all components on one Virtual Private Server using the same Docker Compose setup as local development.

**Why this is the right choice:**
- ✅ Proven to work (identical to local dev stack)
- ✅ Java runner constraint satisfied (Docker socket access)
- ✅ Simple operations (one machine to manage)
- ✅ Adequate scale for beta (3-5 teachers)
- ✅ Low cost (~$20-50/month VPS)
- ✅ Fast iteration for fixes and updates

### Deployment Documentation

Comprehensive deployment evaluation and planning:

- **[Deployment Options](docs/DEPLOYMENT_OPTIONS.md)** - Complete evaluation of deployment strategies
  - Current architecture summary
  - Option A: Local demo only
  - Option B: Single VPS + Docker Compose (recommended)
  - Option C: Frontend hosted separately + Backend on VPS
  - Option D: PaaS platforms (must verify Java runner support)
  - Option E: Remote runner service (future architecture)
  - Decision matrix and final recommendation

- **[VPS Beta Deployment Plan](docs/VPS_BETA_DEPLOYMENT_PLAN.md)** - High-level deployment guide
  - VPS preparation (Docker, firewall, repository)
  - Environment variable configuration
  - Service startup and initialization
  - Verification checklist
  - Safety reminders and monitoring
  - Common issues and troubleshooting

### Key Deployment Constraint

**⚠️ CRITICAL:** The **Java runner** is the key deployment constraint.

**Deployment platform must support:**
- Docker socket access (`/var/run/docker.sock`), OR
- Spawning temporary containers for code execution, OR
- Equivalent secure container execution strategy

**Why this matters:**
- Many PaaS platforms restrict Docker-in-Docker for security
- Java auto-grading requires isolated container execution
- Without Docker support, platform cannot grade submissions

**Before choosing a deployment platform:**
1. Verify Docker socket access or equivalent
2. Test Java runner functionality
3. Evaluate resource and cost constraints

### Post-Beta Architecture Evolution

**After successful beta trial**, consider:

- **If scaling needed:** Remote runner service (separate execution backend)
- **If frontend performance matters:** CDN-hosted frontend with backend on VPS
- **If operations are hard:** Re-evaluate PaaS (only if runner constraints verified)
- **If beta succeeded:** Expand teacher count gradually on same VPS setup

### Beta Trial Parameters

**Recommended scale:**
- 3-5 teachers
- 5-20 students per teacher (max ~100 total)
- 2-4 weeks duration
- 1-2 assignments per teacher
- AP CSA array FRQ only

**Do not scale beyond this** until:
- ✅ Runner security validated
- ✅ Database backup strategy tested
- ✅ Monitoring and alerting in place
- ✅ Beta feedback collected and prioritized

## Milestone 3.8: VPS Production Config Template

**Production configuration templates** for Single VPS + Docker Compose deployment.

### Production Files

**Ready-to-use production configuration templates:**

- **`docker-compose.prod.yml`** - Production Docker Compose configuration
  - Production service orchestration
  - Environment variable placeholders
  - Security-focused port bindings
  - Docker socket access with security warnings
  - Restart policies for reliability
  - Production command (no --reload)

- **`.env.production.example`** - Production environment variable template
  - All required variables documented
  - Security-critical settings highlighted
  - Placeholder values for secrets
  - Configuration checklist
  - Deployment command examples

### Production Configuration Guide

**Comprehensive production setup documentation:**

- **[VPS Production Config](docs/VPS_PRODUCTION_CONFIG.md)** - Complete production configuration guide
  - Why VPS deployment for this MVP
  - Required files checklist
  - Environment variable explanations (all 13 variables)
  - Startup commands with docker-compose.prod.yml
  - Verification checklist (health, login, Java tests, analytics)
  - Security reminders and Java runner risk assessment
  - Troubleshooting common production issues
  - Monitoring and maintenance tasks
  - Beta trial scale limits (3-5 teachers max)

- **[Backup and Restore](docs/BACKUP_AND_RESTORE.md)** - PostgreSQL backup procedures
  - Why backups are critical for beta
  - Backup commands (full, compressed, table-specific)
  - Restore commands (full, clean, from compressed)
  - Backup frequency recommendations (daily during beta)
  - Manual backup best practices
  - Backup storage and security (encryption, offsite)
  - Automation with cron (daily backup script)
  - Disaster recovery scenarios
  - Privacy considerations for beta data

- **[Reverse Proxy Notes](docs/REVERSE_PROXY_NOTES.md)** - HTTPS setup with Caddy or Nginx
  - Why use a reverse proxy (HTTPS, domain mapping, security)
  - Caddy configuration (recommended - automatic HTTPS)
  - Nginx configuration (with Certbot for Let's Encrypt)
  - DNS configuration requirements
  - Port configuration with/without reverse proxy
  - Troubleshooting (certificates, CORS, 502 errors)
  - Security best practices (rate limiting, headers)
  - Monitoring and logs

### Key Production Requirements

**Security-Critical Settings:**

```bash
# MUST be changed in production
APP_ENV=production
ENABLE_PUBLIC_REGISTER=false
SECRET_KEY=generate-with-openssl-rand-hex-32

# MUST use HTTPS in beta
CORS_ORIGINS=https://your-frontend-domain.com
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**Java Runner Security:**

⚠️ **Docker socket access required** (`/var/run/docker.sock`)

- Acceptable for small beta (3-5 trusted teachers)
- Risk documented in `docker-compose.prod.yml` comments
- Containers are isolated with CPU/memory/timeout limits
- Consider remote runner service for scaling beyond beta

### Production Deployment Workflow

**Quick reference:**

```bash
# 1. Prepare environment
cp .env.production.example .env.production
nano .env.production  # Update SECRET_KEY, passwords, domains

# 2. Start production services
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# 3. Initialize database
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend python seed.py

# 4. Verify deployment
curl http://localhost:8000/health  # {"status":"ok"}

# 5. Set up HTTPS (see REVERSE_PROXY_NOTES.md)
# 6. Configure backups (see BACKUP_AND_RESTORE.md)
```

### Production Checklist

**Before beta launch:**

- [ ] `.env.production` created with real values (NOT committed to git)
- [ ] `SECRET_KEY` changed from default (generate with `openssl rand -hex 32`)
- [ ] `POSTGRES_PASSWORD` set to strong password
- [ ] `APP_ENV=production`
- [ ] `ENABLE_PUBLIC_REGISTER=false`
- [ ] HTTPS configured with Caddy or Nginx
- [ ] `CORS_ORIGINS` updated to actual frontend domain
- [ ] `NEXT_PUBLIC_API_URL` updated to actual backend domain
- [ ] Firewall configured (only ports 22, 80, 443)
- [ ] PostgreSQL port 5432 NOT exposed to public
- [ ] Backup strategy planned (daily backups during beta)
- [ ] Smoke test passed on production environment

### Beta Trial Scale Reminder

**Do not exceed:**
- 5 teachers maximum
- 20 students per teacher
- 2-4 weeks duration
- AP CSA array FRQ only

**Validate before scaling:**
- Runner security in production
- Backup/restore procedures
- Monitoring and alerting
- Beta feedback analysis

### Question tags

Each question now includes:

| Field | Example |
|-------|---------|
| `skill` | traversal, selection |
| `estimated_minutes` | 10 |
| `source` | original, teacher-created |
| `is_active` | true / false |

### Auto-generate API

```http
POST /assignments/generate
```

Example body:

```json
{
  "title": "Array Traversal Auto Practice",
  "description": "Auto-generated AP CSA array traversal practice.",
  "class_id": 1,
  "units": ["Array"],
  "difficulties": ["easy"],
  "skills": ["traversal"],
  "question_count": 3,
  "include_recent_questions": true
}
```

### How to test auto-generate

1. Log in as `teacher@example.com`
2. Go to **Assignments → New Assignment → Auto-generate**
3. Fill in unit, difficulty, skill, and question count
4. Click **Generate Assignment**
5. Log in as `student@example.com` and confirm the new assignment appears

Or run the full regression suite:

```bash
docker compose down -v
docker compose up --build -d
docker compose exec backend python seed.py
python scripts/smoke_test.py
```

`scripts/smoke_test.py` creates temporary orphan questions and auto-generated
assignments during regression checks and archives temporary questions and deletes temporary auto-generated assignments before finishing.

Current scope: **AP_CSA** / **FRQ_CODE** / `public int solve(int[] nums)` only.

## Current MVP Limitations

- Only supports `public int solve(int[] nums)` method signature
- No Monaco Editor (uses textarea)
- No OAuth / SSO
- No rubric-based scoring (test-case points only)
- No AI feedback
- No AP Classroom import
- No payment or multi-tenant support
- Single school deployment model
- Hidden test details masked for students (pass/fail message only)

## Milestone 3.9: High-Polish UI Redesign

**Modern, demo-ready interface** with shadcn/ui + Tailwind CSS for beta trials and public showcases.

### UI Infrastructure

**shadcn/ui Integration:**
- Modern component library with Tailwind CSS v3.4
- CVA (class-variance-authority) for component variants
- Radix UI primitives for accessibility
- Tailwind CSS color system with CSS variables
- Responsive design tokens and utilities

**Installed shadcn/ui Components:**
- Button, Card, Input, Textarea, Label, Badge, Alert, Table, Separator

**Custom Reusable Components:**
- `PageHeader`, `StatCard`, `EmptyState`, `StatusBadge`, `DemoAccountCard`, `BetaNoticeCard`

### Redesigned Pages

**1. Landing Page** - Hero, features, beta scope, workflows, privacy messaging  
**2. Login Page** - Two-column layout with demo credentials  
**3. Teacher Dashboard** - Beta demo flow, analytics tables, stat cards  
**4. Student Coding Page** - Two-column problem/editor layout with test results

### Visual Design

- Clean, modern education SaaS aesthetic
- Soft slate gradients and blue accents
- Professional typography and spacing
- Suitable for beta demos and screen recording
- High contrast, clear hierarchy

**No Breaking Changes:** All existing functionality preserved. Smoke test passes: ✅

## Implemented Features

- [x] User roles (teacher / student) with JWT auth
- [x] Class management
- [x] Question bank with FRQ prompts and starter code
- [x] Test case configuration (public + hidden)
- [x] Assignment creation and publishing to classes
- [x] Student code editor and public test runs
- [x] Final submission with auto-grading
- [x] Docker-sandboxed Java compilation and execution
- [x] Score calculation from test case points
- [x] Submission history for teachers and students
- [x] Teacher dashboard with filters
- [x] Student dashboard with average score
- [x] Seed data script (6 sample AP CSA questions)
- [x] Question tags (skill, estimated_minutes, source, is_active)
- [x] Auto-generated assignments from unit / difficulty / skill filters

## Reserved for Future Development

Code structure includes extension points for:

- [ ] Additional Java method signatures (String, ArrayList, 2D array)
- [ ] AP CSA rubric item scoring
- [ ] Static analysis (loop detection, method call checks)
- [ ] LLM-generated feedback
- [ ] AP CSP MCQ support
- [ ] AP CSP Create Task checklist
- [ ] Wrong-answer notebook
- [ ] Smarter auto-grouping (difficulty distribution, topic balancing)
- [ ] Knowledge mastery analytics

Auto-generate does not yet support difficulty **distribution** (only filter by
difficulty list). AP CSP, AI scoring, and rubric scoring remain out of scope.

See `backend/app/services/java_runner.py` and `backend/app/models.py` for enum placeholders (`Course.AP_CSP`, `QuestionType.MCQ`).

## License

MIT — for educational use.
