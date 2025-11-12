# ==============================================================================
# START LOCAL - Avvia CRM Immobiliare in locale (senza Docker)
# ==============================================================================
# Esegui con: .\start-local.ps1
# ==============================================================================

Write-Host "🚀 Avvio CRM Immobiliare in modalità locale..." -ForegroundColor Cyan
Write-Host ""

# Verifica Python
Write-Host "📦 Verifica Python..." -ForegroundColor Yellow
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    if (-not (Get-Command python3 -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Python non trovato! Installalo da python.org" -ForegroundColor Red
        exit 1
    } else {
        $pythonCmd = "python3"
    }
} else {
    $pythonCmd = "python"
}

$pythonVersion = & $pythonCmd --version
Write-Host "✅ Python installato: $pythonVersion" -ForegroundColor Green

# Verifica Node.js
Write-Host "📦 Verifica Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js non trovato! Installalo da nodejs.org" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✅ Node.js installato: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Copia .env.local se non esiste .env
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creazione file .env da .env.local..." -ForegroundColor Yellow
    Copy-Item ".env.local" ".env"
    Write-Host "✅ File .env creato" -ForegroundColor Green
} else {
    Write-Host "✅ File .env già esistente" -ForegroundColor Green
}

# Setup database se non esiste
if (-not (Test-Path "database/prisma/dev.db")) {
    Write-Host ""
    Write-Host "🗄️  Setup database SQLite..." -ForegroundColor Cyan

    # Imposta DATABASE_URL per Prisma
    $env:DATABASE_URL = "file:./dev.db"

    # Installa dipendenze database
    Write-Host "  📦 Installazione dipendenze database..." -ForegroundColor Yellow
    Set-Location "database"
    npm install
    Set-Location ".."

    # Vai in prisma per i comandi
    Set-Location "database/prisma"

    Write-Host "  🔄 Generazione Prisma Client..." -ForegroundColor Yellow
    npx prisma generate

    Write-Host "  📊 Creazione database e tabelle..." -ForegroundColor Yellow
    npx prisma db push

    Write-Host "  🌱 Popolamento dati demo..." -ForegroundColor Yellow
    npx tsx seed.ts

    Set-Location "../.."
    Write-Host "✅ Database pronto!" -ForegroundColor Green
} else {
    Write-Host "✅ Database già esistente" -ForegroundColor Green
}

# Setup Frontend
Write-Host ""
Write-Host "🎨 Setup Frontend..." -ForegroundColor Cyan
Set-Location "frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "  📦 Installazione dipendenze..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Frontend pronto!" -ForegroundColor Green
Set-Location ".."

# Setup Backend AI
Write-Host ""
Write-Host "🤖 Setup Backend AI..." -ForegroundColor Cyan
Set-Location "ai_tools"

if (-not (Test-Path ".venv")) {
    Write-Host "  🐍 Creazione virtual environment..." -ForegroundColor Yellow
    & $pythonCmd -m venv .venv
}

Write-Host "  📦 Installazione dipendenze Python..." -ForegroundColor Yellow
if ($IsWindows -or $env:OS -match "Windows") {
    .\.venv\Scripts\Activate.ps1
    & $pythonCmd -m pip install --upgrade pip
    & $pythonCmd -m pip install -r requirements.txt
} else {
    . .venv/bin/activate
    & $pythonCmd -m pip install --upgrade pip
    & $pythonCmd -m pip install -r requirements.txt
}

Write-Host "✅ Backend AI pronto!" -ForegroundColor Green
Set-Location ".."

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETATO!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Avvio servizi..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 IMPORTANTE: Apri 2 terminali separati:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Terminal 1 - Backend AI (FastAPI):" -ForegroundColor Cyan
Write-Host "    cd ai_tools" -ForegroundColor White
Write-Host "    .\.venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "    python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000" -ForegroundColor White
Write-Host ""
Write-Host "  Terminal 2 - Frontend (Next.js):" -ForegroundColor Cyan
Write-Host "    cd frontend" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Oppure usa i comandi rapidi:" -ForegroundColor Yellow
Write-Host "  .\start-backend.ps1  # Avvia solo backend AI" -ForegroundColor White
Write-Host "  .\start-frontend.ps1 # Avvia solo frontend" -ForegroundColor White
Write-Host ""
Write-Host "📱 App disponibile su: http://localhost:3000" -ForegroundColor Green
Write-Host "🤖 API AI su: http://localhost:8000" -ForegroundColor Green
Write-Host "📚 Docs API AI: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
