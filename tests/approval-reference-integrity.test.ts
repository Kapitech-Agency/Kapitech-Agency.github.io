import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('approval action validates supported reference targets',async()=>{
 const source=await fs.readFile(path.join(root,'server/postgres-approval-repository.ts'),'utf8');
 assert.match(source,/reference_id/);
 assert.match(source,/Approval reference not found/);
 assert.match(source,/item\.type === 'Invoice'/);
 assert.match(source,/item\.type === 'Proposal'/);
 assert.match(source,/item\.type === 'Project'/);
});
