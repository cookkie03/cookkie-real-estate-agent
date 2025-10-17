#!/bin/bash

# ==============================================
# CRM Immobiliare - Cleanup Script
# Rimuove node_modules, build artifacts, cache
# ==============================================

echo "=========================================="
echo "CRM Immobiliare - Cleanup"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}⚠ ATTENZIONE: Questo script rimuoverà:${NC}"
echo "  - node_modules (Backend & Frontend)"
echo "  - Build artifacts (.next, dist, build)"
echo "  - Python cache (__pycache__, .pytest_cache)"
echo "  - Log files"
echo "  - Database (dev.db) [OPZIONALE]"
echo ""

read -p "Continuare? (s/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "Operazione annullata"
    exit 1
fi

echo ""
echo -e "${GREEN}▶${NC} Rimozione node_modules..."
rm -rf backend/node_modules frontend/node_modules
echo "✓ node_modules rimossi"

echo -e "${GREEN}▶${NC} Rimozione build artifacts..."
rm -rf frontend/.next backend/.next backend/dist
echo "✓ Build artifacts rimossi"

echo -e "${GREEN}▶${NC} Rimozione cache Python..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null
rm -rf ai_tools/.venv scraping/.venv
echo "✓ Cache Python rimossa"

echo -e "${GREEN}▶${NC} Rimozione log files..."
rm -rf logs/*
mkdir -p logs/backend logs/frontend logs/ai_tools logs/scraping
echo "✓ Log files rimossi"

# Database removal (opzionale)
echo ""
read -p "Rimuovere anche il database (dev.db)? (s/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    rm -f database/prisma/dev.db database/prisma/dev.db-journal
    echo "✓ Database rimosso"
else
    echo "Database preservato"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Cleanup completato!${NC}"
echo "=========================================="
echo ""
echo "Per reinstallare: ./scripts/install.sh"
