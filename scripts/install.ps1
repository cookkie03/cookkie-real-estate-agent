# ==============================================
# CRM Immobiliare - Script di Installazione
# Windows PowerShell Setup Script
# ==============================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CRM Immobiliare - Installazione" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Funzioni di utilità
function Write-Step {
    param([string]$Message)
    Write-Host "▶ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

# Verifica prerequisiti
Write-Step "Verifica prerequisiti..."

try {
    $nodeVersion = node -v
    $npmVersion = npm -v

    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -lt 18) {
        Write-Error-Custom "Node.js versione 18+ richiesta (trovata: $nodeVersion)"
        exit 1
    }
} catch {
    Write-Error-Custom "Node.js non trovato. Installa Node.js 18+ da https://nodejs.org"
    exit 1
}

$pythonAvailable = $true
try {
    $pythonVersion = python --version
    $pythonVersionMatch = [regex]::Match($pythonVersion, 'Python (\d+)\.(\d+)')
    $pythonMajor = [int]$pythonVersionMatch.Groups[1].Value
    $pythonMinor = [int]$pythonVersionMatch.Groups[2].Value

    if ($pythonMajor -lt 3 -or ($pythonMajor -eq 3 -and $pythonMinor -lt 9)) {
        Write-Warning-Custom "Python 3.9+ raccomandato (trovata: $pythonVersion)"
    }
} catch {
    Write-Warning-Custom "Python 3 non trovato. Alcune funzionalità AI potrebbero non funzionare"
    $pythonAvailable = $false
}

Write-Success "Prerequisiti OK: Node $nodeVersion, npm v$npmVersion$(if($pythonAvailable){", Python $pythonVersion"})"
Write-Host ""

# Creazione directory necessarie
Write-Step "Creazione directory strutturali..."
$directories = @(
    "logs/backend",
    "logs/frontend",
    "logs/ai_tools",
    "logs/scraping",
    "database/prisma",
    "config"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Success "Directory create"
Write-Host ""

# Installazione dipendenze Backend
Write-Step "Installazione dipendenze Backend..."
Push-Location backend
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Errore installazione Backend"
        exit 1
    }
    Write-Success "Dipendenze Backend installate"
} else {
    Write-Error-Custom "backend/package.json non trovato"
    exit 1
}
Pop-Location
Write-Host ""

# Installazione dipendenze Frontend
Write-Step "Installazione dipendenze Frontend..."
Push-Location frontend
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Errore installazione Frontend"
        exit 1
    }
    Write-Success "Dipendenze Frontend installate"
} else {
    Write-Error-Custom "frontend/package.json non trovato"
    exit 1
}
Pop-Location
Write-Host ""

# Setup Python AI Tools
if ($pythonAvailable) {
    Write-Step "Setup AI Tools (Python)..."
    Push-Location ai_tools
    if (Test-Path "requirements.txt") {
        python -m pip install --upgrade pip
        python -m pip install -r requirements.txt
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dipendenze AI Tools installate"
        } else {
            Write-Warning-Custom "Errore installazione AI Tools"
        }
    } else {
        Write-Warning-Custom "ai_tools/requirements.txt non trovato"
    }
    Pop-Location
    Write-Host ""

    Write-Step "Setup Scraping Tools (Python)..."
    Push-Location scraping
    if (Test-Path "requirements.txt") {
        python -m pip install -r requirements.txt
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dipendenze Scraping installate"
        } else {
            Write-Warning-Custom "Errore installazione Scraping"
        }
    } else {
        Write-Warning-Custom "scraping/requirements.txt non trovato"
    }
    Pop-Location
    Write-Host ""
} else {
    Write-Warning-Custom "Python non disponibile, skip AI Tools e Scraping"
    Write-Host ""
}

# Setup Database
Write-Step "Setup Database (Prisma)..."
Push-Location backend
if (Test-Path "../database/prisma/schema.prisma") {
    # Genera Prisma Client
    npx prisma generate --schema=../database/prisma/schema.prisma

    # Push schema al database
    npx prisma db push --schema=../database/prisma/schema.prisma --skip-generate

    Write-Success "Database inizializzato"

    # Seed database (opzionale)
    $seed = Read-Host "Vuoi popolare il database con dati di esempio? (s/n)"
    if ($seed -eq 's' -or $seed -eq 'S') {
        npx prisma db seed
        Write-Success "Database popolato con dati di esempio"
    }
} else {
    Write-Error-Custom "database/prisma/schema.prisma non trovato"
    exit 1
}
Pop-Location
Write-Host ""

# Verifica file .env
Write-Step "Verifica configurazione ambiente..."

$envConfigs = @(
    @{Target="config/.env.backend"; Template="config/backend.env.example"},
    @{Target="config/.env.frontend"; Template="config/frontend.env.example"},
    @{Target="config/.env.ai"; Template="config/ai_tools.env.example"}
)

foreach ($config in $envConfigs) {
    if (-not (Test-Path $config.Target)) {
        Write-Warning-Custom "$($config.Target) non trovato"
        if (Test-Path $config.Template) {
            Copy-Item $config.Template $config.Target
            Write-Success "Creato $($config.Target) da template"
        }
    }
}

Write-Host ""
Write-Success "✓ Installazione completata!"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Prossimi passi:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. Configura i file .env in /config"
Write-Host "2. Avvia l'applicazione: .\scripts\start-all.ps1"
Write-Host "3. Accedi a:"
Write-Host "   - Frontend: http://localhost:3000"
Write-Host "   - Backend API: http://localhost:3001"
Write-Host "   - AI Tools: http://localhost:8000"
Write-Host ""
Write-Host "Per documentazione completa: Get-Content docs\GETTING_STARTED.md"
Write-Host "==========================================" -ForegroundColor Cyan
