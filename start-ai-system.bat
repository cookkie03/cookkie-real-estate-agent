@echo off
echo =========================================
echo  CRM Immobiliare - Sistema AI
echo  Avvio Backend Python + Frontend Next.js
echo =========================================
echo.

REM Check if python_ai/.env exists
if not exist "python_ai\.env" (
    echo [ERROR] File python_ai\.env non trovato!
    echo.
    echo Crea il file copiando python_ai\.env.example:
    echo   cd python_ai
    echo   copy .env.example .env
    echo.
    echo Poi aggiungi la tua GOOGLE_API_KEY nel file .env
    echo.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "python_ai\.venv" (
    echo [SETUP] Virtual environment non trovato. Creazione...
    cd python_ai
    python -m venv .venv
    call .venv\Scripts\activate
    echo [SETUP] Installazione dipendenze Python...
    pip install -r requirements.txt
    cd ..
    echo.
    echo [OK] Setup completato!
    echo.
)

echo [START] Avvio Backend Python (porta 8000)...
echo.

REM Start Python backend in new window
start "CRM AI - Python Backend" cmd /k "cd python_ai && .venv\Scripts\activate && uvicorn main:app --reload --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

echo [START] Avvio Frontend Next.js (porta 3000)...
echo.

REM Start Next.js frontend in new window
start "CRM AI - Next.js Frontend" cmd /k "npm run dev"

echo.
echo =========================================
echo  Sistema Avviato!
echo =========================================
echo.
echo Backend Python:  http://localhost:8000
echo API Docs:        http://localhost:8000/docs
echo Frontend:        http://localhost:3000
echo.
echo Premi CTRL+C in ogni finestra per fermare i server.
echo.
pause
