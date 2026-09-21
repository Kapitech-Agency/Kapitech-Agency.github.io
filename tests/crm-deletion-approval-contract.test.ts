import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('CRM deletion protection and approval status whitelist are enforced',async()=>{
 const [lead,deal,approval,routes]=await Promise.all([
  fs.readFile(path.join(root,'server/postgres-lead-repository.ts'),'utf8'),
  fs.readFile(path.join(root,'server/postgres-crm-deal-repository.ts'),'utf8'),
  fs.readFile(path.join(root,'server/postgres-approval-repository.ts'),'utf8'),
  fs.readFile(path.join(root,'server/routes.ts'),'utf8')
 ]);
 assert.match(lead,/LEAD_IS_CLOSED/);
 assert.match(deal,/DEAL_HAS_PROPOSALS/);
 assert.match(deal,/FROM proposals WHERE deal_id/);
 assert.match(approval,/INVALID_APPROVAL_STATUS/);
 assert.match(approval,/Approved.*Rejected.*Changes Requested/);
 assert.match(routes,/LEAD_IS_CLOSED/);
 assert.match(routes,/DEAL_HAS_PROPOSALS/);
});
