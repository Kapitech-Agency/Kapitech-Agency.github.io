import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPostgresPool, closePostgresPool } from '../server/postgres.ts';

const VERSION = '001_initial_schema';
const LOCK_KEY = 'kapitech:ams:postgres:migrations';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../db/postgres/001_initial_schema.sql');

function checksum(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

async function main(): Promise<void> {
  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  const schemaChecksum = checksum(schemaSql);
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [LOCK_KEY]);
    await client.query('BEGIN');

    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), checksum TEXT NOT NULL)'
    );

    const existing = await client.query<{ checksum: string }>(
      'SELECT checksum FROM schema_migrations WHERE version = $1',
      [VERSION]
    );

    if (existing.rowCount) {
      if (existing.rows[0].checksum !== schemaChecksum) {
        throw new Error(
          'Migration ' + VERSION + ' is already recorded with a different checksum. Refusing to run a modified migration.'
        );
      }

      await client.query('ROLLBACK');
      console.log('[PostgreSQL] Migration ' + VERSION + ' is already applied.');
      return;
    }

    await client.query(schemaSql);
    await client.query(
      'INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)',
      [VERSION, schemaChecksum]
    );

    await client.query('COMMIT');
    console.log('[PostgreSQL] Applied ' + VERSION + ' (' + schemaChecksum + ').');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    throw error;
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock(hashtextextended($1, 0))', [LOCK_KEY]);
    } catch {}
    client.release();
    await closePostgresPool();
  }
}

main().catch((error) => {
  console.error('[PostgreSQL] Migration failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
