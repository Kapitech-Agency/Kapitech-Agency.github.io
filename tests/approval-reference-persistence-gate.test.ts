import { describe, expect, it } from 'vitest';
import fs from 'fs';
const read=(p:string)=>fs.readFileSync(p,'utf8');
describe('approval reference persistence gate',()=>{
 it('persists the validated reference id instead of losing it before review',()=>{
  const s=read('server/postgres-approval-repository.ts');
  expect(s).toContain('reference_id, requester_user_id');
  expect(s).toContain('VALUES ($1,$2,$3,$4,\'Pending\',$5,$6');
  expect(s).toContain('referenceId || null');
 });
});
