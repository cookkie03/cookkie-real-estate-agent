#!/bin/bash

# Docker startup script
# Run: ./scripts/docker-up.sh

set -e

echo "🐳 RealEstate AI CRM - Docker Startup"
echo "====================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed${NC}"
    echo "Please install Docker and Docker Compose"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo "Please start Docker"
    exit 1
fi

echo -e "${BLUE}🚀 Starting Docker services...${NC}"
docker-compose up --build

echo ""
echo -e "${GREEN}✅ Docker services started!${NC}"
echo ""
echo -e "${BLUE}📋 Services running:${NC}"
echo "  🌐 App:      http://localhost:3000"
echo "  🗄️  Adminer:  http://localhost:8080"
echo "  💾 Database: localhost:5432"
echo ""
echo -e "${YELLOW}⏱️  First startup takes 30-60 seconds (database setup + seeding)${NC}"
echo ""
echo -e "${BLUE}💡 Useful commands:${NC}"
echo "  docker-compose logs -f          # View logs"
echo "  docker-compose logs -f app      # View app logs only"
echo "  docker-compose exec postgres psql -U postgres -d crm_immobiliare  # Access DB"
echo "  docker-compose down             # Stop services"
echo "  docker-compose down -v          # Stop and remove volumes"
