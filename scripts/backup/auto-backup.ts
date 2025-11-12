#!/usr/bin/env tsx
/**
 * AUTO-BACKUP UTILITY
 *
 * Crea backup automatici del database prima di operazioni pericolose
 *
 * Usage:
 *   import { createBackup } from './scripts/backup/auto-backup';
 *   await createBackup('pre-seed');
 */

import fs from 'fs-extra';
import path from 'path';

const DB_PATH = 'database/prisma/dev.db';
const BACKUP_DIR = 'backups';

interface BackupOptions {
  prefix?: string;
  maxBackups?: number;
  compress?: boolean;
}

/**
 * Crea un backup del database con timestamp
 */
export async function createBackup(
  reason: string = 'manual',
  options: BackupOptions = {}
): Promise<string> {
  const { prefix = 'backup', maxBackups = 30, compress = false } = options;

  // Verifica che il database esista
  if (!await fs.pathExists(DB_PATH)) {
    throw new Error(`Database not found at ${DB_PATH}`);
  }

  // Crea directory backup se non esiste
  await fs.ensureDir(BACKUP_DIR);

  // Timestamp ISO formato: YYYYMMDD-HHMMSS
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 17); // 20251110_180622

  // Nome file backup
  const filename = `${prefix}-${reason}-${timestamp}.db`;
  const backupPath = path.join(BACKUP_DIR, filename);

  // Copia database
  console.log(`🛡️  Creating backup: ${filename}`);
  await fs.copy(DB_PATH, backupPath);

  // Verifica dimensione
  const stats = await fs.stat(backupPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`✅ Backup created: ${backupPath} (${sizeMB} MB)`);

  // Cleanup vecchi backup
  await cleanOldBackups(maxBackups, prefix);

  return backupPath;
}

/**
 * Rimuove backup più vecchi mantenendo solo gli ultimi N
 */
async function cleanOldBackups(keep: number, prefix: string): Promise<void> {
  const files = await fs.readdir(BACKUP_DIR);

  // Filtra solo file .db con il prefix giusto
  const backups = files
    .filter(f => f.startsWith(prefix) && f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time); // Più recenti prima

  // Rimuovi quelli oltre il limite
  const toRemove = backups.slice(keep);

  for (const backup of toRemove) {
    console.log(`🗑️  Removing old backup: ${backup.name}`);
    await fs.remove(backup.path);
  }

  if (toRemove.length > 0) {
    console.log(`✅ Cleaned ${toRemove.length} old backup(s)`);
  }
}

/**
 * Lista tutti i backup disponibili
 */
export async function listBackups(prefix?: string): Promise<Array<{
  name: string;
  path: string;
  size: number;
  created: Date;
}>> {
  if (!await fs.pathExists(BACKUP_DIR)) {
    return [];
  }

  const files = await fs.readdir(BACKUP_DIR);

  const backups = await Promise.all(
    files
      .filter(f => f.endsWith('.db'))
      .filter(f => !prefix || f.startsWith(prefix))
      .map(async f => {
        const filePath = path.join(BACKUP_DIR, f);
        const stats = await fs.stat(filePath);
        return {
          name: f,
          path: filePath,
          size: stats.size,
          created: stats.mtime
        };
      })
  );

  // Ordina per data (più recenti prima)
  return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
}

/**
 * Backup prima di operazione pericolosa con prompt
 */
export async function backupBeforeDangerousOp(
  operation: string,
  autoYes: boolean = false
): Promise<string> {
  console.log(`⚠️  ${operation} will modify/delete data`);

  // Crea backup
  const backupPath = await createBackup(operation.toLowerCase().replace(/\s+/g, '-'));

  if (!autoYes) {
    // Se non auto-yes, mostra warning
    console.log(`\n⚠️  WARNING: ${operation}`);
    console.log(`Backup saved to: ${backupPath}`);
    console.log(`To restore: cp ${backupPath} ${DB_PATH}\n`);
  }

  return backupPath;
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const reason = args[1] || 'manual';

  (async () => {
    try {
      switch (command) {
        case 'create':
          await createBackup(reason);
          break;

        case 'list':
          const backups = await listBackups();
          console.log('\n📦 Available backups:\n');
          backups.forEach((b, i) => {
            const sizeMB = (b.size / 1024 / 1024).toFixed(2);
            const date = b.created.toISOString().slice(0, 19).replace('T', ' ');
            console.log(`${i + 1}. ${b.name}`);
            console.log(`   Size: ${sizeMB} MB | Created: ${date}`);
          });
          break;

        default:
          console.log('Usage:');
          console.log('  npx tsx scripts/backup/auto-backup.ts create [reason]');
          console.log('  npx tsx scripts/backup/auto-backup.ts list');
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Backup failed:', error);
      process.exit(1);
    }
  })();
}
