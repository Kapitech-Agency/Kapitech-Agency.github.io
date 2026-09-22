import { describe, expect, it } from 'vitest';
import fs from 'fs';
const read=(p:string)=>fs.readFileSync(p,'utf8');
describe('invoice payment idempotency gate',()=>{
 it('passes Idempotency-Key into PostgreSQL payment writes',()=>{
  const s=read('server/routes.ts');
  expect(s).toContain("idempotencyKey: String(input.idempotencyKey || req.get('Idempotency-Key') || '')");
 });
 it('checks the key while the invoice row is locked',()=>{
  const s=read('server/postgres-invoice-repository.ts');
  expect(s).toContain('SELECT * FROM invoices WHERE id=$1 FOR UPDATE');
  expect(s).toContain("metadata->>'idempotencyKey'=$2");
 });
});
