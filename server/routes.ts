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
import { postgresClientRepository, ClientHasDependenciesError } from './postgres-client-repository.ts';
import { postgresProjectRepository, postgresTaskRepository, ProjectVersionConflictError, TaskVersionConflictError, ProjectArchiveMutationError } from './postgres-project-repository.ts';


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

// Public submission form (Rate-limited, validated, and dispatches notification via server)
apiRouter.post('/leads/submit', rateLimitPublic(10, 60 * 1000), async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, company, phone, services, budget, message, source, type, portfolioUrl, rateCard, specialty, website } = req.body;

  // Honeypot field: normal visitors never populate this. Do not process obvious bot submissions.
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

  const db = getDatabase();
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.leads.unshift(newLead);
  pushNotification(db, {
    title: 'New inbound lead',
    message: `${newLead.fullName}${newLead.company ? ` from ${newLead.company}` : ''} submitted a new inquiry.`,
    type: 'lead',
    severity: 'info',
    linkUrl: '/admin/inbox'
  });
  saveDatabase(db);

  recordAuditLog({
    action: 'LEAD_SUBMISSION',
    actor: cleanEmail,
    actorRole: 'public_lead',
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `New inbound lead received from ${newLead.fullName} (${cleanEmail}).`,
    severity: 'info'
  });

  // Server-side automated notification dispatch (Telegram / Formspree) without exposing secrets to client!
  const notif = db.notificationSettings;
  const telegramBotToken = process.env.KAPITECH_TELEGRAM_BOT_TOKEN || notif.telegramBotToken;
  const telegramChatId = process.env.KAPITECH_TELEGRAM_CHAT_ID || notif.telegramChatId;
  if (notif.isTelegramActive && telegramBotToken && telegramChatId) {
    try {
      const text = `🔔 *New Kapitech Lead Received*\n\n` +
        `👤 *Name:* ${newLead.fullName}\n` +
        `🏢 *Company:* ${newLead.company || '-'}\n` +
        `✉️ *Email:* ${newLead.email}\n` +
        `📞 *Phone:* ${newLead.phone || '-'}\n` +
        `🛠️ *Services:* ${newLead.services.join(', ') || '-'}\n` +
        `💰 *Budget:* ${newLead.budget || '-'}\n\n` +
        `💬 *Message:*\n_${newLead.message.slice(0, 300)}_`;

      fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text,
          parse_mode: 'Markdown'
        })
      }).catch(err => console.debug('Telegram notification dispatch failed:', err));
    } catch (err) {
      console.debug('Telegram dispatch error:', err);
    }
  }

  res.json({ success: true, message: 'Inquiry submitted successfully.', id: newLead.id });
});

apiRouter.get('/leads', requireAuth, requirePermission('canManageCrm'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const db = await loadApplicationDatabase();
  res.json({ success: true, leads: db.leads });
});

apiRouter.put('/leads/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body || {};
  const db = getDatabase();
  const idx = db.leads.findIndex(l => l.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }

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
  db.leads[idx] = { ...db.leads[idx], ...patch, updatedAt: new Date().toISOString() };
  saveDatabase(db);

  recordAuditLog({
    action: 'LEAD_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Updated lead ${db.leads[idx].fullName} (status: ${db.leads[idx].status}).`,
    severity: 'info'
  });

  res.json({ success: true, lead: db.leads[idx] });
});

apiRouter.delete('/leads/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const lead = db.leads.find(l => l.id === id);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }

  db.leads = db.leads.filter(l => l.id !== id);
  saveDatabase(db);

  recordAuditLog({
    action: 'LEAD_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted lead ${lead.fullName} (${lead.email}).`,
    severity: 'warning'
  });

  res.json({ success: true, message: 'Lead removed.' });
});

// Convert Lead to Client & CRM Deal
apiRouter.post('/leads/:id/convert', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const lead = db.leads.find(l => l.id === id);
  if (!lead) {
    res.status(404).json({ success: false, error: 'Lead not found.' });
    return;
  }

  // Create Client if not already existing
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

  // Create CRM Deal
  const leadValue = Number(lead.dealValue ?? lead.value ?? 0);
  const dealProbability = normalizeProbability(lead.probability);
  const requestedCloseDate = /^\d{4}-\d{2}-\d{2}$/.test(String(lead.expectedCloseDate || ''))
    ? String(lead.expectedCloseDate)
    : '';
  const deal = {
    id: `deal_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    title: `${lead.company || lead.fullName} - ${lead.services?.join(', ') || 'Digital Project'}`,
    clientName: lead.fullName,
    company: lead.company || lead.fullName,
    value: Number.isFinite(leadValue) && leadValue >= 0 ? leadValue : 0,
    stage: 'new',
    probability: dealProbability,
    owner: req.user!.name || req.user!.username,
    expectedCloseDate: requestedCloseDate,
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

  recordAuditLog({
    action: 'LEAD_CONVERTED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Converted lead "${lead.fullName}" into Client & CRM Deal.`,
    severity: 'info'
  });

  res.json({ success: true, client, deal });
});

// ----------------------------------------------------
// 3. CRM PIPELINE & DEALS
// ----------------------------------------------------

apiRouter.get('/crm/deals', requireAuth, requirePermission('canManageCrm'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const db = await loadApplicationDatabase();
  res.json({ success: true, deals: db.crmDeals });
});

