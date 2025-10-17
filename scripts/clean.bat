@echo off
REM ==============================================
REM CRM Immobiliare - Cleanup Script
REM Rimuove node_modules, build artifacts, cache
REM ==============================================

echo ==========================================
echo CRM Immobiliare - Cleanup
echo ==========================================
echo.

echo [!] ATTENZIONE: Questo script rimuovera:
echo   - node_modules (Backend ^& Frontend^)
echo   - Build artifacts (.next, dist, build^)
echo   - Python cache (__pycache__, .pytest_cache^)
echo   - Log files
echo   - Database (dev.db^) [OPZIONALE]
echo.

set /p CONTINUE="Continuare? (s/n): "
if /i not "%CONTINUE%"=="s" (
    echo Operazione annullata
    exit /b 0
)

echo.
echo [*] Rimozione node_modules...
if exist "backend\node_modules" rmdir /s /q backend\node_modules
if exist "frontend\node_modules" rmdir /s /q frontend\node_modules
echo [OK] node_modules rimossi

echo [*] Rimozione build artifacts...
if exist "frontend\.next" rmdir /s /q frontend\.next
if exist "backend\.next" rmdir /s /q backend\.next
if exist "backend\dist" rmdir /s /q backend\dist
echo [OK] Build artifacts rimossi

echo [*] Rimozione cache Python...
for /d /r . %%d in (__pycache__) do @if exist "%%d" rmdir /s /q "%%d"
for /d /r . %%d in (.pytest_cache) do @if exist "%%d" rmdir /s /q "%%d"
if exist "ai_tools\.venv" rmdir /s /q ai_tools\.venv
if exist "scraping\.venv" rmdir /s /q scraping\.venv
echo [OK] Cache Python rimossa

echo [*] Rimozione log files...
if exist "logs" rmdir /s /q logs
mkdir logs\backend logs\frontend logs\ai_tools logs\scraping
echo [OK] Log files rimossi

REM Database removal (opzionale)
echo.
set /p REMOVE_DB="Rimuovere anche il database (dev.db)? (s/n): "
if /i "%REMOVE_DB%"=="s" (
    if exist "database\prisma\dev.db" del /q database\prisma\dev.db
    if exist "database\prisma\dev.db-journal" del /q database\prisma\dev.db-journal
    echo [OK] Database rimosso
) else (
    echo Database preservato
)

echo.
echo ==========================================
echo [OK] Cleanup completato!
echo ==========================================
echo.
echo Per reinstallare: scripts\install.bat
echo.
pause
