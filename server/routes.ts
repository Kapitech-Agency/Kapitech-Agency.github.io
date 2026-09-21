import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { 
  getDatabase,
  saveDatabase,
  createDatabaseBackup,
  listDatabaseBackups,
  verifyDatabaseBackupIntegrity,
  recordAuditLog,
  hashSessionToken,
  StoredUser,
  verifyAuditLogChain,
  isDataEncryptionEnabled
} from './db';
import { 
  authenticate,
  validateCsrf,
  setCsrfCookie,
  clearCsrfCookie,
  requireAuth,
  requirePermission,
  createSession,
  revokeSession,
  revokeAllUserSessions,
  verifyPasswordForUser,
  preparePassword,
  checkLockout,
  recordFailedLogin,
  clearLockout,
  AuthenticatedRequest,
  rateLimitPublic,
  rateLimitAuthenticated,
  requireAnyPermission,
  requireMaster,
  generateMfaSecret,
  buildMfaOtpUri,
  verifyTotpCode,
  generateMfaRecoveryCodes,
  hashMfaRecoveryCode,
  verifyMfaRecoveryCode,
  issueMfaChallenge,
  getMfaChallenge,
  incrementMfaChallengeFailures,
  consumeMfaChallenge,
  setMfaChallengeCookie,
  clearMfaChallengeCookie
} from './auth';
import { getDataSourceMode } from './data-source.ts';
import { loadApplicationDatabase } from './application-data-repository.ts';
import { postgresAuthRepository } from './postgres-repository.ts';
import { postgresClientRepository } from './postgres-client-repository.ts';
import { postgresProjectRepository, ProjectConcurrencyError } from './postgres-project-repository.ts';
import { postgresVendorRepository } from './postgres-vendor-repository.ts';
import { postgresLeadRepository } from './postgres-lead-repository.ts';
import { postgresCrmDealRepository } from './postgres-crm-deal-repository.ts';
import { postgresProposalRepository } from './postgres-proposal-repository.ts';
import { postgresTaskRepository } from './postgres-task-repository.ts';
import { postgresTimeLogRepository } from './postgres-time-log-repository.ts';
import { postgresInvoiceRepository } from './postgres-invoice-repository.ts';
import { postgresExpenseRepository, ExpenseImmutableError, ExpenseNotFoundError, ExpenseVersionConflictError, ExpenseProjectNotFoundError } from './postgres-expense-repository.ts';


const ROLE_POLICIES: Record<string, {
  stakeholderType: StoredUser['stakeholderType'];
  division: StoredUser['division'];
  permissions: StoredUser['permissions'];
}> = {
  'Stakeholder Executive': {
    stakeholderType: 'Executive',
    division: 'Management',
    permissions: {
      canViewFinancials: true, canManageInvoices: true, canApproveBudgets: true, canManageCrm: true,
      canManageProjects: true, canManageKanbanTasks: false, canManageClients: true, canManageVendors: true,
      canManageCmsContent: false, canAccessServerAndApi: false, canRunDataMigration: false,
      canViewSecurityAuditLogs: true, canManageAdminAccounts: false
    }
  },
  'Financial Officer': {
    stakeholderType: 'Operations',
    division: 'Finance',
    permissions: {
      canViewFinancials: true, canManageInvoices: true, canApproveBudgets: true, canManageCrm: false,
      canManageProjects: false, canManageKanbanTasks: false, canManageClients: true, canManageVendors: true,
      canManageCmsContent: false, canAccessServerAndApi: false, canRunDataMigration: false,
      canViewSecurityAuditLogs: false, canManageAdminAccounts: false
    }
  },
  'Tier 2: Project Manager (PM)': {
    stakeholderType: 'Project_Manager',
    division: 'Operations',
    permissions: {
      canViewFinancials: false, canManageInvoices: false, canApproveBudgets: false, canManageCrm: true,
      canManageProjects: true, canManageKanbanTasks: true, canManageClients: true, canManageVendors: true,
      canManageCmsContent: false, canAccessServerAndApi: false, canRunDataMigration: false,
      canViewSecurityAuditLogs: false, canManageAdminAccounts: false
    }
  },
  'Tier 3: Operational Staff': {
    stakeholderType: 'Operations',
    division: 'Operations',
    permissions: {
      canViewFinancials: false, canManageInvoices: false, canApproveBudgets: false, canManageCrm: false,
      canManageProjects: true, canManageKanbanTasks: true, canManageClients: false, canManageVendors: false,
      canManageCmsContent: false, canAccessServerAndApi: false, canRunDataMigration: false,
      canViewSecurityAuditLogs: false, canManageAdminAccounts: false
    }
  },
  'Teknisi IT / Systems Engineer': {
    stakeholderType: 'IT_Technical',
    division: 'Engineering',
    permissions: {
      canViewFinancials: false, canManageInvoices: false, canApproveBudgets: false, canManageCrm: false,
      canManageProjects: false, canManageKanbanTasks: false, canManageClients: false, canManageVendors: false,
      canManageCmsContent: false, canAccessServerAndApi: true, canRunDataMigration: true,
      canViewSecurityAuditLogs: true, canManageAdminAccounts: false
    }
  }
};

const MAX_PUBLIC_TEXT = 4000;
const MAX_INTERNAL_TEXT = 5000;
const CRM_STAGES = ['new', 'contacted', 'proposal', 'negotiation', 'won', 'lost'] as const;
const DEAL_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

function cleanText(value: unknown, max = MAX_INTERNAL_TEXT): string {
  return String(value ?? '').trim().slice(0, max);
}

