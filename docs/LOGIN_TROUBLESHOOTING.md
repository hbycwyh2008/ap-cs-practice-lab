# Login Troubleshooting (Local Classroom Setup)

Use this when teacher or student login fails in local Docker setup.

## Known Local Credentials

- Teacher: `teacher@example.com` / `password123`
- Student: `student@example.com` / `password123`

These are local demo credentials for private classroom testing only.

## After `docker compose down -v`

A volume reset removes database data. Run seed again:

```bash
docker compose up --build -d
docker compose exec backend python seed.py
```

`seed.py` is idempotent and resets the local teacher/student passwords above.

## Clear Browser Token

If login still fails or redirects loop:

1. Open browser devtools.
2. Go to Application/Storage.
3. Remove `localStorage["token"]` for `http://localhost:3000`.
4. Refresh and login again.

## Verify Backend Login with curl

```bash
curl -X POST http://localhost:8000/auth/login/json \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password123"}'
```

Expected: HTTP `200` with JSON containing `access_token` and `token_type`.

## Error Guide

- `401 Incorrect email or password`
  - Re-run `docker compose exec backend python seed.py`.
  - Confirm you are using the seeded credentials above.
- `422 Unprocessable Entity`
  - Request body must be JSON:
    - `{"email":"...","password":"..."}`
  - Endpoint must be `/auth/login/json`.
- `500 Internal Server Error`
  - Check backend logs:
    - `docker compose logs backend --tail=200`
  - Look for DB connection errors or missing tables.
- Frontend loads `/login` but JS chunks return `404`
  - Restart frontend container:
    - `docker compose restart frontend`
  - If needed, do full reset:
    - `docker compose down -v && docker compose up --build -d`

