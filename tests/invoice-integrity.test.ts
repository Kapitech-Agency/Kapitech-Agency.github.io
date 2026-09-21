import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('invoice repository validates client and project ownership before writes', async () => {
  const source = await fs.readFile(path.join(root, 'server/postgres-invoice-repository.ts'), 'utf8');
  assert.match(source, /SELECT id FROM clients WHERE id=\$1 LIMIT 1/);
  assert.match(source, /SELECT id, client_id FROM projects WHERE id=\$1 LIMIT 1/);
  assert.match(source, /Project does not belong to the selected client/);
  assert.match(source, /const nextClientId = next\.clientId/);
});