function cleanOptionalUrl(value: unknown): string {
  const candidate = cleanText(value, 2000);
  if (!candidate) return '';
  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function pickFields<T extends Record<string, unknown>>(source: Record<string, unknown>, fields: readonly string[]): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(source, field)) result[field] = source[field];
  }
  return result as Partial<T>;
}

function normalizeProbability(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(1, Math.max(0, numeric > 1 ? numeric / 100 : numeric));
}

const MAX_MONEY = 100_000_000_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidEmail(value: unknown): boolean {
  const email = String(value ?? '').trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

function isValidDate(value: unknown): boolean {
  if (!ISO_DATE_PATTERN.test(String(value ?? ''))) return false;
  const parsed = new Date(String(value) + 'T00:00:00Z');
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === String(value);
}

function normalizeNumber(value: unknown, min: number, max: number, fallback?: number): number | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < min || numeric > max) return fallback ?? null;
  return Math.round(numeric * 100) / 100;
}

function normalizeStringArray(value: unknown, maxItems = 50, maxLength = 160): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).map(item => cleanText(item, maxLength)).filter(Boolean);
}

function getInvoicePaidAmount(invoice: any): number {
  const payments = Array.isArray(invoice?.payments) ? invoice.payments : [];
  if (payments.length > 0) {
    return payments.reduce((sum: number, payment: any) => sum + (Number(payment?.amount) || 0), 0);
  }
  return Math.max(0, Number(invoice?.amountPaid) || 0);
}

function getInvoiceBalanceDue(invoice: any): number {
  const total = Math.max(0, Number(invoice?.total) || 0);
  return Math.max(0, total - getInvoicePaidAmount(invoice));
}

function pushNotification(
  db: ReturnType<typeof getDatabase>,
  input: {
    title: string;
    message: string;
    type: 'lead' | 'finance' | 'approval' | 'project' | 'system';
    severity?: 'info' | 'warning' | 'danger' | 'critical';
    linkUrl?: string;
    recipientUserId?: string;
  }
): void {
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    title: cleanText(input.title, 180),
    message: cleanText(input.message, 1000),
    type: input.type,
    severity: input.severity || 'info',
    read: false,
    readBy: [],
    recipientUserId: input.recipientUserId || undefined,
    linkUrl: input.linkUrl || '/admin/dashboard',
    timestamp: new Date().toISOString()
  });
  db.notifications = db.notifications.slice(0, 500);
}

export const apiRouter = Router();

// Apply auth header checking on all API requests
apiRouter.use(authenticate);
apiRouter.use(validateCsrf);
apiRouter.use((req: AuthenticatedRequest, res: Response, next) => {
  if (!req.user) return next();
  return rateLimitAuthenticated(300, 60 * 1000)(req, res, next);
});

// ----------------------------------------------------
// 1. AUTHENTICATION & SESSION MANAGEMENT
// ----------------------------------------------------

apiRouter.post('/auth/login', rateLimitPublic(10, 15 * 60 * 1000), async (req: Request, res: Response): Promise<void> => {
  const { identifier, password, rememberMe } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'unknown';

  if (!identifier || !password) {
    res.status(400).json({ success: false, error: 'Username/email and password are required.' });
    return;
  }

  const cleanIdentifier = String(identifier).trim().toLowerCase();
  const lockout = checkLockout(cleanIdentifier, ip);
  if (lockout.isLocked) {
    res.status(429).json({
      success: false,
      error: `Security Lockout: Too many failed login attempts. Please try again in ${lockout.remainingSeconds}s.`
    });
    return;
  }

  let db;
  let user: StoredUser | null;
  try {
    if (getDataSourceMode() === 'postgres') {
      user = await postgresAuthRepository.findUserByIdentifier(cleanIdentifier);
    } else {
      db = getDatabase();
      user = db.users.find(u => u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier) || null;
    }
  } catch (error) {
    console.error('[Auth] Failed to initialize authentication database:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('ADMIN_INITIAL_PASSWORD')) {
      res.status(503).json({
        success: false,
        error: 'Authentication is not initialized. Configure ADMIN_INITIAL_PASSWORD in the hosting environment, then restart the application.'
      });
      return;
    }
    res.status(503).json({
      success: false,
      error: 'Authentication service is temporarily unavailable. Check the server runtime logs.'
    });
    return;
  }

  if (!user || user.status === 'suspended') {
    recordFailedLogin(cleanIdentifier, ip);
    const lockoutState = checkLockout(cleanIdentifier, ip);
    recordAuditLog({
      action: 'LOGIN_FAILED',
      actor: cleanIdentifier,
      actorRole: 'anonymous',
      ip,
      userAgent,
      details: 'Failed login attempt: Account not found or suspended.',
      severity: 'warning'
    });
    if (lockoutState.isLocked) {
      res.status(429).json({
        success: false,
        error: `Security Lockout: Too many failed login attempts. Please try again in ${lockoutState.remainingSeconds}s.`,
        remainingSeconds: lockoutState.remainingSeconds
      });
      return;
    }
    res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    return;
  }

  if (!verifyPasswordForUser(password, user)) {
    recordFailedLogin(cleanIdentifier, ip);
    const lockoutState = checkLockout(cleanIdentifier, ip);
    recordAuditLog({
      action: 'LOGIN_FAILED',
      actor: user.username,
      actorRole: user.role,
      ip,
      userAgent,
      details: 'Failed login attempt: Incorrect password.',
      severity: 'warning'
    });
    if (lockoutState.isLocked) {
      res.status(429).json({
        success: false,
        error: `Security Lockout: Too many failed login attempts. Please try again in ${lockoutState.remainingSeconds}s.`,
        remainingSeconds: lockoutState.remainingSeconds
      });
      return;
    }
    res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    return;
  }

  // Password verified. Complete legacy hash migration before deciding whether a second factor is required.
  try {
    clearLockout(cleanIdentifier, ip);

    if ((user.passwordAlgorithm || 'pbkdf2-sha512') !== 'scrypt-v1') {
      const prepared = preparePassword(password);
      user.salt = prepared.salt;
      user.passwordHash = prepared.passwordHash;
      user.passwordAlgorithm = prepared.passwordAlgorithm;
      if (getDataSourceMode() === 'postgres') await postgresAuthRepository.updateUserPassword(user.id, prepared.passwordHash, prepared.salt, prepared.passwordAlgorithm);
      else saveDatabase(db);
    }

    if (user.mfaEnabled) {
      if (!user.mfaSecret) {
        res.status(503).json({
          success: false,
          error: 'MFA is enabled but not configured correctly. Contact a Master administrator.'
        });
        return;
      }

      const challenge = await issueMfaChallenge(user.id, Boolean(rememberMe));
      setMfaChallengeCookie(res, challenge);
      setCsrfCookie(res);

      recordAuditLog({
        action: 'LOGIN_MFA_CHALLENGE',
        actor: user.username,
        actorRole: user.role,
        ip,
        userAgent,
        details: 'Password accepted; TOTP second factor is configured and required to complete sign-in.',
        severity: 'info'
      });

      res.json({
        success: true,
        requiresMfa: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mfaEnabled: true
        }
      });
      return;
    }

    const nowIso = new Date().toISOString();
    user.lastLogin = nowIso;
    if (getDataSourceMode() === 'postgres') await postgresAuthRepository.touchUserLastLogin(user.id, nowIso);
    else saveDatabase(db);
    const session = await createSession(user, ip, userAgent, Boolean(rememberMe));

    recordAuditLog({
      action: 'LOGIN_SUCCESS',
      actor: user.username,
      actorRole: user.role,
      ip,
      userAgent,
      details: `User ${user.username} authenticated successfully.`,
      severity: 'info'
    });

    const cookieMaxAge = rememberMe ? 24 * 3600 : 12 * 3600;
    const secureCookie = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
    res.append('Set-Cookie', `kapi_session=${session.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${cookieMaxAge};${secureCookie}`);
    setCsrfCookie(res);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        stakeholderType: user.stakeholderType,
        permissions: user.permissions,
        division: user.division,
        mfaEnabled: user.mfaEnabled,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('[Auth] Failed to create authenticated session:', error);
    res.status(503).json({
      success: false,
      error: 'Login could not be completed because the server session store is unavailable. Check the server runtime logs.'
    });
  }
});

