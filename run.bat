@echo off
echo =========================================
echo  CRM Immobiliare AI - Quick Start
echo =========================================
echo.
echo Scegli modalita:
echo   [1] Docker (raccomandato)
echo   [2] Local (sviluppo)
echo   [3] Stop Docker
echo   [4] Clean Docker
echo.
choice /C 1234 /M "Seleziona opzione"

if errorlevel 4 goto clean
if errorlevel 3 goto stop
if errorlevel 2 goto local
if errorlevel 1 goto docker

:docker
docker-compose up --build -d
echo.
echo Sistema avviato! Frontend: http://localhost:3000
echo.
pause
exit /b

:local
start "Python Backend" cmd /k "cd python_ai && .venv\Scripts\activate && uvicorn main:app --reload"
timeout /t 3 >nul
start "Next.js Frontend" cmd /k "npm run dev"
echo Sistema avviato in modalita local!
pause
exit /b

:stop
docker-compose down
echo Docker fermato!
pause
exit /b

:clean
docker-compose down -v --rmi all
echo Pulizia completata!
pause
exit /b
