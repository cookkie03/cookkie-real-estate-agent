# ==============================================================================
# START BACKEND - Avvia solo backend AI (FastAPI)
# ==============================================================================

Write-Host "🤖 Avvio Backend AI (FastAPI)..." -ForegroundColor Cyan
Write-Host ""

Set-Location "ai_tools"

# Attiva virtual environment
if (Test-Path ".venv\Scripts\Activate.ps1") {
    .\.venv\Scripts\Activate.ps1
    Write-Host "✅ Virtual environment attivato" -ForegroundColor Green
} else {
    Write-Host "❌ Virtual environment non trovato! Esegui prima .\start-local.ps1" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Backend AI in esecuzione" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 API: http://localhost:8000" -ForegroundColor Green
Write-Host "📚 Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "❤️  Health: http://localhost:8000/health" -ForegroundColor Green
Write-Host ""
Write-Host "Premi Ctrl+C per fermare" -ForegroundColor Yellow
Write-Host ""

# Avvia server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
