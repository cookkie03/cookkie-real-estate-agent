# ==============================================
# CRM Immobiliare - Avvio Completo
# Windows PowerShell Start Script
# ==============================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CRM Immobiliare - Avvio Applicazione" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica installazione
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "✗ Errore: Dipendenze Backend non installate" -ForegroundColor Red
    Write-Host "Esegui prima: .\scripts\install.ps1" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "✗ Errore: Dipendenze Frontend non installate" -ForegroundColor Red
    Write-Host "Esegui prima: .\scripts\install.ps1" -ForegroundColor Yellow
    exit 1
}

# Creazione directory logs
$logDirs = @("logs/backend", "logs/frontend", "logs/ai_tools")
foreach ($dir in $logDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Host "▶ Avvio Backend (porta 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev *> ..\logs\backend\app.log" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "▶ Avvio Frontend (porta 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev *> ..\logs\frontend\app.log" -WindowStyle Normal
Start-Sleep -Seconds 3

# Verifica Python
$pythonAvailable = $false
try {
    python --version | Out-Null
    $pythonAvailable = $true
} catch {
    Write-Host "⚠ Python non disponibile, skip AI Tools" -ForegroundColor Yellow
}

if ($pythonAvailable -and (Test-Path "ai_tools/main.py")) {
    Write-Host "▶ Avvio AI Tools (porta 8000)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai_tools; python main.py *> ..\logs\ai_tools\app.log" -WindowStyle Normal
} else {
    if (-not (Test-Path "ai_tools/main.py")) {
        Write-Host "⚠ ai_tools/main.py non trovato, skip" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Applicazione avviata!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servizi attivi:"
Write-Host "  - Frontend:  http://localhost:3000"
Write-Host "  - Backend:   http://localhost:3001"
if ($pythonAvailable -and (Test-Path "ai_tools/main.py")) {
    Write-Host "  - AI Tools:  http://localhost:8000"
}
Write-Host ""
Write-Host "Finestre PowerShell separate aperte per ogni servizio"
Write-Host ""
Write-Host "Log files:"
Write-Host "  - Backend:   logs\backend\app.log"
Write-Host "  - Frontend:  logs\frontend\app.log"
Write-Host "  - AI Tools:  logs\ai_tools\app.log"
Write-Host ""
Write-Host "Per fermare: Chiudi le finestre PowerShell o esegui .\scripts\stop-all.ps1"
Write-Host "==========================================" -ForegroundColor Cyan
