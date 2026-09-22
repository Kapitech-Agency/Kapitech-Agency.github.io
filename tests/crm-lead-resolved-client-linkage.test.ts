import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('CRM lead conversion persists the resolved existing client id on the new deal', () => {
  const source = fs.readFileSync('server/postgres-crm-deal-repository.ts', 'utf8');
  const start = source.indexOf('async convertLead(');
  const end = source.indexOf('\n  }\n}\n\nexport const postgresCrmDealRepository', start);
  assert.ok(start >= 0 && end > start);
  const block = source.slice(start, end);
  assert.match(block, /resolvedClient\s*=\s*\{/);
  assert.match(block, /\[\s*\n\s*resolvedClient\.id,/);
  assert.doesNotMatch(block, /INSERT INTO crm_deals[\s\S]{0,1800}\[\s*\n\s*deal\.id,[\s\S]{0,300}\n\s*client\.id,/);
});
