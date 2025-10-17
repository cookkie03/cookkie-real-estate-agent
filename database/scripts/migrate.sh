#!/bin/bash

# ==============================================
# Database Migration Script
# Apply Prisma migrations
# ==============================================

set -e

cd "$(dirname "$0")/.."

echo "=========================================="
echo "CRM Immobiliare - Database Migration"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Prisma CLI is installed
if ! command -v npx &> /dev/null; then
    echo "Error: npm/npx not found. Install Node.js first."
    exit 1
fi

# Check if schema file exists
if [ ! -f "prisma/schema.prisma" ]; then
    echo "Error: prisma/schema.prisma not found"
    exit 1
fi

# Generate Prisma Client
print_step "Generating Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma

# Push schema to database (for SQLite - no migrations)
print_step "Pushing schema to database..."
npx prisma db push --schema=prisma/schema.prisma --skip-generate

# Optional: Seed database
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Seeding database..."
    npx prisma db seed --schema=prisma/schema.prisma
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Migration completed!${NC}"
echo "=========================================="
echo ""
echo "Database location: prisma/dev.db"
echo "View data: npx prisma studio --schema=prisma/schema.prisma"
