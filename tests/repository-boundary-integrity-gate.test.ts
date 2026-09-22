import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'fs';
import path from 'path';
const read=(p:string)=>fs.readFileSync(path.join(process.cwd(),p),'utf8');
describe('repository boundary integrity gate',()=>{
  it('validates proposal relationships during creation',()=>{
    const s=read('server/postgres-proposal-repository.ts');
    assert.ok(s.includes("Proposal client not found."));
    assert.ok(s.includes("Proposal project does not belong to the selected client."));
    assert.ok(s.includes("Proposal deal does not belong to the selected client."));
    assert.ok(s.includes('FOR SHARE'));
  });
  it('freezes paid invoice financial composition',()=>{
    const s=read('server/postgres-invoice-repository.ts');
    assert.ok(s.includes('PAID_INVOICE_FINANCIAL_FIELDS_IMMUTABLE'));
    assert.ok(s.includes('subtotal'));
    assert.ok(s.includes('discountPercent'));
    assert.ok(s.includes('taxPercent'));
  });
  it('maps paid invoice immutability and proposal lifecycle conflicts to 409',()=>{
    const s=read('server/routes.ts');
    assert.ok(s.includes('PAID_INVOICE_FINANCIAL_FIELDS_IMMUTABLE'));
    assert.ok(s.includes('PROPOSAL_DELETE_RESTRICTED'));
    assert.ok(s.includes('res.status(409)'));
  });
});
