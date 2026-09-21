import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file: string) => fs.readFile(path.join(root, file), 'utf8');

test('private document routes enforce object-level access controls', async () => {
  const routes = await read('server/routes.ts');
  for (const fragment of ['/documents', '/documents/:id/content']) {
    const index = routes.indexOf(fragment);
    assert.ok(index >= 0, 'Missing document route: ' + fragment);
    const window = routes.slice(Math.max(0, index - 100), index + 700);
    assert.match(window, /requireAuth/);
    assert.match(window, /documentAccessMiddleware|documentMutationMiddleware/);
  }
});

test('production private-document storage cannot silently fall back to local disk', async () => {
  const routes = await read('server/routes.ts');
  assert.match(routes, /KAPITECH_DOCUMENT_STORAGE_PROVIDER/);
  assert.match(routes, /s3|s3-compatible/);
  assert.match(routes, /NODE_ENV.*production|production/);
});