apiRouter.post('/crm/deals', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const dealData = req.body || {};
  const db = getDatabase();
  const requestedStage = String(dealData.stage || 'new');
  const requestedPriority = String(dealData.priority || 'medium');
  if (!CRM_STAGES.includes(requestedStage as any) || !DEAL_PRIORITIES.includes(requestedPriority as any)) {
    res.status(400).json({ success: false, error: 'Invalid CRM stage or priority.' });
    return;
  }
  const value = Number(dealData.value);
  if (!Number.isFinite(value) || value < 0 || value > 100_000_000_000) {
    res.status(400).json({ success: false, error: 'Deal value must be a valid non-negative amount.' });
    return;
  }
  const newDeal = {
    id: `deal_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    title: cleanText(dealData.title, 200),
    clientName: cleanText(dealData.clientName, 160),
    company: cleanText(dealData.company, 200),
    email: cleanText(dealData.email, 254).toLowerCase(),
    phone: cleanText(dealData.phone, 40),
    servicePillar: cleanText(dealData.servicePillar, 120),
    value,
    stage: requestedStage,
    probability: normalizeProbability(dealData.probability),
    owner: cleanText(dealData.owner || req.user!.name || req.user!.username, 160),
    expectedCloseDate: /^\d{4}-\d{2}-\d{2}$/.test(String(dealData.expectedCloseDate || '')) ? String(dealData.expectedCloseDate) : '',
    notes: cleanText(dealData.notes, 3000),
    priority: requestedPriority,
    source: cleanText(dealData.source || 'Internal', 120),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.crmDeals.unshift(newDeal);
  saveDatabase(db);

  res.json({ success: true, deal: newDeal });
});

apiRouter.put('/crm/deals/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body || {};
  const db = getDatabase();
  const idx = db.crmDeals.findIndex(d => d.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Deal not found.' });
    return;
  }
  const patch = pickFields(updates, [
    'title', 'clientName', 'company', 'email', 'phone', 'servicePillar',
    'value', 'stage', 'probability', 'owner', 'expectedCloseDate', 'notes',
    'priority', 'source'
  ]);
  if (patch.value !== undefined) {
    const value = Number(patch.value);
    if (!Number.isFinite(value) || value < 0 || value > 100_000_000_000) {
      res.status(400).json({ success: false, error: 'Deal value must be a valid non-negative amount.' });
      return;
    }
    patch.value = value;
  }
  if (patch.probability !== undefined) patch.probability = normalizeProbability(patch.probability);
  if (patch.stage !== undefined && !CRM_STAGES.includes(String(patch.stage) as any)) {
    res.status(400).json({ success: false, error: 'Invalid CRM stage.' });
    return;
  }
  if (patch.priority !== undefined && !DEAL_PRIORITIES.includes(String(patch.priority) as any)) {
    res.status(400).json({ success: false, error: 'Invalid CRM priority.' });
    return;
  }
  if (patch.email !== undefined) patch.email = cleanText(patch.email, 254).toLowerCase();
  for (const key of ['title','clientName','company','phone','servicePillar','owner','notes','source'] as const) {
    if (patch[key] !== undefined) patch[key] = cleanText(patch[key], key === 'notes' ? 3000 : 200);
  }
  db.crmDeals[idx] = { ...db.crmDeals[idx], ...patch, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, deal: db.crmDeals[idx] });
});

apiRouter.delete('/crm/deals/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.crmDeals = db.crmDeals.filter(d => d.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Deal deleted.' });
});

// ----------------------------------------------------
// 4. CLIENTS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/clients', requireAuth, requireAnyPermission('canManageClients', 'canManageCrm'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (getDataSourceMode() === 'postgres') {
      res.json({ success: true, clients: await postgresClientRepository.list() });
      return;
    }
    const db = getDatabase();
    res.json({ success: true, clients: db.clients });
  } catch (error) {
    console.error('[Clients] Failed to load clients:', error);
    res.status(503).json({ success: false, error: 'Client data is temporarily unavailable.' });
  }
});

apiRouter.post('/clients', requireAuth, requirePermission('canManageClients'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const clientData = req.body || {};
  const email = cleanText(clientData.email, 254).toLowerCase();
  const website = cleanOptionalUrl(clientData.website);
  const avatarUrl = cleanOptionalUrl(clientData.avatarUrl);
  const totalSpend = normalizeNumber(clientData.totalSpend ?? 0, 0, MAX_MONEY, 0);
  const projectsCount = normalizeNumber(clientData.projectsCount ?? 0, 0, 100000, 0);
  const slaBudget = normalizeNumber(clientData.slaDailyAdSpendBudget ?? 0, 0, MAX_MONEY, 0);
  const currentSpend = normalizeNumber(clientData.currentDailyAdSpend ?? 0, 0, MAX_MONEY, 0);

  if (email && !isValidEmail(email)) {
    res.status(400).json({ success: false, error: 'Invalid client email address.' });
    return;
  }
  if (clientData.status !== undefined && !['active','inactive','prospect','on_hold','completed','lead'].includes(String(clientData.status))) {
    res.status(400).json({ success: false, error: 'Invalid client status.' });
    return;
  }

  const newClient = {
    id: String(clientData.id || ('cli_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'))),
    ...pickFields(clientData, ['name','company','companyName','clientName','email','phone','website','location','industry','status','contactPersonRole','notes']),
    name: cleanText(clientData.name || clientData.clientName, 160),
    company: cleanText(clientData.company || clientData.companyName, 200),
    clientName: cleanText(clientData.clientName || clientData.name, 160),
    email,
    phone: cleanText(clientData.phone, 40),
    website,
    location: cleanText(clientData.location, 160),
    industry: cleanText(clientData.industry, 160),
    status: clientData.status ? String(clientData.status) : 'prospect',
    totalSpend: totalSpend ?? 0,
    projectsCount: projectsCount ?? 0,
    contactPersonRole: cleanText(clientData.contactPersonRole, 160),
    notes: cleanText(clientData.notes, 3000),
    avatarUrl,
    slaDailyAdSpendBudget: slaBudget ?? 0,
    currentDailyAdSpend: currentSpend ?? 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    if (getDataSourceMode() === 'postgres') {
      const created = await postgresClientRepository.create(newClient);
      recordAuditLog({
        action: 'CLIENT_CREATED',
        actor: req.user!.username,
        actorRole: req.user!.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        details: 'Created client "' + (created.company || created.clientName) + '".',
        severity: 'info'
      });
      res.json({ success: true, client: created });
      return;
    }

    const db = getDatabase();
    db.clients.unshift(newClient);
    saveDatabase(db);
    recordAuditLog({
      action: 'CLIENT_CREATED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: 'Created client "' + (newClient.company || newClient.clientName) + '".',
      severity: 'info'
    });
    res.json({ success: true, client: newClient });
  } catch (error: any) {
    if (error?.code === '23505') {
      res.status(409).json({ success: false, error: 'Client already exists.' });
      return;
    }
    console.error('[Clients] Create failed:', error);
    res.status(500).json({ success: false, error: 'Client could not be created.' });
  }
});

apiRouter.put('/clients/:id', requireAuth, requirePermission('canManageClients'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body || {};

  if (getDataSourceMode() === 'postgres') {
    const existing = await postgresClientRepository.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Client not found.' });
      return;
    }
  } else {
    const db = getDatabase();
    if (!db.clients.some(c => c.id === id)) {
      res.status(404).json({ success: false, error: 'Client not found.' });
      return;
    }
  }

  const patch = pickFields(updates || {}, ['name', 'companyName', 'clientName', 'email', 'phone', 'address', 'website', 'location', 'industry', 'status', 'tier', 'totalProjects', 'totalInvoiced', 'activeRetainer', 'notes', 'slaDailyAdSpendBudget', 'currentDailyAdSpend']);
  if (patch.email !== undefined) {
    patch.email = cleanText(patch.email, 254).toLowerCase();
    if (patch.email && !isValidEmail(patch.email)) {
      res.status(400).json({ success: false, error: 'Invalid client email address.' });
      return;
    }
  }
  if (patch.website !== undefined) patch.website = cleanOptionalUrl(patch.website);
  if (patch.status !== undefined && !['active','inactive','prospect','on_hold','completed','lead'].includes(String(patch.status))) {
    res.status(400).json({ success: false, error: 'Invalid client status.' });
    return;
  }
  for (const key of ['name','companyName','clientName','phone','address','location','industry','tier','notes'] as const) {
    if (patch[key] !== undefined) patch[key] = cleanText(patch[key], key === 'notes' ? 3000 : 200);
  }
  for (const key of ['totalProjects','totalInvoiced','slaDailyAdSpendBudget','currentDailyAdSpend'] as const) {
    if (patch[key] !== undefined) {
      const numeric = normalizeNumber(patch[key], 0, key === 'totalProjects' ? 100000 : MAX_MONEY);
      if (numeric === null) {
        res.status(400).json({ success: false, error: 'Invalid numeric value for ' + key + '.' });
        return;
      }
      patch[key] = numeric;
    }
  }
  if (patch.activeRetainer !== undefined) patch.activeRetainer = Boolean(patch.activeRetainer);

  try {
    if (getDataSourceMode() === 'postgres') {
      const updated = await postgresClientRepository.update(id, patch as Record<string, any>);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Client not found.' });
        return;
      }
      recordAuditLog({
        action: 'CLIENT_UPDATED',
        actor: req.user!.username,
        actorRole: req.user!.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        details: 'Updated client ' + id + '.',
        severity: 'info'
      });
      res.json({ success: true, client: updated });
      return;
    }

    const db = getDatabase();
    const idx = db.clients.findIndex(c => c.id === id);
    db.clients[idx] = { ...db.clients[idx], ...patch, updatedAt: new Date().toISOString() };
    saveDatabase(db);
    recordAuditLog({
      action: 'CLIENT_UPDATED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: 'Updated client ' + id + '.',
      severity: 'info'
    });
    res.json({ success: true, client: db.clients[idx] });
  } catch (error) {
    console.error('[Clients] Update failed:', error);
    res.status(500).json({ success: false, error: 'Client could not be updated.' });
  }
});

apiRouter.delete('/clients/:id', requireAuth, requirePermission('canManageClients'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (getDataSourceMode() === 'postgres') {
      const deleted = await postgresClientRepository.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Client not found.' });
        return;
      }
      recordAuditLog({
        action: 'CLIENT_DELETED',
        actor: req.user!.username,
        actorRole: req.user!.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        details: 'Deleted client ' + id + '.',
        severity: 'warning'
      });
      res.json({ success: true, message: 'Client deleted.' });
      return;
    }

    const db = getDatabase();
    const existing = db.clients.some(c => c.id === id);
    db.clients = db.clients.filter(c => c.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: existing ? 'Client deleted.' : 'Client not found.' });
  } catch (error) {
    if (error instanceof ClientHasDependenciesError) {
      res.status(409).json({ success: false, error: error.message, code: error.code });
      return;
    }
    console.error('[Clients] Delete failed:', error);
    res.status(500).json({ success: false, error: 'Client could not be deleted.' });
  }
});

// ----------------------------------------------------
// 5. PROJECTS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/projects', requireAuth, requireAnyPermission('canManageProjects', 'canManageKanbanTasks'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (getDataSourceMode() === 'postgres') {
      res.json({ success: true, projects: await postgresProjectRepository.list() });
      return;
    }
    const db = getDatabase();
    res.json({ success: true, projects: db.projects });
  } catch (error) {
    console.error('[Projects] Failed to load projects:', error);
    res.status(503).json({ success: false, error: 'Project data is temporarily unavailable.' });
  }
});

apiRouter.post('/projects', requireAuth, requirePermission('canManageProjects'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const projectData = req.body || {};
  const progressPercent = Math.min(100, Math.max(0, Number(projectData.progressPercent) || 0));
  const budget = Number(projectData.budget);
  if (!Number.isFinite(budget) || budget < 0 || budget > 100_000_000_000) {
    res.status(400).json({ success: false, error: 'Project budget must be a valid non-negative amount.' });
    return;
  }

  const newProject = {
    id: String(projectData.id || ('proj_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'))),
    name: cleanText(projectData.name || projectData.title, 200),
    title: cleanText(projectData.title || projectData.name, 200),
    client: cleanText(projectData.client || projectData.clientCompany, 200),
    clientName: cleanText(projectData.clientName, 160),
    clientCompany: cleanText(projectData.clientCompany || projectData.client, 200),
    clientEmail: cleanText(projectData.clientEmail, 254).toLowerCase(),
    clientId: cleanText(projectData.clientId, 120),
    crmLeadId: cleanText(projectData.crmLeadId, 100),
    serviceCategory: cleanText(projectData.serviceCategory, 120),
    status: ['planning','in_progress','review','completed','on_hold'].includes(String(projectData.status)) ? String(projectData.status) : 'planning',
    health: ['Good','At Risk','Delayed','Blocked'].includes(String(projectData.health)) ? String(projectData.health) : 'Good',
    budget,
    progressPercent,
    startDate: normalizeDate(projectData.startDate, new Date().toISOString().slice(0,10)),
    targetEndDate: normalizeDate(projectData.targetEndDate, new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10)),
    teamLead: cleanText(projectData.teamLead, 160),
    teamMembers: Array.isArray(projectData.teamMembers) ? projectData.teamMembers.slice(0,50).map((v) => cleanText(v,160)) : [],
    techStack: Array.isArray(projectData.techStack) ? projectData.techStack.slice(0,50).map((v) => cleanText(v,120)) : [],
    milestones: Array.isArray(projectData.milestones) ? projectData.milestones.slice(0,50) : [],
    repositoryUrl: cleanOptionalUrl(projectData.repositoryUrl),
    figmaUrl: cleanOptionalUrl(projectData.figmaUrl),
    liveStagingUrl: cleanOptionalUrl(projectData.liveStagingUrl),
    notes: cleanText(projectData.notes, 3000),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    if (getDataSourceMode() === 'postgres') {
      const created = await postgresProjectRepository.create(newProject);
      recordAuditLog({
        action: 'PROJECT_CREATED',
        actor: req.user!.username,
        actorRole: req.user!.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        details: 'Created project ' + created.id + '.',
        severity: 'info'
      });
      res.json({ success: true, project: created });
      return;
    }

    const db = getDatabase();
    const legacyProject = {
      ...newProject,
      tasks: Array.isArray(projectData.tasks) ? projectData.tasks.slice(0, 200) : [],
      milestones: Array.isArray(projectData.milestones) ? projectData.milestones.slice(0, 50) : []
    };
    db.projects.unshift(legacyProject);
    saveDatabase(db);
    res.json({ success: true, project: legacyProject });
  } catch (error: any) {
    if (error?.code === '23503') {
      res.status(400).json({ success: false, error: 'Referenced client does not exist.' });
      return;
    }
    console.error('[Projects] Create failed:', error);
    res.status(500).json({ success: false, error: 'Project could not be created.' });
  }
});

apiRouter.put('/projects/:id', requireAuth, requirePermission('canManageProjects'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body || {};

  if (getDataSourceMode() === 'postgres') {
    const existing = await postgresProjectRepository.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }
  } else {
    const db = getDatabase();
    if (!db.projects.some(p => p.id === id)) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }
  }

  const patch = pickFields(updates || {}, ['title', 'name', 'client', 'clientName', 'clientCompany', 'clientEmail', 'clientId', 'serviceCategory', 'status', 'health', 'budget', 'progressPercent', 'startDate', 'targetEndDate', 'teamLead', 'teamMembers', 'techStack', 'repositoryUrl', 'figmaUrl', 'liveStagingUrl', 'notes', 'version']);
  for (const key of ['title','name','client','clientName','clientCompany','serviceCategory','teamLead','notes'] as const) {
    if (patch[key] !== undefined) patch[key] = cleanText(patch[key], key === 'notes' ? 3000 : 200);
  }
  if (patch.clientEmail !== undefined) {
    patch.clientEmail = cleanText(patch.clientEmail, 254).toLowerCase();
    if (patch.clientEmail && !isValidEmail(patch.clientEmail)) {
      res.status(400).json({ success: false, error: 'Invalid project client email address.' });
      return;
    }
  }
  if (patch.status !== undefined && !['planning','in_progress','review','completed','on_hold'].includes(String(patch.status))) {
    res.status(400).json({ success: false, error: 'Invalid project status.' });
    return;
  }
  if (patch.health !== undefined && !['Good','At Risk','Delayed','Blocked'].includes(String(patch.health))) {
    res.status(400).json({ success: false, error: 'Invalid project health state.' });
    return;
  }
  if (patch.budget !== undefined) {
    const numeric = normalizeNumber(patch.budget, 0, MAX_MONEY);
    if (numeric === null) {
      res.status(400).json({ success: false, error: 'Invalid project budget.' });
      return;
    }
    patch.budget = numeric;
  }
  if (patch.progressPercent !== undefined) {
    const progress = normalizeNumber(patch.progressPercent, 0, 100);
    if (progress === null) {
      res.status(400).json({ success: false, error: 'Invalid project progress.' });
      return;
    }
    patch.progressPercent = progress;
  }
  for (const key of ['startDate','targetEndDate'] as const) {
    if (patch[key] !== undefined && !isValidDate(patch[key])) {
      res.status(400).json({ success: false, error: 'Invalid project date for ' + key + '.' });
      return;
    }
  }
  for (const key of ['repositoryUrl','figmaUrl','liveStagingUrl'] as const) {
    if (patch[key] !== undefined) patch[key] = cleanOptionalUrl(patch[key]);
  }
  if (patch.teamMembers !== undefined) patch.teamMembers = normalizeStringArray(patch.teamMembers, 50, 160);
  if (patch.techStack !== undefined) patch.techStack = normalizeStringArray(patch.techStack, 50, 120);

  try {
    if (getDataSourceMode() === 'postgres') {
      const updated = await postgresProjectRepository.update(id, patch as Record<string, any>);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Project not found.' });
        return;
      }
      recordAuditLog({
        action: 'PROJECT_UPDATED',
        actor: req.user!.username,
        actorRole: req.user!.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        details: 'Updated project ' + id + '.',
        severity: 'info'
      });
      res.json({ success: true, project: updated });
      return;
    }

    const db = getDatabase();
    const idx = db.projects.findIndex(p => p.id === id);
    db.projects[idx] = { ...db.projects[idx], ...patch, updatedAt: new Date().toISOString() };
    saveDatabase(db);
    recordAuditLog({
      action: 'PROJECT_UPDATED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: 'Updated project ' + id + '.',
      severity: 'info'
    });
    res.json({ success: true, project: db.projects[idx] });
  } catch (error: any) {
    if (error instanceof ProjectVersionConflictError) {
      res.status(409).json({ success: false, error: error.message, code: error.code });
      return;
    }
    if (error?.code === '23503') {
      res.status(400).json({ success: false, error: 'Referenced client does not exist.' });
      return;
    }
    if (error instanceof ProjectArchiveMutationError) {
      res.status(409).json({ success: false, error: error.message, code: error.code });
      return;
    }
    console.error('[Projects] Update failed:', error);
    res.status(500).json({ success: false, error: 'Project could not be updated.' });
  }
});

apiRouter.delete('/projects/:id', requireAuth, requirePermission('canManageProjects'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (getDataSourceMode() === 'postgres') {
      const archived = await postgresProjectRepository.archive(id);
      if (!archived) {
        res.status(404).json({ success: false, error: 'Project not found.' });
        return;
      }
      recordAuditLog({
        action: 'PROJECT_ARCHIVED',
        actor: req.user!.username,
        actorRole: req.user!.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        details: 'Archived project ' + id + '.',
        severity: 'warning'
      });
      res.json({ success: true, message: 'Project archived.' });
      return;
    }

    const db = getDatabase();
    const project = db.projects.find((item: any) => item.id === id);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found.' });
      return;
    }
    db.projects = db.projects.filter(p => p.id !== id);
    saveDatabase(db);
    recordAuditLog({
      action: 'PROJECT_DELETED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: 'Deleted project "' + (project.name || project.title || id) + '".',
      severity: 'warning'
    });
    res.json({ success: true, message: 'Project removed.' });
  } catch (error) {
    if (error instanceof ProjectArchiveMutationError) {
      res.status(409).json({ success: false, error: error.message, code: error.code });
      return;
    }
    console.error('[Projects] Delete/archive failed:', error);
    res.status(500).json({ success: false, error: 'Project could not be archived.' });
  }
});

// ----------------------------------------------------
// 6. FINANCE, INVOICING & PAYMENTS (Server-Authoritative Calculations)
// ----------------------------------------------------

apiRouter.get('/finance/invoices', requireAuth, requirePermission('canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, invoices: db.invoices });
});

function normalizeInvoiceItems(value: unknown): Array<{ id: string; description: string; quantity: number; unitPrice: number; amount: number }> {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map((item: any) => {
    const quantity = Number(item?.quantity);
    const unitPrice = Number(item?.unitPrice);
    return {
      id: String(item?.id || `line_${crypto.randomBytes(4).toString('hex')}`).slice(0, 80),
      description: String(item?.description || '').trim().slice(0, 500),
      quantity: Number.isFinite(quantity) ? Math.min(100000, Math.max(0, quantity)) : 0,
      unitPrice: Number.isFinite(unitPrice) ? Math.min(10_000_000_000, Math.max(0, unitPrice)) : 0,
      amount: 0
    };
  }).filter(item => item.description && item.quantity > 0 && item.unitPrice >= 0).map(item => ({
    ...item,
    amount: Math.round(item.quantity * item.unitPrice)
  }));
}

function normalizeDate(value: unknown, fallback: string): string {
  const candidate = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    const parsed = new Date(`${candidate}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === candidate) return candidate;
  }
  return fallback;
}

const INVOICE_STATUSES = new Set(['draft', 'sent', 'approved', 'overdue', 'cancelled']);
const PAYMENT_METHODS = new Set(['bank_transfer', 'credit_card', 'cash', 'other']);

function buildInvoiceFinancials(items: ReturnType<typeof normalizeInvoiceItems>, taxPercent: number, discountPercent: number) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableSubtotal * (taxPercent / 100));
  const total = taxableSubtotal + taxAmount;
  return { subtotal, discountAmount, taxableSubtotal, taxAmount, total };
}


