import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
const read=(p:string)=>fs.readFileSync(p,'utf8');
describe('approval reference persistence gate',()=>{
 it('persists the validated reference id instead of losing it before review',()=>{
  const s=read('server/postgres-approval-repository.ts');
  for (const expected of ['reference_id, requester_user_id',"VALUES ($1,$2,$3,$4,'Pending',$5,$6",'referenceId || null']) assert.ok(s.includes(expected), expected);
 });
});
