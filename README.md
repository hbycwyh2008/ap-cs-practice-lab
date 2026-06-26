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

# 1. Build the Java runner image (required once)
docker build -t ap-cs-java-runner ./runner

# 2. Start all services
docker compose up -d --build

# 3. Seed demo data
docker compose exec backend python seed.py
```

Or use the helper script (Linux/macOS):

```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

Open **http://localhost:3000** in your browser.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Teacher | teacher@example.com | password123 |
| Student | student@example.com | password123 |

Seed data includes:
- Class: **AP CSA Period 1** (2026-2027)
- Question: **Find Maximum Value** (Array unit, 4 test cases, 10 points)
- Assignment: **Array Practice - Week 1**

## Testing the First FRQ Auto-Grading

1. Log in as **student@example.com**
2. Go to **My Assignments** → **Array Practice - Week 1**
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
- [x] Seed data script

## Reserved for Future Development

Code structure includes extension points for:

- [ ] Additional Java method signatures (String, ArrayList, 2D array)
- [ ] AP CSA rubric item scoring
- [ ] Static analysis (loop detection, method call checks)
- [ ] LLM-generated feedback
- [ ] AP CSP MCQ support
- [ ] AP CSP Create Task checklist
- [ ] Wrong-answer notebook
- [ ] Auto-generated problem sets
- [ ] Knowledge mastery analytics

See `backend/app/services/java_runner.py` and `backend/app/models.py` for enum placeholders (`Course.AP_CSP`, `QuestionType.MCQ`).

## License

MIT — for educational use.
