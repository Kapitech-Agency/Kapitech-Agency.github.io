import { describe, expect, it } from 'vitest';
import fs from 'fs';
const read=(p:string)=>fs.readFileSync(p,'utf8');
describe('proposal client linkage gate',()=>{
 it('derives client linkage from project or deal when clientId is omitted',()=>{
  const s=read('server/postgres-proposal-repository.ts');
  expect(s).toContain('let resolvedClientId = p.clientId ? String(p.clientId) : null');
  expect(s).toContain('projectClientId');
  expect(s).toContain('dealClientId');
  expect(s).toContain('resolvedClientId');
 });
});
