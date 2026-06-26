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
assignments during regression checks and deletes them before finishing.

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
