#!/bin/bash

# ============================================================================
# PostgreSQL Database Backup Script
# ============================================================================
# Backs up PostgreSQL database from Docker container
# Usage: ./backup-database.sh [backup_directory]
# ============================================================================

set -e

# Configuration
BACKUP_DIR="${1:-./backups/database}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="crm-database"
DB_NAME="crm_immobiliare"
DB_USER="crm_user"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory
echo -e "${BLUE}Creating backup directory: $BACKUP_DIR${NC}"
mkdir -p "$BACKUP_DIR"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo -e "${RED}Error: PostgreSQL container '$CONTAINER_NAME' is not running${NC}"
  echo "Start it with: docker-compose up -d"
  exit 1
fi

# Backup filename
BACKUP_FILE="$BACKUP_DIR/crm_db_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo -e "${BLUE}Backing up database: $DB_NAME${NC}"

# Create SQL dump
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" \
  --clean \
  --if-exists \
  --create \
  --verbose \
  > "$BACKUP_FILE" 2>&1

# Compress backup
echo -e "${BLUE}Compressing backup...${NC}"
gzip "$BACKUP_FILE"

# Get size
SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)

# Create metadata
cat > "$BACKUP_DIR/backup_${TIMESTAMP}_metadata.json" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date -Iseconds)",
  "database": "$DB_NAME",
  "user": "$DB_USER",
  "container": "$CONTAINER_NAME",
  "backup_file": "$(basename $BACKUP_FILE_GZ)",
  "size": "$SIZE"
}
EOF

# Cleanup old backups (keep last 30 days)
echo -e "${BLUE}Cleaning up old backups (keeping last 30 days)...${NC}"
find "$BACKUP_DIR" -name "crm_db_*.sql.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "backup_*_metadata.json" -mtime +30 -delete

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database backup completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "File: $BACKUP_FILE_GZ"
echo -e "Size: $SIZE"
echo ""
echo -e "${BLUE}To restore:${NC}"
echo -e "  gunzip < $BACKUP_FILE_GZ | docker exec -i $CONTAINER_NAME psql -U $DB_USER"
