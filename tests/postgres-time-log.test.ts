import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getPostgresPool, closePostgresPool } from '../server/postgres.ts';
import { PostgresClientRepository } from '../server/postgres-client-repository.ts';
import { PostgresProjectRepository } from '../server/postgres-project-repository.ts';
import { PostgresBillingRateRepository } from '../server/postgres-billing-rate-repository.ts';
import {
  PostgresTimeLogRepository,
  BillingRateNotConfiguredError,
  TimeLogImmutableError
} from '../server/postgres-time-log-repository.ts';

const configured = Boolean(process.env.KAPITECH_POSTGRES_URL);

function token(prefix: string): string {
  return prefix + '_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrow(): string {
  const value = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return value.toISOString().slice(0, 10);
}

test('PostgreSQL financial time log workflow enforces server-side rate snapshots', async t => {
  if (!configured) {
    t.skip('KAPITECH_POSTGRES_URL is not configured');
    return;
  }

  const pool = getPostgresPool();
  const clients = new PostgresClientRepository();
  const projects = new PostgresProjectRepository();
  const rates = new PostgresBillingRateRepository();
  const timeLogs = new PostgresTimeLogRepository();

  const userId = token('test_user');
  const clientId = token('test_client');
  const projectId = token('test_project');
  const rateId1 = token('rate');
  const rateId2 = token('rate');
  const logId = token('tim');
  const idempotencyKey = token('idem');

  await pool.query(
    'INSERT INTO users (id,name,username,email,password_hash,salt,role,stakeholder_type,permissions,division,status) ' +
    'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
    [
      userId,
      'Integration User',
      userId,
      userId + '@example.test',
      'test-password-hash',
      'test-salt',
      'Integration',
      'Operations',
      '{}',
      'Operations',
      'active'
    ]
  );

  const client = await clients.create({
    id: clientId,
    name: 'Financial Integration Client',
    company: 'Financial Integration Co',
    status: 'active'
  });

  const project = await projects.create({
    id: projectId,
    clientId: client.id,
    name: 'Financial Integration Project',
    status: 'planning',
    budget: 1000000,
    currency: 'IDR'
  });

  try {
    const firstRate = await rates.create({
      id: rateId1,
      userId,
      hourlyRate: 100000,
      currency: 'IDR',
      effectiveFrom: today()
    });
    assert.equal(firstRate.hourlyRate, 100000);

    const log = await timeLogs.create({
      id: logId,
      userId,
      projectId,
      durationMinutes: 60,
      workDate: today(),
      currency: 'IDR',
      billable: true,
      notes: 'Integration test',
      idempotencyKey
    });

    assert.equal(log.durationMinutes, 60);
    assert.equal(log.rate, 100000);
    assert.equal(log.amount, 100000);
    assert.equal(log.currency, 'IDR');
    assert.equal(log.status, 'draft');
    assert.equal(log.version, 1);

    const retry = await timeLogs.create({
      id: token('retry'),
      userId,
      projectId,
      durationMinutes: 120,
      workDate: today(),
      currency: 'IDR',
      idempotencyKey
    });
    assert.equal(retry.id, log.id);
    assert.equal(retry.amount, 100000);

    const submitted = await timeLogs.submit(log.id, log.version);
    assert.equal(submitted.status, 'submitted');
    assert.equal(submitted.version, 2);

    const approved = await timeLogs.approve(submitted.id, submitted.version);
    assert.equal(approved.status, 'approved');
    assert.equal(approved.version, 3);
    assert.equal(approved.amount, 100000);

    await assert.rejects(
      () => timeLogs.void(approved.id, approved.version),
      error => error instanceof TimeLogImmutableError
    );

    const secondRate = await rates.create({
      id: rateId2,
      userId,
      hourlyRate: 150000,
      currency: 'IDR',
      effectiveFrom: tomorrow()
    });
    assert.equal(secondRate.hourlyRate, 150000);

    const historical = await rates.findEffective(userId, 'IDR', today());
    const future = await rates.findEffective(userId, 'IDR', tomorrow());
    assert.equal(historical?.hourlyRate, 100000);
    assert.equal(future?.hourlyRate, 150000);
  } finally {
    await pool.query('DELETE FROM time_logs WHERE id = $1', [logId]);
    await pool.query('DELETE FROM billing_rates WHERE id IN ($1,$2)', [rateId1, rateId2]);
    await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [clientId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await closePostgresPool();
  }
});

test('PostgreSQL time logs fail closed when a billing rate is missing', async t => {
  if (!configured) {
    t.skip('KAPITECH_POSTGRES_URL is not configured');
    return;
  }

  // The previous test resets its singleton pool after cleanup. This test uses a
  // deliberately missing user/project pair and checks the rate error before
  // any insert can occur.
  const userId = token('missing_user');
  const projectId = token('missing_project');
  const timeLogs = new PostgresTimeLogRepository();

  await assert.rejects(
    () => timeLogs.create({
      id: token('tim'),
      userId,
      projectId,
      durationMinutes: 60,
      workDate: today(),
      currency: 'IDR'
    }),
    error => error instanceof BillingRateNotConfiguredError || error?.code === 'TIMELOG_NOT_FOUND'
  );

  await closePostgresPool();
});
