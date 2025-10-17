#!/bin/bash

# ==============================================
# CRM Immobiliare - Docker Up Script
# Start all containers
# ==============================================

set -e

cd "$(dirname "$0")/.."

echo "=========================================="
echo "CRM Immobiliare - Docker Start"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

# Check if .env files exist
if [ ! -f "config/.env.backend" ] || [ ! -f "config/.env.frontend" ] || [ ! -f "config/.env.ai" ]; then
    echo "⚠ Warning: .env files not found in config/"
    echo "Creating from templates..."
    [ ! -f "config/.env.backend" ] && cp config/backend.env.example config/.env.backend 2>/dev/null || true
    [ ! -f "config/.env.frontend" ] && cp config/frontend.env.example config/.env.frontend 2>/dev/null || true
    [ ! -f "config/.env.ai" ] && cp config/ai_tools.env.example config/.env.ai 2>/dev/null || true
fi

# Start containers
print_step "Starting containers..."
docker-compose -f config/docker-compose.yml up -d

echo ""
print_step "Waiting for services to be ready..."
sleep 5

# Check status
docker-compose -f config/docker-compose.yml ps

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Containers avviati!${NC}"
echo "=========================================="
echo ""
echo "Servizi disponibili:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:3001"
echo "  - AI Tools:  http://localhost:8000"
echo ""
echo "Comandi utili:"
echo "  - Logs:   ./scripts/docker-logs.sh"
echo "  - Stop:   ./scripts/docker-down.sh"
echo "  - Status: docker-compose -f config/docker-compose.yml ps"
echo "=========================================="
