import { describe, expect, it } from 'vitest';
import fs from 'fs';
const read=(p:string)=>fs.readFileSync(p,'utf8');
describe('production build and runtime gate',()=>{
 it('builds frontend, backend bundle, and packages PostgreSQL migrations',()=>{
  const pkg=JSON.parse(read('package.json'));
  expect(pkg.scripts.build).toContain('vite build');
  expect(pkg.scripts.build).toContain('esbuild server.ts');
  expect(pkg.scripts.build).toContain('copy-postgres-migrations.mjs');
  expect(pkg.scripts.start).toBe('node dist/server.cjs');
 });
 it('requires PostgreSQL, encryption, TLS, private document storage, and backup evidence in production',()=>{
  const s=read('scripts/validate-production-env.ts');
  expect(s).toContain("KAPITECH_DATA_SOURCE");
  expect(s).toContain("KAPITECH_DATA_ENCRYPTION_KEY");
  expect(s).toContain("KAPITECH_POSTGRES_SSL");
  expect(s).toContain("KAPITECH_DOCUMENT_STORAGE_PROVIDER");
  expect(s).toContain("KAPITECH_POSTGRES_BACKUP_LATEST_SHA256");
  expect(s).toContain("KAPITECH_POSTGRES_BACKUP_RESTORE_VERIFIED_AT");
 });
 it('packages all numbered SQL migrations deterministically',()=>{
  const s=read('scripts/copy-postgres-migrations.mjs');
  expect(s).toContain("filter((file) => /^\\d+_.+\\.sql$/.test(file))");
  expect(s).toContain("dist/db/postgres");
  expect(s).toContain('No PostgreSQL migration files were found to package.');
 });
});
