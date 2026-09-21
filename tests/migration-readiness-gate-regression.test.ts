import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import path from 'node:path';

test('Production readiness migration gate does not hard-code a fixed migration count', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'server/routes.ts'), 'utf8');
  assert.ok(source.includes("fs.readdirSync(migrationsDir)"));
  assert.ok(source.includes("requiredMigrationVersions.every(version => appliedMigrationSet.has(version))"));
  assert.ok(!source.includes("Array.from({ length: 14 }"));
});
