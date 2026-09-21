import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresInvoiceRepository } from '../server/postgres-invoice-repository.ts';

test('PostgresInvoiceRepository exposes invoice and payment operations', () => {
  const repository = new PostgresInvoiceRepository();
  assert.equal(typeof repository.list, 'function');
  assert.equal(typeof repository.findById, 'function');
  assert.equal(typeof repository.create, 'function');
  assert.equal(typeof repository.update, 'function');
  assert.equal(typeof repository.recordPayment, 'function');
  assert.equal(typeof repository.cancel, 'function');
});

test('PostgreSQL invoice repository is opt-in', async (t) => {
  if (!process.env.KAPITECH_POSTGRES_URL) {
    t.skip('KAPITECH_POSTGRES_URL is not configured in this test environment');
    return;
  }
  const repository = new PostgresInvoiceRepository();
  assert.equal(await repository.findById('integration-test-missing-invoice'), null);
});
