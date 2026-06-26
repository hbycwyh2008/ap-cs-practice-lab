# VPS Production Configuration Guide

**AP CS Practice Lab - Production Environment Setup**

This guide explains how to configure and deploy the platform on a single VPS using Docker Compose for small-scale beta trials.

---

## Why VPS Deployment?

**Current MVP Architecture Constraints:**

1. **Docker-based Java execution** is a core requirement
   - Student code runs in isolated Docker containers
   - Backend needs Docker socket access (`/var/run/docker.sock`)
   - Spawns temporary containers for each submission

2. **Single VPS + Docker Compose** is the simplest first beta route
   - Proven to work (identical to local development)
   - Docker support guaranteed
   - Simple operations (one machine)
   - Adequate for 3-5 teacher beta

3. **Alternative platforms** have constraints
   - Most PaaS restrict Docker-in-Docker
   - Kubernetes is overkill for beta
   - Remote runner service requires refactoring

**For detailed platform evaluation, see:**
- `docs/DEPLOYMENT_OPTIONS.md`

---

## Required Files

Before deployment, ensure these files are present:

| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | Production service orchestration |
| `.env.production.example` | Environment variable template |
| `.env.production` | Your actual production config (DO NOT COMMIT) |
| `docs/VPS_BETA_DEPLOYMENT_PLAN.md` | Step-by-step deployment guide |
| `docs/DEPLOYMENT_CHECKLIST.md` | Pre-launch verification checklist |
| `docs/BACKUP_AND_RESTORE.md` | Database backup procedures |
| `docs/REVERSE_PROXY_NOTES.md` | HTTPS setup with Caddy/Nginx |

**File Location:** All files are in the project root or `docs/` directory.

---

## Production Environment Variables

### Security-Critical Variables

**1. APP_ENV**
```bash
APP_ENV=production
```
- **Purpose:** Enables production mode and safety checks
- **Effect:** Application refuses to start if `SECRET_KEY` is still the dev default
- **Required:** MUST be `production` for beta/production deployment
- **Never use:** `development` in public deployment

**2. ENABLE_PUBLIC_REGISTER**
```bash
ENABLE_PUBLIC_REGISTER=false
```
- **Purpose:** Disables public teacher registration endpoint
- **Effect:** `POST /auth/register` returns 403 Forbidden
- **Required:** MUST be `false` in production/beta
- **Why:** Teacher accounts should be created manually or via seed
- **Student accounts:** Created by teacher via bulk-create (`POST /classes/{id}/students/bulk-create`)

**3. SECRET_KEY**
```bash
SECRET_KEY=your-secure-random-key-here-at-least-32-characters
```
- **Purpose:** JWT token signing and session security
- **Required:** MUST be changed from `dev-secret-key-change-in-production`
- **Generate:** `openssl rand -hex 32`
- **Safety:** Application refuses to start if not changed when `APP_ENV=production`
- **Never commit:** Keep this secret out of version control

### Database Configuration

**4. DATABASE_URL**
```bash
DATABASE_URL=postgresql://apcs:strong-password@postgres:5432/ap_cs_practice
```
- **Format:** `postgresql://username:password@host:port/database`
- **Host:** Use `postgres` (Docker Compose service name) for internal connection
- **Password:** Must match `POSTGRES_PASSWORD`
- **Security:** Never expose PostgreSQL port 5432 to public internet

**5. POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB**
```bash
POSTGRES_USER=apcs
POSTGRES_PASSWORD=strong-password-here
POSTGRES_DB=ap_cs_practice
```
- **Purpose:** PostgreSQL container credentials
- **Used by:** `docker-compose.prod.yml` to initialize database
- **Password strength:** Use a strong, random password
- **Consistency:** Password in `DATABASE_URL` must match `POSTGRES_PASSWORD`

### CORS & Frontend Configuration

**6. CORS_ORIGINS**
```bash
CORS_ORIGINS=https://your-frontend-domain.com,https://www.example.com
```
- **Purpose:** Allowed origins for Cross-Origin Resource Sharing
- **Format:** Comma-separated list of URLs (no trailing slashes)
- **Development:** `http://localhost:3000,http://127.0.0.1:3000`
- **Production:** Your actual frontend domain(s) with HTTPS
- **Important:** Must match actual frontend URL or browser will block API calls

**7. NEXT_PUBLIC_API_URL**
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```
- **Purpose:** Backend API URL used by Next.js frontend
- **Format:** Full URL with protocol (https:// in production)
- **Development:** `http://localhost:8000`
- **Production:** Your actual backend domain with HTTPS
- **CORS:** This URL must be in backend's `CORS_ORIGINS`

### Java Runner Configuration