apiRouter.post('/finance/invoices', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const input = req.body || {};
  const items = normalizeInvoiceItems(input.items);
  if (items.length === 0) {
    res.status(400).json({ success: false, error: 'At least one valid invoice line item is required.' });
    return;
  }

  const taxPercent = Number.isFinite(Number(input.taxPercent)) ? Math.min(100, Math.max(0, Number(input.taxPercent))) : 11;
  const discountPercent = Number.isFinite(Number(input.discountPercent)) ? Math.min(100, Math.max(0, Number(input.discountPercent))) : 0;
  const { subtotal, discountAmount, taxableSubtotal, taxAmount, total } = buildInvoiceFinancials(items, taxPercent, discountPercent);

  const db = getDatabase();
  const requestedNumber = String(input.invoiceNumber || '').trim();
  const invoiceNumber = requestedNumber && /^[A-Za-z0-9._/-]{1,80}$/.test(requestedNumber)
    ? requestedNumber
    : `INV-KAPI-${new Date().getFullYear()}-${crypto.randomInt(1000, 10000)}`;

  if (db.invoices.some((invoice: any) => invoice.invoiceNumber === invoiceNumber)) {
    res.status(409).json({ success: false, error: 'Invoice number already exists.' });
    return;
  }

  const issueDate = normalizeDate(input.issueDate, new Date().toISOString().slice(0, 10));
  const dueDate = normalizeDate(input.dueDate, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const requestedStatus = String(input.status || 'draft');
  const status = INVOICE_STATUSES.has(requestedStatus) ? requestedStatus : 'draft';
  const invoice = {
    id: `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    invoiceNumber,
    type: input.type === 'quotation' ? 'quotation' : 'invoice',
    clientName: String(input.clientName || 'Client').trim().slice(0, 160),
    clientCompany: String(input.clientCompany || '').trim().slice(0, 200),
    clientEmail: String(input.clientEmail || '').trim().toLowerCase().slice(0, 254),
    clientPhone: String(input.clientPhone || '').trim().slice(0, 40),
    projectId: String(input.projectId || '').slice(0, 100),
    leadId: String(input.leadId || '').slice(0, 100),
    items,
    subtotal,
    discountPercent,
    discountAmount,
    taxPercent,
    taxAmount,
    total,
    amountPaid: 0,
    balanceDue: total,
    payments: [],
    currency: input.currency === 'USD' ? 'USD' : 'IDR',
    status,
    issueDate,
    dueDate,
    notes: String(input.notes || '').trim().slice(0, 5000),
    paymentTerms: String(input.paymentTerms || '').trim().slice(0, 500),
    auditTrail: [{
      action: 'created',
      timestamp: new Date().toISOString(),
      user: req.user!.username
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.invoices.unshift(invoice);
  saveDatabase(db);

  recordAuditLog({
    action: 'INVOICE_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created invoice ${invoice.invoiceNumber} for ${invoice.clientName} (Total: ${invoice.total}).`,
    severity: 'info'
  });

  res.json({ success: true, invoice });
});

apiRouter.put('/finance/invoices/:id', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const input = req.body || {};
  const db = getDatabase();
  const idx = db.invoices.findIndex((invoice: any) => invoice.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Invoice not found.' });
    return;
  }

  const existing = db.invoices[idx];
  if (existing.status === 'cancelled' && input.status !== 'cancelled') {
    res.status(409).json({ success: false, error: 'Cancelled invoices cannot be reopened.' });
    return;
  }

  const items = input.items !== undefined ? normalizeInvoiceItems(input.items) : normalizeInvoiceItems(existing.items);
  if (items.length === 0) {
    res.status(400).json({ success: false, error: 'At least one valid invoice line item is required.' });
    return;
  }

  const taxPercent = input.taxPercent !== undefined ? Math.min(100, Math.max(0, Number(input.taxPercent) || 0)) : Number(existing.taxPercent) || 0;
  const discountPercent = input.discountPercent !== undefined ? Math.min(100, Math.max(0, Number(input.discountPercent) || 0)) : Number(existing.discountPercent) || 0;
  const { subtotal, discountAmount, taxableSubtotal, taxAmount, total } = buildInvoiceFinancials(items, taxPercent, discountPercent);

  const existingPayments = Array.isArray(existing.payments) ? existing.payments : [];
  const amountPaid = existingPayments.reduce((sum: number, payment: any) => sum + (Number(payment.amount) || 0), 0);
  if (total < amountPaid) {
    res.status(409).json({ success: false, error: 'Invoice total cannot be lower than payments already recorded.' });
    return;
  }

  const requestedStatus = String(input.status || existing.status);
  let status = INVOICE_STATUSES.has(requestedStatus) ? requestedStatus : existing.status;
  if (amountPaid >= total && total > 0) status = 'paid';
  else if (amountPaid > 0) status = 'partially_paid';
  else if (status === 'paid' || status === 'partially_paid') status = 'draft';

  db.invoices[idx] = {
    ...existing,
    invoiceNumber: existing.invoiceNumber,
    clientName: input.clientName !== undefined ? String(input.clientName).trim().slice(0, 160) : existing.clientName,
    clientCompany: input.clientCompany !== undefined ? String(input.clientCompany).trim().slice(0, 200) : existing.clientCompany,
    clientEmail: input.clientEmail !== undefined ? String(input.clientEmail).trim().toLowerCase().slice(0, 254) : existing.clientEmail,
    clientPhone: input.clientPhone !== undefined ? String(input.clientPhone).trim().slice(0, 40) : existing.clientPhone,
    projectId: input.projectId !== undefined ? String(input.projectId).slice(0, 100) : existing.projectId,
    leadId: input.leadId !== undefined ? String(input.leadId).slice(0, 100) : existing.leadId,
    items,
    subtotal,
    discountPercent,
    discountAmount,
    taxPercent,
    taxAmount,
    total,
    amountPaid,
    balanceDue: Math.max(0, total - amountPaid),
    payments: existingPayments,
    currency: input.currency === 'USD' || input.currency === 'IDR' ? input.currency : existing.currency || 'IDR',
    status,
    issueDate: input.issueDate !== undefined ? normalizeDate(input.issueDate, existing.issueDate) : existing.issueDate,
    dueDate: input.dueDate !== undefined ? normalizeDate(input.dueDate, existing.dueDate) : existing.dueDate,
    notes: input.notes !== undefined ? String(input.notes).trim().slice(0, 5000) : existing.notes,
    paymentTerms: input.paymentTerms !== undefined ? String(input.paymentTerms).trim().slice(0, 500) : existing.paymentTerms,
    auditTrail: [
      ...(Array.isArray(existing.auditTrail) ? existing.auditTrail : []),
      { action: 'updated', timestamp: new Date().toISOString(), user: req.user!.username }
    ],
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);

  recordAuditLog({
    action: 'INVOICE_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Updated invoice ${db.invoices[idx].invoiceNumber} (Status: ${status}).`,
    severity: 'info'
  });

  res.json({ success: true, invoice: db.invoices[idx] });
});

apiRouter.post('/finance/invoices/:id/pay', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const input = req.body || {};
  const payAmount = Number(input.amount);

  if (!Number.isFinite(payAmount) || payAmount <= 0) {
    res.status(400).json({ success: false, error: 'Valid payment amount is required.' });
    return;
  }

  const db = getDatabase();
  const invoice = db.invoices.find((item: any) => item.id === id);
  if (!invoice) {
    res.status(404).json({ success: false, error: 'Invoice not found.' });
    return;
  }

  if (invoice.status === 'cancelled') {
    res.status(409).json({ success: false, error: 'Cancelled invoices cannot receive payments.' });
    return;
  }

  const currentBalance = Math.max(0, Number(invoice.balanceDue ?? (invoice.total - (invoice.amountPaid || 0))));
  if (currentBalance <= 0) {
    res.status(409).json({ success: false, error: 'Invoice has no remaining balance.' });
    return;
  }

  if (payAmount > currentBalance) {
    res.status(400).json({ success: false, error: 'Payment exceeds the current invoice balance.' });
    return;
  }

  const method = PAYMENT_METHODS.has(String(input.method)) ? String(input.method) : 'bank_transfer';
  const date = normalizeDate(input.date, new Date().toISOString().slice(0, 10));
  const reference = String(input.reference || '').trim().slice(0, 160);
  const notes = String(input.notes || '').trim().slice(0, 1000);

  const paymentRecord = {
    id: `pay_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    amount: Math.round(payAmount * 100) / 100,
    date,
    method,
    reference,
    recordedBy: req.user!.name || req.user!.username,
    notes
  };

  if (!Array.isArray(invoice.payments)) invoice.payments = [];
  invoice.payments.push(paymentRecord);

  const totalPaid = invoice.payments.reduce((sum: number, payment: any) => sum + (Number(payment.amount) || 0), 0);
  invoice.amountPaid = totalPaid;
  invoice.balanceDue = Math.max(0, Number(invoice.total || 0) - totalPaid);
  invoice.status = invoice.balanceDue <= 0 ? 'paid' : 'partially_paid';
  invoice.updatedAt = new Date().toISOString();
  invoice.auditTrail = [
    ...(Array.isArray(invoice.auditTrail) ? invoice.auditTrail : []),
    { action: 'payment_recorded', timestamp: new Date().toISOString(), user: req.user!.username, note: reference || notes }
  ];

  saveDatabase(db);

  recordAuditLog({
    action: 'PAYMENT_RECORDED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Recorded payment of ${payAmount} for invoice ${invoice.invoiceNumber}. New status: ${invoice.status}.`,
    severity: 'info'
  });

  res.json({ success: true, invoice, payment: paymentRecord });
});

apiRouter.delete('/finance/invoices/:id', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const invoice = db.invoices.find((item: any) => item.id === id);
  if (!invoice) {
    res.status(404).json({ success: false, error: 'Invoice not found.' });
    return;
  }

  invoice.status = 'cancelled';
  invoice.updatedAt = new Date().toISOString();
  invoice.auditTrail = [
    ...(Array.isArray(invoice.auditTrail) ? invoice.auditTrail : []),
    { action: 'cancelled', timestamp: new Date().toISOString(), user: req.user!.username }
  ];
  saveDatabase(db);

  recordAuditLog({
    action: 'INVOICE_CANCELLED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Cancelled invoice ${invoice.invoiceNumber}.`,
    severity: 'warning'
  });

  res.json({ success: true, message: 'Invoice cancelled.', invoice });
});

// Expenses
apiRouter.get('/finance/expenses', requireAuth, requirePermission('canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, expenses: db.expenses });
});

apiRouter.post('/finance/expenses', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const exp = req.body || {};
  const amount = Number(exp.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000_000) {
    res.status(400).json({ success: false, error: 'Expense amount must be a valid positive amount.' });
    return;
  }
  const date = normalizeDate(exp.date, new Date().toISOString().slice(0, 10));
  const db = getDatabase();
  const newExpense = {
    id: `exp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    type: ['OpEx','CapEx'].includes(String(exp.type)) ? String(exp.type) : 'OpEx',
    category: cleanText(exp.category || 'General', 120),
    description: cleanText(exp.description, 500),
    amount: Math.round(amount * 100) / 100,
    date,
    recurringInterval: cleanText(exp.recurringInterval || 'none', 40),
    recordedBy: req.user!.name || req.user!.username,
    createdAt: new Date().toISOString()
  };
  db.expenses.unshift(newExpense);
  saveDatabase(db);
  recordAuditLog({
    action: 'EXPENSE_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created expense of ${newExpense.amount}.`,
    severity: 'info'
  });
  res.json({ success: true, expense: newExpense });
});

apiRouter.delete('/finance/expenses/:id', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const expense = db.expenses.find((item: any) => item.id === id);
  if (!expense) {
    res.status(404).json({ success: false, error: 'Expense not found.' });
    return;
  }
  db.expenses = db.expenses.filter(e => e.id !== id);
  saveDatabase(db);
  recordAuditLog({
    action: 'EXPENSE_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted expense "${expense.description || id}" (${expense.amount || 0}).`,
    severity: 'warning'
  });
  res.json({ success: true, message: 'Expense deleted.' });
});

// Financial Metrics (Authoritative server-calculated metrics)
apiRouter.get('/finance/metrics', requireAuth, requirePermission('canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const invoices = db.invoices;
  const expenses = db.expenses;

  let totalRevenueCollected = 0;
  let totalBilled = 0;
  let totalOutstanding = 0;
  let paidCount = 0;
  let partiallyPaidCount = 0;
  let overdueCount = 0;
  let draftCount = 0;

  for (const inv of invoices) {
    totalBilled += inv.total || 0;
    const paid = getInvoicePaidAmount(inv);
    totalRevenueCollected += paid;
    const due = getInvoiceBalanceDue(inv);
    if (inv.status !== 'paid' && inv.status !== 'cancelled') {
      totalOutstanding += due;
    }

    if (inv.status === 'paid') paidCount++;
    else if (inv.status === 'partially_paid') partiallyPaidCount++;
    else if (inv.status === 'overdue') overdueCount++;
    else if (inv.status === 'draft') draftCount++;
  }

  const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netProfit = totalRevenueCollected - totalExpense;
  const profitMargin = totalRevenueCollected > 0 ? ((netProfit / totalRevenueCollected) * 100).toFixed(1) : '0';

  res.json({
    success: true,
    metrics: {
      totalRevenueCollected,
      totalBilled,
      totalOutstanding,
      totalExpense,
      netProfit,
      profitMargin,
      totalInvoicesCount: invoices.length,
      paidCount,
      partiallyPaidCount,
      overdueCount,
      draftCount
    }
  });
});

// ----------------------------------------------------
// 7. VENDORS MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/vendors', requireAuth, requireAnyPermission('canManageVendors', 'canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, vendors: db.vendors });
});

