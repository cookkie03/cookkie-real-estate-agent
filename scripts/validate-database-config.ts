#!/usr/bin/env tsx
/**
 * DATABASE CONFIG VALIDATOR
 *
 * Verifica che DATABASE_URL sia consistente tra tutti i config files
 */

import fs from 'fs';
import path from 'path';

interface ConfigCheck {
  file: string;
  url: string | null;
  normalized: string | null;
}

const CONFIG_FILES = [
  '.env.local',
  'database/.env.database',
];

function normalizeDatabasePath(url: string | null): string | null {
  if (!url) return null;

  // Convert file:./path to absolute
  if (url.startsWith('file:./')) {
    return path.resolve(url.replace('file:./', ''));
  }

  // Convert file:path to absolute
  if (url.startsWith('file:')) {
    return path.resolve(url.replace('file:', ''));
  }

  // Convert sqlite:///path to absolute
  if (url.startsWith('sqlite:///')) {
    return path.resolve(url.replace('sqlite:///', ''));
  }

  // PostgreSQL or other - return as-is
  return url;
}

function loadEnvFile(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/DATABASE_URL="?([^"\n]+)"?/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function validateConfig() {
  console.log('🔍 Validating DATABASE_URL configuration...\n');

  const checks: ConfigCheck[] = [];

  // Load all configs
  for (const file of CONFIG_FILES) {
    const url = loadEnvFile(file);
    const normalized = normalizeDatabasePath(url);

    checks.push({ file, url, normalized });
  }

  // Display findings
  checks.forEach(check => {
    console.log(`📄 ${check.file}`);
    console.log(`   DATABASE_URL: ${check.url || '(not set)'}`);
    console.log(`   Normalized: ${check.normalized || 'N/A'}`);
    console.log('');
  });

  // Check consistency
  const paths = checks
    .map(c => c.normalized)
    .filter(p => p !== null) as string[];

  const uniquePaths = [...new Set(paths)];

  if (uniquePaths.length === 0) {
    console.error('❌ No DATABASE_URL found in any config!');
    process.exit(1);
  }

  if (uniquePaths.length > 1) {
    console.error('❌ DATABASE_URL mismatch detected!\n');
    console.error('Different paths found:');
    uniquePaths.forEach((p, i) => {
      console.error(`  ${i + 1}. ${p}`);
    });
    console.error('\nAll configs must point to the same database!');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL is consistent across all configs');
  console.log(`   All point to: ${uniquePaths[0]}`);
}

validateConfig().catch(err => {
  console.error('❌ Validation failed:', err);
  process.exit(1);
});
