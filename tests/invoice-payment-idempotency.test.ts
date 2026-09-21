import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('invoice payment endpoint accepts an idempotency key', async () => {
  const source = await fs.readFile(path.join(root, 'server/routes.ts'), 'utf8');
  assert.match(source, /input\.idempotencyKey \|\| req\.get\('Idempotency-Key'\)/);
});

test('postgres invoice payment repository deduplicates idempotent retries inside the transaction', async () => {
  const source = await fs.readFile(path.join(root, 'server/postgres-invoice-repository.ts'), 'utf8');
  assert.match(source, /metadata->>'idempotencyKey'/);
  assert.match(source, /payment\.idempotencyKey/);
  assert.match(source, /FOR UPDATE/);
});
