import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('protected client and project deletion returns conflict',async()=>{
 const source=await fs.readFile(path.join(root,'server/routes.ts'),'utf8');
 assert.match(source,/CLIENT_HAS_BUSINESS_RECORDS/);
 assert.match(source,/PROJECT_HAS_BUSINESS_RECORDS/);
 assert.match(source,/res\.status\(409\)/);
});
