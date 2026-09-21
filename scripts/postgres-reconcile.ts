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

function sha256(raw: string | Buffer): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
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

function computeAuditLogHash(log: any): string {
  return crypto.createHash('sha256').update(JSON.stringify({
    id: log.id,
    timestamp: log.timestamp,
    action: log.action,
    actor: log.actor,
    actorRole: log.actorRole,
    ip: log.ip,
    userAgent: log.userAgent,
    details: log.details,
    severity: log.severity,
    prevHash: log.prevHash
  })).digest('hex');
}

function verifyAuditLogChain(db: any): { valid: boolean; checked: number; brokenAt?: string } {
  const logs = arr(db, 'auditLogs');
  let previousHash = 'GENESIS';
  let checked = 0;
  for (let index = logs.length - 1; index >= 0; index -= 1) {
    const log = logs[index];
    const prevHash = log.prevHash || previousHash;
    const expectedHash = computeAuditLogHash({ ...log, prevHash });
    checked += 1;
    if (log.prevHash !== prevHash || log.hash !== expectedHash) return { valid: false, checked, brokenAt: String(log.id || '') };
    previousHash = expectedHash;
  }
  return { valid: true, checked };
}

function verifyPrivateDocuments(db: any): { valid: boolean; checked: number; missing: string[]; malformed: string[] } {
  const missing: string[] = [];
  const malformed: string[] = [];
  let checked = 0;
  const dir = process.env.KAPITECH_PRIVATE_DOCUMENT_DIR
    ? path.resolve(process.env.KAPITECH_PRIVATE_DOCUMENT_DIR)
    : path.join(DATA_DIR, 'private-documents');
  for (const document of arr(db, 'documents')) {
    if (!document.storageKey) continue;
    checked += 1;
    if (!/^[a-f0-9]{64}$/.test(String(document.storageKey))) {
      malformed.push(String(document.id || document.storageKey));
      continue;
    }
    try {
      const encryptedPath = path.join(dir, String(document.storageKey) + '.enc');
      const stat = fs.statSync(encryptedPath);
      if (!stat.isFile() || stat.size <= 0) {
        missing.push(String(document.id || document.storageKey));
        continue;
      }
      if (document.storageSha256) {
        const encryptedPayload = fs.readFileSync(encryptedPath);
        const actualSha256 = sha256(encryptedPayload);
        if (actualSha256 !== String(document.storageSha256)) malformed.push(String(document.id || document.storageKey));
      }
    } catch {
      missing.push(String(document.id || document.storageKey));
    }
  }
  return { valid: missing.length === 0 && malformed.length === 0, checked, missing, malformed };
}

