import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('won-deal client resolution serializes concurrent client creation by normalized identity', () => {
  const source = fs.readFileSync('server/postgres-crm-deal-repository.ts', 'utf8');
  const start = source.indexOf('async convertWonDeal(');
  const end = source.indexOf('async convertLead(', start);
  assert.ok(start >= 0 && end > start);
  const block = source.slice(start, end);
  assert.match(block, /crm-won-client:/);
  assert.match(block, /hashtextextended\(\$1, 3847219\)/);
  assert.match(block, /toLowerCase\(\)/);
});
