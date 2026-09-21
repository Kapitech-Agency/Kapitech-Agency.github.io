import test from 'node:test';
import assert from 'node:assert/strict';
import { getPostgresPool, checkPostgresConnection, closePostgresPool } from '../server/postgres.ts';
import { PostgresDatabaseRepository } from '../server/postgres-database-repository.ts';
import { PostgresSecurityControlsRepository } from '../server/postgres-security-controls-repository.ts';

const configured = Boolean(process.env.KAPITECH_POSTGRES_URL);

test('PostgreSQL integration harness is fail-closed when not configured', async t => {
  if (configured) return;
  assert.throws(() => getPostgresPool(), /KAPITECH_POSTGRES_URL/);
  await assert.rejects(() => checkPostgresConnection(), /KAPITECH_POSTGRES_URL/);
  await closePostgresPool();
  t.diagnostic('Set KAPITECH_POSTGRES_URL to execute live schema integration checks.');
});

test('PostgreSQL repository can load the complete schema when configured', async t => {
  if (!configured) { t.skip('KAPITECH_POSTGRES_URL is not configured'); return; }
  const connection = await checkPostgresConnection();
  assert.equal(connection.ok, true);
  assert.ok(connection.latencyMs >= 0);
  const db = await new PostgresDatabaseRepository().loadDatabase();
  for (const key of ['users','sessions','leads','crmDeals','clients','projects','proposals','tasks','timeLogs','invoices','expenses','approvals','vendors','documents','notifications','cmsServices','cmsProjects','cmsTestimonials','auditLogs']) {
    assert.ok(Array.isArray((db as any)[key]), key);
  }
  assert.equal(typeof db.cmsSettings, 'object');
  assert.equal(typeof db.notificationSettings, 'object');
  await closePostgresPool();
});


test('PostgreSQL security controls can consume a live rate-limit bucket', async t => {
  if (!configured) { t.skip('KAPITECH_POSTGRES_URL is not configured'); return; }

  const repository = new PostgresSecurityControlsRepository();
  const bucketKey = 'ci-rate-limit-' + Date.now() + '-' + Math.random().toString(16).slice(2);

  try {
    const first = await repository.consumeRateLimit(bucketKey, 2, 60_000);
    const second = await repository.consumeRateLimit(bucketKey, 2, 60_000);
    const third = await repository.consumeRateLimit(bucketKey, 2, 60_000);

    assert.equal(first.count, 1);
    assert.equal(first.allowed, true);
    assert.equal(second.count, 2);
    assert.equal(second.allowed, true);
    assert.equal(third.count, 3);
    assert.equal(third.allowed, false);
  } finally {
    await getPostgresPool().query(
      'DELETE FROM security_rate_limits WHERE bucket_key = $1',
      [bucketKey]
    );
    await closePostgresPool();
  }
});