apiRouter.post('/auth/mfa/verify', rateLimitPublic(10, 5 * 60 * 1000), async (req: Request, res: Response): Promise<void> => {
  const origin = req.get('origin');
  if (origin && origin !== `${req.protocol}://${req.get('host')}`) {
    res.status(403).json({ success: false, error: 'Security validation failed.' });
    return;
  }

  const challengeToken = req.headers.cookie
    ?.split(';')
    .map(part => part.trim())
    .find(part => part.startsWith('kapi_mfa_challenge='))
    ?.slice('kapi_mfa_challenge='.length) || '';
  const challenge = await getMfaChallenge(decodeURIComponent(challengeToken));
  if (!challenge) {
    clearMfaChallengeCookie(res);
    res.status(401).json({ success: false, error: 'MFA challenge expired. Please sign in again.' });
    return;
  }

  const db = getDataSourceMode() === 'json' ? getDatabase() : undefined;
  const user = getDataSourceMode() === 'postgres' ? await postgresAuthRepository.findUserById(challenge.userId) : db!.users.find(item => item.id === challenge.userId) || null;
  const code = String(req.body?.code || '').trim();
  const validTotp = Boolean(user?.mfaEnabled && user?.mfaSecret && verifyTotpCode(user.mfaSecret, code));
  const validRecovery = Boolean(user?.mfaEnabled && user && verifyMfaRecoveryCode(user, code));
  if (validRecovery && getDataSourceMode() === 'postgres' && user) {
    await postgresAuthRepository.updateUserMfa(user.id, { mfaEnabled: user.mfaEnabled, mfaSecret: user.mfaSecret || null, mfaPendingSecret: user.mfaPendingSecret || null, mfaPendingSecretCreatedAt: user.mfaPendingSecretCreatedAt || null, mfaRecoveryCodeHashes: user.mfaRecoveryCodeHashes || [] });
  }
  if (!user || user.status === 'suspended' || !user.mfaEnabled || (!validTotp && !validRecovery)) {
    const failedAttempts = await incrementMfaChallengeFailures(decodeURIComponent(challengeToken));
    if (failedAttempts >= 5) {
      clearMfaChallengeCookie(res);
    }
    recordAuditLog({
      action: 'MFA_VERIFY_FAILED',
      actor: user?.username || 'unknown',
      actorRole: user?.role || 'anonymous',
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: 'Invalid or unavailable MFA verification code during sign-in.',
      severity: 'warning'
    });
    res.status(401).json({ success: false, error: 'Invalid verification code.' });
    return;
  }

  await consumeMfaChallenge(decodeURIComponent(challengeToken));
  user.lastLogin = new Date().toISOString();
  if (getDataSourceMode() === 'postgres') await postgresAuthRepository.touchUserLastLogin(user.id, user.lastLogin);
  else saveDatabase(db!);

  const session = await createSession(user, req.ip || 'unknown', req.headers['user-agent'] || 'unknown', challenge.rememberMe);
  const cookieMaxAge = challenge.rememberMe ? 24 * 3600 : 12 * 3600;
  const secureCookie = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.append('Set-Cookie', `kapi_session=${session.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${cookieMaxAge};${secureCookie}`);
  clearMfaChallengeCookie(res);
  setCsrfCookie(res);

  recordAuditLog({
    action: 'LOGIN_SUCCESS',
    actor: user.username,
    actorRole: user.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `User ${user.username} authenticated successfully with MFA.`,
    severity: 'info'
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      stakeholderType: user.stakeholderType,
      permissions: user.permissions,
      division: user.division,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLogin
    }
  });
});

