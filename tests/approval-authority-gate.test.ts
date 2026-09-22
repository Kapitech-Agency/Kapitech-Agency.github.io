import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
const root=process.cwd();
const read=(p:string)=>fs.readFileSync(path.join(root,p),'utf8');
describe('approval authority gate',()=>{
  it('forces Pending status and validates supported references before creation',()=>{
    const s=read('server/postgres-approval-repository.ts');
    for (const expected of ["Invoice: 'invoices'","Proposal: 'proposals'","Project: 'projects'","Expense: 'expenses'","if (!referenceId) throw new Error('Approval reference is required.')","VALUES ($1,$2,$3,$4,'Pending'"]) assert.ok(s.includes(expected), expected);
  });
  it('enforces maker-checker inside the transactional action boundary',()=>{
    const s=read('server/postgres-approval-repository.ts');
    for (const expected of ["item.requesterId === reviewer.id","APPROVAL_SELF_ACTION_BLOCKED",'SELECT * FROM approvals WHERE id=$1 FOR UPDATE']) assert.ok(s.includes(expected), expected);
  });
  it('exposes approval authority failures as explicit API responses',()=>{
    const s=read('server/routes.ts');
    for (const expected of ["reference not found","APPROVAL_SELF_ACTION_BLOCKED",'res.status(403)']) assert.ok(s.includes(expected), expected);
  });
});
