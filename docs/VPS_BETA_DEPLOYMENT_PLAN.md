# VPS Beta Deployment Plan

**Single VPS + Docker Compose - High-Level Deployment Guide**

This document provides a high-level plan for deploying AP CS Practice Lab on a single VPS for beta trial. It does NOT contain real credentials or bind to a specific VPS provider.

---

## Prerequisites

**Before You Begin:**

- [ ] Selected VPS provider (DigitalOcean, Linode, Vultr, AWS EC2, Tencent Cloud, Aliyun, etc.)
- [ ] Created VPS instance (recommended: 4 CPU, 8GB RAM, 80GB disk, Ubuntu 22.04 LTS)
- [ ] Have root or sudo access to the VPS
- [ ] Have a domain name (optional but recommended for HTTPS)
- [ ] Read `DEPLOYMENT_OPTIONS.md` and confirmed VPS + Docker Compose approach

**Not Required:**
- Kubernetes knowledge
- Complex orchestration tools
- Multiple servers
- Load balancers

---

## Step 1: Prepare VPS

### 1.1 Initial Server Access

```bash
# SSH into your VPS
ssh root@your-vps-ip-address

# Or with SSH key (recommended)
ssh -i ~/.ssh/your-key.pem root@your-vps-ip-address
```

### 1.2 Update System

```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget vim ufw
```

### 1.3 Install Docker

```bash
# Install Docker (official method)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Docker installation
docker --version

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### 1.4 Install Docker Compose

```bash
# Install Docker Compose (via plugin, recommended)
sudo apt install -y docker-compose-plugin

# Verify installation
docker compose version
```

**Alternative (standalone binary):**
```bash
# If the above doesn't work, install standalone binary
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 1.5 Configure Firewall

```bash
# Enable UFW (Uncomplicated Firewall)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Check status
sudo ufw status
```

**Security Note:** Only open ports 22 (SSH), 80 (HTTP), and 443 (HTTPS). Do NOT open PostgreSQL port (5432) to public.

### 1.6 Clone Repository

```bash
# Navigate to deployment directory
cd /opt

# Clone the repository
git clone https://github.com/your-username/ap-cs-practice-lab.git
cd ap-cs-practice-lab

# Or clone a specific branch
git clone -b beta-deployment https://github.com/your-username/ap-cs-practice-lab.git
```

---

## Step 2: Configure Environment Variables

### 2.1 Create .env File

```bash
# Navigate to project root
cd /opt/ap-cs-practice-lab

# Create .env file (do NOT commit this file)
nano .env
```

### 2.2 Environment Variable Template

**Copy and customize the following:**

```bash
# Database Configuration
DATABASE_URL=postgresql://apcs:YOUR_DB_PASSWORD_HERE@postgres:5432/ap_cs_practice

# Security - CRITICAL: Change this!
SECRET_KEY=YOUR_SECURE_RANDOM_SECRET_KEY_HERE_AT_LEAST_32_CHARS

# Application Environment
APP_ENV=production

# Public Registration - MUST be false in production
ENABLE_PUBLIC_REGISTER=false

# CORS Origins - Set to your deployed frontend domain
CORS_ORIGINS=https://your-frontend-domain.com

# Frontend API URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Java Runner Configuration
JAVA_RUNNER_IMAGE=ap-cs-java-runner
JAVA_RUNNER_MEMORY=256m
JAVA_RUNNER_CPUS=0.5
JAVA_RUNNER_TIMEOUT=5
JAVA_RUNNER_PIDS_LIMIT=64
JAVA_RUNNER_TMP_DIR=/tmp/ap-cs-practice-lab-java-runs
```

### 2.3 Generate Secure SECRET_KEY

```bash
# Generate a secure random key (32+ characters)
openssl rand -hex 32

# Copy the output and use it as SECRET_KEY
```

### 2.4 Update docker-compose.yml (if needed)

**For production, you may want to:**

```yaml
# In docker-compose.yml, update backend environment:
backend:
  environment:
    # ... other vars ...
    APP_ENV: production
    ENABLE_PUBLIC_REGISTER: "false"
```

