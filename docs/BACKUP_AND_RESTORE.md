# Backup and Restore Guide

**AP CS Practice Lab - PostgreSQL Backup Procedures**

This guide provides backup and restore commands for production PostgreSQL data.

---

## Why Backups Are Critical

**What's at risk:**
- Teacher accounts and credentials
- Student accounts (anonymized for beta)
- Classes and assignment configurations
- Question bank (custom questions created by teachers)
- Student submissions and scores
- Analytics data (completion rates, performance stats)

**Backup scenarios:**
- Before major code deployments
- Before database migrations
- Weekly during active beta trial
- Before deleting test data
- After successful beta completion (archive)

**Data loss scenarios:**
- VPS failure or data corruption
- Accidental database drop
- Bad migration script
- Docker volume deletion
- User error (teacher deletes important data)

---

## PostgreSQL Backup Commands

### Basic Backup (All Data)

**Command template:**

```bash
# Using docker-compose.prod.yml
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U apcs ap_cs_practice > backups/ap_cs_practice_$(date +%Y%m%d_%H%M%S).sql

# Or with explicit credentials from .env.production
docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backups/backup.sql
```

**What this does:**
- Connects to PostgreSQL container
- Dumps entire `ap_cs_practice` database
- Saves to `backups/` directory with timestamp
- Includes schema (tables, indexes) and all data

**Output file:** `backups/ap_cs_practice_20260626_153022.sql`

### Backup with Compression

**For large databases (>100MB):**

```bash
# Gzip compression
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U apcs ap_cs_practice | gzip > backups/ap_cs_practice_$(date +%Y%m%d_%H%M%S).sql.gz
```

**Compression ratio:** Typically 5-10x smaller file

### Backup Specific Tables

**If you only need certain data:**

```bash
# Backup only questions table
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U apcs -t questions ap_cs_practice > backups/questions_only.sql

# Backup multiple tables
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U apcs -t questions -t test_cases ap_cs_practice > backups/questions_and_tests.sql
```

**Use case:** Export question bank to share with colleagues (without student data)

### Schema-Only Backup

**If you only need table structure (no data):**

```bash
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U apcs --schema-only ap_cs_practice > backups/schema_only.sql
```

**Use case:** Document database structure or prepare for migration

---

## PostgreSQL Restore Commands

### Full Database Restore

**Command template:**

```bash
# Restore from backup file
cat backups/ap_cs_practice_20260626_153022.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U apcs ap_cs_practice
```

**What this does:**
- Reads SQL file
- Pipes to PostgreSQL container
- Executes all SQL commands (CREATE TABLE, INSERT, etc.)
- Restores database to backup state

**⚠️ WARNING:** This **appends** data. If tables exist with data, you may get duplicate key errors.

### Clean Restore (Drop Existing Data First)

**If you want to completely replace current database:**

```bash
# Step 1: Drop and recreate database
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "DROP DATABASE IF EXISTS ap_cs_practice;"
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "CREATE DATABASE ap_cs_practice;"

# Step 2: Restore from backup
cat backups/ap_cs_practice_20260626_153022.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U apcs ap_cs_practice
```

**⚠️ DANGER:** This **deletes all current data**. Use with extreme caution.

**Recommended:** Test restore on a separate database first:

```bash
# Create test database
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "CREATE DATABASE ap_cs_practice_test;"

# Restore to test database
cat backups/backup.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U apcs ap_cs_practice_test

# Verify data
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs ap_cs_practice_test -c "SELECT COUNT(*) FROM users;"

# Drop test database after verification
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "DROP DATABASE ap_cs_practice_test;"
```

### Restore from Compressed Backup

**If you have a `.sql.gz` file:**

```bash
gunzip < backups/ap_cs_practice_20260626_153022.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U apcs ap_cs_practice
```

---

## Backup Frequency Recommendations

### Small Beta Trial (3-5 Teachers)

