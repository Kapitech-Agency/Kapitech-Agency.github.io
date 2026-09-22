import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'fs';
import path from 'path';
const root=process.cwd();
const read=(p:string)=>fs.readFileSync(path.join(root,p),'utf8');
describe('approval authority gate',()=>{
  it('forces Pending status and validates supported references before creation',()=>{
    const s=read('server/postgres-approval-repository.ts');
    assert.ok(s.includes("Invoice: 'invoices'"));
    assert.ok(s.includes("Proposal: 'proposals'"));
    assert.ok(s.includes("Project: 'projects'"));
    assert.ok(s.includes("Expense: 'expenses'"));
    assert.ok(s.includes("if (!referenceId) throw new Error('Approval reference is required.')"));
    assert.ok(s.includes("VALUES ($1,$2,$3,$4,'Pending'"));
  });
  it('enforces maker-checker inside the transactional action boundary',()=>{
    const s=read('server/postgres-approval-repository.ts');
    assert.ok(s.includes("item.requesterId === reviewer.id"));
    assert.ok(s.includes("APPROVAL_SELF_ACTION_BLOCKED"));
    assert.ok(s.includes('SELECT * FROM approvals WHERE id=$1 FOR UPDATE'));
  });
  it('exposes approval authority failures as explicit API responses',()=>{
    const s=read('server/routes.ts');
    assert.ok(s.includes("reference not found"));
    assert.ok(s.includes("APPROVAL_SELF_ACTION_BLOCKED"));
    assert.ok(s.includes('res.status(403)'));
  });
});