**8. JAVA_RUNNER_IMAGE**
```bash
JAVA_RUNNER_IMAGE=ap-cs-java-runner
```
- **Purpose:** Docker image name for Java execution sandbox
- **Default:** `ap-cs-java-runner` (built by docker-compose)
- **Change:** Only if using custom runner image

**9. JAVA_RUNNER_MEMORY**
```bash
JAVA_RUNNER_MEMORY=256m
```
- **Purpose:** Memory limit per Java execution container
- **Default:** 256m (256 megabytes)
- **Adjust:** Increase if students submit memory-intensive solutions
- **Beta:** 256m is adequate for array traversal problems

**10. JAVA_RUNNER_CPUS**
```bash
JAVA_RUNNER_CPUS=0.5
```
- **Purpose:** CPU limit per Java execution container
- **Format:** Decimal (0.5 = 50% of one core, 1.0 = one full core)
- **Default:** 0.5
- **Adjust:** Increase for compute-intensive problems

**11. JAVA_RUNNER_TIMEOUT**
```bash
JAVA_RUNNER_TIMEOUT=5
```
- **Purpose:** Maximum execution time in seconds
- **Default:** 5 seconds
- **Effect:** Kills container after timeout to prevent infinite loops
- **Adjust:** Increase if legitimate solutions need more time

**12. JAVA_RUNNER_PIDS_LIMIT**
```bash
JAVA_RUNNER_PIDS_LIMIT=64
```
- **Purpose:** Maximum number of processes per container
- **Default:** 64
- **Why:** Prevents fork bombs and runaway process creation
- **Beta:** 64 is adequate

**13. JAVA_RUNNER_TMP_DIR**
```bash
JAVA_RUNNER_TMP_DIR=/tmp/ap-cs-practice-lab-java-runs
```
- **Purpose:** Host directory for temporary Java code files
- **Important:** Must exist on VPS and be accessible by Docker
- **Created by:** Backend creates per-run subdirectories
- **Cleanup:** Backend deletes subdirectories after each run
- **Security:** Only backend and runner containers access this directory

---

## Startup Commands

### 1. Prepare Environment

```bash
# Copy production config template
cp .env.production.example .env.production

# Edit with real values (SECRET_KEY, passwords, domains)
nano .env.production  # or vim, code, etc.
```

### 2. Create Temp Directory

```bash
# Create Java runner temp directory on host
sudo mkdir -p /tmp/ap-cs-practice-lab-java-runs
sudo chmod 755 /tmp/ap-cs-practice-lab-java-runs
```

### 3. Start Services

```bash
# Build and start all production services
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# Check container status
docker compose -f docker-compose.prod.yml ps
```

**Expected output:**
```
NAME                              STATUS
ap-cs-practice-lab-backend-1      Up
ap-cs-practice-lab-frontend-1     Up
ap-cs-practice-lab-postgres-1     Up
ap-cs-practice-lab-java-runner-1  Exited (expected)
```

### 4. Initialize Database (First Deployment Only)

**Option A: Use seed data (for testing/demo)**
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend python seed.py
```

**Option B: Create teacher manually**
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend python -c "
from app.database import Session, engine
from app.models import User, UserRole
from app.auth import get_password_hash

session = Session(engine)
teacher = User(
    name='Beta Teacher',
    email='teacher@yourschool.com',
    password_hash=get_password_hash('secure-password-here'),
    role=UserRole.TEACHER
)
session.add(teacher)
session.commit()
print(f'Teacher created: {teacher.email}')
"
```

### 5. View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## Verification Commands

Run these checks after deployment to ensure everything works:

### 1. Backend Health Check

```bash
curl http://localhost:8000/health
```

**Expected:** `{"status":"ok"}`

### 2. Frontend Access

```bash
curl http://localhost:3000
```

**Expected:** HTML response (Next.js page)

### 3. Teacher Login (via browser)

1. Open `http://your-vps-ip:3000` or `https://your-domain.com`
2. Login with teacher account (seed or manually created)
3. **Expected:** Redirect to `/dashboard`

### 4. Student Login (via browser)

1. As teacher, create a class and bulk-create students
2. Save student credentials (shown only once)
3. Logout and login as student
4. **Expected:** Redirect to `/dashboard` (student view)

### 5. Java Public Test Run

1. As teacher, create an assignment with an array question
2. Login as student, open assignment, open question
3. Paste a simple solution:

```java
public class ArrayProblems {
    public static int findMax(int[] arr) {
        if (arr == null || arr.length == 0) return 0;
        int max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > max) max = arr[i];
        }
        return max;
    }
}
```

4. Click "Run Public Tests"
5. **Expected:** Test results appear (e.g., "4/10 points")

