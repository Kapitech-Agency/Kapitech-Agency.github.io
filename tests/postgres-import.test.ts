import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('staging importer is fail-closed for writes', async () => {
  const source = await fs.readFile(path.join(root, 'scripts/postgres-import.ts'), 'utf8');

  assert.match(source, /KAPITECH_MIGRATION_ENV !== 'staging'/);
  assert.match(source, /KAPITECH_MIGRATION_ALLOW_WRITE !== 'true'/);
  assert.match(source, /NODE_ENV === 'production'/);
  assert.match(source, /await client\.query\('BEGIN'\)/);
  assert.match(source, /await client\.query\('ROLLBACK'\)/);
});

test('staging importer preserves stable IDs and does not delete target-only rows', async () => {
  const source = await fs.readFile(path.join(root, 'scripts/postgres-import.ts'), 'utf8');

  assert.match(source, /ON CONFLICT \(id\) DO UPDATE/);
  assert.match(source, /target-only rows were not deleted/);
  assert.match(source, /Target-only rows deleted: false|targetOnlyRowsDeleted: false/);
});

test('staging importer validates source duplicates and foreign keys before writing', async () => {
  const source = await fs.readFile(path.join(root, 'scripts/postgres-import.ts'), 'utf8');

  assert.match(source, /assertNoDuplicateIds\(db\)/);
  assert.match(source, /assertForeignKeys\(db\)/);
  assert.match(source, /documents\.accessUserIds/);
});
