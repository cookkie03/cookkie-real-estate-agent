#!/bin/bash

# Development setup script
# Run: ./scripts/dev.sh

set -e

echo "🚀 RealEstate AI CRM - Development Setup"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}📝 Creating .env.local file${NC}"
    cat > .env.local << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_immobiliare"
NEXT_PUBLIC_APP_NAME="RealEstate AI CRM"
EOF
    echo -e "${GREEN}✅ .env.local created${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Generate Prisma Client
echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
npm run prisma:generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"

echo -e "${GREEN}✅ Development setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Start PostgreSQL (via Docker or local)"
echo "  2. Run: npm run prisma:push"
echo "  3. Run: npm run prisma:seed"
echo "  4. Run: npm run dev"
echo ""
echo "💡 Pro tip: Use 'npm run dev' to start the dev server"
