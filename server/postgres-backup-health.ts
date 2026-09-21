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
  const latestBackupAtMs = latestBackupAt ? new Date(latestBackupAt).getTime() : null;
  const ageMs = latestBackupAtMs !== null && Number.isFinite(latestBackupAtMs)
    ? now - latestBackupAtMs
    : null;
  const rpoMinutes = readPositiveInt('KAPITECH_POSTGRES_BACKUP_RPO_MINUTES', 15);
  const rtoMinutes = readPositiveInt('KAPITECH_POSTGRES_BACKUP_RTO_MINUTES', 60);
  const retentionDays = readPositiveInt('KAPITECH_POSTGRES_BACKUP_RETENTION_DAYS', 35);
  const backupFresh = ageMs !== null && ageMs >= 0 && ageMs <= rpoMinutes * 60 * 1000;
  const restoreVerifiedAtMs = restoreVerifiedAt ? new Date(restoreVerifiedAt).getTime() : null;
  const restoreMaxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
  const restoreVerificationFresh = restoreVerifiedAtMs !== null
    && Number.isFinite(restoreVerifiedAtMs)
    && restoreVerifiedAtMs <= now
    && now - restoreVerifiedAtMs <= restoreMaxAgeMs;
  const restoreVerified = restoreVerificationFresh;

  let reason: string | undefined;
  if (!provider) reason = 'No PostgreSQL backup provider is configured.';
  else if (!latestBackupAt) reason = 'Backup provider is configured but no successful backup timestamp is published.';
  else if (!backupFresh) reason = 'The latest reported PostgreSQL backup is outside the configured RPO.';
  else if (!restoreVerifiedAt) reason = 'A successful restore rehearsal has not been reported.';
  else if (!restoreVerificationFresh) reason = 'The latest restore rehearsal is older than the configured retention window.';

  return {
    configured: Boolean(provider && latestBackupAt && backupFresh && restoreVerified),
    provider: provider || 'unconfigured',
    latestBackupAt,
    latestBackupAgeMinutes: ageMs === null ? null : Math.round(ageMs / 60000),
    backupFresh,
    integrity: {
      valid: Boolean(provider && latestBackupAt && backupFresh && restoreVerificationFresh),
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
