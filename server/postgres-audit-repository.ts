import crypto from 'node:crypto';
import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;

export interface AuditEntry {
  action: string;
  actor: string;
  actorRole: string;
  actorUserId?: string;
  ip?: string;
  userAgent?: string;
  details: string;
  severity?: 'info' | 'warning' | 'critical';
}

function hashLog(input: Record<string, any>): string {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

export class PostgresAuditRepository {
  async append(entry: AuditEntry): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(91827364)');

      const previous = await client.query<Row>(
        'SELECT hash FROM audit_logs ORDER BY timestamp DESC, id DESC LIMIT 1 FOR UPDATE'
      );
      const previousHash = previous.rows[0]?.hash || 'GENESIS';
      const id = 'log_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
      const timestamp = new Date().toISOString();

      const normalized = {
        id,
        timestamp,
        action: entry.action,
        actor: entry.actor || 'anonymous',
        actorRole: entry.actorRole || 'visitor',
        ip: entry.ip || '127.0.0.1',
        userAgent: entry.userAgent || 'unknown',
        details: entry.details || '',
        severity: entry.severity || 'info',
        prevHash: previousHash
      };

      const hash = hashLog(normalized);
      const result = await client.query<Row>(
        'INSERT INTO audit_logs ' +
        '(id,timestamp,action,actor,actor_role,actor_user_id,ip,user_agent,details,severity,prev_hash,hash) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
        [
          id,
          timestamp,
          normalized.action,
          normalized.actor,
          normalized.actorRole,
          entry.actorUserId || null,
          normalized.ip,
          normalized.userAgent,
          normalized.details,
          normalized.severity,
          previousHash,
          hash
        ]
      );

      return result.rows[0];
    });
  }

  async list(limit = 100): Promise<Record<string, any>[]> {
    const bounded = Math.min(500, Math.max(1, Math.floor(limit)));
    const result = await getPostgresPool().query<Row>(
      'SELECT id,timestamp,action,actor,actor_role,actor_user_id,ip,user_agent,details,severity,prev_hash,hash ' +
      'FROM audit_logs ORDER BY timestamp DESC,id DESC LIMIT $1',
      [bounded]
    );
    return result.rows;
  }

  async verifyChain(): Promise<{ valid: boolean; checked: number; brokenAt?: string }> {
    const result = await getPostgresPool().query<Row>(
      "SELECT id,to_char(timestamp AT TIME ZONE 'UTC','YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') AS timestamp," +
      "action,actor,actor_role,actor_user_id,ip::text AS ip,user_agent,details,severity,prev_hash,hash " +
      "FROM audit_logs ORDER BY timestamp ASC,id ASC"
    );

    let previousHash = 'GENESIS';
    let checked = 0;

    for (const row of result.rows) {
      const normalized = {
        id: row.id,
        timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
        action: row.action,
        actor: row.actor,
        actorRole: row.actor_role,
        ip: row.ip,
        userAgent: row.user_agent,
        details: row.details,
        severity: row.severity,
        prevHash: row.prev_hash || previousHash
      };
      const expectedHash = hashLog(normalized);

      if ((row.prev_hash || 'GENESIS') !== previousHash || row.hash !== expectedHash) {
        return { valid: false, checked, brokenAt: String(row.id) };
      }

      previousHash = expectedHash;
      checked += 1;
    }

    return { valid: true, checked };
  }
}

export const postgresAuditRepository = new PostgresAuditRepository();
