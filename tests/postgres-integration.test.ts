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


test('PostgreSQL commercial workflow converts proposal to invoice and records a partial payment', async t => {
  if (!configured) { t.skip('KAPITECH_POSTGRES_URL is not configured'); return; }

  const { PostgresClientRepository } = await import('../server/postgres-client-repository.ts');
  const { PostgresProposalRepository } = await import('../server/postgres-proposal-repository.ts');
  const { PostgresInvoiceRepository } = await import('../server/postgres-invoice-repository.ts');

  const clientRepository = new PostgresClientRepository();
  const proposalRepository = new PostgresProposalRepository();
  const invoiceRepository = new PostgresInvoiceRepository();

  const suffix = Date.now() + '-' + Math.random().toString(16).slice(2);
  const clientId = 'ci-client-' + suffix;
  const proposalId = 'ci-proposal-' + suffix;
  const itemId = 'ci-proposal-item-' + suffix;
  const now = new Date().toISOString();

  try {
    await clientRepository.create({
      id: clientId,
      name: 'CI Commercial Client',
      company: 'CI Commercial Company',
      email: 'ci-' + suffix + '@example.test',
      phone: '',
      industry: 'Technology',
      status: 'active',
      notes: 'PostgreSQL workflow integration test',
      createdAt: now,
      updatedAt: now
    });

    await proposalRepository.create({
      id: proposalId,
      proposalNumber: 'CI-PROP-' + suffix,
      title: 'CI Commercial Proposal',
      clientId,
      subtotal: 2_000_000,
      discount: 0,
      taxPercent: 0,
      tax: 0,
      total: 2_000_000,
      currency: 'IDR',
      validityPeriod: '14 days',
      paymentTerms: '50% upfront',
      owner: 'ci',
      status: 'Approved',
      notes: 'Workflow integration test',
      createdDate: now.slice(0, 10),
      items: [{
        id: itemId,
        description: 'Website implementation',
        quantity: 1,
        unitPrice: 2_000_000
      }],
      createdAt: now,
      updatedAt: now
    });

    const invoice = await proposalRepository.convertToInvoice(proposalId);
    assert.ok(invoice);
    assert.equal(invoice.clientId, clientId);
    assert.equal(invoice.total, 2_000_000);
    assert.equal(invoice.items.length, 1);
    assert.equal(invoice.items[0].description, 'Website implementation');

    const proposal = await proposalRepository.findById(proposalId);
    assert.equal(proposal?.status, 'Accepted');

    const paid = await invoiceRepository.recordPayment(invoice.id, {
      id: 'ci-payment-' + suffix,
      amount: 1_000_000,
      date: now.slice(0, 10),
      method: 'bank_transfer',
      reference: 'CI-WORKFLOW-PAYMENT',
      recordedBy: 'ci',
      userId: null
    });

    assert.equal(paid?.amountPaid, 1_000_000);
    assert.equal(paid?.balanceDue, 1_000_000);
    assert.equal(paid?.status, 'partially_paid');
    assert.equal(paid?.payments.length, 1);
  } finally {
    const db = getPostgresPool();
    await db.query('DELETE FROM invoice_payments WHERE invoice_id IN (SELECT id FROM invoices WHERE id LIKE $1)', ['inv_%' + suffix]);
    await db.query('DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE id LIKE $1)', ['inv_%' + suffix]);
    await db.query('DELETE FROM invoices WHERE id LIKE $1', ['inv_%' + suffix]);
    await db.query('DELETE FROM proposal_items WHERE proposal_id = $1', [proposalId]);
    await db.query('DELETE FROM proposals WHERE id = $1', [proposalId]);
    await db.query('DELETE FROM clients WHERE id = $1', [clientId]);
    await closePostgresPool();
  }
});
