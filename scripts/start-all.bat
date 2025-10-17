@echo off
REM ==============================================
REM CRM Immobiliare - Avvio Completo
REM Windows Batch Start Script
REM ==============================================

echo ==========================================
echo CRM Immobiliare - Avvio Applicazione
echo ==========================================
echo.

REM Verifica che l'installazione sia stata eseguita
if not exist "backend\node_modules" (
    echo [X] Errore: Dipendenze Backend non installate
    echo Esegui prima: scripts\install.bat
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo [X] Errore: Dipendenze Frontend non installate
    echo Esegui prima: scripts\install.bat
    pause
    exit /b 1
)

REM Creazione directory logs
if not exist "logs\backend" mkdir logs\backend
if not exist "logs\frontend" mkdir logs\frontend
if not exist "logs\ai_tools" mkdir logs\ai_tools

echo [*] Avvio Backend (porta 3001^)...
start "CRM Backend" cmd /c "cd backend && npm run dev > ..\logs\backend\app.log 2>&1"
timeout /t 3 /nobreak >nul

echo [*] Avvio Frontend (porta 3000^)...
start "CRM Frontend" cmd /c "cd frontend && npm run dev > ..\logs\frontend\app.log 2>&1"
timeout /t 3 /nobreak >nul

REM Verifica se Python è disponibile
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [*] Avvio AI Tools (porta 8000^)...
    if exist "ai_tools\main.py" (
        start "CRM AI Tools" cmd /c "cd ai_tools && python main.py > ..\logs\ai_tools\app.log 2>&1"
    ) else (
        echo [!] ai_tools\main.py non trovato, skip
    )
) else (
    echo [!] Python non disponibile, skip AI Tools
)

echo.
echo ==========================================
echo Applicazione avviata!
echo ==========================================
echo.
echo Servizi attivi:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:3001
echo   - AI Tools:  http://localhost:8000
echo.
echo Finestre console separate aperte per ogni servizio
echo.
echo Log files:
echo   - Backend:   logs\backend\app.log
echo   - Frontend:  logs\frontend\app.log
echo   - AI Tools:  logs\ai_tools\app.log
echo.
echo Per fermare: Chiudi le finestre console o esegui scripts\stop-all.bat
echo ==========================================
echo.
pause
