@echo off
REM ==============================================
REM Database Migration Script (Windows)
REM Apply Prisma migrations
REM ==============================================

setlocal enabledelayedexpansion

cd /d "%~dp0\.."

echo ==========================================
echo CRM Immobiliare - Database Migration
echo ==========================================
echo.

REM Check if schema exists
if not exist "prisma\schema.prisma" (
    echo [X] Error: prisma\schema.prisma not found
    pause
    exit /b 1
)

echo [*] Generating Prisma Client...
call npx prisma generate --schema=prisma\schema.prisma
if %ERRORLEVEL% neq 0 (
    echo [X] Failed to generate Prisma Client
    pause
    exit /b 1
)

echo [*] Pushing schema to database...
call npx prisma db push --schema=prisma\schema.prisma --skip-generate
if %ERRORLEVEL% neq 0 (
    echo [X] Failed to push database schema
    pause
    exit /b 1
)

REM Optional seed
set /p SEED="Do you want to seed the database? (y/n): "
if /i "%SEED%"=="y" (
    echo [*] Seeding database...
    call npx prisma db seed --schema=prisma\schema.prisma
)

echo.
echo ==========================================
echo [OK] Migration completed!
echo ==========================================
echo.
echo Database location: prisma\dev.db
echo View data: npx prisma studio --schema=prisma\schema.prisma
echo.
pause
