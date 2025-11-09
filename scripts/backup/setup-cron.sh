#!/bin/bash

# ============================================================================
# Cron Jobs Setup for Automated Backups
# ============================================================================
# Sets up automated daily backups using cron
# Usage: sudo ./setup-cron.sh
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}CRM Backup Cron Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Project root: $PROJECT_ROOT"
echo "Backup scripts: $SCRIPT_DIR"
echo ""

# Check if running as root for system-wide cron
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: Not running as root${NC}"
  echo "This will set up user-level cron jobs only."
  echo ""
  read -p "Continue? (yes/no): " CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    echo "Setup cancelled"
    exit 0
  fi
  CRON_USER="$USER"
else
  CRON_USER="root"
fi

# Make scripts executable
echo -e "${BLUE}Making backup scripts executable...${NC}"
chmod +x "$SCRIPT_DIR/backup-volumes.sh"
chmod +x "$SCRIPT_DIR/backup-database.sh"
chmod +x "$SCRIPT_DIR/restore-volumes.sh"

# Backup directory
BACKUP_DIR="$PROJECT_ROOT/backups"
mkdir -p "$BACKUP_DIR"

# Create cron jobs file
CRON_FILE="/tmp/crm_backup_cron"

cat > "$CRON_FILE" <<EOF
# ============================================================================
# CRM Immobiliare - Automated Backups
# ============================================================================

# Database backup - Daily at 2:00 AM
0 2 * * * cd $PROJECT_ROOT && $SCRIPT_DIR/backup-database.sh $BACKUP_DIR/database >> $BACKUP_DIR/cron.log 2>&1

# Full volumes backup - Weekly on Sunday at 3:00 AM
0 3 * * 0 cd $PROJECT_ROOT && $SCRIPT_DIR/backup-volumes.sh $BACKUP_DIR/volumes >> $BACKUP_DIR/cron.log 2>&1

# Cleanup old logs - Monthly on the 1st at 4:00 AM
0 4 1 * * find $BACKUP_DIR -name "*.log" -mtime +90 -delete

EOF

# Install cron jobs
echo -e "${BLUE}Installing cron jobs for user: $CRON_USER${NC}"

# Get existing crontab (ignore errors if empty)
crontab -l > /tmp/existing_cron 2>/dev/null || true

# Remove old CRM backup jobs if they exist
sed -i '/# CRM Immobiliare - Automated Backups/,/^$/d' /tmp/existing_cron 2>/dev/null || true

# Append new jobs
cat /tmp/existing_cron "$CRON_FILE" | crontab -

# Cleanup temp files
rm -f "$CRON_FILE" /tmp/existing_cron

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Cron jobs installed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Backup schedule:${NC}"
echo "  Database backup:  Daily at 2:00 AM"
echo "  Volumes backup:   Weekly (Sunday) at 3:00 AM"
echo "  Log cleanup:      Monthly on the 1st at 4:00 AM"
echo ""
echo -e "${BLUE}Logs location:${NC}"
echo "  $BACKUP_DIR/cron.log"
echo ""
echo -e "${BLUE}To view current cron jobs:${NC}"
echo "  crontab -l"
echo ""
echo -e "${BLUE}To remove CRM backup jobs:${NC}"
echo "  crontab -e  # Then delete the CRM Immobiliare section"
echo ""
echo -e "${YELLOW}Note: Ensure Docker is running for backups to work!${NC}"
