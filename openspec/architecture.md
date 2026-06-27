# Architecture

## Frontend Stack

- Next.js 14 App Router.
- React and TypeScript.
- Tailwind CSS with shadcn-style reusable UI components.
- Client-side auth helper in `frontend/src/lib/auth.ts`.
- API wrapper and shared frontend DTO types in `frontend/src/lib/api.ts`.

## Backend Stack

- FastAPI on Python 3.12.
- SQLModel for database models and persistence.
- Pydantic schemas for request and response contracts.
- JWT authentication with email/password login.
- API modules organized by domain: auth, classes, questions, assignments, submissions, analytics.

## Database

- PostgreSQL 16.
- Docker Compose local database service.
- No Alembic migration system in the current MVP; database resets use `docker compose down -v` and seed data.

## Java Runner

- Java code execution uses Docker from the backend container.
- Runner image: `ap-cs-java-runner`, built from `runner/Dockerfile` using Eclipse Temurin JDK 17.
- Backend invokes `docker run` with:
  - `--network none`
  - memory limit
  - CPU limit
  - PID limit
  - timeout
  - per-run temporary workspace bind mount
- Current Java signature support: `public int solve(int[] nums)`.

## Docker Services

Local development `docker-compose.yml` includes:

- `postgres`: PostgreSQL database with healthcheck.
- `java-runner`: builds the Java runner image.
- `backend`: FastAPI service on port 8000 with Docker socket access.
- `frontend`: Next.js service on port 3000.

Production template `docker-compose.prod.yml` keeps the same service shape with production environment variables, restart policies, and security warnings.

## Authentication Approach

- `/auth/login/json` returns a bearer token.
- Frontend stores token in `localStorage`.
- API requests add `Authorization: Bearer <token>`.
- Backend resolves current user via token and enforces roles through `get_current_user` and `require_teacher`.
- Public registration is configurable and must be disabled in production.

## API Client Layer

`frontend/src/lib/api.ts` is the frontend source of truth for API calls and response shapes. New frontend work should extend this layer rather than scattering raw fetch calls across pages.

## Deployment Assumptions

- Local development uses Docker Compose.
- Small beta deployment is expected to use a single VPS with Docker Compose.
- HTTPS is expected through a reverse proxy such as Caddy or Nginx.
- Production must set a non-default `SECRET_KEY`, disable public registration, and set CORS/frontend URLs explicitly.

## Known Infrastructure Risks

- Backend requires Docker socket access for Java grading. This is operationally simple but security-sensitive.
- Java runner temp directory must be visible to the host Docker daemon.
- No migration tooling means schema changes currently require reset/seed workflows.
- Local Docker cache or stale frontend volumes can cause style/runtime issues.
- Current scale target is small private classroom beta, not public multi-tenant usage.
