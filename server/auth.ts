import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  getDatabase,
  saveDatabase,
  hashPassword,
  hashSessionToken,
  verifyPassword,
  StoredUser,
  StoredSession,
  recordAuditLog
} from './db';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface LockoutEntry {
  failedAttempts: number;
  lockoutUntil: number;
}

const loginLockouts = new Map<string, LockoutEntry>();
const publicRateLimits = new Map<string, RateLimitEntry>();
const authenticatedRateLimits = new Map<string, RateLimitEntry>();

const MAX_FAILED_ATTEMPTS = 8;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const SESSION_LIFETIME_MS = 12 * 60 * 60 * 1000;
const EXTENDED_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;
const SESSION_IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const SESSION_TOUCH_INTERVAL_MS = 60 * 1000;

export interface AuthenticatedRequest extends Request {
  user?: StoredUser;
  sessionToken?: string;
}

function cleanupMaps(): void {
  const now = Date.now();
  for (const [key, entry] of loginLockouts) {
    if (entry.lockoutUntil > 0 && entry.lockoutUntil <= now) loginLockouts.delete(key);
  }
  for (const [key, entry] of publicRateLimits) {
    if (entry.resetAt <= now) publicRateLimits.delete(key);
  }
  for (const [key, entry] of authenticatedRateLimits) {
    if (entry.resetAt <= now) authenticatedRateLimits.delete(key);
  }
}

setInterval(cleanupMaps, 5 * 60 * 1000).unref();

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function cookieValue(req: Request, name: string): string {
  const header = req.headers.cookie || '';
  for (const segment of header.split(';')) {
    const [rawName, ...rest] = segment.split('=');
    if (rawName?.trim() !== name) continue;
    const rawValue = rest.join('=').trim();
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }
  return '';
}

export function createCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setCsrfCookie(res: Response, token: string = createCsrfToken()): string {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.append(
    'Set-Cookie',
    `kapi_csrf=${token}; Path=/; SameSite=Strict; Max-Age=86400;${secure}`
  );
  return token;
}

export function clearCsrfCookie(res: Response): void {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.append('Set-Cookie', `kapi_csrf=; Path=/; SameSite=Strict; Max-Age=0;${secure}`);
}

export function checkLockout(identifier: string, ip = 'unknown'): { isLocked: boolean; remainingSeconds: number } {
  const key = `${identifier.toLowerCase()}|${ip}`;
  const entry = loginLockouts.get(key);
  if (!entry) return { isLocked: false, remainingSeconds: 0 };
  const now = Date.now();
  if (entry.lockoutUntil > now) {
    return {
      isLocked: true,
      remainingSeconds: Math.ceil((entry.lockoutUntil - now) / 1000)
    };
  }
  loginLockouts.delete(key);
  return { isLocked: false, remainingSeconds: 0 };
}

export function recordFailedLogin(identifier: string, ip = 'unknown'): void {
  const key = `${identifier.toLowerCase()}|${ip}`;
  const entry = loginLockouts.get(key) || { failedAttempts: 0, lockoutUntil: 0 };
  entry.failedAttempts += 1;
  if (entry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  loginLockouts.set(key, entry);
}

export function clearLockout(identifier: string, ip = 'unknown'): void {
  loginLockouts.delete(`${identifier.toLowerCase()}|${ip}`);
}

export function createSession(user: StoredUser, ip: string, userAgent: string, rememberMe = false): StoredSession {
  const db = getDatabase();
  const now = Date.now();
  const lifetime = rememberMe ? EXTENDED_SESSION_LIFETIME_MS : SESSION_LIFETIME_MS;
  const expiresAt = now + lifetime;
  const token = `kapi_sec_${crypto.randomBytes(32).toString('hex')}`;

  const session: StoredSession = {
    tokenHash: hashSessionToken(token),
    userId: user.id,
    createdAt: new Date(now).toISOString(),
    lastActivityAt: new Date(now).toISOString(),
    expiresAt,
    rememberMe,
    ip,
    userAgent
  };

  // Keep a bounded number of sessions and remove stale sessions for the same account.
  db.sessions = db.sessions.filter(s => s.expiresAt > now);
  const userSessions = db.sessions.filter(s => s.userId === user.id);
  if (userSessions.length >= 5) {
    const keep = userSessions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4)
      .map(s => s.tokenHash);
    db.sessions = db.sessions.filter(s => s.userId !== user.id || keep.includes(s.tokenHash));
  }
  db.sessions.push(session);
  saveDatabase(db);
  return session;
}