**If this works, Java runner is functioning correctly.**

### 6. Final Submission

1. Continue from above, click "Submit Final Answer"
2. **Expected:** Final score appears (e.g., "10/10 points")

### 7. Teacher Analytics

1. Login as teacher, go to Dashboard
2. **Expected:** Assignment stats, question performance, skill stats

### 8. CSV Export

1. On teacher dashboard, click "Export CSV"
2. **Expected:** CSV file downloads with assignment data

---

## Security Reminders

### Critical Security Checklist

**Before public beta access:**

- [ ] **SECRET_KEY** changed from dev default to secure random value
- [ ] **POSTGRES_PASSWORD** set to strong password
- [ ] **APP_ENV** set to `production`
- [ ] **ENABLE_PUBLIC_REGISTER** set to `false`
- [ ] **CORS_ORIGINS** updated to actual frontend domain
- [ ] **Firewall** configured (only ports 22, 80, 443 open)
- [ ] **PostgreSQL port 5432** NOT exposed to public internet
- [ ] **HTTPS** enabled with Caddy or Nginx (see `REVERSE_PROXY_NOTES.md`)
- [ ] **Backup strategy** planned (see `BACKUP_AND_RESTORE.md`)
- [ ] **Docker socket security** reviewed (see Java Runner Security below)

### File Security

**Never commit to version control:**
- `.env.production` (contains secrets)
- Database backups (may contain student data)
- SSH private keys
- Any file with real passwords or API keys

**Add to `.gitignore`:**
```
.env.production
.env.local
backups/
*.sql
```

### Java Runner Security

**Current Architecture:**

The backend requires Docker socket access (`/var/run/docker.sock`) to spawn isolated Java execution containers.

**Security Implications:**

| Risk | Mitigation |
|------|-----------|
| Container escape | Java runner uses Alpine Linux, non-root user, no network |
| Resource exhaustion | CPU/memory/PID limits enforced |
| Malicious code execution | Isolated container, read-only filesystem, timeout |
| Host access | Limited to temp directory only |

**For Small Beta:**
- ✅ **Acceptable** for 3-5 trusted teachers
- ✅ Risk is low with proper resource limits
- ✅ Containers are isolated and ephemeral

**For Scaling Beyond Beta:**
- ⚠️ **Consider** remote runner service (separate execution backend)
- ⚠️ **Evaluate** additional sandboxing (gVisor, Firecracker)
- ⚠️ **Monitor** for suspicious activity

**Documented in:**
- `docker-compose.prod.yml` (comments on volumes section)
- `docs/DEPLOYMENT_OPTIONS.md` (Option E: Remote runner service)

### Beta Trial Security Best Practices

**During beta:**
- Use anonymized student accounts only (`student-001@class-X.demo`)
- Do not collect unnecessary personal information
- Do not show real student data in screenshots or demos
- Keep beta small (3-5 teachers, 5-20 students per teacher max)
- Monitor server logs for suspicious activity
- Respond promptly to teacher security concerns

**Privacy:**
- Teachers can export assignment data as CSV (no student emails included)
- Analytics show numeric IDs (`Student #42`) not emails
- See `/beta-notice` page for complete privacy information

---

## Troubleshooting

### Problem: Backend won't start (SECRET_KEY error)

**Error:**
```
ValueError: SECRET_KEY must be changed in production
```

**Solution:**
- Edit `.env.production` and change `SECRET_KEY` to a secure random value
- Generate: `openssl rand -hex 32`

### Problem: Frontend can't reach backend (CORS error)

**Error in browser console:**
```
Access to fetch at 'http://backend:8000/...' has been blocked by CORS policy
```

**Solution:**
- Verify `CORS_ORIGINS` in `.env.production` includes your frontend domain
- Verify `NEXT_PUBLIC_API_URL` points to correct backend URL
- Restart backend: `docker compose -f docker-compose.prod.yml restart backend`

### Problem: Java runner timeouts

**Symptom:** All submissions fail with timeout

**Check:**
```bash
# View backend logs
docker compose -f docker-compose.prod.yml logs backend | grep timeout

# Check Docker is running
docker ps

# Check temp directory exists
ls -la /tmp/ap-cs-practice-lab-java-runs
```

**Solution:**
- Increase `JAVA_RUNNER_TIMEOUT` in `.env.production`
- Verify Docker socket is accessible
- Check VPS has enough CPU/memory

### Problem: Database connection failed

**Error:**
```
psycopg2.OperationalError: could not connect to server
```

**Check:**
```bash
# Is PostgreSQL running?
docker compose -f docker-compose.prod.yml ps postgres

# Check DATABASE_URL format
grep DATABASE_URL .env.production
```

