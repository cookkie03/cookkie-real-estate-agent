#!/bin/bash

# ==============================================
# CRM Immobiliare - Avvio Completo
# Linux/macOS Start Script
# ==============================================

set -e

echo "=========================================="
echo "CRM Immobiliare - Avvio Applicazione"
echo "=========================================="
echo ""

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verifica che l'installazione sia stata eseguita
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "Errore: Dipendenze non installate. Esegui prima: ./scripts/install.sh"
    exit 1
fi

# Creazione directory logs se non esistono
mkdir -p logs/backend logs/frontend logs/ai_tools logs/scraping

print_step "Avvio Backend (porta 3001)..."
cd backend
npm run dev > ../logs/backend/app.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

sleep 2

print_step "Avvio Frontend (porta 3000)..."
cd frontend
npm run dev > ../logs/frontend/app.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

sleep 2

# Verifica se Python è disponibile
if command -v python3 &> /dev/null; then
    print_step "Avvio AI Tools (porta 8000)..."
    cd ai_tools
    if [ -f "main.py" ]; then
        python3 main.py > ../logs/ai_tools/app.log 2>&1 &
        AI_PID=$!
        echo "AI Tools PID: $AI_PID"
    else
        print_warning "ai_tools/main.py non trovato, skip"
    fi
    cd ..
else
    print_warning "Python 3 non disponibile, skip AI Tools"
fi

echo ""
echo "=========================================="
echo "Applicazione avviata!"
echo "=========================================="
echo ""
echo "Servizi attivi:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:3001"
if [ ! -z "$AI_PID" ]; then
    echo "  - AI Tools:  http://localhost:8000"
fi
echo ""
echo "Log files:"
echo "  - Backend:   logs/backend/app.log"
echo "  - Frontend:  logs/frontend/app.log"
if [ ! -z "$AI_PID" ]; then
    echo "  - AI Tools:  logs/ai_tools/app.log"
fi
echo ""
echo "Per fermare l'applicazione: ./scripts/stop-all.sh"
echo "=========================================="
echo ""

# Salva i PID per stop-all.sh
echo "BACKEND_PID=$BACKEND_PID" > .pids
echo "FRONTEND_PID=$FRONTEND_PID" >> .pids
if [ ! -z "$AI_PID" ]; then
    echo "AI_PID=$AI_PID" >> .pids
fi

# Mantieni lo script in esecuzione e mostra i log
print_step "Monitoraggio log (Ctrl+C per uscire)..."
echo ""
tail -f logs/backend/app.log logs/frontend/app.log $([ -f logs/ai_tools/app.log ] && echo "logs/ai_tools/app.log") 2>/dev/null
