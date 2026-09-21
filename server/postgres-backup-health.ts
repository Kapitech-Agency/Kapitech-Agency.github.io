import { getDataSourceMode } from './data-source.ts';

export type PostgresBackupHealth = {
  configured: boolean;
  provider: string;
  latestBackupAt: string | null;
  latestBackupAgeMinutes: number | null;
  backupFresh: boolean;
  integrity: {
    valid: boolean;
    checkedAt: string;
    latestBackupAt: string | null;
    restoreVerifiedAt: string | null;
    restoreVerified: boolean;
    reason?: string;
  };
  rpoMinutes: number;
  rtoMinutes: number;
  retentionDays: number;
};

function readIsoEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function readPositiveInt(name: string, fallback: number): number {
  const value = Number(process.env[name] || fallback);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

/**
 * PostgreSQL backup/DR is intentionally provider-driven.
 *
 * The AMS runtime must not assume that pg_dump or durable filesystem storage is
 * available (for example on serverless deployments). A managed PostgreSQL
 * provider, scheduled ops job, or backup service must publish these health
 * values into the deployment environment.
 */
export function getPostgresBackupHealth(): PostgresBackupHealth {
  if (getDataSourceMode() !== 'postgres') {
    return {
      configured: false,
      provider: 'json-local',
      latestBackupAt: null,
      latestBackupAgeMinutes: null,
      backupFresh: false,
      integrity: {
        valid: false,
        checkedAt: new Date().toISOString(),
        latestBackupAt: null,
        restoreVerifiedAt: null,
        restoreVerified: false,
        reason: 'PostgreSQL backup health is only applicable when KAPITECH_DATA_SOURCE=postgres.'
      },
      rpoMinutes: readPositiveInt('KAPITECH_POSTGRES_BACKUP_RPO_MINUTES', 15),
      rtoMinutes: readPositiveInt('KAPITECH_POSTGRES_BACKUP_RTO_MINUTES', 60),
      retentionDays: readPositiveInt('KAPITECH_POSTGRES_BACKUP_RETENTION_DAYS', 35)
    };
  }

  const provider = process.env.KAPITECH_POSTGRES_BACKUP_PROVIDER?.trim() || '';
  const latestBackupAt = readIsoEnv('KAPITECH_POSTGRES_BACKUP_LATEST_AT');
  const restoreVerifiedAt = readIsoEnv('KAPITECH_POSTGRES_BACKUP_RESTORE_VERIFIED_AT');
  const now = Date.now();
  const ageMs = latestBackupAt ? Math.max(0, now - new Date(latestBackupAt).getTime()) : null;
  const rpoMinutes = readPositiveInt('KAPITECH_POSTGRES_BACKUP_RPO_MINUTES', 15);
  const rtoMinutes = readPositiveInt('KAPITECH_POSTGRES_BACKUP_RTO_MINUTES', 60);
  const retentionDays = readPositiveInt('KAPITECH_POSTGRES_BACKUP_RETENTION_DAYS', 35);
  const backupFresh = ageMs !== null && ageMs <= rpoMinutes * 60 * 1000;
  const restoreVerified = restoreVerifiedAt !== null;

  let reason: string | undefined;
  if (!provider) reason = 'No PostgreSQL backup provider is configured.';
  else if (!latestBackupAt) reason = 'Backup provider is configured but no successful backup timestamp is published.';
  else if (!backupFresh) reason = 'The latest reported PostgreSQL backup is outside the configured RPO.';
  else if (!restoreVerified) reason = 'A successful restore rehearsal has not been reported.';

  return {
    configured: Boolean(provider && latestBackupAt && backupFresh && restoreVerified),
    provider: provider || 'unconfigured',
    latestBackupAt,
    latestBackupAgeMinutes: ageMs === null ? null : Math.round(ageMs / 60000),
    backupFresh,
    integrity: {
      valid: Boolean(provider && latestBackupAt && backupFresh),
      checkedAt: new Date().toISOString(),
      latestBackupAt,
      restoreVerifiedAt,
      restoreVerified,
      ...(reason ? { reason } : {})
    },
    rpoMinutes,
    rtoMinutes,
    retentionDays
  };
}
