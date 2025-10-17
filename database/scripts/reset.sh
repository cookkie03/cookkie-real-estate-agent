#!/bin/bash

# ==============================================
# Database Reset Script
# WARNING: This will delete all data!
# ==============================================

set -e

cd "$(dirname "$0")/.."

echo "=========================================="
echo "CRM Immobiliare - Database Reset"
echo "=========================================="
echo ""

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}WARNING: This will DELETE ALL DATA in the database!${NC}"
echo ""
read -p "Are you absolutely sure? Type 'yes' to confirm: " -r
echo ""

if [[ ! $REPLY == "yes" ]]; then
    echo "Operation cancelled"
    exit 0
fi

# Backup old database
if [ -f "prisma/dev.db" ]; then
    BACKUP_NAME="prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}▶${NC} Creating backup: $BACKUP_NAME"
    cp prisma/dev.db "$BACKUP_NAME"
fi

# Remove database
echo -e "${GREEN}▶${NC} Removing database..."
rm -f prisma/dev.db prisma/dev.db-journal

# Push schema (recreate)
echo -e "${GREEN}▶${NC} Recreating database..."
npx prisma db push --schema=prisma/schema.prisma --skip-generate --force-reset

# Seed
read -p "Seed database with sample data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}▶${NC} Seeding database..."
    npx prisma db seed --schema=prisma/schema.prisma
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Database reset completed!${NC}"
echo "=========================================="