apiRouter.post('/vendors', requireAuth, requirePermission('canManageVendors'), (req: AuthenticatedRequest, res: Response): void => {
  const vendorData = req.body || {};
  const db = getDatabase();
  const hourlyRate = Number(vendorData.hourlyRate);
  if (!Number.isFinite(hourlyRate) || hourlyRate < 0 || hourlyRate > 10_000_000_000) {
    res.status(400).json({ success: false, error: 'Vendor hourly rate must be a valid non-negative amount.' });
    return;
  }
  const rating = Number(vendorData.rating);
  const newVendor = {
    id: `ven_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    name: cleanText(vendorData.name, 160),
    companyName: cleanText(vendorData.companyName, 200),
    email: cleanText(vendorData.email, 254).toLowerCase(),
    phone: cleanText(vendorData.phone, 40),
    type: ['freelancer','agency_partner','contractor','saas_vendor'].includes(String(vendorData.type)) ? String(vendorData.type) : 'contractor',
    primaryCategory: cleanText(vendorData.primaryCategory, 120),
    skills: Array.isArray(vendorData.skills) ? vendorData.skills.slice(0,100).map((v) => cleanText(v,120)) : [],
    hourlyRate,
    currency: vendorData.currency === 'USD' ? 'USD' : 'IDR',
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0,
    completedProjectsCount: Math.max(0, Math.floor(Number(vendorData.completedProjectsCount) || 0)),
    status: ['active','under_review','inactive','blacklisted'].includes(String(vendorData.status)) ? String(vendorData.status) : 'under_review',
    isVetted: Boolean(vendorData.isVetted),
    location: cleanText(vendorData.location, 160),
    portfolioUrl: cleanOptionalUrl(vendorData.portfolioUrl),
    githubUrl: cleanOptionalUrl(vendorData.githubUrl),
    contracts: Array.isArray(vendorData.contracts) ? vendorData.contracts.slice(0,50) : [],
    notes: cleanText(vendorData.notes, 3000),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.vendors.unshift(newVendor);
  saveDatabase(db);
  res.json({ success: true, vendor: newVendor });
});

apiRouter.put('/vendors/:id', requireAuth, requirePermission('canManageVendors'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body || {};
  const db = getDatabase();
  const idx = db.vendors.findIndex(v => v.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Vendor not found.' });
    return;
  }
  const patch = pickFields(updates || {}, ['name', 'category', 'contactPerson', 'email', 'phone', 'website', 'paymentTerms', 'status', 'monthlySpend', 'notes', 'portfolioUrl', 'githubUrl', 'contracts']);
  if (patch.email !== undefined) {
    patch.email = cleanText(patch.email, 254).toLowerCase();
    if (patch.email && !isValidEmail(patch.email)) {
      res.status(400).json({ success: false, error: 'Invalid vendor email address.' });
      return;
    }
  }
  for (const key of ['website','portfolioUrl','githubUrl'] as const) {
    if (patch[key] !== undefined) patch[key] = cleanOptionalUrl(patch[key]);
  }
  if (patch.status !== undefined && !['active','under_review','inactive','blacklisted'].includes(String(patch.status))) {
    res.status(400).json({ success: false, error: 'Invalid vendor status.' });
    return;
  }
  if (patch.monthlySpend !== undefined) {
    const numeric = normalizeNumber(patch.monthlySpend, 0, MAX_MONEY);
    if (numeric === null) {
      res.status(400).json({ success: false, error: 'Invalid vendor monthly spend.' });
      return;
    }
    patch.monthlySpend = numeric;
  }
  for (const key of ['name','category','contactPerson','phone','paymentTerms','notes'] as const) {
    if (patch[key] !== undefined) patch[key] = cleanText(patch[key], key === 'notes' ? 3000 : 200);
  }
  if (patch.contracts !== undefined) patch.contracts = Array.isArray(patch.contracts) ? patch.contracts.slice(0, 50) : [];
  db.vendors[idx] = { ...db.vendors[idx], ...patch, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  recordAuditLog({
    action: 'VENDOR_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Updated vendor ${id}.`,
    severity: 'info'
  });
  res.json({ success: true, vendor: db.vendors[idx] });
});

apiRouter.delete('/vendors/:id', requireAuth, requirePermission('canManageVendors'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const vendor = db.vendors.find((item: any) => item.id === id);
  if (!vendor) {
    res.status(404).json({ success: false, error: 'Vendor not found.' });
    return;
  }
  db.vendors = db.vendors.filter(v => v.id !== id);
  saveDatabase(db);
  recordAuditLog({
    action: 'VENDOR_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted vendor "${vendor.name || id}".`,
    severity: 'warning'
  });
  res.json({ success: true, message: 'Vendor deleted.' });
});

// ----------------------------------------------------
// 8. CMS (Services, Projects, Testimonials, Settings)
// ----------------------------------------------------

// CMS Services (Public GET for published services, protected for drafts)
apiRouter.get('/cms/services', (req: Request, res: Response): void => {
  const db = getDatabase();
  const user = (req as AuthenticatedRequest).user;
  const canManage = Boolean(user && (user.stakeholderType === 'Master' || user.permissions?.canManageCmsContent));
  const services = canManage ? db.cmsServices : db.cmsServices.filter(s => s.isPublished !== false);
  res.json({ success: true, services });
});

apiRouter.post('/cms/services', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const item = req.body || {};
  const db = getDatabase();
  const newService = {
    id: `srv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...pickFields(item, [
      'slug','type','category','title','navSubtitle','navSubtitleId','heroHeadline','heroHeadlineId',
      'heroSubtitle','heroSubtitleId','badge','badgeId','metrics','capabilities','technologies',
      'deliverables','testimonial','featured','isPublished'
    ]),
    slug: cleanText(item.slug, 160).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    title: cleanText(item.title, 200),
    isPublished: item.isPublished !== undefined ? Boolean(item.isPublished) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.cmsServices.unshift(newService);
  saveDatabase(db);
  res.json({ success: true, service: newService });
});

apiRouter.put('/cms/services/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body || {};
  const db = getDatabase();
  const idx = db.cmsServices.findIndex(s => s.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Service not found.' });
    return;
  }
  const patch = pickFields(updates, ['slug','type','category','title','navSubtitle','navSubtitleId','heroHeadline','heroHeadlineId','heroSubtitle','heroSubtitleId','badge','badgeId','metrics','capabilities','technologies','deliverables','testimonial','featured','isPublished']);
  db.cmsServices[idx] = { ...db.cmsServices[idx], ...patch, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, service: db.cmsServices[idx] });
});

apiRouter.delete('/cms/services/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const service = db.cmsServices.find((item: any) => item.id === id);
  if (!service) {
    res.status(404).json({ success: false, error: 'Service not found.' });
    return;
  }
  db.cmsServices = db.cmsServices.filter(s => s.id !== id);
  saveDatabase(db);
  recordAuditLog({
    action: 'CMS_SERVICE_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted CMS service "${service.title || id}".`,
    severity: 'warning'
  });
  res.json({ success: true, message: 'Service deleted.' });
});

// CMS Projects
apiRouter.get('/cms/projects', (req: Request, res: Response): void => {
  const db = getDatabase();
  const user = (req as AuthenticatedRequest).user;
  const canManage = Boolean(user && (user.stakeholderType === 'Master' || user.permissions?.canManageCmsContent));
  const projects = canManage ? db.cmsProjects : db.cmsProjects.filter(p => p.isPublished !== false);
  res.json({ success: true, projects });
});

apiRouter.post('/cms/projects', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const item = req.body || {};
  const db = getDatabase();
  const newProj = {
    id: `proj_cms_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    ...pickFields(item, [
      'slug','title','client','industry','pillar','service','featured','image','desc','descId',
      'challenge','challengeId','solution','solutionId','deliverables','technologies','impact','year','isPublished'
    ]),
    slug: cleanText(item.slug, 160).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    title: cleanText(item.title, 240),
    isPublished: item.isPublished !== undefined ? Boolean(item.isPublished) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.cmsProjects.unshift(newProj);
  saveDatabase(db);
  res.json({ success: true, project: newProj });
});

apiRouter.put('/cms/projects/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body || {};
  const db = getDatabase();
  const idx = db.cmsProjects.findIndex(p => p.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Project not found.' });
    return;
  }
  const patch = pickFields(updates, ['slug','title','client','industry','pillar','service','featured','image','desc','descId','challenge','challengeId','solution','solutionId','deliverables','technologies','impact','year','isPublished']);
  db.cmsProjects[idx] = { ...db.cmsProjects[idx], ...patch, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, project: db.cmsProjects[idx] });
});

apiRouter.delete('/cms/projects/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const project = db.cmsProjects.find((item: any) => item.id === id);
  if (!project) {
    res.status(404).json({ success: false, error: 'Project not found.' });
    return;
  }
  db.cmsProjects = db.cmsProjects.filter(p => p.id !== id);
  saveDatabase(db);
  recordAuditLog({
    action: 'CMS_PROJECT_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted CMS project "${project.title || id}".`,
    severity: 'warning'
  });
  res.json({ success: true, message: 'Project deleted.' });
});

// CMS Testimonials
apiRouter.get('/cms/testimonials', (req: Request, res: Response): void => {
  const db = getDatabase();
  const user = (req as AuthenticatedRequest).user;
  const canManage = Boolean(user && (user.stakeholderType === 'Master' || user.permissions?.canManageCmsContent));
  const testimonials = canManage ? db.cmsTestimonials : db.cmsTestimonials.filter(t => t.isPublished !== false);
  res.json({ success: true, testimonials });
});

apiRouter.post('/cms/testimonials', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const item = req.body || {};
  const db = getDatabase();
  const rating = Number(item.rating);
  const newTestimonial = {
    id: `test_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    quote: cleanText(item.quote, 2000),
    quoteId: cleanText(item.quoteId, 2000),
    author: cleanText(item.author, 160),
    role: cleanText(item.role, 160),
    company: cleanText(item.company, 200),
    location: cleanText(item.location, 160),
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 5,
    avatar: cleanOptionalUrl(item.avatar),
    isPublished: item.isPublished !== undefined ? Boolean(item.isPublished) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.cmsTestimonials.unshift(newTestimonial);
  saveDatabase(db);
  res.json({ success: true, testimonial: newTestimonial });
});

apiRouter.put('/cms/testimonials/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body || {};
  const db = getDatabase();
  const idx = db.cmsTestimonials.findIndex(t => t.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Testimonial not found.' });
    return;
  }
  const patch = pickFields(updates, ['quote','quoteId','author','role','company','location','rating','avatar','isPublished']);
  db.cmsTestimonials[idx] = { ...db.cmsTestimonials[idx], ...patch, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, testimonial: db.cmsTestimonials[idx] });
});

apiRouter.delete('/cms/testimonials/:id', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const testimonial = db.cmsTestimonials.find((item: any) => item.id === id);
  if (!testimonial) {
    res.status(404).json({ success: false, error: 'Testimonial not found.' });
    return;
  }
  db.cmsTestimonials = db.cmsTestimonials.filter(t => t.id !== id);
  saveDatabase(db);
  recordAuditLog({
    action: 'CMS_TESTIMONIAL_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted CMS testimonial "${testimonial.author || id}".`,
    severity: 'warning'
  });
  res.json({ success: true, message: 'Testimonial deleted.' });
});

// CMS Settings
apiRouter.get('/cms/settings', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, settings: db.cmsSettings });
});

apiRouter.put('/cms/settings', requireAuth, requirePermission('canManageCmsContent'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const patch = pickFields(req.body || {}, ['siteTitle','siteDescription','contactReceiverEmail','defaultLanguage','enableLiveChat','enableSoundAlerts','maintenanceMode']);
  db.cmsSettings = { ...db.cmsSettings, ...patch, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, settings: db.cmsSettings });
});

// ----------------------------------------------------
// 9. AUDIT LOGS (Server-Side, Tamper-Resistant)
// ----------------------------------------------------

apiRouter.get('/audit-logs', requireAuth, requirePermission('canViewSecurityAuditLogs'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, logs: db.auditLogs });
});

apiRouter.get('/audit-logs/integrity', requireAuth, requirePermission('canViewSecurityAuditLogs'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const integrity = verifyAuditLogChain(db);
  res.status(integrity.valid ? 200 : 409).json({
    success: integrity.valid,
    integrity
  });
});

// ----------------------------------------------------
// 10. NOTIFICATION SETTINGS (Secrets kept strictly on server)
// ----------------------------------------------------

apiRouter.get('/notifications/settings', requireAuth, requirePermission('canAccessServerAndApi'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const s = db.notificationSettings;
  res.json({
    success: true,
    settings: {
      targetEmail: s.targetEmail,
      formspreeEndpoint: s.formspreeEndpoint,
      telegramChatId: s.telegramChatId,
      isEmailActive: s.isEmailActive,
      isTelegramActive: s.isTelegramActive,
      hasTelegramToken: Boolean((process.env.KAPITECH_TELEGRAM_BOT_TOKEN || s.telegramBotToken) && (process.env.KAPITECH_TELEGRAM_BOT_TOKEN || s.telegramBotToken).length > 5)
    }
  });
});

apiRouter.put('/notifications/settings', requireAuth, requirePermission('canAccessServerAndApi'), (req: AuthenticatedRequest, res: Response): void => {
  const { targetEmail, formspreeEndpoint, telegramChatId, isEmailActive, isTelegramActive } = req.body;
  const db = getDatabase();
  const current = db.notificationSettings;

  const nextTargetEmail = targetEmail !== undefined ? cleanText(targetEmail, 254).toLowerCase() : current.targetEmail;
  const nextFormspreeEndpoint = formspreeEndpoint !== undefined ? cleanOptionalUrl(formspreeEndpoint) : current.formspreeEndpoint;
  const nextTelegramChatId = telegramChatId !== undefined ? cleanText(telegramChatId, 120) : current.telegramChatId;

  if (nextTargetEmail && !isValidEmail(nextTargetEmail)) {
    res.status(400).json({ success: false, error: 'Invalid notification target email address.' });
    return;
  }
  if (nextFormspreeEndpoint && !/^https:\/\/(?:www\.)?formspree\.io\//i.test(nextFormspreeEndpoint)) {
    res.status(400).json({ success: false, error: 'Only Formspree HTTPS endpoints are allowed.' });
    return;
  }

  db.notificationSettings = {
    targetEmail: nextTargetEmail,
    formspreeEndpoint: nextFormspreeEndpoint,
    telegramBotToken: current.telegramBotToken,
    telegramChatId: nextTelegramChatId,
    isEmailActive: isEmailActive !== undefined ? Boolean(isEmailActive) : current.isEmailActive,
    isTelegramActive: isTelegramActive !== undefined ? Boolean(isTelegramActive) : current.isTelegramActive,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);

  recordAuditLog({
    action: 'SETTINGS_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: 'Updated notification and dispatch channel settings.',
    severity: 'info'
  });

  res.json({ success: true, message: 'Notification settings saved.' });
});

// ----------------------------------------------------
// 11. SERVER-SIDE GEMINI INTEGRATION (Key never exposed to browser)
// ----------------------------------------------------

