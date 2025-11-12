# ==============================================================================
# START FRONTEND - Avvia solo frontend Next.js
# ==============================================================================

Write-Host "🎨 Avvio Frontend (Next.js)..." -ForegroundColor Cyan
Write-Host ""

Set-Location "frontend"

# Verifica node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installazione dipendenze..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Frontend in esecuzione" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 App: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Avvia anche il backend AI in un altro terminale:" -ForegroundColor Yellow
Write-Host "   .\start-backend.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Premi Ctrl+C per fermare" -ForegroundColor Yellow
Write-Host ""

# Avvia Next.js
npm run dev
