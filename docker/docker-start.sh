#!/bin/bash

# ==============================================================================
# CRM Immobiliare - Docker Start Script (Linux/Mac)
# ==============================================================================

set -e

echo "========================================="
echo " CRM Immobiliare - Docker Setup"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker non trovato!"
    echo ""
    echo "Installa Docker da: https://docs.docker.com/get-docker/"
    echo ""
    exit 1
fi

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "[ERROR] docker-compose non trovato!"
    echo ""
    exit 1
fi

echo "[OK] Docker trovato!"
echo ""

# Check if .env.docker exists
if [ ! -f ".env.docker" ]; then
    echo "[SETUP] Creazione .env.docker..."
    cp .env.example .env.docker 2>/dev/null || true
    echo "[OK] .env.docker creato. Modifica il file se necessario."
    echo ""
fi

echo "[INFO] Verifica GOOGLE_API_KEY in .env.docker prima di continuare"
echo ""
read -p "Premi ENTER per avviare i container Docker..."

echo ""
echo "[BUILD] Building Docker images..."
echo "Questo potrebbe richiedere alcuni minuti la prima volta."
echo ""

$DOCKER_COMPOSE build

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Build fallita!"
    echo ""
    exit 1
fi

echo ""
echo "[START] Avvio container..."
echo ""

$DOCKER_COMPOSE up -d

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Avvio fallito!"
    echo ""
    exit 1
fi

echo ""
echo "========================================="
echo " Sistema Avviato con Successo!"
echo "========================================="
echo ""
echo "Backend Python:  http://localhost:8000"
echo "API Docs:        http://localhost:8000/docs"
echo "Frontend:        http://localhost:3000"
echo ""
echo "Comandi utili:"
echo "  $DOCKER_COMPOSE logs -f        - Visualizza logs"
echo "  $DOCKER_COMPOSE ps             - Stato container"
echo "  $DOCKER_COMPOSE down           - Ferma tutto"
echo "  $DOCKER_COMPOSE restart        - Riavvia"
echo ""
read -p "Premi ENTER per visualizzare i logs in tempo reale (CTRL+C per uscire)..."

$DOCKER_COMPOSE logs -f
