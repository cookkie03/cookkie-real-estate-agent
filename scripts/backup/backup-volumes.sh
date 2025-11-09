#!/bin/bash

# ============================================================================
# Docker Volumes Backup Script
# ============================================================================
# Backs up all CRM Docker volumes to compressed archives
# Usage: ./backup-volumes.sh [backup_directory]
# ============================================================================

set -e

# Configuration
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory
echo -e "${BLUE}Creating backup directory: $BACKUP_PATH${NC}"
mkdir -p "$BACKUP_PATH"

# Volumes to backup
VOLUMES=(
  "crm_postgres_data"
  "crm_app_uploads"
  "crm_app_backups"
  "crm_app_logs"
  "crm_app_cache"
  "crm_ai_cache"
  "crm_ai_logs"
  "crm_scraping_profiles"
  "crm_qdrant_storage"
)

# Backup each volume
for VOLUME in "${VOLUMES[@]}"; do
  echo -e "${BLUE}Backing up volume: $VOLUME${NC}"

  # Check if volume exists
  if ! docker volume inspect "$VOLUME" &> /dev/null; then
    echo -e "${RED}Volume $VOLUME does not exist, skipping...${NC}"
    continue
  fi

  # Create backup archive
  docker run --rm \
    -v "$VOLUME:/data:ro" \
    -v "$BACKUP_PATH:/backup" \
    alpine \
    tar czf "/backup/${VOLUME}.tar.gz" -C /data .

  # Get archive size
  SIZE=$(du -h "$BACKUP_PATH/${VOLUME}.tar.gz" | cut -f1)
  echo -e "${GREEN}✓ Backed up $VOLUME ($SIZE)${NC}"
done

# Create metadata file
cat > "$BACKUP_PATH/metadata.json" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date -Iseconds)",
  "volumes": [
    $(printf '"%s",' "${VOLUMES[@]}" | sed 's/,$//')
  ],
  "backup_path": "$BACKUP_PATH"
}
EOF

echo -e "${GREEN}✓ Backup metadata created${NC}"

# Calculate total size
TOTAL_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Location: $BACKUP_PATH"
echo -e "Total size: $TOTAL_SIZE"
echo -e "Volumes backed up: ${#VOLUMES[@]}"
echo ""
echo -e "${BLUE}To restore, use: ./restore-volumes.sh $BACKUP_PATH${NC}"
