import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import {
  generateMfaSecret,
  verifyTotpCode,
  generateMfaRecoveryCodes,
  hashMfaRecoveryCode,
  verifyMfaRecoveryCode
} from '../server/auth.ts';
import {
  hashPassword,
  verifyPassword,
  hashSessionToken
} from '../server/db.ts';
import type { StoredUser } from '../server/db.ts';

function makeUser(): StoredUser {
  return {
    id: 'test-user',
    name: 'Test User',
    username: 'test',
    email: 'test@example.com',
    passwordHash: '',
    salt: '',
    passwordAlgorithm: 'scrypt-v1',
    role: 'Test',
    stakeholderType: 'Operations',
    permissions: {
      canViewFinancials: false,
      canManageInvoices: false,
      canApproveBudgets: false,
      canManageCrm: false,
      canManageProjects: false,
      canManageKanbanTasks: false,
      canManageClients: false,
      canManageVendors: false,
      canManageCmsContent: false,
      canAccessServerAndApi: false,
      canRunDataMigration: false,
      canViewSecurityAuditLogs: false,
      canManageAdminAccounts: false
    },
    mfaEnabled: true,
    mfaRecoveryCodeHashes: [],
    division: 'Operations',
    status: 'active',
    lastLogin: '',
    createdAt: new Date().toISOString()
  };
}

function decodeBase32(secret: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of secret) {
    value = (value << 5) | alphabet.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function totpAt(secret: string, timestamp: number): string {
  const counter = Math.floor(timestamp / 1000 / 30);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter), 0);
  const digest = crypto.createHmac('sha1', decodeBase32(secret)).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1_000_000;
  return String(binary).padStart(6, '0');
}

test('TOTP accepts the current time window and rejects malformed codes', () => {
  const secret = generateMfaSecret();
  const timestamp = 1_800_000_000_000;
  assert.equal(verifyTotpCode(secret, totpAt(secret, timestamp), timestamp), true);
  assert.equal(verifyTotpCode(secret, '12345', timestamp), false);
  assert.equal(verifyTotpCode(secret, 'abcdef', timestamp), false);
});

test('recovery codes are one-time use and are stored as hashes', () => {
  const user = makeUser();
  const [code, secondCode] = generateMfaRecoveryCodes(2);
  user.mfaRecoveryCodeHashes = [
    hashMfaRecoveryCode(code),
    hashMfaRecoveryCode(secondCode)
  ];

  assert.equal(user.mfaRecoveryCodeHashes.includes(code), false);
  assert.equal(verifyMfaRecoveryCode(user, code.toLowerCase()), true);
  assert.equal(verifyMfaRecoveryCode(user, code), false);
  assert.equal(user.mfaRecoveryCodeHashes.length, 1);
  assert.equal(verifyMfaRecoveryCode(user, secondCode), true);
  assert.equal(user.mfaRecoveryCodeHashes.length, 0);
});

test('password hashing verifies correctly and session tokens are never stored in plaintext', () => {
  const salt = 'unit-test-salt';
  const password = 'A-strong-test-password-2026!';
  const hash = hashPassword(password, salt, 'scrypt-v1');
  const user = { ...makeUser(), salt, passwordHash: hash };

  assert.equal(verifyPassword(password, user), true);
  assert.equal(verifyPassword('wrong-password', user), false);

  const rawToken = 'kapi_sec_test_token';
  const tokenHash = hashSessionToken(rawToken);
  assert.notEqual(tokenHash, rawToken);
  assert.match(tokenHash, /^[0-9a-f]{64}$/);
});