apiRouter.post('/ai/generate', requireAuth, requirePermission('canAccessServerAndApi'), rateLimitAuthenticated(10, 60 * 1000), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { prompt, context } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.length > 4000) {
    res.status(400).json({ success: false, error: 'Prompt is required and must be 4000 characters or fewer.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      success: false,
      error: 'Gemini AI service is not configured on server. Please set GEMINI_API_KEY.'
    });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are the executive AI copilot for Kapitech Agency Management System. Context: ${typeof context === 'string' ? context.slice(0, 4000) : 'General Agency Operations'}. Request: ${prompt}`
                  }
                ]
              }
            ]
          }),
          signal: controller.signal
        }
      );

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        console.error('[AI] Gemini API returned HTTP', response.status);
        res.status(502).json({ success: false, error: 'AI service request failed. Please try again later.' });
        return;
      }

      const outputText = Array.isArray(payload?.candidates?.[0]?.content?.parts)
        ? payload.candidates[0].content.parts
            .map((part: { text?: string }) => typeof part.text === 'string' ? part.text : '')
            .join('')
        : '';

      if (!outputText) {
        res.status(502).json({ success: false, error: 'AI service returned an empty response. Please try again later.' });
        return;
      }

      res.json({ success: true, result: outputText });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err: any) {
    console.error('Server Gemini API call failed:', err);
    res.status(502).json({ success: false, error: 'AI service request failed. Please try again later.' });
  }
});

// ----------------------------------------------------
// 12. DATA MIGRATION: IMPORT FROM LEGACY LOCALSTORAGE
// ----------------------------------------------------

apiRouter.post('/migration/import-local', requireAuth, requirePermission('canRunDataMigration'), (req: AuthenticatedRequest, res: Response): void => {
  const { leads, clients, projects, invoices, expenses, vendors, cmsServices, cmsProjects, cmsTestimonials } = req.body;
  const db = getDatabase();
  let importedCount = 0;

  if (Array.isArray(leads) && leads.length > 0) {
    for (const lead of leads) {
      if (!db.leads.some(l => l.id === lead.id || l.email === lead.email)) {
        db.leads.push(lead);
        importedCount++;
      }
    }
  }

  if (Array.isArray(clients) && clients.length > 0) {
    for (const client of clients) {
      if (!db.clients.some(c => c.id === client.id)) {
        db.clients.push(client);
        importedCount++;
      }
    }
  }

  if (Array.isArray(projects) && projects.length > 0) {
    for (const project of projects) {
      if (!db.projects.some(p => p.id === project.id)) {
        db.projects.push(project);
        importedCount++;
      }
    }
  }

  if (Array.isArray(invoices) && invoices.length > 0) {
    for (const invoice of invoices) {
      if (!db.invoices.some(i => i.id === invoice.id || i.invoiceNumber === invoice.invoiceNumber)) {
        db.invoices.push(invoice);
        importedCount++;
      }
    }
  }

  if (Array.isArray(expenses) && expenses.length > 0) {
    for (const expense of expenses) {
      if (!db.expenses.some(e => e.id === expense.id)) {
        db.expenses.push(expense);
        importedCount++;
      }
    }
  }

  if (Array.isArray(vendors) && vendors.length > 0) {
    for (const vendor of vendors) {
      if (!db.vendors.some(v => v.id === vendor.id)) {
        db.vendors.push(vendor);
        importedCount++;
      }
    }
  }

  if (Array.isArray(cmsServices) && cmsServices.length > 0) {
    for (const srv of cmsServices) {
      if (!db.cmsServices.some(s => s.id === srv.id || s.slug === srv.slug)) {
        db.cmsServices.push(srv);
        importedCount++;
      }
    }
  }

  if (Array.isArray(cmsProjects) && cmsProjects.length > 0) {
    for (const proj of cmsProjects) {
      if (!db.cmsProjects.some(p => p.id === proj.id || p.slug === proj.slug)) {
        db.cmsProjects.push(proj);
        importedCount++;
      }
    }
  }

  if (Array.isArray(cmsTestimonials) && cmsTestimonials.length > 0) {
    for (const t of cmsTestimonials) {
      if (!db.cmsTestimonials.some(existing => existing.id === t.id)) {
        db.cmsTestimonials.push(t);
        importedCount++;
      }
    }
  }

  saveDatabase(db);

  recordAuditLog({
    action: 'DATA_MIGRATION',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Imported and synchronized ${importedCount} records from legacy client storage into persistent database.`,
    severity: 'info'
  });

  res.json({
    success: true,
    importedCount,
    message: `Successfully migrated ${importedCount} records into the server database.`
  });
});

// ----------------------------------------------------
// 13. PROPOSALS & QUOTATIONS (PART 12)
// ----------------------------------------------------

apiRouter.get('/crm/proposals', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, proposals: db.proposals || [] });
});

apiRouter.post('/crm/proposals', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const data = req.body;
  const db = getDatabase();

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items = rawItems.slice(0, 100).map((item: any) => ({
    id: cleanText(item?.id || crypto.randomBytes(4).toString('hex'), 80),
    description: cleanText(item?.description, 500),
    quantity: normalizeNumber(item?.quantity ?? 1, 0.01, 100000, 1) || 1,
    unitPrice: normalizeNumber(item?.unitPrice ?? 0, 0, MAX_MONEY, 0) || 0
  })).filter((item: any) => item.description && item.quantity > 0);
  if (!items.length) {
    res.status(400).json({ success: false, error: 'Proposal requires at least one valid line item.' });
    return;
  }
  const subtotal = items.reduce((sum: number, it: any) => sum + (it.quantity * it.unitPrice), 0);
  const discount = Math.min(subtotal, Math.max(0, Number(data.discount) || 0));
  const taxPercent = Math.min(100, Math.max(0, Number(data.taxPercent ?? 11) || 0));
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * (taxPercent / 100));
  const total = taxableAmount + tax;
  const statusValues = new Set(['Draft','Internal Review','Sent','Approved','Rejected','Accepted']);
  const status = statusValues.has(String(data.status)) ? String(data.status) : 'Draft';
  const currency = data.currency === 'USD' ? 'USD' : 'IDR';
  const newProposal = {
    id: `prop_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    proposalNumber: cleanText(data.proposalNumber || `PROP-KAPI-${new Date().getFullYear()}-${crypto.randomInt(1000, 1000000)}`, 80),
    title: cleanText(data.title || 'Digital Engineering Proposal', 240),
    clientName: cleanText(data.clientName || 'Prospective Client', 160),
    company: cleanText(data.company, 200),
    dealId: cleanText(data.dealId, 120),
    projectId: cleanText(data.projectId, 120),
    items,
    subtotal,
    discount,
    taxPercent,
    tax,
    total,
    currency,
    validityPeriod: cleanText(data.validityPeriod || '30 Days', 80),
    paymentTerms: cleanText(data.paymentTerms || '50% Upfront, 50% on Delivery', 300),
    owner: req.user!.name || req.user!.username,
    status,
    notes: cleanText(data.notes, 3000),
    createdDate: new Date().toISOString().split('T')[0],
    sentDate: data.sentDate || null,
    approvedDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.proposals) db.proposals = [];
  db.proposals.unshift(newProposal);
  saveDatabase(db);

  recordAuditLog({
    action: 'PROPOSAL_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created proposal ${newProposal.proposalNumber} for ${newProposal.clientName} (Total: ${newProposal.total}).`,
    severity: 'info'
  });

  res.json({ success: true, proposal: newProposal });
});

apiRouter.put('/crm/proposals/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const updates = req.body || {};
  const db = getDatabase();
  const idx = (db.proposals || []).findIndex(p => p.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Proposal not found.' });
    return;
  }

  const existing = db.proposals[idx];
  const items = Array.isArray(updates.items) ? updates.items.slice(0, 100).map((item: any) => ({
    id: cleanText(item?.id || crypto.randomBytes(4).toString('hex'), 80),
    description: cleanText(item?.description, 500),
    quantity: Math.min(100000, Math.max(0, Number(item?.quantity) || 0)),
    unitPrice: Math.min(10_000_000_000, Math.max(0, Number(item?.unitPrice) || 0))
  })).filter((item: any) => item.description && item.quantity > 0) : existing.items;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: 'Proposal requires at least one valid line item.' });
    return;
  }
  const subtotal = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) * Number(it.unitPrice)), 0);
  const discount = updates.discount !== undefined ? Math.min(subtotal, Math.max(0, Number(updates.discount) || 0)) : (existing.discount || 0);
  const taxPercent = updates.taxPercent !== undefined ? Math.min(100, Math.max(0, Number(updates.taxPercent) || 0)) : (existing.taxPercent || 11);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * (taxPercent / 100));
  const total = taxableAmount + tax;
  const patch = pickFields(updates, ['proposalNumber','title','clientName','company','dealId','projectId','currency','validityPeriod','paymentTerms','status','notes','sentDate']);
  if (patch.proposalNumber !== undefined && !/^[A-Za-z0-9._/-]{1,80}$/.test(String(patch.proposalNumber))) {
    res.status(400).json({ success: false, error: 'Invalid proposal number.' });
    return;
  }
  for (const key of ['title','clientName','company','dealId','projectId','validityPeriod','paymentTerms','notes'] as const) {
    if (patch[key] !== undefined) patch[key] = cleanText(patch[key], key === 'notes' ? 3000 : 300);
  }
  if (patch.currency !== undefined && !['IDR','USD'].includes(String(patch.currency))) {
    res.status(400).json({ success: false, error: 'Invalid proposal currency.' });
    return;
  }
  if (patch.status !== undefined && !['Draft','Internal Review','Sent','Approved','Rejected','Accepted'].includes(String(patch.status))) {
    res.status(400).json({ success: false, error: 'Invalid proposal status.' });
    return;
  }
  if (patch.sentDate !== undefined && patch.sentDate !== null && !isValidDate(patch.sentDate)) {
    res.status(400).json({ success: false, error: 'Invalid proposal sent date.' });
    return;
  }
  db.proposals[idx] = {
    ...existing,
    ...patch,
    items,
    subtotal,
    discount,
    taxPercent,
    tax,
    total,
    updatedAt: new Date().toISOString()
  };

  saveDatabase(db);
  recordAuditLog({
    action: 'PROPOSAL_UPDATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Updated proposal ${db.proposals[idx].proposalNumber}.`,
    severity: 'info'
  });
  res.json({ success: true, proposal: db.proposals[idx] });
});

apiRouter.post('/crm/proposals/:id/approve', requireAuth, requirePermission('canApproveBudgets'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const prop = (db.proposals || []).find(p => p.id === id);

  if (!prop) {
    res.status(404).json({ success: false, error: 'Proposal not found.' });
    return;
  }

  if (!['Draft','Internal Review','Sent'].includes(String(prop.status))) {
    res.status(409).json({ success: false, error: 'Only draft, internal review, or sent proposals can be approved.' });
    return;
  }
  prop.status = 'Approved';
  prop.approvedDate = new Date().toISOString().split('T')[0];
  prop.updatedAt = new Date().toISOString();
  saveDatabase(db);

  recordAuditLog({
    action: 'PROPOSAL_APPROVED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Approved proposal ${prop.proposalNumber}.`,
    severity: 'info'
  });

  res.json({ success: true, proposal: prop });
});

