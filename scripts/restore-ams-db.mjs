#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.KAPITECH_DATA_DIR
  ? path.resolve(process.env.KAPITECH_DATA_DIR)
  : path.join(process.env.HOME || process.cwd(), '.kapitech-ams-data');
const DB_FILE = path.join(DATA_DIR, 'kapitech_db.json');
const backupFile = process.argv[2];
const force = process.argv.includes('--force');

if (!backupFile) {
  console.error('Usage: node scripts/restore-ams-db.mjs <backup-file> [--force]');
  process.exit(2);
}

const source = path.resolve(backupFile);
if (!fs.existsSync(source)) {
  console.error('Backup file not found.');
  process.exit(1);
}

const payload = fs.readFileSync(source);
if (!payload.toString('utf8', 0, 12).startsWith('KAPI-ENC-V1:')) {
  console.error('Refusing restore: backup does not contain the expected encrypted database format.');
  process.exit(1);
}

if (fs.existsSync(DB_FILE) && !force) {
  console.error('Refusing to overwrite the live database without --force.');
  console.error('Create a safety copy of the current database first, then rerun with --force.');
  process.exit(1);
}

fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
const safetyPath = fs.existsSync(DB_FILE)
  ? path.join(DATA_DIR, `kapitech_db_pre_restore_${Date.now()}.bak`)
  : null;

if (safetyPath) {
  fs.copyFileSync(DB_FILE, safetyPath);
  fs.chmodSync(safetyPath, 0o600);
}

const tempPath = `${DB_FILE}.${process.pid}.${Date.now()}.restore.tmp`;
fs.writeFileSync(tempPath, payload, { mode: 0o600 });
fs.renameSync(tempPath, DB_FILE);
fs.chmodSync(DB_FILE, 0o600);

console.log('Database restore completed.');
if (safetyPath) console.log(`Safety copy: ${safetyPath}`);
