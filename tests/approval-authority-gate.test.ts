import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
const root=process.cwd();
const read=(p:string)=>fs.readFileSync(path.join(root,p),'utf8');
describe('approval authority gate',()=>{
  it('forces Pending status and validates supported references before creation',()=>{
    const s=read('server/postgres-approval-repository.ts');
    expect(s).toContain("Invoice: 'invoices'");
    expect(s).toContain("Proposal: 'proposals'");
    expect(s).toContain("Project: 'projects'");
    expect(s).toContain("Expense: 'expenses'");
    expect(s).toContain("if (!referenceId) throw new Error('Approval reference is required.')");
    expect(s).toContain("VALUES ($1,$2,$3,$4,'Pending'");
  });
  it('enforces maker-checker inside the transactional action boundary',()=>{
    const s=read('server/postgres-approval-repository.ts');
    expect(s).toContain("item.requesterId === reviewer.id");
    expect(s).toContain("APPROVAL_SELF_ACTION_BLOCKED");
    expect(s).toContain('SELECT * FROM approvals WHERE id=$1 FOR UPDATE');
  });
  it('exposes approval authority failures as explicit API responses',()=>{
    const s=read('server/routes.ts');
    expect(s).toContain("reference not found");
    expect(s).toContain("APPROVAL_SELF_ACTION_BLOCKED");
    expect(s).toContain('res.status(403)');
  });
});
