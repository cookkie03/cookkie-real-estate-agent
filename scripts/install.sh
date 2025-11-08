#!/bin/bash

# ==============================================
# CRM Immobiliare - Script di Installazione
# Linux/macOS Setup Script
# v3.0.0 - Unified Architecture
# ==============================================

set -e

echo "=========================================="
echo "CRM Immobiliare - Installazione"
echo "=========================================="
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi
print_step() {
    echo -e "${GREEN}▶${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Verifica prerequisiti
print_step "Verifica prerequisiti..."

if ! command -v node &> /dev/null; then
    print_error "Node.js non trovato. Installa Node.js 18+ da https://nodejs.org"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm non trovato. Installa npm"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    print_error "Python 3 non trovato. Installa Python 3.9+ da https://python.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versione 18+ richiesta (trovata: $(node -v))"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(sys.version_info.major, sys.version_info.minor)')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d' ' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d' ' -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || [ "$PYTHON_MINOR" -lt 9 ]; then
    print_error "Python 3.9+ richiesta (trovata: $(python3 --version))"
    exit 1
fi

print_success "Prerequisiti OK: Node $(node -v), npm $(npm -v), Python $(python3 --version)"
echo ""

# Creazione directory necessarie
print_step "Creazione directory strutturali..."
mkdir -p logs/frontend logs/ai_tools logs/scraping
mkdir -p database/prisma
print_success "Directory create"
echo ""

# Installazione dipendenze Frontend (Unified - UI + API)
print_step "Installazione dipendenze Frontend (UI + API unificati)..."
cd frontend
if [ -f "package.json" ]; then
    npm install
    print_success "Dipendenze Frontend installate"
else
    print_error "frontend/package.json non trovato"
    exit 1
fi
cd ..
echo ""

# Setup Python AI Tools
print_step "Setup AI Tools (Python)..."
cd ai_tools
if [ -f "requirements.txt" ]; then
    if command -v python3 &> /dev/null; then
        python3 -m pip install --upgrade pip
        python3 -m pip install -r requirements.txt
        print_success "Dipendenze AI Tools installate"
    else
        print_warning "Python 3 non trovato, skip AI Tools"
    fi
else
    print_warning "ai_tools/requirements.txt non trovato"
fi
cd ..
echo ""

# Setup Scraping (Python)
print_step "Setup Scraping Tools (Python)..."
cd scraping
if [ -f "requirements.txt" ]; then
    if command -v python3 &> /dev/null; then
        python3 -m pip install -r requirements.txt
        print_success "Dipendenze Scraping installate"
    else
        print_warning "Python 3 non trovato, skip Scraping"
    fi
else
    print_warning "scraping/requirements.txt non trovato"
fi
cd ..
echo ""

# Setup Database
print_step "Setup Database (Prisma)..."
cd frontend
if [ -f "../database/prisma/schema.prisma" ]; then
    # Genera Prisma Client
    npx prisma generate --schema=../database/prisma/schema.prisma

    # Push schema al database
    npx prisma db push --schema=../database/prisma/schema.prisma --skip-generate

    print_success "Database inizializzato"

    # Seed database (opzionale)
    read -p "Vuoi popolare il database con dati di esempio? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        npx prisma db seed --schema=../database/prisma/schema.prisma
        print_success "Database popolato con dati di esempio"
    fi
else
    print_error "database/prisma/schema.prisma non trovato"
    exit 1
fi
cd ..
echo ""

# Verifica file .env
print_step "Verifica configurazione ambiente..."

if [ ! -f "frontend/.env.local" ]; then
    print_warning "frontend/.env.local non trovato"
    if [ -f "config/frontend.env.example" ]; then
        print_step "Copia template..."
        cp config/frontend.env.example frontend/.env.local
        print_success "Creato frontend/.env.local da template"
        print_warning "⚠ IMPORTANTE: Modifica frontend/.env.local e aggiungi GOOGLE_API_KEY"
    fi
fi

if [ ! -f "ai_tools/.env" ]; then
    print_warning "ai_tools/.env non trovato"
    if [ -f "config/ai_tools.env.example" ]; then
        print_step "Copia template..."
        cp config/ai_tools.env.example ai_tools/.env
        print_success "Creato ai_tools/.env da template"
        print_warning "⚠ IMPORTANTE: Modifica ai_tools/.env e aggiungi GOOGLE_API_KEY"
    fi
fi

echo ""
print_success "✓ Installazione completata!"
echo ""
echo "=========================================="
echo "Prossimi passi:"
echo "=========================================="
echo "1. Configura le API keys:"
echo "   - frontend/.env.local → NEXT_PUBLIC_GOOGLE_API_KEY"
echo "   - ai_tools/.env → GOOGLE_API_KEY"
echo ""
echo "2. Ottieni la chiave Google AI Studio:"
echo "   https://aistudio.google.com/app/apikey"
echo ""
echo "3. Avvia l'applicazione:"
echo "   ./scripts/start-all.sh"
echo ""
echo "4. Accedi a:"
echo "   - Frontend & API: http://localhost:3000 (architettura unificata)"
echo "   - AI Tools API: http://localhost:8000/docs"
echo ""
echo "Per documentazione completa: cat docs/GETTING_STARTED.md"
echo "=========================================="
echo ""
