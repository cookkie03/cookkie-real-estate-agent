# Backup & Restore Scripts

Automated backup and restore scripts for CRM Immobiliare.

## Scripts Overview

### 1. `backup-database.sh`
Backs up PostgreSQL database from Docker container.

**Usage:**
```bash
./backup-database.sh [backup_directory]
```

**Features:**
- Creates compressed SQL dump (.sql.gz)
- Includes metadata JSON
- Auto-cleanup of backups older than 30 days
- Default location: `./backups/database/`

**Example:**
```bash
cd scripts/backup
./backup-database.sh ../../backups/database
```

### 2. `backup-volumes.sh`
Backs up all Docker volumes to compressed archives.

**Usage:**
```bash
./backup-volumes.sh [backup_directory]
```

**Features:**
- Backs up all 9 CRM volumes
- Creates timestamped directory
- Includes metadata JSON
- Shows total backup size

**Volumes backed up:**
- `crm_postgres_data` - PostgreSQL database
- `crm_app_uploads` - User uploads (photos, documents)
- `crm_app_backups` - Application backups
- `crm_app_logs` - Application logs
- `crm_app_cache` - Next.js cache
- `crm_ai_cache` - AI embeddings & vectors
- `crm_ai_logs` - AI service logs
- `crm_scraping_profiles` - Browser profiles
- `crm_qdrant_storage` - Vector database

**Example:**
```bash
cd scripts/backup
./backup-volumes.sh ../../backups/volumes
```

### 3. `restore-volumes.sh`
Restores Docker volumes from backup archives.

**Usage:**
```bash
./restore-volumes.sh <backup_directory>
```

**Features:**
- Restores all volumes from timestamped backup
- Creates missing volumes automatically
- Safety confirmation prompt
- Clears existing data before restore

**Example:**
```bash
cd scripts/backup
./restore-volumes.sh ../../backups/volumes/20251109_143000
```

### 4. `setup-cron.sh`
Sets up automated daily/weekly backups using cron.

**Usage:**
```bash
# User-level cron (recommended)
./setup-cron.sh

# System-wide cron (requires sudo)
sudo ./setup-cron.sh
```

**Automated schedule:**
- **Database backup**: Daily at 2:00 AM
- **Volumes backup**: Weekly (Sunday) at 3:00 AM
- **Log cleanup**: Monthly on the 1st at 4:00 AM

**Example:**
```bash
cd scripts/backup
chmod +x setup-cron.sh
./setup-cron.sh
```

## Quick Start

### Manual Backup

1. **Backup database only:**
```bash
cd scripts/backup
./backup-database.sh
```

2. **Backup all volumes:**
```bash
cd scripts/backup
./backup-volumes.sh
```

### Automated Backup

**Setup automated backups:**
```bash
cd scripts/backup
chmod +x *.sh
./setup-cron.sh
```

**View installed cron jobs:**
```bash
crontab -l
```

**Check backup logs:**
```bash
tail -f backups/cron.log
```

### Restore from Backup

1. **Find available backups:**
```bash
ls -lh backups/database/
ls -lh backups/volumes/
```

2. **Restore database:**
```bash
gunzip < backups/database/crm_db_20251109_140000.sql.gz | \
  docker exec -i crm-database psql -U crm_user
```

3. **Restore volumes:**
```bash
cd scripts/backup
./restore-volumes.sh ../../backups/volumes/20251109_143000
docker-compose restart
```

## Backup Best Practices

### Daily Operations
- Database backups run automatically at 2:00 AM
- Check logs periodically: `tail backups/cron.log`
- Keep at least 7 days of database backups

### Weekly Operations
- Full volume backup runs Sunday at 3:00 AM
- Verify backup sizes are reasonable
- Test restore on staging environment monthly

### Monthly Operations
- Review backup disk usage
- Archive old backups to external storage
- Test full disaster recovery procedure

### Before Major Changes
**Always backup before:**
- Database schema migrations
- Application updates
- Configuration changes
- Docker Compose modifications

```bash
# Quick pre-migration backup
cd scripts/backup
./backup-database.sh ../../backups/pre-migration
./backup-volumes.sh ../../backups/pre-migration
```

## Backup Storage

### Local Storage
Default backup location: `backups/` directory in project root

**Recommended structure:**
```
backups/
├── database/           # Daily database dumps
│   ├── crm_db_20251109_020000.sql.gz
│   ├── crm_db_20251110_020000.sql.gz
│   └── ...
├── volumes/            # Weekly volume backups
│   ├── 20251105_030000/
│   ├── 20251112_030000/
│   └── ...
├── pre-migration/      # Manual pre-migration backups
└── cron.log           # Backup automation logs
```

### External Storage

**Copy backups to external storage:**
```bash
# USB drive
rsync -avz backups/ /mnt/usb/crm-backups/

# Network share
rsync -avz backups/ user@nas:/backups/crm/

# Cloud storage (requires rclone)
rclone sync backups/ remote:crm-backups/
```

## Troubleshooting

### Issue: Cron jobs not running
**Check cron service:**
```bash
systemctl status cron  # or crond
```

**Check cron logs:**
```bash
grep CRON /var/log/syslog
tail -f backups/cron.log
```

### Issue: Backup fails - container not running
**Start containers:**
```bash
docker-compose up -d
```

**Verify containers:**
```bash
docker-compose ps
```

### Issue: Insufficient disk space
**Check disk usage:**
```bash
df -h
du -sh backups/
```

**Cleanup old backups:**
```bash
# Remove backups older than 30 days
find backups/ -name "*.sql.gz" -mtime +30 -delete
find backups/volumes/ -type d -mtime +60 -exec rm -rf {} +
```

### Issue: Restore fails
**Check backup integrity:**
```bash
# Test gzip integrity
gunzip -t backups/database/crm_db_20251109_020000.sql.gz

# Test tar integrity
tar tzf backups/volumes/20251109_030000/crm_postgres_data.tar.gz > /dev/null
```

## Disaster Recovery

### Full System Recovery

1. **Install Docker and Docker Compose**
2. **Clone repository:**
```bash
git clone <repo-url>
cd cookkie-real-estate-agent
```

3. **Restore volumes:**
```bash
cd scripts/backup
./restore-volumes.sh /path/to/backup/volumes/20251109_030000
```

4. **Start services:**
```bash
docker-compose up -d
```

5. **Verify:**
```bash
docker-compose ps
docker-compose logs
```

### Database-Only Recovery

```bash
# Stop containers
docker-compose down

# Start only database
docker-compose up -d database

# Restore database
gunzip < backups/database/crm_db_20251109_020000.sql.gz | \
  docker exec -i crm-database psql -U crm_user

# Start all services
docker-compose up -d
```

## Security Notes

- Backup files contain sensitive data - store securely
- Encrypt backups before uploading to cloud storage
- Restrict backup directory permissions: `chmod 700 backups/`
- Never commit backups to Git repository
- Use `.gitignore` to exclude `backups/` directory

## Support

For issues or questions:
1. Check backup logs: `backups/cron.log`
2. Verify Docker containers: `docker-compose ps`
3. Test backup manually before automation
4. Review this README for common solutions
