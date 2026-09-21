import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getPostgresPool, closePostgresPool } from '../server/postgres.ts';
import { PostgresClientRepository } from '../server/postgres-client-repository.ts';
import { PostgresProposalRepository } from '../server/postgres-proposal-repository.ts';
import {
  PostgresInvoiceRepository,
  InvoiceImmutableError,
  InvoicePaymentError
} from '../server/postgres-invoice-repository.ts';

const configured = Boolean(process.env.KAPITECH_POSTGRES_URL);

function token(prefix: string): string {
  return prefix + '_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
}

test('PostgreSQL proposal to invoice lifecycle is atomic and idempotent', async t => {
  if (!configured) {
    t.skip('KAPITECH_POSTGRES_URL is not configured');
    return;
  }

  const pool = getPostgresPool();
  const clients = new PostgresClientRepository();
  const proposals = new PostgresProposalRepository();
  const invoices = new PostgresInvoiceRepository();

  const userId = token('proposal_user');
  const clientId = token('proposal_client');
  const proposalId = token('proposal');
  const invoiceIdempotency = token('payment_idem');

  await pool.query(
    'INSERT INTO users (id,name,username,email,password_hash,salt,role,stakeholder_type,permissions,division,status) ' +
    'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [
      userId,
      'Proposal Integration User',
      userId,
      userId + '@example.test',
      'test-password-hash',
      'test-salt',
      'Integration',
      'Finance',
      '{}',
      'Finance',
      'active'
    ]
  );

  await clients.create({
    id: clientId,
    name: 'Proposal Integration Client',
    company: 'Proposal Integration Co',
    status: 'active'
  });

  try {
    const proposal = await proposals.create({
      id: proposalId,
      proposalNumber: 'PROP-TEST-' + Date.now(),
      title: 'Integration Proposal',
      clientId,
      clientName: 'Proposal Integration Client',
      company: 'Proposal Integration Co',
      items: [
        { id: token('line'), description: 'Strategy', quantity: 1, unitPrice: 1000000 },
        { id: token('line'), description: 'Implementation', quantity: 2, unitPrice: 500000 }
      ],
      discount: 100000,
      taxPercent: 11,
      currency: 'IDR',
      validityPeriod: '30 Days',
      paymentTerms: '50% upfront'
    });

    assert.equal(proposal.subtotal, 2000000);
    assert.equal(proposal.discount, 100000);
    assert.equal(proposal.tax, 209000);
    assert.equal(proposal.total, 2109000);
    assert.equal(proposal.version, 1);

    const approved = await proposals.approve(proposal.id, proposal.version);
    assert.equal(approved.status, 'Approved');
    assert.equal(approved.version, 2);

    const converted = await invoices.convertProposal(approved.id, userId);
    assert.equal(converted.invoice.sourceProposalId, approved.id);
    assert.equal(converted.invoice.total, approved.total);
    assert.equal(converted.invoice.amountPaid, 0);
    assert.equal(converted.invoice.balanceDue, approved.total);
    assert.equal(converted.proposal.status, 'Accepted');

    const retryConversion = await invoices.convertProposal(approved.id, userId);
    assert.equal(retryConversion.invoice.id, converted.invoice.id);
    assert.equal(retryConversion.invoice.sourceProposalId, approved.id);

    const payment = await invoices.pay(converted.invoice.id, {
      amount: 1000000,
      date: new Date().toISOString().slice(0, 10),
      method: 'bank_transfer',
      reference: 'TEST-PAYMENT',
      idempotencyKey: invoiceIdempotency,
      recordedByUserId: userId
    });

    assert.equal(payment.payment.amount, 1000000);
    assert.equal(payment.invoice.amountPaid, 1000000);
    assert.equal(payment.invoice.balanceDue, approved.total - 1000000);
    assert.equal(payment.invoice.status, 'partially_paid');

    const paymentRetry = await invoices.pay(converted.invoice.id, {
      amount: 999999,
      date: new Date().toISOString().slice(0, 10),
      method: 'bank_transfer',
      reference: 'SHOULD-NOT-DUPLICATE',
      idempotencyKey: invoiceIdempotency,
      recordedByUserId: userId
    });

    assert.equal(paymentRetry.payment.id, payment.payment.id);
    assert.equal(paymentRetry.invoice.amountPaid, 1000000);

    await assert.rejects(
      () => invoices.update(converted.invoice.id, {
        items: [{ description: 'Changed after payment', quantity: 1, unitPrice: 1 }],
        version: payment.invoice.version
      }),
      error => error instanceof InvoiceImmutableError
    );

    await assert.rejects(
      () => invoices.pay(converted.invoice.id, {
        amount: approved.total,
        recordedByUserId: userId
      }),
      error => error instanceof InvoicePaymentError
    );
  } finally {
    await pool.query('DELETE FROM invoice_payments WHERE invoice_id IN (SELECT id FROM invoices WHERE source_proposal_id=$1)', [proposalId]);
    await pool.query('DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE source_proposal_id=$1)', [proposalId]);
    await pool.query('DELETE FROM invoices WHERE source_proposal_id=$1', [proposalId]);
    await pool.query('DELETE FROM proposal_items WHERE proposal_id=$1', [proposalId]);
    await pool.query('DELETE FROM proposals WHERE id=$1', [proposalId]);
    await pool.query('DELETE FROM clients WHERE id=$1', [clientId]);
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    await closePostgresPool();
  }
});
