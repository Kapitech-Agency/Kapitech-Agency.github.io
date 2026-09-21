import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('Relational cutover import protects MFA secrets and migrates private document objects', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'scripts/postgres-import.ts'), 'utf8');
  assert.ok(source.includes("encryptOptionalSecret(row.mfaSecret)"));
  assert.ok(source.includes("encryptOptionalSecret(row.mfaPendingSecret)"));
  assert.ok(source.includes('stagePrivateDocumentObjects'));
  assert.ok(source.includes('await storage.put(storageKey, payload)'));
  assert.ok(source.includes('verified.storageSha256 !== storageSha256'));
  assert.ok(source.includes("'content_sha256','storage_sha256','storage_version','storage_provider','integrity_checked_at'"));
});
