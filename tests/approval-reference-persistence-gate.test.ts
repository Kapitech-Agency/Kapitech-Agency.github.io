import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const read=(p:string)=>fs.readFileSync(p,'utf8');
test('approval reference id is persisted after validation',()=>{
 const s=read('server/postgres-approval-repository.ts');
 assert.match(s,/reference_id, requester_user_id/);
 assert.match(s,/VALUES \(\$1,\$2,\$3,\$4,'Pending',\$5,\$6/);
 assert.match(s,/referenceId \|\| null/);
});
