import { Pool, type PoolClient } from 'pg';

let pool: Pool | null = null;

function requirePostgresUrl(): string {
  const url = process.env.KAPITECH_POSTGRES_URL?.trim();
  if (!url) {
    throw new Error(
      'KAPITECH_POSTGRES_URL is not configured. PostgreSQL access is opt-in and never falls back to the JSON database.'
    );
  }
  return url;
}

function postgresSslConfig(): false | { rejectUnauthorized: boolean } {
  const mode = (process.env.KAPITECH_POSTGRES_SSL || 'require').trim().toLowerCase();
  if (mode === 'disable' || mode === 'false' || mode === 'off') return false;

  const rejectUnauthorized = !['false', '0', 'no'].includes(
    (process.env.KAPITECH_POSTGRES_SSL_REJECT_UNAUTHORIZED || 'true').trim().toLowerCase()
  );

  return { rejectUnauthorized };
}

export function getPostgresPool(): Pool {
  if (pool) return pool;

  pool = new Pool({
    connectionString: requirePostgresUrl(),
    ssl: postgresSslConfig(),
    max: Number(process.env.KAPITECH_POSTGRES_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.KAPITECH_POSTGRES_IDLE_TIMEOUT_MS || 10_000),
    connectionTimeoutMillis: Number(process.env.KAPITECH_POSTGRES_CONNECTION_TIMEOUT_MS || 5_000),
    statement_timeout: Number(process.env.KAPITECH_POSTGRES_STATEMENT_TIMEOUT_MS || 15_000),
    application_name: 'kapitech-ams'
  });

  pool.on('error', (error) => {
    console.error('[PostgreSQL] Idle client error:', error);
  });

  return pool;
}

export async function query(text: string, values: unknown[] = []): Promise<unknown> {
  return getPostgresPool().query(text, values);
}

export async function withPostgresTransaction<T>(
  operation: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPostgresPool().connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('[PostgreSQL] Transaction rollback failed:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function checkPostgresConnection(): Promise<{ ok: boolean; latencyMs: number }> {
  const startedAt = Date.now();
  await query('SELECT 1');
  return { ok: true, latencyMs: Date.now() - startedAt };
}

export async function closePostgresPool(): Promise<void> {
  if (!pool) return;
  const current = pool;
  pool = null;
  await current.end();
}
