#!/bin/bash

# ==============================================
# CRM Immobiliare - Docker Down Script
# Stop and remove all containers
# ==============================================

set -e

cd "$(dirname "$0")/.."

echo "=========================================="
echo "CRM Immobiliare - Docker Stop"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Ask for confirmation to remove volumes
read -p "Rimuovere anche i volumi (database e cache)? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${YELLOW}⚠${NC} Rimozione containers e volumi..."
    docker-compose -f config/docker-compose.yml down -v
    echo -e "${GREEN}✓${NC} Containers e volumi rimossi"
else
    echo "Rimozione solo containers..."
    docker-compose -f config/docker-compose.yml down
    echo -e "${GREEN}✓${NC} Containers rimossi (volumi preservati)"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Docker stopped${NC}"
echo "=========================================="
