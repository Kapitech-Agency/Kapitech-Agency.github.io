import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPostgresPool, closePostgresPool } from '../server/postgres.ts';

const LOCK_KEY = 'kapitech:ams:postgres:migrations';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../db/postgres');

function checksum(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function migrationVersion(fileName: string): string {
  return fileName.replace(/\.sql$/, '');
}

function normalizeMigrationSql(sql: string): string {
  // Migration 001 predates the versioned runner and owns its own BEGIN/COMMIT.
  // Strip only those outer transaction statements so the runner can guarantee
  // one atomic transaction per migration without changing the stored checksum.
  return sql
    .replace(/^\s*BEGIN;\s*/i, '')
    .replace(/\s*COMMIT;\s*$/i, '');
}

async function loadMigrations(): Promise<Array<{ version: string; sql: string; checksum: string }>> {
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

  if (!files.length) {
    throw new Error('No PostgreSQL migration files were found.');
  }

  return Promise.all(files.map(async (file) => {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    return {
      version: migrationVersion(file),
      sql,
      checksum: checksum(sql)
    };
  }));
}

async function main(): Promise<void> {
  const migrations = await loadMigrations();
  const pool = getPostgresPool();
  const client = await pool.connect();

  try {
    await client.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [LOCK_KEY]);

    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), checksum TEXT NOT NULL)'
    );

    const applied = await client.query<{ version: string; checksum: string }>(
      'SELECT version, checksum FROM schema_migrations'
    );
    const appliedByVersion = new Map(applied.rows.map((row) => [row.version, row.checksum]));

    for (const migration of migrations) {
      const existingChecksum = appliedByVersion.get(migration.version);

      if (existingChecksum) {
        if (existingChecksum !== migration.checksum) {
          throw new Error(
            'Migration ' + migration.version + ' is already recorded with a different checksum. Refusing to run a modified migration.'
          );
        }
        console.log('[PostgreSQL] Migration ' + migration.version + ' is already applied.');
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(normalizeMigrationSql(migration.sql));
        await client.query(
          'INSERT INTO schema_migrations (version, checksum) VALUES ($1, $2)',
          [migration.version, migration.checksum]
        );
        await client.query('COMMIT');
        console.log('[PostgreSQL] Applied ' + migration.version + ' (' + migration.checksum + ').');
      } catch (error) {
        try {
          await client.query('ROLLBACK');
        } catch {}
        throw error;
      }
    }
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