**Frequency:**
- **Daily:** During active trial weeks
- **Before/after:** Major code deployments
- **Weekly:** During less active periods

**Retention policy:**
- Keep last 7 days of daily backups
- Keep last 4 weeks of weekly backups
- Archive final backup after beta completion

**Why:**
- Beta data is valuable for feedback analysis
- Small dataset, easy to backup frequently
- Teachers may request data recovery

### Production (Post-Beta)

**Frequency:**
- **Daily:** Automated backups every night
- **Weekly:** Full backup with extended retention
- **Before migrations:** Manual backup required

**Retention policy:**
- Keep last 14 days of daily backups
- Keep last 3 months of weekly backups
- Archive semester-end backups

**Automation:** Set up cron job (see Automation section below)

---

## Manual Backup Best Practices

### 1. Create Backups Directory

```bash
# On VPS
mkdir -p /opt/ap-cs-practice-lab/backups
cd /opt/ap-cs-practice-lab
```

### 2. Before Major Changes

**Always backup before:**
- Code deployment with database schema changes
- Running migrations (when implemented)
- Deleting test data
- Bulk student account deletion
- Upgrading PostgreSQL version

**Command:**

```bash
# Timestamp backup with reason
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U apcs ap_cs_practice > backups/before_migration_$(date +%Y%m%d).sql

echo "Backed up before migration at $(date)" >> backups/backup_log.txt
```

### 3. Verify Backup Success

**After backup, verify file exists and is not empty:**

```bash
ls -lh backups/

# Should show file with reasonable size (>1KB if data exists)
# Example output:
# -rw-r--r-- 1 root root 2.3M Jun 26 15:30 ap_cs_practice_20260626.sql
```

**Test restore (optional but recommended):**

```bash
# Count records in original database
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs ap_cs_practice -c "SELECT COUNT(*) FROM users;"

# Create test database and restore
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "CREATE DATABASE test_restore;"
cat backups/ap_cs_practice_20260626.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U apcs test_restore

# Verify same record count
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs test_restore -c "SELECT COUNT(*) FROM users;"

# Clean up
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "DROP DATABASE test_restore;"
```

---

## Backup Storage and Security

### Where to Store Backups

**❌ DO NOT:**
- Store only on the same VPS (single point of failure)
- Commit backups to git repository (contains sensitive data)
- Upload to public cloud storage without encryption

**✅ DO:**
- Copy backups to separate server or local machine
- Use encrypted cloud storage (AWS S3, DigitalOcean Spaces, etc.)
- Keep backups in multiple locations

### Copy Backups Offsite

**From VPS to local machine (via SCP):**

```bash
# On your local machine
scp root@your-vps-ip:/opt/ap-cs-practice-lab/backups/ap_cs_practice_20260626.sql ~/backups/
```

**To encrypted cloud storage (example with AWS S3):**

```bash
# On VPS, install AWS CLI
apt install awscli

# Configure AWS credentials (once)
aws configure

# Upload backup to S3 bucket
aws s3 cp backups/ap_cs_practice_20260626.sql s3://your-bucket-name/ap-cs-backups/ --sse AES256
```

### Privacy and GDPR Considerations

**What backups contain:**
- Teacher emails and password hashes
- Student emails (anonymized in beta: `student-001@class-X.demo`)
- Student code submissions (may contain personal comments)
- Scores and analytics data

**Privacy best practices:**
- Do not share backups publicly
- Encrypt backups at rest and in transit
- Delete backups when no longer needed
- Inform beta participants about backup practices
- Do not upload backups to unencrypted third-party services

**After beta trial ends:**
- Archive final backup
- Delete beta trial data after retention period
- Document what was kept and what was deleted

---

## Automation with Cron

### Daily Backup Script

**Create backup script:**

```bash
# On VPS
nano /opt/ap-cs-practice-lab/scripts/daily_backup.sh
```

**Script content:**