apiRouter.post('/crm/proposals/:id/convert-to-invoice', requireAuth, requirePermission('canManageInvoices'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const prop = (db.proposals || []).find(p => p.id === id);

  if (!prop) {
    res.status(404).json({ success: false, error: 'Proposal not found.' });
    return;
  }

  const year = new Date().getFullYear();
  let invoiceNumber = `INV-KAPI-${year}-${crypto.randomInt(1000, 1000000)}`;
  while (db.invoices.some((invoice: any) => invoice.invoiceNumber === invoiceNumber)) {
    invoiceNumber = `INV-KAPI-${year}-${crypto.randomInt(1000, 1000000)}`;
  }
  const newInvoice = {
    id: `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    invoiceNumber,
    clientName: prop.clientName,
    clientCompany: prop.company || prop.clientName,
    clientEmail: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    items: prop.items,
    subtotal: prop.subtotal,
    taxPercent: prop.taxPercent,
    taxAmount: prop.tax,
    total: prop.total,
    amountPaid: 0,
    balanceDue: prop.total,
    payments: [],
    notes: `Generated from Proposal ${prop.proposalNumber}. Terms: ${prop.paymentTerms}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.invoices.unshift(newInvoice);
  prop.status = 'Accepted';
  prop.updatedAt = new Date().toISOString();
  saveDatabase(db);

  recordAuditLog({
    action: 'PROPOSAL_CONVERTED_TO_INVOICE',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Converted proposal ${prop.proposalNumber} to invoice ${newInvoice.invoiceNumber}.`,
    severity: 'info'
  });

  res.json({ success: true, invoice: newInvoice, proposal: prop });
});

apiRouter.delete('/crm/proposals/:id', requireAuth, requirePermission('canManageCrm'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.proposals = (db.proposals || []).filter(p => p.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Proposal deleted.' });
});

// ----------------------------------------------------
// 14. PROJECT TASKS & TIME TRACKING (PARTS 16, 17, 18)
// ----------------------------------------------------

apiRouter.get('/projects/tasks', requireAuth, requireAnyPermission('canManageKanbanTasks', 'canManageProjects'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (getDataSourceMode() === 'postgres') {
      res.json({ success: true, tasks: await postgresTaskRepository.list() });
      return;
    }
    const db = getDatabase();
    res.json({ success: true, tasks: db.tasks || [] });
  } catch (error) {
    console.error('[Tasks] Failed to load tasks:', error);
    res.status(503).json({ success: false, error: 'Task data is temporarily unavailable.' });
  }
});

apiRouter.post('/projects/tasks', requireAuth, requirePermission('canManageKanbanTasks'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const taskData = req.body || {};
  const dueDate = String(taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const estimatedHours = normalizeNumber(taskData.estimatedHours ?? 8, 0, 10000, 8);
  const actualHours = normalizeNumber(taskData.actualHours ?? 0, 0, 10000, 0);
  const priority = ['low','medium','high','urgent'].includes(String(taskData.priority)) ? String(taskData.priority) : 'medium';
  const status = ['todo','in_progress','review','done'].includes(String(taskData.status)) ? String(taskData.status) : 'todo';

  if (!taskData.title || !isValidDate(dueDate) || estimatedHours === null || actualHours === null) {
    res.status(400).json({ success: false, error: 'Task title, due date, and valid hour values are required.' });
    return;
  }

  const newTask = {
    id: String(taskData.id || ('task_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'))),
    title: cleanText(taskData.title, 240),
    description: cleanText(taskData.description, 3000),
    projectId: cleanText(taskData.projectId, 120),
    projectName: cleanText(taskData.projectName || 'General Delivery', 200),
    assignee: cleanText(taskData.assignee || req.user!.name || req.user!.username, 160),
    assigneeUserId: cleanText(taskData.assigneeUserId, 120),
    reporter: req.user!.name || req.user!.username,
    priority,
    status,
    dueDate,
    estimatedHours,
    actualHours,
    tags: normalizeStringArray(Array.isArray(taskData.tags) && taskData.tags.length ? taskData.tags : ['Sprint'], 30, 80),
    subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks.slice(0, 50) : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!newTask.projectId) {
    res.status(400).json({ success: false, error: 'Task projectId is required.' });
    return;
  }

  try {
    if (getDataSourceMode() === 'postgres') {
      const created = await postgresTaskRepository.create(newTask);
      recordAuditLog({
        action: 'TASK_CREATED',
        actor: req.user!.username,
        actorRole: req.user!.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        details: 'Created task "' + created.title + '".',
        severity: 'info'
      });
      res.json({ success: true, task: created });
      return;
    }

    const db = getDatabase();
    if (!db.tasks) db.tasks = [];
    db.tasks.unshift(newTask);
    saveDatabase(db);
    recordAuditLog({
      action: 'TASK_CREATED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: 'Created task "' + newTask.title + '".',
      severity: 'info'
    });
    res.json({ success: true, task: newTask });
  } catch (error: any) {
    if (error?.code === '23503') {
      res.status(400).json({ success: false, error: 'Referenced project or assignee does not exist.' });
      return;
    }
    console.error('[Tasks] Create failed:', error);
    res.status(500).json({ success: false, error: 'Task could not be created.' });
  }
});

apiRouter.put('/projects/tasks/:id', requireAuth, requirePermission('canManageKanbanTasks'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body || {};
  const patch = pickFields(updates, ['title','description','projectId','projectName','assignee','assigneeUserId','priority','status','dueDate','estimatedHours','actualHours','tags','subtasks','version']);

  for (const key of ['title','description','projectId','projectName','assignee','assigneeUserId'] as const) {
    if (patch[key] !== undefined) patch[key] = cleanText(patch[key], key === 'description' ? 3000 : 240);
  }
  if (patch.status !== undefined && !['todo','in_progress','review','done'].includes(String(patch.status))) {
    res.status(400).json({ success: false, error: 'Invalid task status.' });
    return;
  }
  if (patch.priority !== undefined && !['low','medium','high','urgent'].includes(String(patch.priority))) {
    res.status(400).json({ success: false, error: 'Invalid task priority.' });
    return;
  }
  if (patch.dueDate !== undefined && !isValidDate(patch.dueDate)) {
    res.status(400).json({ success: false, error: 'Invalid task due date.' });
    return;
  }
  for (const key of ['estimatedHours','actualHours'] as const) {
    if (patch[key] !== undefined) {
      const numeric = normalizeNumber(patch[key], 0, 10000);
      if (numeric === null) {
        res.status(400).json({ success: false, error: 'Invalid task hours for ' + key + '.' });
        return;
      }
      patch[key] = numeric;
    }
  }
  if (patch.tags !== undefined) patch.tags = normalizeStringArray(patch.tags, 30, 80);
  if (patch.subtasks !== undefined) patch.subtasks = Array.isArray(patch.subtasks) ? patch.subtasks.slice(0, 50) : [];

  try {
    if (getDataSourceMode() === 'postgres') {
      const existing = await postgresTaskRepository.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Task not found.' });
        return;
      }
      const updated = await postgresTaskRepository.update(id, patch as Record<string, any>);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Task not found.' });
        return;
      }
      recordAuditLog({
        action: 'TASK_UPDATED',
        actor: req.user!.username,
        actorRole: req.user!.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        details: 'Updated task ' + id + '.',
        severity: 'info'
      });
      res.json({ success: true, task: updated });
      return;
    }

    const db = getDatabase();
    const idx = (db.tasks || []).findIndex(t => t.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: 'Task not found.' });
      return;
    }
    db.tasks[idx] = { ...db.tasks[idx], ...patch, updatedAt: new Date().toISOString() };
    saveDatabase(db);
    recordAuditLog({
      action: 'TASK_UPDATED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: 'Updated task ' + id + '.',
      severity: 'info'
    });
    res.json({ success: true, task: db.tasks[idx] });
  } catch (error: any) {
    if (error instanceof TaskVersionConflictError) {
      res.status(409).json({ success: false, error: error.message, code: error.code });
      return;
    }
    if (error instanceof ProjectArchiveMutationError || error?.code === '23503') {
      res.status(409).json({ success: false, error: error.message || 'Task references an invalid or archived project.', code: error.code || 'TASK_DEPENDENCY_ERROR' });
      return;
    }
    console.error('[Tasks] Update failed:', error);
    res.status(500).json({ success: false, error: 'Task could not be updated.' });
  }
});

apiRouter.delete('/projects/tasks/:id', requireAuth, requirePermission('canManageKanbanTasks'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (getDataSourceMode() === 'postgres') {
      const archived = await postgresTaskRepository.archive(id);
      if (!archived) {
        res.status(404).json({ success: false, error: 'Task not found.' });
        return;
      }
      recordAuditLog({
        action: 'TASK_ARCHIVED',
        actor: req.user!.username,
        actorRole: req.user!.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'] as string,
        details: 'Archived task ' + id + '.',
        severity: 'warning'
      });
      res.json({ success: true, message: 'Task archived.' });
      return;
    }

    const db = getDatabase();
    const exists = (db.tasks || []).some(t => t.id === id);
    db.tasks = (db.tasks || []).filter(t => t.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: exists ? 'Task deleted.' : 'Task not found.' });
  } catch (error) {
    console.error('[Tasks] Archive failed:', error);
    res.status(500).json({ success: false, error: 'Task could not be archived.' });
  }
});

// Time Tracking
apiRouter.get('/projects/timelogs', requireAuth, requireAnyPermission('canManageKanbanTasks', 'canManageProjects'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, timeLogs: db.timeLogs || [] });
});

apiRouter.post('/projects/timelogs', requireAuth, requireAnyPermission('canManageKanbanTasks', 'canManageProjects'), (req: AuthenticatedRequest, res: Response): void => {
  const logData = req.body || {};
  const durationMinutes = normalizeNumber(logData.durationMinutes ?? 60, 1, 1440, 60);
  const date = String(logData.date || new Date().toISOString().slice(0, 10));

  if (durationMinutes === null || !isValidDate(date)) {
    res.status(400).json({ success: false, error: 'Valid duration and date are required for a time entry.' });
    return;
  }

  const db = getDatabase();
  const newLog = {
    id: `tim_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    projectId: cleanText(logData.projectId, 120),
    projectName: cleanText(logData.projectName || 'General', 200),
    taskId: cleanText(logData.taskId, 120),
    taskTitle: cleanText(logData.taskTitle, 240),
    user: req.user!.name || req.user!.username,
    durationMinutes,
    billable: logData.billable !== undefined ? Boolean(logData.billable) : true,
    date,
    notes: cleanText(logData.notes, 2000),
    createdAt: new Date().toISOString()
  };

  if (!db.timeLogs) db.timeLogs = [];
  db.timeLogs.unshift(newLog);
  saveDatabase(db);
  recordAuditLog({
    action: 'TIMELOG_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created ${durationMinutes} minute time entry for ${newLog.projectName}.`,
    severity: 'info'
  });
  res.json({ success: true, timeLog: newLog });
});

apiRouter.delete('/projects/timelogs/:id', requireAuth, requireAnyPermission('canManageKanbanTasks', 'canManageProjects'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  db.timeLogs = (db.timeLogs || []).filter(t => t.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Time entry deleted.' });
});

// ----------------------------------------------------
// 15. APPROVALS CENTER (PART 24)
// ----------------------------------------------------

apiRouter.get('/approvals', requireAuth, requireAnyPermission('canApproveBudgets', 'canManageProjects', 'canViewFinancials'), (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({ success: true, approvals: db.approvals || [] });
});

apiRouter.post('/approvals', requireAuth, requireAnyPermission('canManageProjects', 'canApproveBudgets'), (req: AuthenticatedRequest, res: Response): void => {
  const data = req.body || {};
  const type = String(data.type || 'Invoice').trim().slice(0, 80);
  const referenceId = String(data.referenceId || '').trim().slice(0, 120);
  const title = String(data.title || 'Approval Request').trim().slice(0, 200);
  const reason = String(data.reason || 'Standard operational review').trim().slice(0, 2000);
  const riskLevel = ['Low', 'Medium', 'High', 'Critical'].includes(String(data.riskLevel))
    ? String(data.riskLevel)
    : 'Low';
  const value = Number(data.value);

  if (!title || !reason || !Number.isFinite(value) || value < 0) {
    res.status(400).json({ success: false, error: 'Approval title, reason, and a valid non-negative value are required.' });
    return;
  }

  const db = getDatabase();
  const newApproval = {
    id: `appr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    type,
    referenceId,
    title,
    requesterId: req.user!.id,
    requester: req.user!.name || req.user!.username,
    requesterRole: req.user!.role,
    value,
    date: new Date().toISOString().split('T')[0],
    reason,
    riskLevel,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  if (!db.approvals) db.approvals = [];
  db.approvals.unshift(newApproval);
  pushNotification(db, {
    title: 'Approval request pending',
    message: `${newApproval.title} requires an independent review.`,
    type: 'approval',
    severity: riskLevel === 'Critical' ? 'critical' : riskLevel === 'High' ? 'warning' : 'info',
    linkUrl: '/admin/approvals'
  });
  saveDatabase(db);

  recordAuditLog({
    action: 'APPROVAL_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created approval request "${title}" for ${value}.`,
    severity: riskLevel === 'Critical' ? 'critical' : riskLevel === 'High' ? 'warning' : 'info'
  });

  res.json({ success: true, approval: newApproval });
});

apiRouter.post('/approvals/:id/action', requireAuth, requirePermission('canApproveBudgets'), (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const action = String(req.body?.action || '');
  const notes = String(req.body?.notes || '').trim().slice(0, 2000);
  const allowedActions = new Set(['Approve', 'Reject', 'Request Changes']);

  if (!allowedActions.has(action)) {
    res.status(400).json({ success: false, error: 'Invalid approval action.' });
    return;
  }

  const db = getDatabase();
  const item = (db.approvals || []).find(a => a.id === id);

  if (!item) {
    res.status(404).json({ success: false, error: 'Approval item not found.' });
    return;
  }

  if (item.status !== 'Pending') {
    res.status(409).json({ success: false, error: 'This approval request has already been resolved.' });
    return;
  }

  if (item.requesterId && item.requesterId === req.user!.id) {
    recordAuditLog({
      action: 'APPROVAL_SELF_ACTION_BLOCKED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `Blocked self-approval action "${action}" on approval item "${item.title}".`,
      severity: 'warning'
    });
    res.status(403).json({ success: false, error: 'Maker-checker control: the requester cannot approve or reject their own request.' });
    return;
  }

  if (!item.requesterId && item.requester) {
    const legacyRequester = db.users.find(u => u.name === item.requester || u.username === item.requester);
    if (legacyRequester) item.requesterId = legacyRequester.id;
  }
  item.status = action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Rejected' : 'Changes Requested';
  item.reviewedById = req.user!.id;
  item.reviewedBy = req.user!.name || req.user!.username;
  item.reviewedAt = new Date().toISOString();
  item.reviewNotes = notes;

  saveDatabase(db);

  recordAuditLog({
    action: `APPROVAL_${action.toUpperCase().replace(/ /g, '_')}`,
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `${action} decision executed for approval item "${item.title}".`,
    severity: action === 'Reject' ? 'warning' : 'info'
  });

  res.json({ success: true, approval: item });
});

// ----------------------------------------------------
// 16. DOCUMENTS & ASSET VAULT
// ----------------------------------------------------

const PRIVATE_DOCUMENT_DIR = process.env.KAPITECH_DATA_DIR
  ? path.join(path.resolve(process.env.KAPITECH_DATA_DIR), 'private-documents')
  : path.join(process.env.HOME || process.cwd(), '.kapitech-ams-data', 'private-documents');

const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]);

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function publicDocument(document: any): any {
  const { storageKey, ownerUserId, accessUserIds, ...safeDocument } = document || {};
  if (safeDocument.sourceType === 'private_file' && safeDocument.status === 'ready') {
    safeDocument.downloadUrl = `/api/documents/${encodeURIComponent(String(safeDocument.id))}/content`;
  }
  return safeDocument;
}

function canAccessDocument(req: AuthenticatedRequest, document: any): boolean {
  if (!req.user || req.user.stakeholderType === 'Master') return true;

  const ownerUserId = String(document?.ownerUserId || '');
  const accessUserIds = Array.isArray(document?.accessUserIds)
    ? document.accessUserIds.map((id: unknown) => String(id))
    : [];

  // Legacy records without an explicit access list keep module-permission access.
  if (!ownerUserId && accessUserIds.length === 0) return true;

  return ownerUserId === req.user.id || accessUserIds.includes(req.user.id);
}

function requireDocumentObjectAccess(req: AuthenticatedRequest, res: Response): boolean {
  const id = req.params.id;
  if (!id) return true;

  const document = (getDatabase().documents || []).find((item: any) => item.id === id);
  if (!document) return true;

  if (!canAccessDocument(req, document)) {
    recordAuditLog({
      action: 'DOCUMENT_ACCESS_DENIED',
      actor: req.user?.username || 'anonymous',
      actorRole: req.user?.role || 'visitor',
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `Object-level document access denied for "${document.name || id}".`,
      severity: 'warning'
    });
    res.status(403).json({ success: false, error: 'Document access denied.' });
    return false;
  }

  return true;
}

function privateDocumentPath(document: any): string {
  if (!document?.storageKey || !/^[a-f0-9]{64}$/.test(String(document.storageKey))) return '';
  return path.join(PRIVATE_DOCUMENT_DIR, `${document.storageKey}.enc`);
}