apiRouter.post('/auth/mfa/setup/start', requireAuth, rateLimitAuthenticated(5, 15 * 60 * 1000), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = req.user!;
  if (user.mfaEnabled) {
    res.status(409).json({ success: false, error: 'MFA is already enabled.' });
    return;
  }

  const db = getDataSourceMode() === 'json' ? getDatabase() : undefined;
  const current = getDataSourceMode() === 'postgres' ? await postgresAuthRepository.findUserById(user.id) : db!.users.find(item => item.id === user.id) || null;
  if (!current) {
    res.status(404).json({ success: false, error: 'Account not found.' });
    return;
  }

  const secret = generateMfaSecret();
  current.mfaPendingSecret = secret;
  current.mfaPendingSecretCreatedAt = new Date().toISOString();
  if (getDataSourceMode() === 'postgres') await postgresAuthRepository.updateUserMfa(current.id, { mfaEnabled: current.mfaEnabled, mfaSecret: current.mfaSecret || null, mfaPendingSecret: secret, mfaPendingSecretCreatedAt: current.mfaPendingSecretCreatedAt, mfaRecoveryCodeHashes: current.mfaRecoveryCodeHashes || [] });
  else saveDatabase(db!);

  res.json({
    success: true,
    secret,
    otpAuthUri: buildMfaOtpUri(current, secret)
  });
});

apiRouter.post('/auth/mfa/setup/verify', requireAuth, rateLimitAuthenticated(10, 15 * 60 * 1000), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const code = String(req.body?.code || '').trim();
  const db = getDataSourceMode() === 'json' ? getDatabase() : undefined;
  const user = getDataSourceMode() === 'postgres' ? await postgresAuthRepository.findUserById(req.user!.id) : db!.users.find(item => item.id === req.user!.id) || null;
  if (!user?.mfaPendingSecret) {
    res.status(409).json({ success: false, error: 'MFA setup has not been started.' });
    return;
  }

  const pendingCreatedAt = new Date(user.mfaPendingSecretCreatedAt || 0).getTime();
  if (!Number.isFinite(pendingCreatedAt) || pendingCreatedAt <= 0 || Date.now() - pendingCreatedAt > 10 * 60 * 1000) {
    user.mfaPendingSecret = undefined;
    user.mfaPendingSecretCreatedAt = undefined;
    if (getDataSourceMode() === 'postgres') await postgresAuthRepository.updateUserMfa(user.id, { mfaEnabled: user.mfaEnabled, mfaSecret: user.mfaSecret || null, mfaPendingSecret: null, mfaPendingSecretCreatedAt: null, mfaRecoveryCodeHashes: user.mfaRecoveryCodeHashes || [] });
    else saveDatabase(db!);
    res.status(410).json({ success: false, error: 'MFA setup expired. Start the setup again.' });
    return;
  }

  if (!verifyTotpCode(user.mfaPendingSecret, code)) {
    res.status(401).json({ success: false, error: 'Invalid verification code.' });
    return;
  }

  user.mfaSecret = user.mfaPendingSecret;
  user.mfaPendingSecret = undefined;
  user.mfaPendingSecretCreatedAt = undefined;
  user.mfaEnabled = true;
  const recoveryCodes = generateMfaRecoveryCodes(8);
  user.mfaRecoveryCodeHashes = recoveryCodes.map(hashMfaRecoveryCode);
  if (getDataSourceMode() === 'postgres') await postgresAuthRepository.updateUserMfa(user.id, { mfaEnabled: true, mfaSecret: user.mfaSecret || null, mfaPendingSecret: null, mfaPendingSecretCreatedAt: null, mfaRecoveryCodeHashes: user.mfaRecoveryCodeHashes });
  else saveDatabase(db!);
  await revokeAllUserSessions(user.id, req.sessionToken ? hashSessionToken(req.sessionToken) : undefined);

  recordAuditLog({
    action: 'MFA_ENABLED',
    actor: user.username,
    actorRole: user.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: 'TOTP multi-factor authentication enabled for the account.',
    severity: 'info'
  });

  res.json({ success: true, mfaEnabled: true, mfaRecoveryCodes: recoveryCodes, message: 'MFA enabled successfully. Store the recovery codes securely; each code can be used once.' });
});

apiRouter.post('/auth/mfa/disable', requireAuth, rateLimitAuthenticated(5, 15 * 60 * 1000), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const currentPassword = String(req.body?.currentPassword || '');
  const code = String(req.body?.code || '').trim();
  const db = getDataSourceMode() === 'json' ? getDatabase() : undefined;
  const user = getDataSourceMode() === 'postgres' ? await postgresAuthRepository.findUserById(req.user!.id) : db!.users.find(item => item.id === req.user!.id) || null;
  if (!user?.mfaEnabled || !user.mfaSecret) {
    res.status(409).json({ success: false, error: 'MFA is not enabled.' });
    return;
  }
  const validSecondFactor = verifyTotpCode(user.mfaSecret, code) || verifyMfaRecoveryCode(user, code);
  if (!verifyPasswordForUser(currentPassword, user) || !validSecondFactor) {
    res.status(401).json({ success: false, error: 'Current password and a valid TOTP or recovery code are required.' });
    return;
  }

  user.mfaEnabled = false;
  user.mfaSecret = undefined;
  user.mfaPendingSecret = undefined;
  user.mfaRecoveryCodeHashes = [];
  if (getDataSourceMode() === 'postgres') await postgresAuthRepository.updateUserMfa(user.id, { mfaEnabled: false, mfaSecret: null, mfaPendingSecret: null, mfaPendingSecretCreatedAt: null, mfaRecoveryCodeHashes: [] });
  else saveDatabase(db!);
  await revokeAllUserSessions(user.id);

  recordAuditLog({
    action: 'MFA_DISABLED',
    actor: user.username,
    actorRole: user.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: 'TOTP multi-factor authentication disabled for the account.',
    severity: 'warning'
  });

  const secureCookie = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.append('Set-Cookie', `kapi_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;${secureCookie}`);
  clearCsrfCookie(res);
  res.json({ success: true, mfaEnabled: false });
});

