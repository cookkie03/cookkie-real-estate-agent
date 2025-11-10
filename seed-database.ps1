# ==============================================================================
# SEED DATABASE - Popola il database con dati demo
# ==============================================================================

Write-Host "🌱 Popolamento database con dati demo..." -ForegroundColor Cyan
Write-Host ""

# Vai nella cartella prisma
Set-Location "database\prisma"

# Verifica node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installazione dipendenze Prisma..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Genera Prisma Client
Write-Host "🔄 Generazione Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Write-Host ""

# Push schema a database (crea tabelle)
Write-Host "📊 Creazione tabelle database..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss
Write-Host ""

# Esegui seed
Write-Host "🌱 Popolamento con dati demo..." -ForegroundColor Yellow
npx tsx seed.ts

# Torna alla root
Set-Location "..\..\"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Database popolato con successo!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Dati demo inseriti:" -ForegroundColor Cyan
Write-Host "  • UserProfile con settings predefiniti" -ForegroundColor White
Write-Host "  • 10 immobili demo (case, appartamenti, negozi)" -ForegroundColor White
Write-Host "  • 15 contatti (acquirenti, venditori, inquilini)" -ForegroundColor White
Write-Host "  • 8 richieste di ricerca immobile" -ForegroundColor White
Write-Host "  • Match automatici tra richieste e immobili" -ForegroundColor White
Write-Host ""
Write-Host "🗺️  Gli immobili sono ora visibili sulla mappa!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Avvia l'app per vedere i dati:" -ForegroundColor Yellow
Write-Host "  Terminal 1: .\start-backend.ps1" -ForegroundColor White
Write-Host "  Terminal 2: .\start-frontend.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Poi apri: http://localhost:3000" -ForegroundColor Green
Write-Host ""