async function pgCountsAndFinancials(): Promise<{ counts: Record<string, number>; financials: Record<string, number>; cmsSettings: Record<string, unknown>; notificationSettings: Record<string, unknown> }> {
  const pool = getPostgresPool();
  const tables: Record<string, string> = {
    users: 'users', sessions: 'sessions', leads: 'leads', crmDeals: 'crm_deals',
    proposals: 'proposals', clients: 'clients', projects: 'projects', tasks: 'tasks',
    timeLogs: 'time_logs', invoices: 'invoices', expenses: 'expenses', approvals: 'approvals',
    vendors: 'vendors', documents: 'documents', notifications: 'notifications', auditLogs: 'audit_logs', cmsServices: 'cms_services', cmsProjects: 'cms_projects', cmsTestimonials: 'cms_testimonials'
  };
  const counts: Record<string, number> = {};
  for (const [source, table] of Object.entries(tables)) {
    const result = await pool.query<{ count: string }>('SELECT COUNT(*)::bigint AS count FROM ' + table);
    counts[source] = Number(result.rows[0].count);
  }

  const result = await pool.query<{
    proposal_subtotal: string; proposal_total: string; invoice_total: string;
    invoice_amount_paid: string; invoice_balance_due: string; expenses_total: string;
    pipeline_value: string;
  }>(`
    SELECT
      (SELECT COALESCE(SUM(subtotal),0) FROM proposals) AS proposal_subtotal,
      (SELECT COALESCE(SUM(total),0) FROM proposals) AS proposal_total,
      (SELECT COALESCE(SUM(total),0) FROM invoices) AS invoice_total,
      (SELECT COALESCE(SUM(amount_paid),0) FROM invoices) AS invoice_amount_paid,
      (SELECT COALESCE(SUM(balance_due),0) FROM invoices) AS invoice_balance_due,
      (SELECT COALESCE(SUM(amount),0) FROM expenses) AS expenses_total,
      (SELECT COALESCE(SUM(value),0) FROM crm_deals) AS pipeline_value
  `);
  const row = result.rows[0];
  const cmsResult = await pool.query<{ key: string; value: unknown }>(
    'SELECT key, value FROM cms_settings ORDER BY key'
  );
  const pgCmsSettings: Record<string, unknown> = {};
  for (const item of cmsResult.rows) pgCmsSettings[item.key] = item.value;

  const notificationResult = await pool.query<{
    target_email: string | null;
    formspree_endpoint: string | null;
    telegram_chat_id: string | null;
    is_email_active: boolean;
    is_telegram_active: boolean;
  }>(
    `SELECT target_email, formspree_endpoint, telegram_chat_id, is_email_active,
            is_telegram_active
       FROM notification_settings WHERE id = 1`
  );
  const notificationRow = notificationResult.rows[0];
  return {
    counts,
    financials: {
      proposalSubtotal: Number(row.proposal_subtotal),
      proposalTotal: Number(row.proposal_total),
      invoiceTotal: Number(row.invoice_total),
      invoiceAmountPaid: Number(row.invoice_amount_paid),
      invoiceBalanceDue: Number(row.invoice_balance_due),
      expensesTotal: Number(row.expenses_total),
      pipelineValue: Number(row.pipeline_value)
    },
    cmsSettings: pgCmsSettings,
    notificationSettings: notificationRow ? {
      targetEmail: notificationRow.target_email,
      formspreeEndpoint: notificationRow.formspree_endpoint,
      telegramChatId: notificationRow.telegram_chat_id,
      isEmailActive: notificationRow.is_email_active,
      isTelegramActive: notificationRow.is_telegram_active,
      hasTelegramToken: Boolean(process.env.KAPITECH_TELEGRAM_BOT_TOKEN)
    } : {}
  };
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
    'notifications','auditLogs','cmsServices','cmsProjects','cmsTestimonials'
  ];
  for (const key of keys) localCounts[key] = count(db, key);

  const duplicates: Record<string, string[]> = {};
  for (const key of keys) {
    const ids = duplicateIds(db, key);
    if (ids.length) duplicates[key] = ids;
  }

  const auditChain = verifyAuditLogChain(db);
  const privateDocuments = verifyPrivateDocuments(db);

  const sourceCmsSettings = db.cmsSettings && typeof db.cmsSettings === 'object' ? { ...db.cmsSettings } : {};
  delete sourceCmsSettings.updatedAt;
  const sourceNotification = db.notificationSettings || {};
  const notificationSource = {
    targetEmail: sourceNotification.targetEmail || null,
    formspreeEndpoint: sourceNotification.formspreeEndpoint || null,
    telegramChatId: sourceNotification.telegramChatId || null,
    isEmailActive: Boolean(sourceNotification.isEmailActive),
    isTelegramActive: Boolean(sourceNotification.isTelegramActive),
    hasTelegramToken: Boolean(process.env.KAPITECH_TELEGRAM_BOT_TOKEN)
  };

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
  await pool.query('SELECT 1');
  await pool.query(
    'INSERT INTO migration_runs (id, source_kind, source_sha256, started_at, status, report) VALUES ($1,$2,$3,NOW(),$4,$5)',
    [runId, 'encrypted-json', sourceSha256, 'running', JSON.stringify({ localCounts, financials, duplicates, brokenReferences })]
  );

  try {
    const postgresResult = await pgCountsAndFinancials();
    const postgresCounts = postgresResult.counts;
    const financialMismatches = Object.fromEntries(
      Object.keys(financials)
        .filter(key => Math.abs(financials[key as keyof typeof financials] - postgresResult.financials[key]) > 0.005)
        .map(key => [key, { json: financials[key as keyof typeof financials], postgres: postgresResult.financials[key] }])
    );
    const cmsSettingsMismatches = Object.keys({ ...sourceCmsSettings, ...postgresResult.cmsSettings })
      .filter(key => JSON.stringify(sourceCmsSettings[key]) !== JSON.stringify(postgresResult.cmsSettings[key]))
      .map(key => [key, { json: sourceCmsSettings[key], postgres: postgresResult.cmsSettings[key] }]);
    const notificationMismatches = Object.keys(notificationSource)
      .filter(key => notificationSource[key as keyof typeof notificationSource] !== postgresResult.notificationSettings[key])
      .map(key => key === 'hasTelegramToken' ? key : [key, { json: notificationSource[key as keyof typeof notificationSource], postgres: postgresResult.notificationSettings[key] }]);

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
      countParity: Object.keys(countMismatches).length === 0,
      financialParity: Object.keys(financialMismatches).length === 0,
      cmsSettingsParity: cmsSettingsMismatches.length === 0,
      notificationSettingsParity: notificationMismatches.length === 0,
      auditChainIntegrity: auditChain.valid,
      privateDocumentIntegrity: privateDocuments.valid
    };

    const reconciliationPass = checks.countParity && checks.financialParity;
    const status = reconciliationPass && Object.values(checks).every(Boolean) ? 'succeeded' : 'failed';
    const report = {
      runId,
      sourceSha256,
      checks,
      localCounts,
      postgresCounts,
      countMismatches,
      financialMismatches,
      cmsSettingsMismatches,
      notificationMismatches,
      auditChain,
      privateDocuments,
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
