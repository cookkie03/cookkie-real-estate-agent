#!/bin/bash

# ==============================================
# CRM Immobiliare - Docker Logs Script
# View logs from all containers
# ==============================================

cd "$(dirname "$0")/.."

echo "=========================================="
echo "CRM Immobiliare - Docker Logs"
echo "=========================================="
echo ""
echo "Mostrando log di tutti i container..."
echo "(Ctrl+C per uscire)"
echo ""

# Follow logs from all containers
docker-compose -f config/docker-compose.yml logs -f --tail=50
