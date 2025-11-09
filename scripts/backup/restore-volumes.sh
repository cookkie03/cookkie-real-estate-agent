#!/bin/bash

# ============================================================================
# Docker Volumes Restore Script
# ============================================================================
# Restores CRM Docker volumes from backup archives
# Usage: ./restore-volumes.sh <backup_directory>
# ============================================================================

set -e

# Configuration
BACKUP_PATH="$1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validate arguments
if [ -z "$BACKUP_PATH" ]; then
  echo -e "${RED}Error: Backup directory not specified${NC}"
  echo "Usage: $0 <backup_directory>"
  exit 1
fi

if [ ! -d "$BACKUP_PATH" ]; then
  echo -e "${RED}Error: Backup directory does not exist: $BACKUP_PATH${NC}"
  exit 1
fi

# Check metadata
if [ ! -f "$BACKUP_PATH/metadata.json" ]; then
  echo -e "${YELLOW}Warning: metadata.json not found${NC}"
fi

# Warning
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}WARNING: Volume Restore${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "This will ${RED}REPLACE${NC} existing data in Docker volumes!"
echo -e "Backup path: $BACKUP_PATH"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo -e "${BLUE}Restore cancelled${NC}"
  exit 0
fi

# Find all backup archives
echo -e "${BLUE}Finding backup archives...${NC}"
ARCHIVES=($(find "$BACKUP_PATH" -name "*.tar.gz" -type f))

if [ ${#ARCHIVES[@]} -eq 0 ]; then
  echo -e "${RED}No backup archives found in $BACKUP_PATH${NC}"
  exit 1
fi

# Restore each archive
for ARCHIVE in "${ARCHIVES[@]}"; do
  FILENAME=$(basename "$ARCHIVE")
  VOLUME="${FILENAME%.tar.gz}"

  echo -e "${BLUE}Restoring volume: $VOLUME${NC}"

  # Create volume if it doesn't exist
  if ! docker volume inspect "$VOLUME" &> /dev/null; then
    echo -e "${YELLOW}Creating volume: $VOLUME${NC}"
    docker volume create "$VOLUME"
  fi

  # Restore data
  docker run --rm \
    -v "$VOLUME:/data" \
    -v "$BACKUP_PATH:/backup:ro" \
    alpine \
    sh -c "rm -rf /data/* /data/..?* /data/.[!.]* 2>/dev/null; cd /data && tar xzf /backup/$FILENAME"

  echo -e "${GREEN}✓ Restored $VOLUME${NC}"
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Restore completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Volumes restored: ${#ARCHIVES[@]}"
echo ""
echo -e "${YELLOW}Note: You may need to restart containers:${NC}"
echo -e "  docker-compose restart"