**Solution:**
- Ensure `DATABASE_URL` format is correct
- Verify `POSTGRES_PASSWORD` matches in both `DATABASE_URL` and separate variable
- Restart PostgreSQL: `docker compose -f docker-compose.prod.yml restart postgres`

### Problem: High CPU usage

**Check:**
```bash
docker stats
```

**Possible causes:**
- Too many concurrent Java runner executions
- Infinite loop in student code (should timeout)
- VPS underpowered for current load

**Solution:**
- Monitor during peak submission times
- Set rate limits if needed (future enhancement)
- Upgrade VPS resources if sustained high usage
- Ask teachers to stagger assignment due dates

---

## Monitoring and Maintenance

### Daily Checks (During Beta)

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Check disk space
df -h

# Check Docker disk usage
docker system df

# View recent errors
docker compose -f docker-compose.prod.yml logs --tail=100 | grep ERROR
```

### Weekly Maintenance

```bash
# Backup database (see BACKUP_AND_RESTORE.md)
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U apcs ap_cs_practice > backup-$(date +%Y%m%d).sql

# Clean up old Docker images
docker image prune -a

# Review logs for issues
docker compose -f docker-compose.prod.yml logs --since 7d > logs-weekly.txt
```

### Resource Monitoring

**Set up alerts for:**
- CPU usage > 80% sustained
- Memory usage > 80%
- Disk usage > 80%
- Container restarts
- Backend errors spike

**Tools:**
- `docker stats` (built-in)
- VPS provider monitoring (DigitalOcean, Linode, etc.)
- Custom scripts with email alerts

---

## Beta Trial Scale Limits

**Recommended beta parameters:**

| Parameter | Limit | Reason |
|-----------|-------|--------|
| Teachers | 3-5 | Manageable support load |
| Students per teacher | 5-20 | Adequate for classroom pilot |
| Total students | ~100 max | VPS resource limits |
| Duration | 2-4 weeks | Enough time for feedback |
| Assignments per teacher | 1-2 | Focus on quality over quantity |
| Assignment type | AP CSA array FRQ only | Current MVP scope |

**Do not scale beyond this** until:
- ✅ Beta feedback collected and analyzed
- ✅ Runner security validated in production
- ✅ Database backup/restore tested
- ✅ Monitoring and alerting in place
- ✅ Known issues documented or fixed
- ✅ Cost and resource usage understood

**After successful beta:**
- Expand gradually (add 2-3 teachers at a time)
- Monitor resource usage closely
- Consider architecture evolution (see `DEPLOYMENT_OPTIONS.md`)

---

## Next Steps

**After reading this guide:**

1. **Review related documentation:**
   - `docs/VPS_BETA_DEPLOYMENT_PLAN.md` - Step-by-step deployment
   - `docs/DEPLOYMENT_CHECKLIST.md` - Pre-launch verification
   - `docs/BACKUP_AND_RESTORE.md` - Database backup procedures
   - `docs/REVERSE_PROXY_NOTES.md` - HTTPS setup

2. **Prepare VPS:**
   - Provision server (4 CPU, 8GB RAM recommended)
   - Install Docker and Docker Compose
   - Configure firewall
   - Clone repository

3. **Configure environment:**
   - Copy `.env.production.example` to `.env.production`
   - Update all placeholders with real values
   - Generate secure `SECRET_KEY`
   - Set strong `POSTGRES_PASSWORD`

4. **Deploy:**
   - Follow startup commands above
   - Run verification checks
   - Set up HTTPS reverse proxy
   - Configure backups

5. **Invite beta teachers:**
   - Send beta trial invitation (see `BETA_TRIAL_INVITE.md`)
   - Provide teacher guide (see `BETA_TRIAL_TEACHER_GUIDE.md`)
   - Monitor and support throughout trial
   - Collect feedback (see `BETA_TRIAL_FEEDBACK_FORM.md`)

---

## Support and Feedback

**For deployment issues:**
- Check troubleshooting section above
- Review Docker Compose logs
- Verify all environment variables are set correctly
- Ensure VPS meets minimum requirements

**For beta trial support:**
- Respond to teacher questions promptly
- Monitor server resources during peak times
- Deploy fixes quickly when needed
- Document all issues for post-beta review

**Post-beta:**
- Analyze feedback form responses
- Prioritize improvements
- Plan architecture evolution if needed
- Share learnings with community (anonymized)

---

**Good luck with your production deployment!** 🚀

Remember:
- Start small (3-5 teachers)
- Monitor closely
- Iterate quickly based on feedback
- Collect meaningful data for decisions
- Scale gradually after validation

---

**Version:** Production Config v1.0  
**Last Updated:** June 2026  
**Configuration:** Single VPS + Docker Compose