**Or simply use the .env file** (recommended - easier to keep secrets out of git).

---

## Step 3: Start Services

### 3.1 Build and Start Containers

```bash
# Navigate to project root
cd /opt/ap-cs-practice-lab

# Build and start all services in detached mode
docker compose up --build -d

# Check if all containers are running
docker compose ps
```

**Expected Output:**
```
NAME                              STATUS
ap-cs-practice-lab-backend-1      Up
ap-cs-practice-lab-frontend-1     Up
ap-cs-practice-lab-postgres-1     Up
ap-cs-practice-lab-java-runner-1  Exited (expected)
```

**Note:** `java-runner-1` exits immediately (it's just an image, not a long-running service).

### 3.2 Check Logs

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f backend
```

### 3.3 Troubleshooting Startup

**If containers are not running:**

```bash
# Check which containers failed
docker compose ps

# View detailed logs for failed container
docker compose logs <service-name>

# Common issues:
# 1. Port already in use: sudo lsof -i :8000
# 2. Database connection failed: check DATABASE_URL
# 3. Permission denied: check .env file permissions
```

---

## Step 4: Initialize Database

### 4.1 Verify Database Connection

```bash
# Enter backend container
docker compose exec backend bash

# Inside container, try connecting to database
python -c "from app.database import engine; engine.connect(); print('Database connected!')"

# Exit container
exit
```

### 4.2 Option A: Run Seed Script (Demo Data)

```bash
# Run seed.py to create demo data
docker compose exec backend python seed.py
```

**This creates:**
- Teacher account: `teacher@example.com` / `password123`
- Student account: `student@example.com` / `password123`
- Demo class: "AP CSA Period 1"
- 6 demo questions
- 1 demo assignment

**Warning:** Use seed script only for initial testing. For real beta trial, create proper accounts.

### 4.2 Option B: Manually Create Teacher Account

**If you don't want to use seed data:**

```bash
# Enter backend container
docker compose exec backend bash

# Create teacher manually via Python
python -c "
from app.database import Session, engine
from app.models import User, UserRole
from app.auth import get_password_hash

session = Session(engine)
teacher = User(
    name='Beta Teacher',
    email='beta-teacher@yourschool.com',
    password_hash=get_password_hash('secure-password-here'),
    role=UserRole.TEACHER
)
session.add(teacher)
session.commit()
print(f'Teacher created: {teacher.email}')
"

# Exit container
exit
```

### 4.3 Bulk-Create Anonymized Students

**Via web UI after teacher logs in:**
1. Login as teacher
2. Create a class
3. Click "Manage Students"
4. Bulk-create 5-20 students
5. Save credentials immediately

---

## Step 5: Verify Deployment

### 5.1 Health Endpoint Check

```bash
# From VPS
curl http://localhost:8000/health

# Expected output:
# {"status":"ok"}

# If using domain:
curl https://your-backend-domain.com/health
```

### 5.2 Login Test

**Open browser and navigate to:**
- `http://your-vps-ip:3000` (if not using domain)
- `https://your-frontend-domain.com` (if using domain)

**Try logging in with:**
- Demo teacher: `teacher@example.com` / `password123`
- Or your manually created teacher account

**Expected:** Successful login, redirected to dashboard.

### 5.3 Java Public Tests

1. Login as teacher
2. Create or open an existing class
3. Create a simple assignment with one array question
4. Login as student (use bulk-created account)
5. Open assignment, open question
6. Paste a simple Java solution:

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

7. Click "Run Public Tests"
8. **Expected:** Test results appear (e.g., "4/10 points")

**If this works, Java runner is functioning correctly!**

### 5.4 Final Submission Test

1. Continue from above (as student)
2. Click "Submit Final Answer"
3. **Expected:** Final score appears (e.g., "10/10 points")

### 5.5 Teacher Analytics Check

1. Login as teacher
2. Navigate to Dashboard
3. **Expected:** See assignment completion stats, question performance, skill stats

### 5.6 CSV Export Test

1. On teacher dashboard
2. Click "Export CSV"
3. **Expected:** CSV file downloads with assignment data

---

## Step 6: Safety and Monitoring

### 6.1 Security Checklist

**After deployment, verify:**

- [ ] `.env` file is NOT committed to git
- [ ] `SECRET_KEY` is NOT the default dev key
- [ ] `ENABLE_PUBLIC_REGISTER` is set to `false`
- [ ] Only ports 22, 80, 443 are open on firewall
- [ ] SSH password login is disabled (use keys only)
- [ ] PostgreSQL port 5432 is NOT exposed to internet
- [ ] Demo credentials are changed or removed

### 6.2 Never Expose

**⚠️ CRITICAL - Never share publicly:**
- `.env` file contents
- Database passwords
- `SECRET_KEY` value
- VPS SSH keys
- Teacher account passwords
- Backend logs that contain sensitive data

### 6.3 Monitor Server Resources

```bash
# Check CPU and memory usage
docker stats

# Check disk usage
df -h

# Check Docker disk usage
docker system df
```

**Set up alerts (optional but recommended):**
- CPU usage > 80%
- Memory usage > 80%
- Disk usage > 80%
- Container restarts

### 6.4 Backup Strategy

**Minimum backup:**

```bash
# Backup PostgreSQL database daily
docker compose exec -T postgres pg_dump -U apcs ap_cs_practice > backup-$(date +%Y%m%d).sql

# Store backups offsite (e.g., AWS S3, DigitalOcean Spaces, etc.)
```

**Recommended backup schedule:**
- Daily database backups
- Keep last 7 days of backups
- Weekly full system backup (volumes + .env)

### 6.5 Log Monitoring

```bash
# View recent backend errors
docker compose logs backend | grep ERROR

# View Java runner issues
docker compose logs backend | grep "Java runner"

# Save logs to file for analysis
docker compose logs > logs-$(date +%Y%m%d).txt
```

---

## Step 7: Beta Trial Reminders

### 7.1 Keep Beta Small

**Do NOT exceed:**
- 5 teachers
- 20 students per teacher
- 2-4 weeks duration

**Why:**
- Validate architecture before scaling
- Easier to provide support
- Lower risk if issues occur
- Meaningful feedback with manageable group

### 7.2 Set Expectations

**Tell beta teachers:**
- This is a beta trial, bugs are expected
- Platform may go down briefly for fixes
- Use anonymized student accounts only
- Feedback is critical for improvement

### 7.3 Monitor During Trial

**Daily checks:**
- [ ] VPS is responsive (ping, SSH)
- [ ] Containers are running (`docker compose ps`)
- [ ] Disk space is sufficient (`df -h`)
- [ ] No error spikes in logs
- [ ] Teacher questions answered promptly

### 7.4 Quick Fix Deployment

**If you need to deploy a fix:**

```bash
# SSH into VPS
ssh root@your-vps-ip

# Navigate to project
cd /opt/ap-cs-practice-lab

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up --build -d

# Check logs
docker compose logs -f backend
```

**Estimated downtime:** 2-5 minutes

### 7.5 Show Real Student Data in Screenshots

**⚠️ Never include in screenshots:**
- Real student names
- Real student emails
- Real school names
- SECRET_KEY or database passwords
- Backend URLs (if sensitive)

**Always blur or redact** before sharing screenshots with others.

---

## Step 8: Common Issues and Solutions

### Issue 1: Cannot Access Frontend

**Check:**
```bash
# Is frontend container running?
docker compose ps frontend

# Is port 3000 open?
sudo ufw status | grep 3000

# View frontend logs
docker compose logs frontend
```

**Solution:**
- Ensure `NEXT_PUBLIC_API_URL` in `.env` points to correct backend URL
- Check firewall allows port 3000 (or 80/443 if using reverse proxy)

### Issue 2: Java Runner Timeouts

**Check:**
```bash
# View backend logs
docker compose logs backend | grep timeout

# Check Docker is running
docker ps
```

**Solution:**
- Increase `JAVA_RUNNER_TIMEOUT` (default 5 seconds)
- Check VPS has enough CPU/memory
- Verify Docker socket is accessible

### Issue 3: Database Connection Errors

**Check:**
```bash
# Is PostgreSQL running?
docker compose ps postgres

# Check DATABASE_URL in .env
grep DATABASE_URL .env
```

**Solution:**
- Ensure `DATABASE_URL` format is correct
- Verify PostgreSQL container name matches (usually `postgres`)
- Check database password matches between `.env` and docker-compose

### Issue 4: High CPU Usage

**Check:**
```bash
# Monitor container resource usage
docker stats
```

**Solution:**
- Too many concurrent Java runner executions
- Set rate limits on submission endpoint
- Increase VPS resources
- Ask teachers to stagger assignment due dates

### Issue 5: Disk Space Full

**Check:**
```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df
```

**Solution:**
```bash
# Clean up unused Docker resources
docker system prune -a

# Remove old logs
docker compose logs > /dev/null

# Remove database backups older than 7 days
find . -name "backup-*.sql" -mtime +7 -delete
```

---

## Step 9: Post-Beta Cleanup (Optional)

**After beta trial ends:**

### Option A: Keep for Future Use
- Keep VPS running
- Expand to more teachers gradually
- Continue monitoring and improving

### Option B: Export Data and Shutdown
```bash
# Export database
docker compose exec -T postgres pg_dump -U apcs ap_cs_practice > final-backup.sql

# Download backup to local machine
scp root@your-vps-ip:/opt/ap-cs-practice-lab/final-backup.sql ./

# Stop all services
docker compose down -v

# (Optional) Destroy VPS to stop billing
```

---

## Step 10: Next Steps After Successful Beta

**If beta trial is successful:**

1. **Collect and prioritize feedback**
   - What worked well?
   - What needs improvement?
   - What features are critical?

2. **Decide on architecture evolution:**
   - Stay on single VPS and expand gradually?
   - Separate frontend hosting for better performance?
   - Build remote runner service for better scaling?
   - Evaluate PaaS platforms with validated runner constraints?

3. **Improve operations:**
   - Automate backups
   - Set up proper monitoring and alerting
   - Create runbooks for common issues
   - Implement CI/CD if deploying frequently

4. **Consider pricing model:**
   - Continue free for now?
   - Freemium tier?
   - Per-teacher or per-student pricing?
   - Open-source + paid hosting?

5. **Plan next beta or public launch:**
   - Invite more teachers (10-20)?
   - Open to public registration (with vetting)?
   - Partner with schools?
   - Continue invite-only?

---

## Additional Resources

**For more detailed guidance, see:**
- `docs/DEPLOYMENT_CHECKLIST.md` - Complete deployment checklist with security
- `docs/DEPLOYMENT_OPTIONS.md` - Evaluation of all deployment options
- `docs/BETA_TRIAL_TEACHER_GUIDE.md` - Guide for beta teachers
- `README.md` - Project overview and milestones

**External Resources:**
- Docker Docs: https://docs.docker.com/
- Docker Compose Docs: https://docs.docker.com/compose/
- UFW Tutorial: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu
- PostgreSQL Backup: https://www.postgresql.org/docs/current/backup-dump.html

---

## Questions or Issues?

**During deployment:**
- Check Docker logs: `docker compose logs`
- Verify environment variables: `cat .env` (privately)
- Test connectivity: `curl http://localhost:8000/health`

**During beta trial:**
- Monitor server resources daily
- Respond to teacher questions promptly
- Deploy fixes quickly
- Document all issues for post-beta review

**Post-beta:**
- Review feedback form responses
- Prioritize improvements
- Plan architecture evolution
- Share learnings with community (anonymized)

---

**Good luck with your beta deployment!** 🚀

Remember:
- Start small (3-5 teachers)
- Monitor closely
- Iterate quickly
- Collect feedback
- Scale gradually

---

**Version:** Beta v0.1  
**Last Updated:** June 2026  
**Deployment Method:** Single VPS + Docker Compose
