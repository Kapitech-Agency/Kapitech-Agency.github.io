import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getDatabase, saveDatabase, hashPassword, StoredUser, StoredSession, recordAuditLog } from './db';

// Rate Limiting and Lockout Map
interface LockoutEntry {
  failedAttempts: number;
  lockoutUntil: number;
}

const loginLockouts = new Map<string, LockoutEntry>();
const publicRateLimits = new Map<string, { count: number; resetAt: number }>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours
const EXTENDED_SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AuthenticatedRequest extends Request {
  user?: StoredUser;
  sessionToken?: string;
}

export function checkLockout(identifier: string): { isLocked: boolean; remainingSeconds: number } {
  const entry = loginLockouts.get(identifier.toLowerCase());
  if (!entry) return { isLocked: false, remainingSeconds: 0 };

  const now = Date.now();
  if (entry.lockoutUntil > now) {
    return {
      isLocked: true,
      remainingSeconds: Math.ceil((entry.lockoutUntil - now) / 1000)
    };
  }

  // Lockout expired
  if (entry.lockoutUntil !== 0 && entry.lockoutUntil <= now) {
    loginLockouts.delete(identifier.toLowerCase());
  }

  return { isLocked: false, remainingSeconds: 0 };
}

export function recordFailedLogin(identifier: string): void {
  const key = identifier.toLowerCase();
  const entry = loginLockouts.get(key) || { failedAttempts: 0, lockoutUntil: 0 };
  entry.failedAttempts += 1;

  if (entry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
  }

  loginLockouts.set(key, entry);
}

export function clearLockout(identifier: string): void {
  loginLockouts.delete(identifier.toLowerCase());
}

export function createSession(user: StoredUser, ip: string, userAgent: string, rememberMe: boolean = false): StoredSession {
  const db = getDatabase();
  const token = `kapi_sec_${crypto.randomBytes(32).toString('hex')}`;
  const lifetime = rememberMe ? EXTENDED_SESSION_LIFETIME_MS : SESSION_LIFETIME_MS;
  const expiresAt = Date.now() + lifetime;

  const session: StoredSession = {
    token,
    userId: user.id,
    username: user.username,
    role: user.role,
    ip,
    userAgent,
    expiresAt,
    createdAt: new Date().toISOString()
  };

  // Remove expired sessions for this user
  db.sessions = db.sessions.filter(s => s.expiresAt > Date.now() && s.userId !== user.id);
  db.sessions.push(session);
  saveDatabase(db);

  return session;
}

export function revokeSession(token: string): boolean {
  const db = getDatabase();
  const initialCount = db.sessions.length;
  db.sessions = db.sessions.filter(s => s.token !== token);
  if (db.sessions.length !== initialCount) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export function getSessionUser(token: string): StoredUser | null {
  if (!token) return null;
  const db = getDatabase();
  const session = db.sessions.find(s => s.token === token);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    revokeSession(token);
    return null;
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user || user.status === 'suspended') return null;

  return user;
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    const trimmedName = name?.trim();
    if (!trimmedName) return;
    const value = rest.join('=').trim();
    list[trimmedName] = decodeURIComponent(value);
  });
  return list;
}

// Authentication middleware
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers['x-session-token']) {
    token = String(req.headers['x-session-token']).trim();
  } else if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.kapi_session) {
      token = cookies.kapi_session.trim();
    }
  }

  if (token) {
    const user = getSessionUser(token);
    if (user) {
      req.user = user;
      req.sessionToken = token;
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthenticated: Valid session required.'
    });
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

    // Master account bypass
    if (req.user.stakeholderType === 'Master') {
      next();
      return;
    }

    if (!req.user.permissions || !req.user.permissions[permissionKey]) {
      recordAuditLog({
        action: 'ACCESS_DENIED',
        actor: req.user.username,
        actorRole: req.user.role,
        ip: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        details: `Access denied: missing permission '${permissionKey}' on endpoint ${req.originalUrl}`,
        severity: 'warning'
      });

      res.status(403).json({
        success: false,
        error: `Unauthorized: User lacks required permission '${permissionKey}'.`
      });
      return;
    }

    next();
  };
}

export function rateLimitPublic(maxRequests: number = 30, windowMs: number = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = publicRateLimits.get(ip);

    if (!record || record.resetAt <= now) {
      publicRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down and try again shortly.'
      });
      return;
    }

    record.count += 1;
    next();
  };
}
