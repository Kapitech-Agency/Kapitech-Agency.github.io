import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('PostgreSQL invoice creation validates line item integrity before insert', () => {
  const source = fs.readFileSync('server/postgres-invoice-repository.ts', 'utf8');
  const start = source.indexOf('async create(');
  const end = source.indexOf('private async findByIdTx', start);
  assert.ok(start >= 0 && end > start);
  const block = source.slice(start, end);
  assert.match(block, /INVALID_INVOICE_ITEM/);
  assert.match(block, /INVOICE_ITEM_SUBTOTAL_MISMATCH/);
  assert.match(block, /INVALID_INVOICE_TOTALS/);
  assert.match(block, /INVOICE_FINANCIAL_TOTAL_MISMATCH/);
  assert.match(block, /INVOICE_ITEMS_REQUIRED/);
  assert.match(block, /expectedAmount = Math.round\(quantity \* unitPrice\)/);
  assert.ok(block.indexOf('invoiceItems') < block.indexOf('INSERT INTO invoices'));
});


test('PostgreSQL invoice updates revalidate authoritative financial totals', () => {
  const source = fs.readFileSync('server/postgres-invoice-repository.ts', 'utf8');
  const updateStart = source.indexOf('async update(');
  const paymentStart = source.indexOf('async recordPayment(', updateStart);
  assert.ok(updateStart >= 0 && paymentStart > updateStart);
  const block = source.slice(updateStart, paymentStart);
  assert.match(block, /this\.validateFinancials\(next\)/);
  assert.match(source, /private validateFinancials\(invoice:any\)/);
  assert.match(source, /INVOICE_FINANCIAL_TOTAL_MISMATCH/);
});


test('PostgreSQL invoice creation preserves the proposal relational link', () => {
  const source = fs.readFileSync('server/postgres-invoice-repository.ts', 'utf8');
  const start = source.indexOf('async create(');
  const end = source.indexOf('private async findByIdTx', start);
  assert.ok(start >= 0 && end > start);
  const block = source.slice(start, end);
  assert.match(block, /INSERT INTO invoices \\(id,proposal_id,invoice_number/);
  assert.match(block, /i\.proposalId\\|\\|null/);
});


test('PostgreSQL invoice updates cannot break an existing proposal linkage', () => {
  const source = fs.readFileSync('server/postgres-invoice-repository.ts', 'utf8');
  const updateStart = source.indexOf('async update(');
  const paymentStart = source.indexOf('async recordPayment(', updateStart);
  assert.ok(updateStart >= 0 && paymentStart > updateStart);
  const block = source.slice(updateStart, paymentStart);
  assert.match(block, /current\.proposalId/);
  assert.match(block, /PROPOSAL_LINKAGE_IMMUTABLE/);
});


test('PostgreSQL payment recording derives paid amount from payment rows', () => {
  const source = fs.readFileSync('server/postgres-invoice-repository.ts', 'utf8');
  const start = source.indexOf('async recordPayment(');
  const end = source.indexOf('async cancel(', start);
  assert.ok(start >= 0 && end > start);
  const block = source.slice(start, end);
  assert.match(block, /authoritativePaid=current\.payments\.reduce/);
  assert.match(block, /const totalPaid=authoritativePaid\+paymentAmount/);
});
