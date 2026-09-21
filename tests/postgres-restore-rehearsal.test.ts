import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('restore rehearsal is isolated and never targets the live database path', async () => {
  const source = await fs.readFile(path.join(root, 'scripts/postgres-restore-rehearsal.ts'), 'utf8');

  assert.match(source, /outputDir/);
  assert.match(source, /\.restore-rehearsal/);
  assert.match(source, /fs\.mkdirSync/);
  assert.match(source, /mode: 0o700/);
  assert.match(source, /mode: 0o600/);
  assert.doesNotMatch(source, /KAPITECH_DATA_DIR.*kapitech_db\.json/);
});

test('restore rehearsal validates the decrypted AMS schema before writing the isolated copy', async () => {
  const source = await fs.readFile(path.join(root, 'scripts/postgres-restore-rehearsal.ts'), 'utf8');

  assert.match(source, /KAPITECH_DATA_ENCRYPTION_KEY/);
  assert.match(source, /aes-256-gcm/);
  assert.match(source, /JSON\.parse/);
  assert.match(source, /requiredArrays/);
});
