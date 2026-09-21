import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getPostgresPool, closePostgresPool } from '../server/postgres.ts';
import { PostgresAuditRepository } from '../server/postgres-audit-repository.ts';

const configured = Boolean(process.env.KAPITECH_POSTGRES_URL);

function token(prefix: string): string {
  return prefix + '_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
}

test('PostgreSQL audit repository preserves a verifiable append-only hash chain', async t => {
  if (!configured) {
    t.skip('KAPITECH_POSTGRES_URL is not configured');
    return;
  }

  const pool = getPostgresPool();
  const audit = new PostgresAuditRepository();
  const actorUserId = token('audit_user');

  await pool.query(
    'INSERT INTO users (id,name,username,email,password_hash,salt,role,stakeholder_type,permissions,division,status) ' +
    'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [
      actorUserId,
      'Audit Integration User',
      actorUserId,
      actorUserId + '@example.test',
      'test-password-hash',
      'test-salt',
      'Integration',
      'Operations',
      '{}',
      'Operations',
      'active'
    ]
  );

  const actions = [
    'AUDIT_TEST_CREATED',
    'AUDIT_TEST_UPDATED',
    'AUDIT_TEST_COMPLETED'
  ];
  const insertedIds: string[] = [];

  try {
    for (const action of actions) {
      const row = await audit.append({
        action,
        actor: actorUserId,
        actorRole: 'Integration',
        actorUserId,
        ip: '127.0.0.1',
        userAgent: 'integration-test',
        details: action,
        severity: 'info'
      });
      insertedIds.push(String(row.id));
    }

    const verified = await audit.verifyChain();
    assert.equal(verified.valid, true);
    assert.ok(verified.checked >= actions.length);

    const recent = await audit.list(actions.length);
    for (const id of insertedIds) {
      assert.ok(recent.some(row => String(row.id) === id));
    }
  } finally {
    await pool.query('DELETE FROM audit_logs WHERE id = ANY($1::text[])', [insertedIds]);
    await pool.query('DELETE FROM users WHERE id=$1', [actorUserId]);
    await closePostgresPool();
  }
});