apiRouter.post('/auth/logout', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.sessionToken) {
    await revokeSession(req.sessionToken);
  }
  if (req.user) {
    recordAuditLog({
      action: 'LOGOUT',
      actor: req.user.username,
      actorRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `User ${req.user.username} logged out.`,
      severity: 'info'
    });
  }
  const secureCookie = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.append('Set-Cookie', `kapi_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;${secureCookie}`);
  clearCsrfCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      stakeholderType: user.stakeholderType,
      permissions: user.permissions,
      division: user.division,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLogin
    }
  });
});

apiRouter.post('/auth/change-password', requireAuth, rateLimitAuthenticated(10, 15 * 60 * 1000), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user!;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, error: 'Current password and new password are required.' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 128) {
    res.status(400).json({ success: false, error: 'New password must be 12 to 128 characters.' });
    return;
  }

  if (newPassword === currentPassword) {
    res.status(400).json({ success: false, error: 'New password must be different from the current password.' });
    return;
  }

  if (!verifyPasswordForUser(currentPassword, user)) {
    res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    return;
  }

  const db = getDataSourceMode() === 'json' ? getDatabase() : undefined;
  const dbUser = getDataSourceMode() === 'postgres' ? await postgresAuthRepository.findUserById(user.id) : db!.users.find(u => u.id === user.id) || null;
  if (dbUser) {
    const prepared = preparePassword(newPassword);
    dbUser.salt = prepared.salt;
    dbUser.passwordHash = prepared.passwordHash;
    dbUser.passwordAlgorithm = prepared.passwordAlgorithm;
    if (getDataSourceMode() === 'postgres') await postgresAuthRepository.updateUserPassword(user.id, prepared.passwordHash, prepared.salt, prepared.passwordAlgorithm);
    else saveDatabase(db!);
    if (req.sessionToken) {
      await revokeAllUserSessions(user.id, hashSessionToken(req.sessionToken));
    }

    recordAuditLog({
      action: 'PASSWORD_CHANGED',
      actor: user.username,
      actorRole: user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `User ${user.username} changed their password.`,
      severity: 'info'
    });
  }

  res.json({ success: true, message: 'Password updated successfully.' });
});

// Admin Account Management (Requires Master or canManageAdminAccounts permission)
apiRouter.post('/auth/verify-password', requireAuth, rateLimitAuthenticated(10, 15 * 60 * 1000), (req: AuthenticatedRequest, res: Response): void => {
  const { password } = req.body;
  const user = req.user!;
  if (!password || typeof password !== 'string') {
    res.status(400).json({ success: false, error: 'Password is required.' });
    return;
  }

  if (!verifyPasswordForUser(password, user)) {
    res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    return;
  }

  res.json({ success: true });
});

apiRouter.get('/auth/users', requireAuth, requireMaster, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const users = getDataSourceMode() === 'postgres' ? await postgresAuthRepository.listUsers() : getDatabase().users;
  const sanitizedUsers = users.map(u => ({
    id: u.id, name: u.name, username: u.username, email: u.email, role: u.role,
    stakeholderType: u.stakeholderType, permissions: u.permissions, division: u.division,
    mfaEnabled: u.mfaEnabled, status: u.status, lastLogin: u.lastLogin, createdAt: u.createdAt
  }));
  res.json({ success: true, users: sanitizedUsers });
});

apiRouter.post('/auth/users', requireAuth, requireMaster, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, username, email, password, role, division } = req.body;
  const requestedRole = String(role || 'Tier 3: Operational Staff').trim();
  const policy = ROLE_POLICIES[requestedRole];

  if (!policy) {
    res.status(400).json({ success: false, error: 'Unsupported account role.' });
    return;
  }
  if (!name || !username || !email || !password) {
    res.status(400).json({ success: false, error: 'Name, username, email, and password are required.' });
    return;
  }

  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    res.status(400).json({ success: false, error: 'Account password must be 12 to 128 characters.' });
    return;
  }

  const cleanName = cleanText(name, 160);
  const cleanUsername = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();
  const reservedUsernames = new Set(['admin', 'root', 'administrator', 'superuser', 'system']);

  if (!cleanName) {
    res.status(400).json({ success: false, error: 'Name is required.' });
    return;
  }
  if (!/^[a-z0-9][a-z0-9._-]{2,63}$/.test(cleanUsername) || reservedUsernames.has(cleanUsername)) {
    res.status(400).json({ success: false, error: 'Username must be 3 to 64 characters and use only lowercase letters, numbers, dots, underscores, or hyphens.' });
    return;
  }
  if (!isValidEmail(cleanEmail)) {
    res.status(400).json({ success: false, error: 'Invalid account email address.' });
    return;
  }

  const db = getDataSourceMode() === 'json' ? getDatabase() : undefined;
  const existing = getDataSourceMode() === 'postgres'
    ? await postgresAuthRepository.findUserByIdentifier(cleanUsername)
    : db!.users.find(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail) || null;
  if (existing || (getDataSourceMode() === 'postgres' && await postgresAuthRepository.findUserByIdentifier(cleanEmail))) {
    res.status(400).json({ success: false, error: 'Username or email already exists.' });
    return;
  }

  const prepared = preparePassword(password);
  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    name: cleanName,
    username: cleanUsername,
    email: cleanEmail,
    passwordHash: prepared.passwordHash,
    salt: prepared.salt,
    passwordAlgorithm: prepared.passwordAlgorithm,
    role: requestedRole,
    stakeholderType: policy.stakeholderType,
    permissions: policy.permissions,
    mfaEnabled: false,
    division: policy.division,
    status: 'active',
    lastLogin: '',
    createdAt: new Date().toISOString()
  };

  if (getDataSourceMode() === 'postgres') await postgresAuthRepository.createUser(newUser);
  else { db!.users.push(newUser); saveDatabase(db!); }

  recordAuditLog({
    action: 'ACCOUNT_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created admin user "${newUser.username}" (${newUser.role}).`,
    severity: 'info'
  });

  res.json({ success: true, user: { id: newUser.id, username: newUser.username } });
});

