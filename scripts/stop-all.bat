@echo off
REM ==============================================
REM CRM Immobiliare - Stop All Services
REM Windows Batch Stop Script
REM ==============================================

echo ==========================================
echo CRM Immobiliare - Stop Servizi
echo ==========================================
echo.

echo [*] Fermando processi Node.js sulle porte 3000 e 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul

echo [*] Fermando processi Python sulla porta 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul

echo.
echo ==========================================
echo [OK] Tutti i servizi sono stati fermati
echo ==========================================
echo.
pause
