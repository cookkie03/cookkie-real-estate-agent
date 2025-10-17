#!/bin/bash

# ==============================================
# CRM Immobiliare - Docker Build Script
# Build all Docker images
# ==============================================

set -e

cd "$(dirname "$0")/.."

echo "=========================================="
echo "CRM Immobiliare - Docker Build"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

# Build all images
print_step "Building Docker images..."
docker-compose -f config/docker-compose.yml build --no-cache

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Build completato!${NC}"
echo "=========================================="
echo ""
echo "Avvia i container con: ./scripts/docker-up.sh"
