#!/usr/bin/env node

/**
 * Quick Start Script - CRM Immobiliare
 * Automatically detects npm/pnpm and runs setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

function checkCommand(command) {
  try {
    exec(`${command} --version`, { silent: true });
    return true;
  } catch {
    return false;
  }
}

function detectPackageManager() {
  // Check if pnpm-lock.yaml exists
  if (fs.existsSync('pnpm-lock.yaml')) {
    if (checkCommand('pnpm')) {
      return 'pnpm';
    } else {
      log('⚠️  Progetto configurato per pnpm ma pnpm non trovato', 'yellow');
      log('   Installalo con: npm install -g pnpm', 'yellow');
      process.exit(1);
    }
  }

  // Fallback to npm
  if (checkCommand('npm')) {
    return 'npm';
  }

  log('❌ Nessun package manager trovato (npm o pnpm)', 'red');
  log('   Installa Node.js da https://nodejs.org/', 'red');
  process.exit(1);
}

async function main() {
  log('\n🚀 CRM IMMOBILIARE - Quick Start\n', 'cyan');

  // Detect package manager
  const pm = detectPackageManager();
  log(`📦 Package Manager: ${pm}`, 'blue');

  // Check Node version
  const nodeVersion = process.version;
  log(`📍 Node Version: ${nodeVersion}`, 'blue');

  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    log('⚠️  Node.js 18+ consigliato (hai ' + nodeVersion + ')', 'yellow');
  }

  log('\n📥 Step 1: Installazione dipendenze...', 'cyan');
  exec(`${pm} install`);
  log('✅ Dipendenze installate', 'green');

  log('\n🗄️  Step 2: Generazione Prisma Client...', 'cyan');
  try {
    if (pm === 'pnpm') {
      exec('pnpm prisma:generate');
    } else {
      exec('npm run prisma:generate');
    }
    log('✅ Prisma Client generato', 'green');
  } catch (error) {
    log('⚠️  Errore generazione Prisma - prova manualmente:', 'yellow');
    log(`   ${pm} ${pm === 'pnpm' ? '' : 'run '}prisma:generate`, 'yellow');
  }

  log('\n✨ Setup completato!\n', 'green');
  log('📝 Prossimi passi:', 'cyan');
  log(`   1. Avvia frontend:  ${pm} ${pm === 'pnpm' ? '' : 'run '}dev:web`, 'blue');
  log('   2. Apri browser:    http://localhost:3000', 'blue');
  log(`   3. Avvia backend:   cd apps/api && ${pm} ${pm === 'pnpm' ? 'start:dev' : 'run start:dev'}`, 'blue');
  log('   4. API Docs:        http://localhost:3001/api/docs', 'blue');
  log(`   5. Database GUI:    ${pm} ${pm === 'pnpm' ? '' : 'run '}prisma:studio\n`, 'blue');

  log('📖 Per guida completa: leggi SETUP-WINDOWS.md\n', 'cyan');
}

main().catch(error => {
  log('\n❌ Errore durante setup:', 'red');
  console.error(error.message);
  process.exit(1);
});