function getDocumentEncryptionKey(): Buffer {
  const raw = process.env.KAPITECH_DATA_ENCRYPTION_KEY?.trim() || '';
  const key = /^[0-9a-f]{64}$/i.test(raw)
    ? Buffer.from(raw, 'hex')
    : Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('Document encryption key is not configured correctly.');
  }
  return key;
}

function encryptPrivateDocument(buffer: Buffer): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getDocumentEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.from(
    'KAPI-FILE-V1:' + JSON.stringify({
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      data: encrypted.toString('base64')
    }),
    'utf8'
  );
}

function decryptPrivateDocument(payload: Buffer): Buffer {
  const raw = payload.toString('utf8');
  if (!raw.startsWith('KAPI-FILE-V1:')) {
    throw new Error('Private document encryption header is invalid.');
  }
  const envelope = JSON.parse(raw.slice('KAPI-FILE-V1:'.length));
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getDocumentEncryptionKey(),
    Buffer.from(envelope.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(envelope.authTag, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(envelope.data, 'base64')),
    decipher.final()
  ]);
}

function ensurePrivateDocumentDirectory(): void {
  if (!fs.existsSync(PRIVATE_DOCUMENT_DIR)) {
    fs.mkdirSync(PRIVATE_DOCUMENT_DIR, { recursive: true, mode: 0o700 });
  } else {
    try { fs.chmodSync(PRIVATE_DOCUMENT_DIR, 0o700); } catch {}
  }
}

const documentAccessMiddleware = requireAnyPermission(
  'canManageProjects',
  'canManageCrm',
  'canViewFinancials',
  'canViewSecurityAuditLogs'
);
const documentMutationMiddleware = requireAnyPermission(
  'canManageProjects',
  'canManageCrm',
  'canAccessServerAndApi'
);

apiRouter.get('/documents', requireAuth, documentAccessMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  res.json({
    success: true,
    documents: (db.documents || [])
      .filter((document: any) => canAccessDocument(req, document))
      .map(publicDocument)
  });
});

apiRouter.post('/documents', requireAuth, documentMutationMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const data = req.body || {};
  const sourceType = data.url ? 'external_link' : 'private_file';
  const name = cleanText(data.name || 'Document', 240);
  const mimeType = cleanText(data.mimeType || '', 160).toLowerCase();

  if (sourceType === 'external_link') {
    const externalUrl = cleanOptionalUrl(data.url);
    let externalProtocol = '';
    try { externalProtocol = new URL(externalUrl).protocol; } catch {}
    if (!externalUrl || externalProtocol !== 'https:') {
      res.status(400).json({ success: false, error: 'Only valid HTTPS document links are allowed.' });
      return;
    }
  } else if (mimeType && !DOCUMENT_MIME_TYPES.has(mimeType)) {
    res.status(400).json({ success: false, error: 'Unsupported document file type.' });
    return;
  }

  const db = getDatabase();
  const newDoc: any = {
    id: `doc_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
    name,
    title: name,
    type: cleanText(data.type || 'Document', 40),
    mimeType,
    size: cleanText(data.size || '0 B', 40),
    sizeBytes: Math.max(0, Math.floor(Number(data.sizeBytes) || 0)),
    category: cleanText(data.category || 'General', 100),
    relatedEntity: cleanText(data.relatedEntity || 'General', 200),
    relatedId: cleanText(data.relatedId || '', 120),
    owner: req.user!.name || req.user!.username,
    ownerUserId: req.user!.id,
    accessUserIds: [req.user!.id],
    sourceType,
    status: sourceType === 'private_file' ? 'pending_upload' : 'external_link',
    uploadedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (sourceType === 'private_file') {
    newDoc.storageKey = crypto.randomBytes(32).toString('hex');
  } else {
    newDoc.url = cleanOptionalUrl(data.url);
  }

  if (!db.documents) db.documents = [];
  db.documents.unshift(newDoc);
  saveDatabase(db);

  recordAuditLog({
    action: 'DOCUMENT_CREATED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Created document record "${name}" (${sourceType}).`,
    severity: 'info'
  });

  res.status(201).json({ success: true, document: publicDocument(newDoc) });
});

apiRouter.put('/documents/:id/content', requireAuth, documentMutationMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const document = (db.documents || []).find((item: any) => item.id === id);

  if (!document) {
    res.status(404).json({ success: false, error: 'Document not found.' });
    return;
  }
  if (!requireDocumentObjectAccess(req, res)) return;

  if (document.sourceType !== 'private_file' || !document.storageKey) {
    res.status(409).json({ success: false, error: 'This document is an external link and has no private file content.' });
    return;
  }

  const body = req.body;
  if (!Buffer.isBuffer(body) || body.length === 0) {
    res.status(400).json({ success: false, error: 'A non-empty document file is required.' });
    return;
  }
  if (body.length > 25 * 1024 * 1024) {
    res.status(413).json({ success: false, error: 'Document exceeds the 25 MB vault limit.' });
    return;
  }

  const mimeType = String(req.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!DOCUMENT_MIME_TYPES.has(mimeType)) {
    res.status(415).json({ success: false, error: 'Unsupported document MIME type.' });
    return;
  }

  ensurePrivateDocumentDirectory();
  const targetPath = privateDocumentPath(document);
  if (!targetPath) {
    res.status(400).json({ success: false, error: 'Invalid private document storage reference.' });
    return;
  }

  const tempPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tempPath, encryptPrivateDocument(body), { flag: 'wx', mode: 0o600 });
    try { fs.chmodSync(tempPath, 0o600); } catch {}
    if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
    fs.renameSync(tempPath, targetPath);

    document.mimeType = mimeType;
    document.type = mimeType.split('/').pop()?.toUpperCase() || document.type || 'FILE';
    document.sizeBytes = body.length;
    document.size = humanFileSize(body.length);
    document.status = 'ready';
    document.updatedAt = new Date().toISOString();
    document.uploadedAt = document.updatedAt;
    saveDatabase(db);

    recordAuditLog({
      action: 'DOCUMENT_UPLOADED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `Uploaded private document "${document.name}" (${body.length} bytes).`,
      severity: 'info'
    });

    res.json({ success: true, document: publicDocument(document) });
  } catch (error) {
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch {}
    console.error('[Documents] Private upload failed:', error);
    res.status(500).json({ success: false, error: 'Private document storage failed.' });
  }
});

apiRouter.get('/documents/:id/content', requireAuth, documentAccessMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const document = (db.documents || []).find((item: any) => item.id === id);

  if (!document) {
    res.status(404).json({ success: false, error: 'Document not found.' });
    return;
  }
  if (!requireDocumentObjectAccess(req, res)) return;

  if (document.sourceType !== 'private_file' || document.status !== 'ready') {
    res.status(409).json({ success: false, error: 'Private document content is not available.' });
    return;
  }

  const filePath = privateDocumentPath(document);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: 'Private document content is missing.' });
    return;
  }

  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(String(document.name || 'document'))}`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Download-Options', 'noopen');
  try {
    const encryptedPayload = fs.readFileSync(filePath);
    const content = decryptPrivateDocument(encryptedPayload);
    res.setHeader('Content-Length', content.length);
    res.end(content);
    recordAuditLog({
      action: 'DOCUMENT_DOWNLOADED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `Downloaded private document "${document.name}".`,
      severity: 'info'
    });
  } catch (error) {
    console.error('[Documents] Private download failed:', error);
    res.status(500).json({ success: false, error: 'Document delivery failed.' });
  }
});

apiRouter.delete('/documents/:id', requireAuth, documentMutationMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const document = (db.documents || []).find((item: any) => item.id === id);

  if (!document) {
    res.status(404).json({ success: false, error: 'Document not found.' });
    return;
  }

  const filePath = privateDocumentPath(document);
  if (!requireDocumentObjectAccess(req, res)) return;

  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (error) {
      console.error('[Documents] Failed to remove private content:', error);
      res.status(500).json({ success: false, error: 'Private document content could not be removed safely.' });
      return;
    }
  }

  db.documents = (db.documents || []).filter(d => d.id !== id);
  saveDatabase(db);

  recordAuditLog({
    action: 'DOCUMENT_DELETED',
    actor: req.user!.username,
    actorRole: req.user!.role,
    ip: req.ip,
    userAgent: req.headers['user-agent'] as string,
    details: `Deleted document "${document.name}".`,
    severity: 'warning'
  });

  res.json({ success: true, message: 'Document removed.' });
});

// ----------------------------------------------------
// 17. SYSTEM BACKUP CONTROLS
// ----------------------------------------------------

const backupAccessMiddleware = requireAnyPermission('canRunDataMigration', 'canAccessServerAndApi');

apiRouter.post('/system/backups', requireAuth, backupAccessMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const backup = createDatabaseBackup(true);
    if (!backup) {
      res.status(404).json({ success: false, error: 'No persistent database file exists yet.' });
      return;
    }

    recordAuditLog({
      action: 'DATABASE_BACKUP_CREATED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `Created a manual encrypted database backup (${backup.sizeBytes} bytes).`,
      severity: 'info'
    });

    res.json({
      success: true,
      backup: {
        createdAt: backup.createdAt,
        sizeBytes: backup.sizeBytes
      }
    });
  } catch (error) {
    console.error('[Backup] Manual backup failed:', error);
    res.status(500).json({ success: false, error: 'Database backup could not be created.' });
  }
});

apiRouter.get('/system/backups/download', requireAuth, backupAccessMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const backup = createDatabaseBackup(true);
    if (!backup) {
      res.status(404).json({ success: false, error: 'No persistent database file exists yet.' });
      return;
    }

    const dataDir = process.env.KAPITECH_DATA_DIR
      ? path.resolve(process.env.KAPITECH_DATA_DIR)
      : path.join(process.env.HOME || process.cwd(), '.kapitech-ams-data');
    const backupDir = process.env.KAPITECH_DB_BACKUP_DIR
      ? path.resolve(process.env.KAPITECH_DB_BACKUP_DIR)
      : path.join(dataDir, 'backups');
    const candidates = listDatabaseBackups();
    const latest = candidates[0];
    if (!latest) {
      res.status(404).json({ success: false, error: 'Backup file is not available.' });
      return;
    }

    const backupPath = path.join(backupDir, latest.name);
    if (!fs.existsSync(backupPath)) {
      res.status(404).json({ success: false, error: 'Backup file is not available.' });
      return;
    }

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(latest.name)}`);
    res.sendFile(backupPath);
    recordAuditLog({
      action: 'DATABASE_BACKUP_DOWNLOADED',
      actor: req.user!.username,
      actorRole: req.user!.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'] as string,
      details: `Downloaded encrypted database backup "${latest.name}".`,
      severity: 'warning'
    });
  } catch (error) {
    console.error('[Backup] Encrypted backup download failed:', error);
    res.status(500).json({ success: false, error: 'Database backup download failed.' });
  }
});

apiRouter.get('/system/backups/integrity', requireAuth, backupAccessMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const integrity = verifyDatabaseBackupIntegrity();
    res.status(integrity.valid ? 200 : 409).json({
      success: integrity.valid,
      integrity
    });
  } catch (error) {
    console.error('[Backup] Backup integrity check failed:', error);
    res.status(500).json({ success: false, error: 'Database backup integrity status is unavailable.' });
  }
});

apiRouter.get('/system/backups', requireAuth, backupAccessMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const backups = listDatabaseBackups().map(backup => ({
      createdAt: backup.createdAt,
      sizeBytes: backup.sizeBytes
    }));
    res.json({
      success: true,
      backups,
      retention: Math.min(30, Math.max(3, Math.floor(Number(process.env.KAPITECH_DB_BACKUP_RETENTION || 14) || 14))),
      encryptedAtRest: isDataEncryptionEnabled(),
      privateDocumentEncryption: isDataEncryptionEnabled()
    });
  } catch (error) {
    console.error('[Backup] Backup listing failed:', error);
    res.status(500).json({ success: false, error: 'Database backup status is unavailable.' });
  }
});

apiRouter.get('/system/security/status', requireAuth, requireAnyPermission('canViewSecurityAuditLogs', 'canAccessServerAndApi'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const db = getDatabase();
    const users = Array.isArray(db.users) ? db.users : [];
    const activeUserCount = users.filter(user => user.status === 'active').length;
    const mfaEnabledCount = users.filter(user => user.status === 'active' && user.mfaEnabled).length;
    const backups = listDatabaseBackups();
    const latestBackup = backups[0];
    const latestBackupAgeMs = latestBackup ? Math.max(0, Date.now() - new Date(latestBackup.createdAt).getTime()) : null;
    const backupIntegrity = verifyDatabaseBackupIntegrity();

    res.json({
      success: true,
      status: {
        encryptionAtRest: isDataEncryptionEnabled(),
        privateDocumentEncryption: isDataEncryptionEnabled(),
        mfaRequired: true,
        activeUserCount,
        mfaEnabledCount,
        mfaCoveragePercent: activeUserCount > 0 ? Math.round((mfaEnabledCount / activeUserCount) * 100) : 100,
        backupCount: backups.length,
        latestBackupAt: latestBackup?.createdAt || null,
        latestBackupAgeMinutes: latestBackupAgeMs === null ? null : Math.round(latestBackupAgeMs / 60000),
        backupFresh: latestBackupAgeMs !== null && latestBackupAgeMs <= 24 * 60 * 60 * 1000,
        backupIntegrity
      }
    });
  } catch (error) {
    console.error('[Security] Security posture check failed:', error);
    res.status(500).json({ success: false, error: 'Security posture status is unavailable.' });
  }
});

// ----------------------------------------------------
// 17. UNIFIED NOTIFICATIONS CENTER
// ----------------------------------------------------

// ----------------------------------------------------
// 17. UNIFIED NOTIFICATIONS CENTER (PART 28)
// ----------------------------------------------------

apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const isMaster = req.user!.stakeholderType === 'Master';
  const canViewFinance = isMaster || Boolean(req.user!.permissions?.canViewFinancials || req.user!.permissions?.canManageInvoices);
  const canViewCrm = isMaster || Boolean(req.user!.permissions?.canManageCrm);
  const canViewApprovals = isMaster || Boolean(req.user!.permissions?.canApproveBudgets || req.user!.permissions?.canManageProjects);

  const notifications = (db.notifications || []).filter((notification) => {
    const typeAllowed =
      notification.type === 'finance' ? canViewFinance :
      notification.type === 'lead' ? canViewCrm :
      notification.type === 'approval' ? canViewApprovals :
      true;
    const recipientAllowed = !notification.recipientUserId || notification.recipientUserId === req.user!.id;
    return typeAllowed && recipientAllowed;
  }).map((notification) => ({
    ...notification,
    read: Array.isArray(notification.readBy)
      ? notification.readBy.includes(req.user!.id)
      : Boolean(notification.read)
  }));

  res.json({ success: true, notifications });
});

apiRouter.post('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDatabase();
  const notif = (db.notifications || []).find(n => n.id === id);
  if (!notif) {
    res.status(404).json({ success: false, error: 'Notification not found.' });
    return;
  }
  if (notif.recipientUserId && notif.recipientUserId !== req.user!.id) {
    res.status(403).json({ success: false, error: 'Notification access denied.' });
    return;
  }
  if (!Array.isArray(notif.readBy)) notif.readBy = [];
  if (!notif.readBy.includes(req.user!.id)) notif.readBy.push(req.user!.id);
  saveDatabase(db);
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  for (const notification of (db.notifications || [])) {
    if (notification.recipientUserId && notification.recipientUserId !== req.user!.id) continue;
    if (!Array.isArray(notification.readBy)) notification.readBy = [];
    if (!notification.readBy.includes(req.user!.id)) notification.readBy.push(req.user!.id);
  }
  saveDatabase(db);
  res.json({ success: true });
});

// ----------------------------------------------------
// 18. UNIFIED GLOBAL SEARCH (PART 6)
// ----------------------------------------------------

apiRouter.get('/search', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    res.json({ success: true, results: [] });
    return;
  }

  const db = getDatabase();
  const results: any[] = [];

  // Leads
  if (req.user!.permissions.canManageCrm || req.user!.stakeholderType === 'Master') {
    for (const lead of db.leads || []) {
      if (
        (lead.fullName && lead.fullName.toLowerCase().includes(q)) ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Lead',
          id: lead.id,
          name: `${lead.fullName} (${lead.company || 'Inquiry'})`,
          status: lead.status,
          owner: lead.email,
          lastUpdated: lead.updatedAt || lead.createdAt,
          url: '/admin/inbox'
        });
      }
    }
  }

  // Deals
  if (req.user!.permissions.canManageCrm || req.user!.stakeholderType === 'Master') {
    for (const deal of db.crmDeals || []) {
      if (
        (deal.title && deal.title.toLowerCase().includes(q)) ||
        (deal.company && deal.company.toLowerCase().includes(q)) ||
        (deal.clientName && deal.clientName.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Deal',
          id: deal.id,
          name: deal.title || deal.company,
          status: deal.stage,
          owner: deal.owner || 'Unassigned',
          lastUpdated: deal.updatedAt || deal.createdAt,
          url: '/admin/crm'
        });
      }
    }
  }

  // Clients
  if (req.user!.permissions.canManageClients || req.user!.stakeholderType === 'Master') {
    for (const cli of db.clients || []) {
      if (
        (cli.companyName && cli.companyName.toLowerCase().includes(q)) ||
        (cli.clientName && cli.clientName.toLowerCase().includes(q)) ||
        (cli.email && cli.email.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Client',
          id: cli.id,
          name: cli.companyName || cli.clientName,
          status: cli.status,
          owner: cli.email,
          lastUpdated: cli.updatedAt || cli.createdAt,
          url: '/admin/clients'
        });
      }
    }
  }

  // Projects
  if (req.user!.permissions.canManageProjects || req.user!.stakeholderType === 'Master') {
    for (const proj of db.projects || []) {
      if (
        (proj.title && proj.title.toLowerCase().includes(q)) ||
        (proj.client && proj.client.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Project',
          id: proj.id,
          name: proj.title,
          status: proj.status || proj.health || 'Active',
          owner: proj.client,
          lastUpdated: proj.updatedAt || proj.createdAt,
          url: '/admin/projects'
        });
      }
    }
  }

  // Invoices
  if (req.user!.permissions.canViewFinancials || req.user!.stakeholderType === 'Master') {
    for (const inv of db.invoices || []) {
      if (
        (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
        (inv.clientName && inv.clientName.toLowerCase().includes(q)) ||
        (inv.clientCompany && inv.clientCompany.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Invoice',
          id: inv.id,
          name: `${inv.invoiceNumber} - ${inv.clientCompany || inv.clientName}`,
          status: inv.status,
          owner: `IDR ${(inv.total || 0).toLocaleString()}`,
          lastUpdated: inv.updatedAt || inv.createdAt,
          url: '/admin/invoicing'
        });
      }
    }
  }

  // Proposals
  const canSearchProposals = req.user!.stakeholderType === 'Master' ||
    Boolean(req.user!.permissions.canManageCrm || req.user!.permissions.canManageInvoices || req.user!.permissions.canApproveBudgets);

  if (canSearchProposals) {
    for (const prop of db.proposals || []) {
      if (
        (prop.proposalNumber && prop.proposalNumber.toLowerCase().includes(q)) ||
        (prop.clientName && prop.clientName.toLowerCase().includes(q)) ||
        (prop.title && prop.title.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'Proposal',
          id: prop.id,
          name: `${prop.proposalNumber} - ${prop.title}`,
          status: prop.status,
          owner: prop.owner,
          lastUpdated: prop.updatedAt || prop.createdAt,
          url: '/admin/proposals'
        });
      }
    }
  }

  res.json({ success: true, results: results.slice(0, 20) });
});
// ----------------------------------------------------
// 19. EXECUTIVE DASHBOARD & TODAY AT KAPITECH ENGINE (PARTS 7, 30, 68)
// ----------------------------------------------------

const handleOverview = (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();

  const isMaster = req.user!.stakeholderType === 'Master';
  const canViewFinancials = isMaster || Boolean(req.user!.permissions?.canViewFinancials);
  const canViewCrm = isMaster || Boolean(req.user!.permissions?.canManageCrm);
  const canViewProjects = isMaster || Boolean(req.user!.permissions?.canManageProjects || req.user!.permissions?.canManageKanbanTasks);
  const canViewApprovals = isMaster || Boolean(req.user!.permissions?.canApproveBudgets || req.user!.permissions?.canManageProjects);
  const canViewAudit = isMaster || Boolean(req.user!.permissions?.canViewSecurityAuditLogs);

  const leads = canViewCrm ? (db.leads || []) : [];
  const deals = canViewCrm ? (db.crmDeals || []) : [];
  const proposals = (canViewCrm || canViewFinancials || canViewApprovals) ? (db.proposals || []) : [];
  const projects = canViewProjects ? (db.projects || []) : [];
  const invoices = canViewFinancials ? (db.invoices || []) : [];
  const expenses = canViewFinancials ? (db.expenses || []) : [];
  const approvals = canViewApprovals ? (db.approvals || []) : [];
  const tasks = canViewProjects ? (db.tasks || []) : [];

  const openLeadsCount = canViewCrm
    ? leads.filter(l => l.status === 'new' || l.status === 'in_review').length
    : 0;
  const activeDeals = canViewCrm ? deals.filter(d => d.stage !== 'won' && d.stage !== 'lost') : [];
  const dealsInPipelineCount = activeDeals.length;
  const activePipelineValue = activeDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const proposalsAwaitingCount = proposals.filter(
    p => p.status === 'Draft' || p.status === 'Internal Review' || p.status === 'Sent'
  ).length;
  const activeProjectsList = projects.filter(p => !['completed','Completed','archived','Archived'].includes(String(p.status)));
  const activeProjectsCount = activeProjectsList.length;
  const projectsAtRiskCount = projects.filter(
    p => p.health === 'At Risk' || p.health === 'Delayed' || p.health === 'Blocked'
  ).length;

  const now = new Date();
  const overdueInvoices = invoices.filter(inv => {
    if (inv.status === 'paid' || inv.status === 'cancelled') return false;
    if (!inv.dueDate) return false;
    return new Date(inv.dueDate) < now;
  });
  const overdueInvoicesCount = overdueInvoices.length;
  const overdueReceivables = overdueInvoices.reduce(
    (sum, i) => sum + (
      getInvoiceBalanceDue(i)
    ),
    0
  );

  const totalOutstanding = invoices
    .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce(
      (sum, i) => sum + (
        getInvoiceBalanceDue(i)
      ),
      0
    );

  const totalBilled = invoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const revenueCollected = invoices.reduce((sum, invoice) => sum + getInvoicePaidAmount(invoice), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const currentMonthKey = now.toISOString().slice(0, 7);
  const revenueThisMonth = invoices.reduce((sum, invoice) => {
    const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
    if (payments.length > 0) {
      return sum + payments
        .filter((payment: any) => String(payment.date || '').startsWith(currentMonthKey))
        .reduce((paymentSum: number, payment: any) => paymentSum + (Number(payment.amount) || 0), 0);
    }

    const paidDate = String(invoice.paidDate || '');
    return sum + (invoice.status === 'paid' && paidDate.startsWith(currentMonthKey) ? (Number(invoice.amountPaid) || Number(invoice.total) || 0) : 0);
  }, 0);

  const operatingExpensesThisMonth = expenses
    .filter((expense) => String(expense.date || '').startsWith(currentMonthKey))
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  const netOperatingProfitThisMonth = revenueThisMonth - operatingExpensesThisMonth;
  const netMarginThisMonth = revenueThisMonth > 0
    ? ((netOperatingProfitThisMonth / revenueThisMonth) * 100).toFixed(1)
    : '0';
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  const overdueTasksCount = tasks.filter(
    t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
  ).length;

  const stages = CRM_STAGES;
  const pipelineByStage = canViewCrm
    ? stages.map(st => {
        const stageDeals = deals.filter(d => d.stage === st);
        return {
          stage: st,
          count: stageDeals.length,
          value: stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
        };
      })
    : [];

  const attentionItems: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'danger' | 'warning' | 'info';
    category: string;
    linkUrl: string;
  }> = [];

  if (canViewFinancials && overdueInvoicesCount > 0) {
    attentionItems.push({
      id: 'att_invoices_overdue',
      title: `${overdueInvoicesCount} Invoices Overdue`,
      description: `Follow-up required on unpaid accounts totaling IDR ${overdueReceivables.toLocaleString()}.`,
      severity: 'danger',
      category: 'Finance',
      linkUrl: '/admin/invoicing'
    });
  }

  if (canViewApprovals && pendingApprovalsCount > 0) {
    attentionItems.push({
      id: 'att_pending_approvals',
      title: `${pendingApprovalsCount} Executive Approvals Awaiting Review`,
      description: 'Budget and operational approvals are waiting for review.',
      severity: 'warning',
      category: 'Operations',
      linkUrl: '/admin/approvals'
    });
  }

  if (canViewProjects && projectsAtRiskCount > 0) {
    attentionItems.push({
      id: 'att_projects_risk',
      title: `${projectsAtRiskCount} Projects Flagged At Risk`,
      description: 'Delivery timeline or resource constraints require attention.',
      severity: 'danger',
      category: 'Delivery',
      linkUrl: '/admin/projects'
    });
  }

  if (canViewProjects && overdueTasksCount > 0) {
    attentionItems.push({
      id: 'att_tasks_overdue',
      title: `${overdueTasksCount} Tasks Overdue in Active Sprints`,
      description: 'Tasks passed their due dates and may require rescheduling.',
      severity: 'warning',
      category: 'Delivery',
      linkUrl: '/admin/projects'
    });
  }

  if (canViewCrm && openLeadsCount > 3) {
    attentionItems.push({
      id: 'att_leads_new',
      title: `${openLeadsCount} Inbound Inquiries Unassigned`,
      description: 'Website inquiries are waiting for qualification.',
      severity: 'info',
      category: 'Sales',
      linkUrl: '/admin/inbox'
    });
  }

  res.json({
    success: true,
    metrics: {
      revenueCollected: canViewFinancials ? revenueCollected : null,
      totalBilled: canViewFinancials ? totalBilled : null,
      outstandingReceivables: canViewFinancials ? totalOutstanding : null,
      overdueReceivables: canViewFinancials ? overdueReceivables : null,
      activePipeline: canViewCrm ? activePipelineValue : null,
      activeProjects: canViewProjects ? activeProjectsCount : 0,
      projectsAtRisk: canViewProjects ? projectsAtRiskCount : 0,
      pendingApprovals: canViewApprovals ? pendingApprovalsCount : 0,
      overdueTasks: canViewProjects ? overdueTasksCount : 0,
      openLeads: canViewCrm ? openLeadsCount : 0
    },
    todayAtKapitech: {
      openLeadsCount: canViewCrm ? openLeadsCount : 0,
      dealsInPipelineCount: canViewCrm ? dealsInPipelineCount : 0,
      pipelineValue: canViewFinancials ? activePipelineValue : null,
      proposalsAwaitingCount: (canViewCrm || canViewFinancials || canViewApprovals) ? proposalsAwaitingCount : 0,
      projectsAtRiskCount: canViewProjects ? projectsAtRiskCount : 0,
      overdueInvoicesCount: canViewFinancials ? overdueInvoicesCount : 0,
      cashOutstanding: canViewFinancials ? totalOutstanding : null
    },
    financials: canViewFinancials ? {
      revenueThisMonth,
      cashCollected: revenueThisMonth,
      outstandingReceivables: totalOutstanding,
      operatingExpenses: operatingExpensesThisMonth,
      netOperatingProfit: netOperatingProfitThisMonth,
      margin: netMarginThisMonth
    } : {
      revenueThisMonth: null,
      cashCollected: null,
      outstandingReceivables: null,
      operatingExpenses: null,
      netOperatingProfit: null,
      margin: null
    },
    pipelineByStage,
    attentionItems,
    projects: canViewProjects ? activeProjectsList.slice(0, 10) : [],
    recentActivity: canViewAudit ? (db.auditLogs || []).slice(0, 10) : []
  });
};
apiRouter.get('/dashboard/overview', requireAuth, handleOverview);
apiRouter.get('/executive/overview', requireAuth, handleOverview);

