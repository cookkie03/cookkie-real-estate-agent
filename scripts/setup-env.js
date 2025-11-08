#!/usr/bin/env node

/**
 * CRM IMMOBILIARE - Auto Setup Script
 *
 * Questo script:
 * 1. Copia .env.example a .env se non esiste
 * 2. Genera automaticamente i secrets se sono vuoti
 * 3. Verifica la configurazione
 *
 * Uso: node scripts/setup-env.js
 * Oppure: npm run setup
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colori per output console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function parseEnvFile(content) {
  // Handle both Unix (\n) and Windows (\r\n) line endings
  const lines = content.split(/\r?\n/);
  const env = {};

  lines.forEach(line => {
    // Remove any remaining \r
    line = line.replace(/\r$/, '');

    // Ignora commenti e righe vuote
    if (line.trim().startsWith('#') || line.trim() === '') {
      return;
    }

    // Parse key=value
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove surrounding quotes if present
      value = value.replace(/^["'](.*)["']$/, '$1');
      env[key] = value;
    }
  });

  return env;
}

function updateEnvValue(content, key, value) {
  const lines = content.split('\n');
  const updatedLines = lines.map(line => {
    if (line.startsWith(`${key}=`)) {
      return `${key}=${value}`;
    }
    return line;
  });
  return updatedLines.join('\n');
}

function main() {
  log('\n🚀 CRM IMMOBILIARE - Setup Automatico\n', colors.bright);

  const rootDir = path.resolve(__dirname, '..');
  const envExamplePath = path.join(rootDir, '.env.example');
  const envPath = path.join(rootDir, '.env');

  // Step 1: Verifica esistenza .env.example
  if (!fs.existsSync(envExamplePath)) {
    log('❌ Errore: .env.example non trovato!', colors.red);
    process.exit(1);
  }

  // Step 2: Crea .env se non esiste
  let envContent;
  let isNewFile = false;

  if (!fs.existsSync(envPath)) {
    log('📋 File .env non trovato, lo creo da .env.example...', colors.blue);
    envContent = fs.readFileSync(envExamplePath, 'utf8');
    isNewFile = true;
  } else {
    log('✅ File .env già esistente, lo aggiorno...', colors.green);
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Step 3: Parse variabili esistenti
  const env = parseEnvFile(envContent);

  // Step 4: Genera secrets se vuoti
  const secretsToGenerate = [
    { key: 'SESSION_SECRET', label: 'Session Secret' },
    { key: 'NEXTAUTH_SECRET', label: 'NextAuth Secret' },
    { key: 'POSTGRES_PASSWORD', label: 'PostgreSQL Password' },
  ];

  let hasChanges = false;

  log('\n🔐 Controllo secrets...\n', colors.bright);

  secretsToGenerate.forEach(({ key, label }) => {
    const currentValue = env[key];

    // Genera se vuoto o contiene placeholder
    if (!currentValue ||
        currentValue === '' ||
        currentValue.includes('GENERATE') ||
        currentValue.includes('CHANGE_THIS')) {

      const newSecret = generateSecret();
      envContent = updateEnvValue(envContent, key, newSecret);
      log(`✨ ${label} generato`, colors.green);
      hasChanges = true;
    } else {
      log(`✅ ${label} già configurato`, colors.blue);
    }
  });

  // Step 5: Salva .env aggiornato
  if (hasChanges || isNewFile) {
    fs.writeFileSync(envPath, envContent, 'utf8');
    log(`\n💾 File .env ${isNewFile ? 'creato' : 'aggiornato'} con successo!`, colors.green);
  } else {
    log('\n✅ Nessuna modifica necessaria', colors.blue);
  }

  // Step 6: Verifica configurazione
  log('\n📊 Stato configurazione:\n', colors.bright);

  const finalEnv = parseEnvFile(envContent);

  // Check DATABASE_URL (already cleaned by parseEnvFile)
  if (finalEnv.DATABASE_URL && finalEnv.DATABASE_URL !== '') {
    log('✅ DATABASE_URL configurato', colors.green);
    if (finalEnv.DATABASE_URL.includes('file:')) {
      log('   → SQLite (sviluppo locale)', colors.blue);
    } else if (finalEnv.DATABASE_URL.includes('postgresql:')) {
      log('   → PostgreSQL', colors.blue);
    }
  } else {
    log('⚠️  DATABASE_URL non configurato', colors.yellow);
  }

  // Check API Keys
  if (finalEnv.GOOGLE_API_KEY && finalEnv.GOOGLE_API_KEY !== '') {
    log('✅ GOOGLE_API_KEY configurato', colors.green);
  } else {
    log('ℹ️  GOOGLE_API_KEY non configurato (puoi configurarlo via GUI)', colors.blue);
  }

  // Check Secrets
  secretsToGenerate.forEach(({ key, label }) => {
    const value = finalEnv[key];
    if (value && !value.includes('GENERATE') && !value.includes('CHANGE_THIS')) {
      log(`✅ ${label} OK`, colors.green);
    } else {
      log(`❌ ${label} non configurato`, colors.red);
    }
  });

  // Step 7: Istruzioni finali
  log('\n📝 Prossimi passi:\n', colors.bright);
  log('1. Avvia l\'applicazione:', colors.blue);
  log('   • Sviluppo locale: npm run dev', colors.reset);
  log('   • Produzione Docker: docker-compose up -d', colors.reset);
  log('\n2. Apri http://localhost:3000', colors.blue);
  log('\n3. Completa il setup tramite il wizard GUI', colors.blue);
  log('   (configurazione utente, API keys, agenzia)\n', colors.reset);

  if (!finalEnv.GOOGLE_API_KEY || finalEnv.GOOGLE_API_KEY === '') {
    log('💡 Suggerimento:', colors.yellow);
    log('   Ottieni una Google API key GRATUITA su:', colors.reset);
    log('   https://aistudio.google.com/app/apikey\n', colors.blue);
  }

  log('✅ Setup completato con successo!\n', colors.green + colors.bright);
}

// Esegui script
try {
  main();
} catch (error) {
  log(`\n❌ Errore durante il setup: ${error.message}\n`, colors.red);
  process.exit(1);
}