```bash
#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/opt/ap-cs-practice-lab/backups"
COMPOSE_FILE="/opt/ap-cs-practice-lab/docker-compose.prod.yml"
ENV_FILE="/opt/ap-cs-practice-lab/.env.production"
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ap_cs_practice_$TIMESTAMP.sql"

# Backup database
cd /opt/ap-cs-practice-lab
docker compose -f $COMPOSE_FILE --env-file $ENV_FILE exec -T postgres pg_dump -U apcs ap_cs_practice > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Log success
echo "$(date): Backup successful - $BACKUP_FILE.gz" >> $BACKUP_DIR/backup_log.txt

# Delete old backups (older than RETENTION_DAYS)
find $BACKUP_DIR -name "ap_cs_practice_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Optional: Copy to remote storage
# scp $BACKUP_FILE.gz user@backup-server:/backups/
# aws s3 cp $BACKUP_FILE.gz s3://your-bucket/ap-cs-backups/

echo "$(date): Old backups cleaned up (retention: $RETENTION_DAYS days)" >> $BACKUP_DIR/backup_log.txt
```

**Make executable:**

```bash
chmod +x /opt/ap-cs-practice-lab/scripts/daily_backup.sh
```

### Schedule with Cron

**Edit crontab:**

```bash
crontab -e
```

**Add daily backup at 2 AM:**

```cron
# AP CS Practice Lab - Daily backup at 2 AM
0 2 * * * /opt/ap-cs-practice-lab/scripts/daily_backup.sh >> /var/log/ap-cs-backup.log 2>&1
```

**Verify cron job:**

```bash
crontab -l
```

**Check backup logs:**

```bash
tail -f /var/log/ap-cs-backup.log
cat /opt/ap-cs-practice-lab/backups/backup_log.txt
```

---

## Disaster Recovery Plan

### Scenario 1: Data Corruption (Database Still Running)

**Symptoms:**
- Missing records
- Incorrect data
- Foreign key violations

**Recovery:**

1. **Stop application to prevent further changes:**
   ```bash
   docker compose -f docker-compose.prod.yml stop backend frontend
   ```

2. **Create backup of corrupted database (for analysis):**
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres pg_dump -U apcs ap_cs_practice > backups/corrupted_$(date +%Y%m%d).sql
   ```

3. **Restore from last known good backup:**
   ```bash
   # Find most recent backup
   ls -lht backups/
   
   # Restore (see Clean Restore section above)
   docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "DROP DATABASE ap_cs_practice;"
   docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "CREATE DATABASE ap_cs_practice;"
   cat backups/ap_cs_practice_20260625.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U apcs ap_cs_practice
   ```

4. **Restart application:**
   ```bash
   docker compose -f docker-compose.prod.yml start backend frontend
   ```

5. **Verify recovery:**
   - Teacher login works
   - Classes and assignments visible
   - Student submissions intact
   - Analytics data correct

6. **Notify users:**
   - Inform teachers about data recovery
   - Explain what data was restored (up to backup time)
   - Ask teachers to verify their data

### Scenario 2: Complete VPS Failure

**Symptoms:**
- VPS unreachable
- Hardware failure
- Hosting provider issue

**Recovery:**

1. **Provision new VPS** (same specs or better)

2. **Install Docker and Docker Compose** (see `VPS_BETA_DEPLOYMENT_PLAN.md`)

3. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/ap-cs-practice-lab.git
   cd ap-cs-practice-lab
   ```

4. **Restore environment configuration:**
   - Copy `.env.production` from backup or recreate
   - Verify all environment variables

