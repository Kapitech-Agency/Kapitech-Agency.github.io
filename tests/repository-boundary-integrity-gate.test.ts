import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
const read=(p:string)=>fs.readFileSync(path.join(process.cwd(),p),'utf8');
describe('repository boundary integrity gate',()=>{
  it('validates proposal relationships during creation',()=>{
    const s=read('server/postgres-proposal-repository.ts');
    expect(s).toContain("Proposal client not found.");
    expect(s).toContain("Proposal project does not belong to the selected client.");
    expect(s).toContain("Proposal deal does not belong to the selected client.");
    expect(s).toContain('FOR SHARE');
  });
  it('freezes paid invoice financial composition',()=>{
    const s=read('server/postgres-invoice-repository.ts');
    expect(s).toContain('PAID_INVOICE_FINANCIAL_FIELDS_IMMUTABLE');
    expect(s).toContain('subtotal');
    expect(s).toContain('discountPercent');
    expect(s).toContain('taxPercent');
  });
  it('maps paid invoice immutability and proposal lifecycle conflicts to 409',()=>{
    const s=read('server/routes.ts');
    expect(s).toContain('PAID_INVOICE_FINANCIAL_FIELDS_IMMUTABLE');
    expect(s).toContain('PROPOSAL_DELETE_RESTRICTED');
    expect(s).toContain('res.status(409)');
  });
});
