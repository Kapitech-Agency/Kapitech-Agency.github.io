import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('authentication audit events use PostgreSQL audit storage in PostgreSQL mode', async () => {
  const source = await fs.readFile(path.join(root, 'server/routes.ts'), 'utf8');

  assert.ok(
    source.includes("async function writeAuditLog(entry: Parameters<typeof recordAuditLog>[0]): Promise<void>"),
    'shared audit writer must exist'
  );
  assert.ok(
    source.includes("if (getDataSourceMode() === 'postgres') {\n    await postgresAuditLogRepository.append({"),
    'shared audit writer must append to PostgreSQL in PostgreSQL mode'
  );

  for (const action of [
    'LOGIN_FAILED',
    'LOGIN_MFA_CHALLENGE',
    'LOGIN_SUCCESS',
    'MFA_VERIFY_FAILED',
    'LOGOUT'
  ]) {
    const occurrences = source.match(new RegExp("action: '" + action + "'", 'g')) || [];
    assert.ok(occurrences.length > 0, action);
  }

  const authBlockStart = source.indexOf("apiRouter.post('/auth/login'");
  const authBlockEnd = source.indexOf("apiRouter.get('/auth/me'", authBlockStart);
  assert.ok(authBlockStart >= 0 && authBlockEnd > authBlockStart);

  const authBlock = source.slice(authBlockStart, authBlockEnd);
  assert.ok(authBlock.includes('await writeAuditLog({'), 'authentication audit events must use the PostgreSQL-aware writer');
  assert.equal(
    authBlock.includes("recordAuditLog({"),
    false,
    'authentication routes must not write directly to the JSON audit store'
  );
});
