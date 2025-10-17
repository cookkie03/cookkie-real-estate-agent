# ==============================================
# CRM Immobiliare - Stop All Services
# Windows PowerShell Stop Script
# ==============================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CRM Immobiliare - Stop Servizi" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

function Stop-ProcessOnPort {
    param([int]$Port, [string]$ServiceName)

    Write-Host "▶ Fermando $ServiceName (porta $Port)..." -ForegroundColor Green

    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

    if ($processes) {
        foreach ($pid in $processes) {
            try {
                Stop-Process -Id $pid -Force
                Write-Host "  ✓ Processo $pid fermato" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠ Impossibile fermare processo $pid" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  ✓ Nessun processo in esecuzione sulla porta $Port" -ForegroundColor Gray
    }
}

# Stop services
Stop-ProcessOnPort -Port 3000 -ServiceName "Frontend"
Stop-ProcessOnPort -Port 3001 -ServiceName "Backend"
Stop-ProcessOnPort -Port 8000 -ServiceName "AI Tools"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ Tutti i servizi sono stati fermati" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