apiRouter.delete('/auth/users/:id', requireAuth, requireMaster, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = getDataSourceMode() === 'json' ? getDatabase() : undefined;
  const target = getDataSourceMode() === 'postgres'
    ? await postgresAuthRepository.findUserById(id)
    : db!.users.find(u => u.id === id) || null;

  if (!target) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  if (target.stakeholderType === 'Master' || target.username === 'admin') {
    res.status(403).json({ success: false, error: 'Cannot delete the Root Master Admin account.' });
    return;
  }

  if (getDataSourceMode() === 'postgres') {
    const deleted = await postgresAuthRepository.deleteUser(id);
    if (!deleted) {
      res.status(409).json({ success: false, error: 'User could not be deleted.' });
      return;
    }
    await postgresAuthRepository.deleteUserSessions(id);
  } else {
    db!.users = db!.users.filter(u => u.id !== id);
    db!.sessions = db!.sessions.filter(s => s.userId !== id);
    saveDatabase(db!);
  }

  recordAuditLog({
    action: 'ACCOUNT_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted user "${target.username}".`,
    severity: 'warning'
  });

  res.json({ success: true, message: 'User deleted.' });
});

apiRouter.put('/auth/users/:id', requireAuth, requireMaster, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = getDataSourceMode() === 'json' ? getDatabase() : undefined;
  const target = getDataSourceMode() === 'postgres'
    ? await postgresAuthRepository.findUserById(id)
    : db!.users.find(u => u.id === id) || null;

  if (!target) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  if (target.stakeholderType === 'Master' || target.username === 'admin') {
    res.status(403).json({ success: false, error: 'The Root Master Admin account cannot be modified here.' });
    return;
  }

  const body = req.body || {};
  const nextRole = body.role !== undefined ? String(body.role).trim() : target.role;
  const policy = ROLE_POLICIES[nextRole];
  if (!policy) {
    res.status(400).json({ success: false, error: 'Unsupported account role.' });
    return;
  }

  const nextName = body.name !== undefined ? String(body.name).trim() : target.name;
  if (!nextName || nextName.length > 160) {
    res.status(400).json({ success: false, error: 'Name is required and must be at most 160 characters.' });
    return;
  }

  if (body.division !== undefined && String(body.division) !== policy.division) {
    res.status(400).json({ success: false, error: 'Division is derived from the selected role and cannot be overridden.' });
    return;
  }

  const nextStatus = body.status !== undefined ? String(body.status) : target.status;
  if (!['active', 'suspended'].includes(nextStatus)) {
    res.status(400).json({ success: false, error: 'Invalid account status.' });
    return;
  }

  if (getDataSourceMode() === 'postgres') {
    const updated = await postgresAuthRepository.updateUserPolicy(
      target.id, nextName, nextRole, policy.stakeholderType, policy.permissions,
      policy.division, nextStatus as StoredUser['status']
    );
    if (!updated) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }
    target.name = updated.name;
    target.role = updated.role;
    target.stakeholderType = updated.stakeholderType;
    target.division = updated.division;
    target.permissions = updated.permissions;
    target.status = updated.status;
    if (target.status === 'suspended') await postgresAuthRepository.deleteUserSessions(target.id);
  } else {
    target.name = nextName;
    target.role = nextRole;
    target.stakeholderType = policy.stakeholderType;
    target.division = policy.division;
    target.permissions = policy.permissions;
    target.status = nextStatus as StoredUser['status'];
    if (target.status === 'suspended') db!.sessions = db!.sessions.filter(session => session.userId !== target.id);
    saveDatabase(db!);
  }

  recordAuditLog({
    action: 'ACCOUNT_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Updated account policy/status for user "${target.username}".`,
    severity: 'warning'
  });

  res.json({
    success: true,
    user: {
      id: target.id,
      username: target.username,
      role: target.role,
      stakeholderType: target.stakeholderType,
      division: target.division,
      status: target.status,
      permissions: target.permissions
    }
  });
});

// ----------------------------------------------------
// 2. LEADS & CONTACT SUBMISSIONS
// ----------------------------------------------------

