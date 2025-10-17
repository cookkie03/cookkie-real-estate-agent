@echo off
REM ==============================================
REM CRM Immobiliare - Test Suite Completa
REM Windows Batch Test Script
REM ==============================================

setlocal enabledelayedexpansion
set FAILURES=0

echo ==========================================
echo CRM Immobiliare - Test Suite
echo ==========================================
echo.

REM Backend Tests
echo ========== Backend Tests ==========
cd backend
if exist "package.json" (
    findstr /C:"\"test\"" package.json >nul
    if !ERRORLEVEL! equ 0 (
        echo [*] Running Backend Unit Tests...
        call npm test
        if !ERRORLEVEL! neq 0 set /a FAILURES+=1
    ) else (
        echo [!] No backend tests configured
    )
) else (
    echo [!] backend/package.json not found
)
cd ..
echo.

REM Frontend Tests
echo ========== Frontend Tests ==========
cd frontend
if exist "package.json" (
    findstr /C:"\"test\"" package.json >nul
    if !ERRORLEVEL! equ 0 (
        echo [*] Running Frontend Unit Tests...
        call npm test
        if !ERRORLEVEL! neq 0 set /a FAILURES+=1
    ) else (
        echo [!] No frontend tests configured
    )
) else (
    echo [!] frontend/package.json not found
)
cd ..
echo.

REM AI Tools Tests
echo ========== AI Tools Tests ==========
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    if exist "ai_tools\tests" (
        echo [*] Running AI Tools Tests...
        cd ai_tools
        python -m pytest tests/ -v
        if !ERRORLEVEL! neq 0 set /a FAILURES+=1
        cd ..
    ) else (
        echo [!] No AI tools tests found
    )
) else (
    echo [!] Python not available
)
echo.

REM Scraping Tests
echo ========== Scraping Tests ==========
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    if exist "scraping\tests" (
        echo [*] Running Scraping Tests...
        cd scraping
        python -m pytest tests/ -v
        if !ERRORLEVEL! neq 0 set /a FAILURES+=1
        cd ..
    ) else (
        echo [!] No scraping tests found
    )
) else (
    echo [!] Python not available
)
echo.

REM Summary
echo ==========================================
if !FAILURES! equ 0 (
    echo [OK] All tests passed!
    echo ==========================================
    exit /b 0
) else (
    echo [X] !FAILURES! test suite(s^) failed
    echo ==========================================
    exit /b 1
)
