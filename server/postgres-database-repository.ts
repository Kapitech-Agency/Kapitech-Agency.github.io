import type { PoolClient } from 'pg';
import type { DatabaseSchema, StoredSession, StoredUser } from './db.ts';
import { getPostgresPool } from './postgres.ts';
import { PostgresAuthRepository } from './postgres-repository.ts';

export type PostgresRepository = {
  auth: PostgresAuthRepository;
  loadDatabase(): Promise<DatabaseSchema>;
};

const iso = (value: Date | string | null): string => value instanceof Date ? value.toISOString() : value ? new Date(value).toISOString() : '';

function mapUser(row: any): StoredUser {
  return {
    id: row.id, name: row.name, username: row.username, email: row.email,
    passwordHash: row.password_hash, salt: row.salt, passwordAlgorithm: row.password_algorithm,
    role: row.role, stakeholderType: row.stakeholder_type, permissions: row.permissions,
    mfaEnabled: row.mfa_enabled, mfaSecret: row.mfa_secret ?? undefined,
    mfaPendingSecret: row.mfa_pending_secret ?? undefined,
    mfaPendingSecretCreatedAt: row.mfa_pending_secret_created_at ? iso(row.mfa_pending_secret_created_at) : undefined,
    mfaRecoveryCodeHashes: Array.isArray(row.mfa_recovery_code_hashes) ? row.mfa_recovery_code_hashes : [],
    division: row.division, status: row.status, lastLogin: iso(row.last_login), createdAt: iso(row.created_at)
  };
}
function mapSession(row: any): StoredSession {
  return { tokenHash: row.token_hash, userId: row.user_id, createdAt: iso(row.created_at),
    lastActivityAt: iso(row.last_activity_at), expiresAt: new Date(row.expires_at).getTime(),
    rememberMe: row.remember_me, ip: row.ip ?? '', userAgent: row.user_agent, kind: row.kind, mfaFailedAttempts: row.mfa_failed_attempts };
}
async function rows(client: PoolClient, table: string): Promise<any[]> {
  const allowed = new Set(['users','sessions','leads','crm_deals','clients','projects','proposals','tasks','time_logs','invoices','expenses','approvals','vendors','documents','notifications','cms_services','cms_projects','cms_testimonials','audit_logs']);
  if (!allowed.has(table)) throw new Error('Unsupported PostgreSQL repository table.');
  const result = await client.query('SELECT * FROM ' + table);
  return result.rows;
}
function arrayMap(rows: any[], mapper: (row:any)=>any) { return rows.map(mapper); }

export class PostgresDatabaseRepository implements PostgresRepository {
  readonly auth = new PostgresAuthRepository();
  async loadDatabase(): Promise<DatabaseSchema> {
    const client = await getPostgresPool().connect();
    try {
      const [users,sessions,leads,crmDeals,clients,projects,proposals,tasks,timeLogs,invoices,expenses,approvals,vendors,documents,notifications,cmsServices,cmsProjects,cmsTestimonials,auditLogs] =
        await Promise.all(['users','sessions','leads','crm_deals','clients','projects','proposals','tasks','time_logs','invoices','expenses','approvals','vendors','documents','notifications','cms_services','cms_projects','cms_testimonials','audit_logs'].map(t => rows(client,t)));
      const db = {
        users: arrayMap(users,mapUser), sessions: arrayMap(sessions,mapSession), leads,
        crmDeals, clients, projects, tasks, timeLogs, invoices, expenses, approvals, vendors, documents,
        notifications, cmsServices, cmsProjects, cmsTestimonials, cmsSettings:{}, auditLogs,
        notificationSettings: {targetEmail:'',formspreeEndpoint:'',telegramBotToken:'',telegramChatId:'',isEmailActive:false,isTelegramActive:false,updatedAt:''}
      } as DatabaseSchema;
      return db;
    } finally { client.release(); }
  }
}
export const postgresDatabaseRepository = new PostgresDatabaseRepository();