apiRouter.post('/leads/submit', rateLimitPublic(10, 60 * 1000), async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, company, phone, services, budget, message, source, type, portfolioUrl, rateCard, specialty, website } = req.body;

  if (website) {
    res.status(400).json({ success: false, error: 'Submission rejected.' });
    return;
  }

  const origin = req.get('origin');
  if (origin && !/^https:\/\/(?:www\.)?kapitech\.id$/i.test(origin) && !/^https:\/\/ams\.kapitech\.id$/i.test(origin)) {
    res.status(403).json({ success: false, error: 'Submission origin is not allowed.' });
    return;
  }

  if (!fullName || !email || !message) {
    res.status(400).json({ success: false, error: 'Name, email, and message are required fields.' });
    return;
  }
  if (String(fullName).length > 160 || String(message).length > MAX_PUBLIC_TEXT || String(company || '').length > 200) {
    res.status(400).json({ success: false, error: 'Submission contains fields that exceed the allowed length.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    res.status(400).json({ success: false, error: 'Invalid email address.' });
    return;
  }

  const now = new Date().toISOString();
  const normalizedServices = normalizeStringArray(services, 20, 120);
  const newLead = {
    id: `lead_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    fullName: cleanText(fullName, 160),
    email: cleanEmail,
    company: cleanText(company, 200),
    phone: cleanText(phone, 80),
    services: normalizedServices,
    budget: cleanText(budget, 160),
    message: cleanText(message, MAX_PUBLIC_TEXT),
    status: 'new',
    source: cleanText(source || 'Website Form', 120),
    type: cleanText(type || 'inquiry', 80),
    portfolioUrl: cleanOptionalUrl(portfolioUrl),
    rateCard: cleanText(rateCard, 120),
    specialty: cleanText(specialty, 160),
    createdAt: now,
    updatedAt: now
  };

  if (getDataSourceMode() === 'postgres') {
    await postgresLeadRepository.create(newLead);
  } else {
    const db = getDatabase();
    db.leads.unshift(newLead);
    pushNotification(db, {
      title: 'New inbound lead',
      message: `${newLead.fullName}${newLead.company ? ` from ${newLead.company}` : ''} submitted a new inquiry.`,
      type: 'lead',
      severity: 'info',
      linkUrl: '/admin/inbox'
    });
    saveDatabase(db);

    const notif = db.notificationSettings;
    const telegramBotToken = process.env.KAPITECH_TELEGRAM_BOT_TOKEN || notif.telegramBotToken;
    const telegramChatId = process.env.KAPITECH_TELEGRAM_CHAT_ID || notif.telegramChatId;
    if (notif.isTelegramActive && telegramBotToken && telegramChatId) {
      const telegramText = `🔔 *New Kapitech Lead Received*\\n\\n` +
        `👤 *Name:* ${newLead.fullName}\\n` +
        `🏢 *Company:* ${newLead.company || '-'}\\n` +
        `✉️ *Email:* ${newLead.email}\\n` +
        `📞 *Phone:* ${newLead.phone || '-'}\\n` +
        `🛠️ *Services:* ${newLead.services.join(', ') || '-'}\\n` +
        `💰 *Budget:* ${newLead.budget || '-'}\\n\\n` +
        `💬 *Message:*\\n_${newLead.message.slice(0, 300)}_`;
      fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId, text: telegramText, parse_mode: 'Markdown' })
      }).catch(err => console.debug('Telegram notification dispatch failed:', err));
    }
  }

  recordAuditLog({
    action: 'LEAD_SUBMISSION',
    actor: cleanEmail,
    actorRole: 'public_lead',
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `New inbound lead received from ${newLead.fullName} (${cleanEmail}).`,
    severity: 'info'
  });

  res.json({ success: true, message: 'Inquiry submitted successfully.', id: newLead.id });
});

apiRouter.get('/leads', requireAuth, requirePermission('canManageCrm'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const leads = getDataSourceMode() === 'postgres' ? await postgresLeadRepository.list() : (await loadApplicationDatabase()).leads;
  res.json({ success: true, leads });
});

apiRouter.put('/leads/:id', requireAuth, requirePermission('canManageCrm'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body || {};
  const patch = pickFields(updates, [
    'fullName', 'email', 'company', 'phone', 'services', 'budget', 'message',
    'status', 'source', 'type', 'portfolioUrl', 'rateCard', 'specialty'
  ]);
  if (patch.email !== undefined) patch.email = cleanText(patch.email, 254).toLowerCase();
  if (patch.fullName !== undefined) patch.fullName = cleanText(patch.fullName, 160);
  if (patch.company !== undefined) patch.company = cleanText(patch.company, 200);
  if (patch.message !== undefined) patch.message = cleanText(patch.message, MAX_PUBLIC_TEXT);
  if (patch.services !== undefined) patch.services = Array.isArray(patch.services) ? patch.services.slice(0, 20).map((v) => cleanText(v, 120)) : [];
  if (patch.portfolioUrl !== undefined) patch.portfolioUrl = cleanOptionalUrl(patch.portfolioUrl);

  if (getDataSourceMode() === 'postgres') {
    const lead = await postgresLeadRepository.update(id, patch);
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }
    recordAuditLog({ action: 'LEAD_UPDATED', actor: req.user!.username, actorRole: req.user!.role, ip: req.ip, userAgent: req.headers['user-agent'] as string, details: `Updated lead ${lead.fullName} (status: ${lead.status}).`, severity: 'info' });
    res.json({ success: true, lead });
    return;
  }

  const db = getDatabase();
  const idx = db.leads.findIndex(l => l.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }
  db.leads[idx] = { ...db.leads[idx], ...patch, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  recordAuditLog({ action: 'LEAD_UPDATED', actor: req.user!.username, actorRole: req.user!.role, ip: req.ip, userAgent: req.headers['user-agent'] as string, details: `Updated lead ${db.leads[idx].fullName} (status: ${db.leads[idx].status}).`, severity: 'info' });
  res.json({ success: true, lead: db.leads[idx] });
});

apiRouter.delete('/leads/:id', requireAuth, requirePermission('canManageCrm'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (getDataSourceMode() === 'postgres') {
    const lead = await postgresLeadRepository.findById(id);
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }
    await postgresLeadRepository.delete(id);
    recordAuditLog({ action: 'LEAD_DELETED', actor: req.user!.username, actorRole: req.user!.role, ip: req.ip, userAgent: req.headers['user-agent'] as string, details: `Deleted lead ${lead.fullName} (${lead.email}).`, severity: 'warning' });
    res.json({ success: true, message: 'Lead removed.' });
    return;
  }

  const db = getDatabase();
  const lead = db.leads.find(l => l.id === id);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }
  db.leads = db.leads.filter(l => l.id !== id);
  saveDatabase(db);
  recordAuditLog({ action: 'LEAD_DELETED', actor: req.user!.username, actorRole: req.user!.role, ip: req.ip, userAgent: req.headers['user-agent'] as string, details: `Deleted lead ${lead.fullName} (${lead.email}).`, severity: 'warning' });
  res.json({ success: true, message: 'Lead removed.' });
});

apiRouter.post('/leads/:id/convert', requireAuth, requirePermission('canManageCrm'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (getDataSourceMode() === 'postgres') {
    const lead = await postgresLeadRepository.findById(id);
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead not found.' });
      return;
    }

    const existingClient = (await postgresClientRepository.list()).find((client) => client.email.toLowerCase() === String(lead.email).toLowerCase());
    const client = existingClient || {
      id: `cli_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      name: lead.fullName,
      company: lead.company || lead.fullName,
      email: lead.email,
      phone: lead.phone || '',
      location: '',
      industry: '',
      status: 'active',
      totalSpend: 0,
      projectsCount: 0,
      contactPersonRole: '',
      notes: `Converted from inbound lead on ${new Date().toLocaleDateString('id-ID')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const leadValue = Number(lead.dealValue ?? lead.value ?? 0);
    const deal = {
      id: `deal_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      title: `${lead.company || lead.fullName} - ${lead.services?.join(', ') || 'Digital Project'}`,
      clientName: lead.fullName,
      company: lead.company || lead.fullName,
      value: Number.isFinite(leadValue) && leadValue >= 0 ? leadValue : 0,
      stage: 'new',
      probability: normalizeProbability(lead.probability),
      owner: req.user!.name || req.user!.username,
      expectedCloseDate: /^\d{4}-\d{2}-\d{2}$/.test(String(lead.expectedCloseDate || '')) ? String(lead.expectedCloseDate) : '',
      notes: lead.message,
      priority: DEAL_PRIORITIES.includes(String(lead.priority) as any) ? String(lead.priority) : 'medium',
      source: lead.source || 'Website',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (existingClient) {
      const createdDeal = await postgresCrmDealRepository.convertLead(lead, existingClient, deal, true);
      recordAuditLog({ action: 'LEAD_CONVERTED', actor: req.user!.username, actorRole: req.user!.role, ip: req.ip, userAgent: req.headers['user-agent'] as string, details: `Converted lead "${lead.fullName}" into CRM Deal using existing client.`, severity: 'info' });
      res.json({ success: true, client: existingClient, deal: createdDeal.deal });
      return;
    }

    const converted = await postgresCrmDealRepository.convertLead(lead, client, deal);
    recordAuditLog({ action: 'LEAD_CONVERTED', actor: req.user!.username, actorRole: req.user!.role, ip: req.ip, userAgent: req.headers['user-agent'] as string, details: `Converted lead "${lead.fullName}" into Client & CRM Deal.`, severity: 'info' });
    res.json({ success: true, client, deal: converted.deal });
    return;
  }

  const db = getDatabase();
  const lead = db.leads.find(l => l.id === id);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }
  let client = db.clients.find(c => c.email.toLowerCase() === lead.email.toLowerCase());
  if (!client) {
    client = {
      id: `cli_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      companyName: lead.company || lead.fullName,
      clientName: lead.fullName,
      email: lead.email,
      phone: lead.phone || '',
      address: '',
      status: 'active',
      tier: 'Standard',
      totalProjects: 1,
      totalInvoiced: 0,
      activeRetainer: false,
      notes: `Converted from inbound lead on ${new Date().toLocaleDateString('id-ID')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.clients.push(client);
  }
  const leadValue = Number(lead.dealValue ?? lead.value ?? 0);
  const deal = {
    id: `deal_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    title: `${lead.company || lead.fullName} - ${lead.services?.join(', ') || 'Digital Project'}`,
    clientName: lead.fullName,
    company: lead.company || lead.fullName,
    value: Number.isFinite(leadValue) && leadValue >= 0 ? leadValue : 0,
    stage: 'new',
    probability: normalizeProbability(lead.probability),
    owner: req.user!.name || req.user!.username,
    expectedCloseDate: /^\d{4}-\d{2}-\d{2}$/.test(String(lead.expectedCloseDate || '')) ? String(lead.expectedCloseDate) : '',
    notes: lead.message,
    priority: DEAL_PRIORITIES.includes(String(lead.priority) as any) ? String(lead.priority) : 'medium',
    source: lead.source || 'Website',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.crmDeals.push(deal);
  lead.status = 'closed';
  lead.updatedAt = new Date().toISOString();
  saveDatabase(db);
  recordAuditLog({ action: 'LEAD_CONVERTED', actor: req.user!.username, actorRole: req.user!.role, ip: req.ip, userAgent: req.headers['user-agent'] as string, details: `Converted lead "${lead.fullName}" into Client & CRM Deal.`, severity: 'info' });
  res.json({ success: true, client, deal });
});

// ----------------------------------------------------

apiRouter.get('/dashboard/overview', requireAuth, handleOverview);
apiRouter.get('/executive/overview', requireAuth, handleOverview);
