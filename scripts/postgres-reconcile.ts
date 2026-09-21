import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getPostgresPool, closePostgresPool } from '../server/postgres.ts';

const DATA_DIR = process.env.KAPITECH_DATA_DIR
  ? path.resolve(process.env.KAPITECH_DATA_DIR)
  : path.join(process.env.HOME || process.cwd(), '.kapitech-ams-data');
const DB_FILE = path.join(DATA_DIR, 'kapitech_db.json');
const PREFIX = 'KAPI-ENC-V1:';

function encryptionKey(): Buffer {
  const raw = process.env.KAPITECH_DATA_ENCRYPTION_KEY?.trim();
  if (!raw) throw new Error('KAPITECH_DATA_ENCRYPTION_KEY is required to read the production JSON database.');
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error('KAPITECH_DATA_ENCRYPTION_KEY must decode to 32 bytes.');
  return key;
}

function decrypt(raw: string): string {
  if (!raw.startsWith(PREFIX)) return raw;
  const payload = JSON.parse(raw.slice(PREFIX.length));
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()]).toString('utf8');
}

function sha256(raw: string): string {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

function arr(db: any, key: string): any[] {
  return Array.isArray(db?.[key]) ? db[key] : [];
}

function count(db: any, key: string): number {
  return arr(db, key).length;
}

function money(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function sum(db: any, key: string, field: string): number {
  return arr(db, key).reduce((total, row) => total + money(row?.[field]), 0);
}

function uniqueIds(db: any, key: string): number {
  const ids = arr(db, key).map(row => row?.id).filter(Boolean);
  return new Set(ids).size;
}

function duplicateIds(db: any, key: string): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const row of arr(db, key)) {
    const id = row?.id;
    if (!id) continue;
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

async function pgCounts(): Promise<Record<string, number>> {
  const pool = getPostgresPool();
  const tables: Record<string, string> = {
    users: 'users',
    sessions: 'sessions',
    leads: 'leads',
    crmDeals: 'crm_deals',
    proposals: 'proposals',
    clients: 'clients',
    projects: 'projects',
    tasks: 'tasks',
    timeLogs: 'time_logs',
    invoices: 'invoices',
    expenses: 'expenses',
    approvals: 'approvals',
    vendors: 'vendors',
    documents: 'documents',
    notifications: 'notifications',
    auditLogs: 'audit_logs'
  };
  const output: Record<string, number> = {};
  for (const [source, table] of Object.entries(tables)) {
    const result = await pool.query<{ count: string }>('SELECT COUNT(*)::bigint AS count FROM ' + table);
    output[source] = Number(result.rows[0].count);
  }
  return output;
}

async function main(): Promise<void> {
  if (!fs.existsSync(DB_FILE)) throw new Error('JSON database file not found: ' + DB_FILE);

  const raw = fs.readFileSync(DB_FILE, 'utf8');
  const db = JSON.parse(decrypt(raw));
  const sourceSha256 = sha256(raw);

  const localCounts: Record<string, number> = {};
  const keys = [
    'users','sessions','leads','crmDeals','proposals','clients','projects',
    'tasks','timeLogs','invoices','expenses','approvals','vendors','documents',
    'notifications','auditLogs'
  ];
  for (const key of keys) localCounts[key] = count(db, key);

  const duplicates: Record<string, string[]> = {};
  for (const key of keys) {
    const ids = duplicateIds(db, key);
    if (ids.length) duplicates[key] = ids;
  }

  const financials = {
    proposalSubtotal: sum(db, 'proposals', 'subtotal'),
    proposalTotal: sum(db, 'proposals', 'total'),
    invoiceTotal: sum(db, 'invoices', 'total'),
    invoiceAmountPaid: sum(db, 'invoices', 'amountPaid'),
    invoiceBalanceDue: sum(db, 'invoices', 'balanceDue'),
    expensesTotal: sum(db, 'expenses', 'amount'),
    pipelineValue: sum(db, 'crmDeals', 'value')
  };

  const userIds = new Set(arr(db, 'users').map(row => row?.id).filter(Boolean));
  const clientIds = new Set(arr(db, 'clients').map(row => row?.id).filter(Boolean));
  const projectIds = new Set(arr(db, 'projects').map(row => row?.id).filter(Boolean));
  const brokenReferences = {
    sessionsUser: arr(db, 'sessions').filter(row => row?.userId && !userIds.has(row.userId)).length,
    projectsClient: arr(db, 'projects').filter(row => row?.clientId && !clientIds.has(row.clientId)).length,
    proposalsClient: arr(db, 'proposals').filter(row => row?.clientId && !clientIds.has(row.clientId)).length,
    proposalsProject: arr(db, 'proposals').filter(row => row?.projectId && !projectIds.has(row.projectId)).length,
    invoicesClient: arr(db, 'invoices').filter(row => row?.clientId && !clientIds.has(row.clientId)).length,
    invoicesProject: arr(db, 'invoices').filter(row => row?.projectId && !projectIds.has(row.projectId)).length,
    tasksProject: arr(db, 'tasks').filter(row => row?.projectId && !projectIds.has(row.projectId)).length
  };

  const pool = getPostgresPool();
  const runId = crypto.randomUUID();
  await pool.query(
    'INSERT INTO migration_runs (id, source_kind, source_sha256, started_at, status, report) VALUES ($1,$2,$3,NOW(),$4,$5)',
    [runId, 'encrypted-json', sourceSha256, 'running', JSON.stringify({ localCounts, financials, duplicates, brokenReferences })]
  );

  try {
    const postgresCounts = await pgCounts();
    const countMismatches = Object.fromEntries(
      keys
        .filter(key => localCounts[key] !== postgresCounts[key])
        .map(key => [key, { json: localCounts[key], postgres: postgresCounts[key] }])
    );

    const checks = {
      sourceReadable: true,
      duplicateIds: Object.keys(duplicates).length === 0,
      brokenReferences: Object.values(brokenReferences).every(value => value === 0),
      postgresReachable: true,
      countParity: Object.keys(countMismatches).length === 0
    };

    const status = Object.values(checks).every(Boolean) ? 'succeeded' : 'failed';
    const report = {
      runId,
      sourceSha256,
      checks,
      localCounts,
      postgresCounts,
      countMismatches,
      financials,
      duplicates,
      brokenReferences,
      note: 'This command is reconciliation-only. It does not insert, update, delete, or migrate business records.'
    };

    await pool.query(
      'UPDATE migration_runs SET completed_at=NOW(), status=$2, report=$3 WHERE id=$1',
      [runId, status, JSON.stringify(report)]
    );

    console.log(JSON.stringify(report, null, 2));
    if (status !== 'succeeded') process.exitCode = 2;
  } catch (error) {
    await pool.query(
      'UPDATE migration_runs SET completed_at=NOW(), status=$2, report=$3 WHERE id=$1',
      [runId, 'failed', JSON.stringify({ error: error instanceof Error ? error.message : String(error) })]
    );
    throw error;
  } finally {
    await closePostgresPool();
  }
}

main().catch(error => {
  console.error('[PostgreSQL reconciliation] Failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
