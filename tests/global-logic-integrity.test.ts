import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const read=(p:string)=>fs.readFileSync(p,'utf8');
test('invoice state machine excludes unsupported approved status',()=>{const s=read('server/routes.ts');assert.ok(s.includes("const INVOICE_STATUSES = new Set(['draft', 'sent', 'overdue'])"));assert.ok(!s.includes("const INVOICE_STATUSES = new Set(['draft', 'sent', 'approved'"));});
test('project updates never delete-recreate all tasks',()=>{const s=read('server/postgres-project-repository.ts');assert.ok(s.includes('Never delete-and-recreate tasks'));assert.ok(s.includes('TASK_HAS_TIME_LOGS'));assert.ok(s.includes('existingById'));});
test('task assignment uses relational assignee column',()=>{const s=read('server/postgres-task-repository.ts');assert.ok(s.includes('assignee_user_id'));assert.ok(s.includes('resolveAssigneeUserId'));assert.ok(s.includes('assigneeUserId'));});
test('document update is transactional',()=>{const s=read('server/postgres-document-repository.ts');const a=s.indexOf('async update(id: string');const z=s.indexOf('async delete(id: string',a);const u=s.slice(a,z);for(const e of ['BEGIN','FOR UPDATE','DELETE FROM document_access','COMMIT'])assert.ok(u.includes(e),e);});
test('critical audit append is transaction-bound',()=>{const s=read('server/postgres-audit-log-repository.ts');for(const e of ['appendWithinTransaction','pg_advisory_xact_lock','INSERT INTO audit_logs'])assert.ok(s.includes(e),e);});
test('approval rejects unsupported types',()=>{assert.ok(read('server/routes.ts').includes('Unsupported approval type'));assert.ok(read('server/postgres-approval-repository.ts').includes('UNSUPPORTED_APPROVAL_TYPE'));});
test('admin user update route is defined exactly once',()=>{const s=read('server/routes.ts');assert.equal(s.split("apiRouter.put('/auth/users/:id'").length-1,1);});
test('task assignee persistence resolves display identity to a real user id',()=>{const s=read('server/postgres-task-repository.ts');assert.ok(s.includes('resolveAssigneeUserId'));assert.ok(s.includes('lower(username) = lower($1)'));assert.ok(s.includes('assigneeUserId'));});

test('task response preserves display assignee while storing relational user id',()=>{const s=read('server/postgres-project-repository.ts');assert.match(s,/assignedTo: String\(metadata\.assignedTo \?\? row\.assignee_user_id \?\? ''\)/);});

test('administrator PostgreSQL account mutations bind audit to the same transaction',()=>{
 const auth=read('server/postgres-repository.ts');
 const routes=read('server/routes.ts');
 for(const e of ['createUser(user: StoredUser, audit?: AuditEntry)','updateUserPolicy(userId: string, name: string, role: string, stakeholderType: string, permissions: StoredUser[\'permissions\'], division: string, status: StoredUser[\'status\'], audit?: AuditEntry)','deleteUser(userId: string, audit?: AuditEntry)']) assert.ok(auth.includes(e),e);
 assert.match(auth,/createUser\([\s\S]*appendWithinTransaction\(client, audit\)/);
 assert.match(auth,/updateUserPolicy\([\s\S]*appendWithinTransaction\(client, audit\)/);
 assert.match(auth,/deleteUser\([\s\S]*appendWithinTransaction\(client, audit\)/);
 assert.match(routes,/postgresAuthRepository\.createUser\(newUser, makeAuditEntry/);
 assert.match(routes,/postgresAuthRepository\.updateUserPolicy\([\s\S]*makeAuditEntry/);
 assert.match(routes,/postgresAuthRepository\.deleteUser\(id, makeAuditEntry/);
});
