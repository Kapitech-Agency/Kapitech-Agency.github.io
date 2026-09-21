import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('financial records protect paid invoice history and accepted proposals',async()=>{
 const [invoice,proposal,routes]=await Promise.all([
  fs.readFile(path.join(root,'server/postgres-invoice-repository.ts'),'utf8'),
  fs.readFile(path.join(root,'server/postgres-proposal-repository.ts'),'utf8'),
  fs.readFile(path.join(root,'server/routes.ts'),'utf8')
 ]);
 assert.match(invoice,/PAID_INVOICE_LINKAGE_IMMUTABLE/);
 assert.match(invoice,/PAID_INVOICE_TOTAL_IMMUTABLE/);
 assert.match(invoice,/current\.payments\.length > 0/);
 assert.match(proposal,/ACCEPTED_PROPOSAL_IMMUTABLE/);
 assert.match(routes,/PAID_INVOICE_LINKAGE_IMMUTABLE/);
 assert.match(routes,/ACCEPTED_PROPOSAL_IMMUTABLE/);
 assert.match(routes,/status\(409\)/);
});
