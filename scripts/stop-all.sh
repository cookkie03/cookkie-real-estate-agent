#!/bin/bash

# ==============================================
# CRM Immobiliare - Stop All Services
# Linux/macOS Stop Script
# ==============================================

echo "=========================================="
echo "CRM Immobiliare - Stop Servizi"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Carica i PID salvati
if [ -f ".pids" ]; then
    source .pids

    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${GREEN}▶${NC} Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || echo "Backend already stopped"
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${GREEN}▶${NC} Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || echo "Frontend already stopped"
    fi

    if [ ! -z "$AI_PID" ]; then
        echo -e "${GREEN}▶${NC} Stopping AI Tools (PID: $AI_PID)..."
        kill $AI_PID 2>/dev/null || echo "AI Tools already stopped"
    fi

    rm .pids
else
    echo -e "${YELLOW}⚠${NC} .pids file not found, trying to kill by port..."

    # Fallback: kill by port
    lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 already free"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "Port 3001 already free"
    lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "Port 8000 already free"
fi

echo ""
echo "=========================================="
echo "✓ Tutti i servizi sono stati fermati"
echo "=========================================="
