import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const read=(p:string)=>fs.readFileSync(p,'utf8');
test('production build bundles backend and packages PostgreSQL migrations',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.match(pkg.scripts.build,/vite build/);
 assert.match(pkg.scripts.build,/esbuild server\.ts/);
 assert.match(pkg.scripts.build,/copy-postgres-migrations\.mjs/);
 assert.equal(pkg.scripts.start,'node dist/server.cjs');
});
test('production environment gate requires database, encryption, storage and backup evidence',()=>{
 const s=read('scripts/validate-production-env.ts');
 for(const key of ['KAPITECH_DATA_SOURCE','KAPITECH_DATA_ENCRYPTION_KEY','KAPITECH_POSTGRES_SSL','KAPITECH_DOCUMENT_STORAGE_PROVIDER','KAPITECH_POSTGRES_BACKUP_LATEST_SHA256','KAPITECH_POSTGRES_BACKUP_RESTORE_VERIFIED_AT']) assert.ok(s.includes(key),key);
});
test('migration packaging is deterministic and fails closed when no SQL migrations exist',()=>{
 const s=read('scripts/copy-postgres-migrations.mjs');
 assert.match(s,/filter\(\(file\) => \/\^\\d\+_\.\+\\\.sql\$\/\.test\(file\)\)/);
 assert.match(s,/dist\/db\/postgres/);
 assert.match(s,/No PostgreSQL migration files were found to package/);
});
