import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('Production build packages PostgreSQL migration SQL files', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
  const build = String(packageJson.scripts?.build || '');
  const script = fs.readFileSync(path.resolve(process.cwd(), 'scripts/copy-postgres-migrations.mjs'), 'utf8');
  const loader = fs.readFileSync(path.resolve(process.cwd(), 'server/postgres-migrations.ts'), 'utf8');

  assert.ok(build.includes('node scripts/copy-postgres-migrations.mjs'));
  assert.ok(script.includes("path.resolve(process.cwd(), 'db/postgres')"));
  assert.ok(script.includes("path.resolve(process.cwd(), 'dist/db/postgres')"));
  assert.ok(loader.includes("path.resolve(entrypointDir, 'db/postgres')"));
});