5. **Start services:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres
   ```

6. **Wait for PostgreSQL to initialize**, then restore data:
   ```bash
   cat backups/ap_cs_practice_latest.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U apcs ap_cs_practice
   ```

7. **Start application:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

8. **Verify and notify users**

### Scenario 3: Accidental Data Deletion

**Symptoms:**
- Teacher reports missing class or assignment
- Student submissions disappeared

**Recovery:**

1. **Identify when data was present:**
   - Ask teacher when they last saw the data
   - Find backup from that timeframe

2. **Extract specific data from backup:**
   ```bash
   # Restore backup to temporary database
   docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "CREATE DATABASE temp_restore;"
   cat backups/ap_cs_practice_20260625.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U apcs temp_restore
   
   # Export specific table/rows
   docker compose -f docker-compose.prod.yml exec postgres psql -U apcs temp_restore -c "COPY (SELECT * FROM classes WHERE id = 5) TO STDOUT WITH CSV HEADER;" > missing_class.csv
   ```

3. **Manually re-insert data:**
   - Review exported data
   - Re-insert using SQL or ask teacher to recreate

4. **Drop temporary database:**
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres psql -U apcs -c "DROP DATABASE temp_restore;"
   ```

---

## Backup Checklist

### Before Beta Trial Starts

- [ ] Backups directory created (`/opt/ap-cs-practice-lab/backups`)
- [ ] Backup script tested (`daily_backup.sh`)
- [ ] Cron job scheduled
- [ ] Test restore verified on separate database
- [ ] Offsite backup location configured (SCP or cloud storage)
- [ ] Backup retention policy documented

### During Beta Trial

- [ ] Daily automated backups running
- [ ] Weekly manual verification of backup files
- [ ] Backup logs reviewed for errors
- [ ] Offsite copies created weekly
- [ ] Backup before any code deployment

### After Beta Trial

- [ ] Final backup created
- [ ] Beta data archived
- [ ] Backup retention policy followed
- [ ] Unused backups deleted securely
- [ ] Lessons learned documented

---

## Troubleshooting

### Problem: Backup file is empty or very small

**Symptoms:**
- Backup file is 0 bytes or <1KB
- No data in database

**Check:**
```bash
# Verify database has data
docker compose -f docker-compose.prod.yml exec postgres psql -U apcs ap_cs_practice -c "SELECT COUNT(*) FROM users;"
```

**Solution:**
- Ensure database name is correct (`ap_cs_practice`)
- Check PostgreSQL container is running
- Verify credentials match `.env.production`

### Problem: Restore fails with "role does not exist"

**Error:**
```
psql: error: connection to server failed: role "apcs" does not exist
```

**Solution:**
- Ensure `POSTGRES_USER` environment variable is set
- Restart PostgreSQL container
- Manually create role if needed:
  ```bash
  docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "CREATE USER apcs WITH PASSWORD 'your-password';"
  ```

### Problem: Cron backup not running

**Check:**
```bash
# View cron logs
grep CRON /var/log/syslog

# Check crontab entry
crontab -l

# Manually run backup script to test
/opt/ap-cs-practice-lab/scripts/daily_backup.sh
```

**Solution:**
- Verify script has execute permissions (`chmod +x`)
- Check script path in crontab is absolute
- Ensure Docker Compose is in PATH for cron

---

## Additional Resources

**For more information, see:**
- `docs/VPS_PRODUCTION_CONFIG.md` - Production configuration
- `docs/VPS_BETA_DEPLOYMENT_PLAN.md` - Deployment steps
- `docs/DEPLOYMENT_CHECKLIST.md` - Pre-launch checklist
- PostgreSQL documentation: https://www.postgresql.org/docs/current/backup-dump.html

**For cloud storage:**
- AWS S3: https://aws.amazon.com/s3/
- DigitalOcean Spaces: https://www.digitalocean.com/products/spaces/
- Backblaze B2: https://www.backblaze.com/b2/cloud-storage.html

---

**Remember:**
- Backups are only useful if you can restore them
- Test restore procedures regularly
- Keep backups in multiple locations
- Encrypt backups containing sensitive data
- Document your backup and restore process

---

**Version:** Backup Guide v1.0  
**Last Updated:** June 2026  
**Database:** PostgreSQL 16
