@echo off
echo =========================================
echo  CRM Immobiliare - Docker Setup
echo =========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker non trovato!
    echo.
    echo Installa Docker Desktop da: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] docker-compose non trovato!
        echo.
        pause
        exit /b 1
    )
    set DOCKER_COMPOSE=docker compose
) else (
    set DOCKER_COMPOSE=docker-compose
)

echo [OK] Docker trovato!
echo.

REM Check if .env.docker exists, if not create from example
if not exist ".env.docker" (
    echo [SETUP] Creazione .env.docker...
    copy .env.example .env.docker >nul 2>&1
    echo [OK] .env.docker creato. Modifica il file se necessario.
    echo.
)

echo [INFO] Verifica GOOGLE_API_KEY in .env.docker prima di continuare
echo.
echo Premi un tasto per avviare i container Docker...
pause >nul

echo.
echo [BUILD] Building Docker images...
echo Questo potrebbe richiedere alcuni minuti la prima volta.
echo.

%DOCKER_COMPOSE% build

if errorlevel 1 (
    echo.
    echo [ERROR] Build fallita!
    echo.
    pause
    exit /b 1
)

echo.
echo [START] Avvio container...
echo.

%DOCKER_COMPOSE% up -d

if errorlevel 1 (
    echo.
    echo [ERROR] Avvio fallito!
    echo.
    pause
    exit /b 1
)

echo.
echo =========================================
echo  Sistema Avviato con Successo!
echo =========================================
echo.
echo Backend Python:  http://localhost:8000
echo API Docs:        http://localhost:8000/docs
echo Frontend:        http://localhost:3000
echo.
echo Comandi utili:
echo   docker-compose logs -f        - Visualizza logs
echo   docker-compose ps             - Stato container
echo   docker-compose down           - Ferma tutto
echo   docker-compose restart        - Riavvia
echo.
echo Premi un tasto per visualizzare i logs in tempo reale...
echo (CTRL+C per uscire dai logs)
pause >nul

%DOCKER_COMPOSE% logs -f
