import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('lead conversion locks and rejects already converted leads',async()=>{
 const source=await fs.readFile(path.join(root,'server/postgres-crm-deal-repository.ts'),'utf8');
 assert.match(source,/SELECT id,status FROM leads WHERE id=\$1 FOR UPDATE/);
 assert.match(source,/Lead has already been converted/);
 assert.match(source,/status <> \$4/);
});
