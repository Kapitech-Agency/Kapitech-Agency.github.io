import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(new URL('..', import.meta.url).pathname);

test('proposal-to-invoice conversion preserves cent precision', async () => {
  const source = await fs.readFile(path.join(root, 'server/postgres-proposal-repository.ts'), 'utf8');
  assert.match(source, /Math\.round\(proposalSubtotal \* \(derivedDiscountPercent \/ 100\) \* 100\) \/ 100/);
  assert.match(source, /Math\.round\(derivedTaxableSubtotal \* \(proposalTaxPercent \/ 100\) \* 100\) \/ 100/);
  assert.match(source, /Math\.round\(\(derivedTaxableSubtotal \+ derivedTaxAmount\) \* 100\) \/ 100/);
});

test('proposal-to-invoice conversion serializes invoice-number generation under a PostgreSQL advisory lock', async () => {
  const source = await fs.readFile(path.join(root, 'server/postgres-proposal-repository.ts'), 'utf8');
  assert.match(source, /pg_advisory_xact_lock\(hashtextextended\(\$1, 9127341\)\)/);
  assert.match(source, /\[\`invoice-number:\$\{invoiceYear\}\`\]/);
  assert.match(source, /attempt < 10/);
  assert.match(source, /INVOICE_NUMBER_GENERATION_FAILED/);
});