export function revokeSession(token: string): boolean {
  const db = getDatabase();
  const tokenHash = hashSessionToken(token);
  const initialCount = db.sessions.length;
  db.sessions = db.sessions.filter(s => s.tokenHash !== tokenHash);
  if (db.sessions.length !== initialCount) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export function revokeAllUserSessions(userId: string, exceptTokenHash?: string): number {
  const db = getDatabase();
  const before = db.sessions.length;
  db.sessions = db.sessions.filter(s => s.userId !== userId || (exceptTokenHash ? s.tokenHash === exceptTokenHash : false));
  const revoked = before - db.sessions.length;
  if (revoked > 0) saveDatabase(db);
  return revoked;
}

export function getSessionUser(token: string): StoredUser | null {
  if (!token) return null;
  const db = getDatabase();
  const tokenHash = hashSessionToken(token);
  const session = db.sessions.find(s => s.tokenHash === tokenHash);
  if (!session) return null;

  const now = Date.now();
  const lastActivityAt = new Date(session.lastActivityAt || session.createdAt).getTime();
  if (session.expiresAt <= now || now - lastActivityAt > SESSION_IDLE_TIMEOUT_MS) {
    db.sessions = db.sessions.filter(s => s.tokenHash !== tokenHash);
    saveDatabase(db);
    return null;
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user || user.status === 'suspended') {
    db.sessions = db.sessions.filter(s => s.tokenHash !== tokenHash);
    saveDatabase(db);
    return null;
  }

  if (now - lastActivityAt > SESSION_TOUCH_INTERVAL_MS) {
    session.lastActivityAt = new Date(now).toISOString();
    saveDatabase(db);
  }

  return user;
}

function sameOrigin(req: Request): boolean {
  const origin = req.get('origin');
  if (!origin) return true;
  const expected = `${req.protocol}://${req.get('host')}`;
  return origin === expected;
}

export function validateCsrf(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  if (req.path === '/auth/login' || req.path === '/leads/submit') {
    next();
    return;
  }

  if (!req.user) {
    next();
    return;
  }

  const cookieToken = cookieValue(req, 'kapi_csrf');
  const headerToken = req.get('x-csrf-token') || '';
  if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken) || !sameOrigin(req)) {
    recordAuditLog({
      action: 'CSRF_BLOCKED',
      actor: req.user.username,
      actorRole: req.user.role,
      ip: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      details: `State-changing request blocked by CSRF/origin validation at ${req.originalUrl}.`,
      severity: 'warning'
    });
    res.status(403).json({ success: false, error: 'Security validation failed. Refresh the page and try again.' });
    return;
  }

  next();
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const sessionToken = cookieValue(req, 'kapi_session');
  if (sessionToken) {
    const user = getSessionUser(sessionToken);
    if (user) {
      req.user = user;
      req.sessionToken = sessionToken;
      if (!cookieValue(req, 'kapi_csrf')) setCsrfCookie(res);
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthenticated: Valid session required.' });
    return;
  }
  next();
}

export function requirePermission(permissionKey: keyof StoredUser['permissions']) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthenticated' });
      return;
    }
    if (req.user.stakeholderType === 'Master') {
      next();
      return;
    }
    if (!req.user.permissions?.[permissionKey]) {
      recordAuditLog({
        action: 'ACCESS_DENIED',
        actor: req.user.username,
        actorRole: req.user.role,
        ip: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        details: `Missing permission '${permissionKey}' at ${req.originalUrl}.`,
        severity: 'warning'
      });
      res.status(403).json({ success: false, error: 'Unauthorized: insufficient permissions.' });
      return;
    }
    next();
  };
}

export function requireMaster(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthenticated' });
    return;
  }
  if (req.user.stakeholderType !== 'Master') {
    recordAuditLog({
      action: 'ACCESS_DENIED',
      actor: req.user.username,
      actorRole: req.user.role,
      ip: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
      details: `Master-only endpoint denied at ${req.originalUrl}.`,
      severity: 'warning'
    });
    res.status(403).json({ success: false, error: 'Master administrator access required.' });
    return;
  }
  next();
}

export function requireAnyPermission(...permissionKeys: Array<keyof StoredUser['permissions']>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthenticated' });
      return;
    }
    if (req.user.stakeholderType === 'Master') {
      next();
      return;
    }
    if (!req.user.permissions || !permissionKeys.some(key => Boolean(req.user!.permissions[key]))) {
      recordAuditLog({
        action: 'ACCESS_DENIED',
        actor: req.user.username,
        actorRole: req.user.role,
        ip: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        details: `Missing any permission [${permissionKeys.join(', ')}] at ${req.originalUrl}.`,
        severity: 'warning'
      });
      res.status(403).json({ success: false, error: 'Unauthorized: insufficient permissions.' });
      return;
    }
    next();
  };
}

export function rateLimitAuthenticated(maxRequests = 60, windowMs = 60 * 1000) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const key = req.user?.id || req.ip || 'unknown';
    const now = Date.now();
    const current = authenticatedRateLimits.get(key);
    if (!current || current.resetAt <= now) {
      authenticatedRateLimits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= maxRequests) {
      res.status(429).json({ success: false, error: 'Too many requests. Please try again shortly.' });
      return;
    }
    current.count += 1;
    next();
  };
}

export function rateLimitPublic(maxRequests = 30, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = publicRateLimits.get(key);
    if (!current || current.resetAt <= now) {
      publicRateLimits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= maxRequests) {
      res.status(429).json({ success: false, error: 'Too many requests. Please slow down and try again shortly.' });
      return;
    }
    current.count += 1;
    next();
  };
}

export function verifyPasswordForUser(password: string, user: StoredUser): boolean {
  return verifyPassword(password, user);
}

export function preparePassword(password: string): { salt: string; passwordHash: string; passwordAlgorithm: 'scrypt-v1' } {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    salt,
    passwordHash: hashPassword(password, salt, 'scrypt-v1'),
    passwordAlgorithm: 'scrypt-v1'
  };
}
