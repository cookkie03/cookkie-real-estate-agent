@echo off
REM ==============================================
REM CRM Immobiliare - Script di Installazione
REM Windows Batch Setup Script
REM ==============================================

setlocal enabledelayedexpansion

echo ==========================================
echo CRM Immobiliare - Installazione
echo ==========================================
echo.

REM Verifica prerequisiti
echo [*] Verifica prerequisiti...

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [X] Node.js non trovato. Installa Node.js 18+ da https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [X] npm non trovato. Installa npm
    pause
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [!] Python 3 non trovato. Alcune funzionalita AI potrebbero non funzionare
    set PYTHON_AVAILABLE=0
) else (
    set PYTHON_AVAILABLE=1
)

echo [OK] Prerequisiti verificati
echo.

REM Creazione directory necessarie
echo [*] Creazione directory strutturali...
if not exist "logs\backend" mkdir logs\backend
if not exist "logs\frontend" mkdir logs\frontend
if not exist "logs\ai_tools" mkdir logs\ai_tools
if not exist "logs\scraping" mkdir logs\scraping
if not exist "database\prisma" mkdir database\prisma
if not exist "config" mkdir config
echo [OK] Directory create
echo.

REM Installazione dipendenze Backend
echo [*] Installazione dipendenze Backend...
cd backend
if exist "package.json" (
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [X] Errore installazione Backend
        pause
        exit /b 1
    )
    echo [OK] Dipendenze Backend installate
) else (
    echo [X] backend\package.json non trovato
    pause
    exit /b 1
)
cd ..
echo.

REM Installazione dipendenze Frontend
echo [*] Installazione dipendenze Frontend...
cd frontend
if exist "package.json" (
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [X] Errore installazione Frontend
        pause
        exit /b 1
    )
    echo [OK] Dipendenze Frontend installate
) else (
    echo [X] frontend\package.json non trovato
    pause
    exit /b 1
)
cd ..
echo.

REM Setup Python AI Tools
if %PYTHON_AVAILABLE% equ 1 (
    echo [*] Setup AI Tools (Python^)...
    cd ai_tools
    if exist "requirements.txt" (
        python -m pip install --upgrade pip
        python -m pip install -r requirements.txt
        if %ERRORLEVEL% neq 0 (
            echo [!] Errore installazione AI Tools
        ) else (
            echo [OK] Dipendenze AI Tools installate
        )
    ) else (
        echo [!] ai_tools\requirements.txt non trovato
    )
    cd ..
    echo.

    REM Setup Scraping
    echo [*] Setup Scraping Tools (Python^)...
    cd scraping
    if exist "requirements.txt" (
        python -m pip install -r requirements.txt
        if %ERRORLEVEL% neq 0 (
            echo [!] Errore installazione Scraping
        ) else (
            echo [OK] Dipendenze Scraping installate
        )
    ) else (
        echo [!] scraping\requirements.txt non trovato
    )
    cd ..
    echo.
) else (
    echo [!] Python non disponibile, skip AI Tools e Scraping
    echo.
)

REM Setup Database
echo [*] Setup Database (Prisma^)...
cd backend
if exist "..\database\prisma\schema.prisma" (
    REM Genera Prisma Client
    call npx prisma generate --schema=..\database\prisma\schema.prisma

    REM Push schema al database
    call npx prisma db push --schema=..\database\prisma\schema.prisma --skip-generate

    echo [OK] Database inizializzato

    REM Seed database (opzionale)
    set /p SEED="Vuoi popolare il database con dati di esempio? (s/n): "
    if /i "!SEED!"=="s" (
        call npx prisma db seed
        echo [OK] Database popolato con dati di esempio
    )
) else (
    echo [X] database\prisma\schema.prisma non trovato
    pause
    exit /b 1
)
cd ..
echo.

REM Verifica file .env
echo [*] Verifica configurazione ambiente...

if not exist "config\.env.backend" (
    echo [!] config\.env.backend non trovato
    if exist "config\backend.env.example" (
        copy config\backend.env.example config\.env.backend >nul
        echo [OK] Creato config\.env.backend da template
    )
)

if not exist "config\.env.frontend" (
    echo [!] config\.env.frontend non trovato
    if exist "config\frontend.env.example" (
        copy config\frontend.env.example config\.env.frontend >nul
        echo [OK] Creato config\.env.frontend da template
    )
)

if not exist "config\.env.ai" (
    echo [!] config\.env.ai non trovato
    if exist "config\ai_tools.env.example" (
        copy config\ai_tools.env.example config\.env.ai >nul
        echo [OK] Creato config\.env.ai da template
    )
)

echo.
echo [OK] Installazione completata!
echo.
echo ==========================================
echo Prossimi passi:
echo ==========================================
echo 1. Configura i file .env in \config
echo 2. Avvia l'applicazione: scripts\start-all.bat
echo 3. Accedi a:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:3001
echo    - AI Tools: http://localhost:8000
echo.
echo Per documentazione completa: type docs\GETTING_STARTED.md
echo ==========================================
echo.
pause
