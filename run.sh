#!/bin/bash
set -e

echo "========================================="
echo " CRM Immobiliare AI - Quick Start"
echo "========================================="
echo ""
echo "Scegli modalita:"
echo "  [1] Docker (raccomandato)"
echo "  [2] Local (sviluppo)"
echo "  [3] Stop Docker"
echo "  [4] Clean Docker"
echo ""
read -p "Seleziona opzione [1-4]: " choice

case $choice in
    1)
        docker-compose up --build -d
        echo ""
        echo "Sistema avviato! Frontend: http://localhost:3000"
        ;;
    2)
        (cd python_ai && source .venv/bin/activate && uvicorn main:app --reload) &
        sleep 3
        npm run dev
        ;;
    3)
        docker-compose down
        echo "Docker fermato!"
        ;;
    4)
        docker-compose down -v --rmi all
        echo "Pulizia completata!"
        ;;
    *)
        echo "Opzione non valida"
        exit 1
        ;;
esac
