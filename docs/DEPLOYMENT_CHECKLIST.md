# Deployment Checklist

This document outlines the steps and requirements for deploying the AP CS Practice Lab platform for beta testing.

## Prerequisites

### Docker Socket Access Requirement

**⚠️ CRITICAL:** This MVP depends on Docker-based Java code execution. The deployment platform must support:
- Docker socket access (`/var/run/docker.sock`), OR
- An equivalent secure container execution strategy

Without Docker socket access, the Java auto-grading feature will not work.

### System Requirements

- Docker and Docker Compose
- PostgreSQL 16+ database
- Node.js 20+ for frontend
- Python 3.12+ for backend
- Sufficient disk space for Docker volumes and Java runner temporary files

## Environment Variables

### Backend Configuration

Create a `.env` file in the `backend/` directory or set environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security - CRITICAL: Change in production
SECRET_KEY=your-secure-random-key-here-minimum-32-characters

# Environment
APP_ENV=production

# Public Registration - MUST be false in beta/production
ENABLE_PUBLIC_REGISTER=false

# CORS Origins - Set to your deployed frontend URL
CORS_ORIGINS=https://your-frontend-domain.com

# Java Runner Configuration
JAVA_RUNNER_IMAGE=ap-cs-java-runner
JAVA_RUNNER_MEMORY=256m
JAVA_RUNNER_CPUS=0.5
JAVA_RUNNER_TIMEOUT=5
JAVA_RUNNER_PIDS_LIMIT=64
JAVA_RUNNER_TMP_DIR=/tmp/ap-cs-practice-lab-java-runs
```

### Frontend Configuration

```bash
# Frontend - Set to your deployed backend URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## Security Checklist

Before going live with beta:

- [ ] **SECRET_KEY** changed to a secure random value (minimum 32 characters)
- [ ] **APP_ENV** set to `production`
- [ ] **ENABLE_PUBLIC_REGISTER** set to `false`
- [ ] **CORS_ORIGINS** set to your deployed frontend URL(s)
- [ ] Database credentials are secure and not using defaults
- [ ] Database is configured with SSL/TLS if possible
- [ ] Backend API is served over HTTPS
- [ ] Frontend is served over HTTPS
- [ ] Docker socket access is properly secured
- [ ] Java runner temporary directory has appropriate permissions

## Database Setup

1. **Create PostgreSQL Database:**
   ```sql
   CREATE DATABASE ap_cs_practice;
   CREATE USER apcs WITH PASSWORD 'secure-password-here';
   GRANT ALL PRIVILEGES ON DATABASE ap_cs_practice TO apcs;
   ```

2. **Run Migrations:**
   The application uses SQLModel and will auto-create tables on first run.

3. **Seed Demo Data:**
   ```bash
   docker compose exec backend python seed.py
   ```

## Initial Setup

### 1. Create Teacher Accounts

Since public registration is disabled in production, create teacher accounts manually:

**Option A: Using seed.py**
- The seed script creates a demo teacher: `teacher@example.com` / `password123`
- Use this for initial testing

**Option B: Manual Database Insert**
```python
# Use psql or a database management tool to create teacher accounts
# Password hash must be generated with bcrypt
```

**Option C: Temporary Enable Registration**
- Set `ENABLE_PUBLIC_REGISTER=true` temporarily
- Create teacher accounts via `/auth/register`
- Set back to `false` before going live

### 2. Create Anonymized Student Accounts

Teachers should use the bulk-create feature:
1. Login as teacher
2. Navigate to "My Classes"
3. Click "Manage Students"
4. Use "Bulk Create Students" with desired count
5. Copy the generated credentials immediately (shown only once)
6. Download CSV for record-keeping

## Pre-Launch Verification

### Run Smoke Test

Before public demo, verify all features work:

```bash
# Full reset and test
docker compose down -v
docker compose up --build -d
docker compose exec backend python seed.py
python scripts/smoke_test.py
```

Expected output:
```
SMOKE TEST PASSED
```

### Manual Verification

1. **Teacher Flow:**
   - [ ] Login works
   - [ ] Create class
   - [ ] Bulk create students
   - [ ] Create/auto-generate assignment
   - [ ] View dashboard analytics
   - [ ] Export CSV

2. **Student Flow:**
   - [ ] Login with anonymized account
   - [ ] View assignments
   - [ ] Run public tests
   - [ ] Submit solution
   - [ ] See final score

3. **Java Runner:**
   - [ ] Test submissions execute within timeout
   - [ ] Compilation errors are reported
   - [ ] Test cases run correctly
   - [ ] Memory limits are enforced

## Privacy & Beta Trial Guidelines

### Data Collection

**DO NOT collect or expose:**
- Real student emails
- Real student names
- Real school information
- Personal identifiable information (PII)

**DO use:**
- Anonymized student accounts (`student-001@class-1.demo`)
- Generic class names
- Demo credentials for screenshots
- Privacy notice at `/beta-notice`

### Screenshots & Demos

When sharing screenshots or demos:
- [ ] Use anonymized student accounts
- [ ] Blur or redact any accidentally visible real data
- [ ] Do not show demo credentials in public materials
- [ ] Link to privacy notice page

## Deployment Architecture

### Recommended Minimal Setup

```
Frontend (Next.js)     → Deployed on Vercel/Netlify/similar
    ↓
Backend (FastAPI)      → Deployed on Docker-capable platform
    ↓
PostgreSQL Database    → Managed database (AWS RDS/similar)
    ↓
Java Runner            → Docker on same host as backend
```

### Platform Requirements

**Backend Platform Must Support:**
- Docker containers
- Docker socket access for Java runner
- Persistent volumes for database connections
- Environment variable configuration
- HTTPS/SSL

**Frontend Platform Must Support:**
- Next.js deployment
- Environment variable configuration
- HTTPS/SSL

## Monitoring & Maintenance

### Health Check

The backend provides a health endpoint:
```
GET /health
```

### Logs

Monitor logs for:
- Java runner timeout errors
- Database connection issues
- CORS errors
- Authentication failures

### Backup

Regularly backup:
- PostgreSQL database
- Teacher account credentials
- Bulk-created student account CSVs

## Rollback Plan

If issues occur after deployment:
1. Revert to previous Docker image
2. Restore database from backup
3. Verify with smoke test
4. Notify beta users of maintenance window

## Support Resources

- **Smoke Test:** `scripts/smoke_test.py`
- **Seed Data:** `backend/seed.py`
- **Beta Demo Flow:** `docs/BETA_DEMO_FLOW.md`
- **Privacy Notice:** Frontend `/beta-notice` page
- **README:** Project root `README.md`

## Known Limitations (Beta)

- Single-school deployment only
- No password reset mechanism
- No OAuth/SSO
- Teacher accounts must be created manually
- Java runner requires Docker socket access
- No real-time collaboration
- No mobile optimization

## Next Steps After Beta

Consider for future releases:
- OAuth/SSO integration
- Self-service teacher registration with approval
- Remote Java runner with sandboxing
- Multi-tenancy for multiple schools
- Improved analytics and reporting
- Mobile responsive design
