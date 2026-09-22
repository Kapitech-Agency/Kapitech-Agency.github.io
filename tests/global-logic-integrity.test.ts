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

test('CMS PostgreSQL mutations bind route audit to repository transaction',()=>{const route=read('server/routes.ts');const cms=read('server/postgres-cms-repository.ts');assert.match(cms,/async create\(kind: CmsKind, input: any, audit\?: AuditEntry/);assert.match(cms,/async update\(kind: CmsKind, id: string, patch: any, audit\?: AuditEntry/);assert.match(cms,/async delete\(kind: CmsKind, id: string, audit\?: AuditEntry/);assert.match(cms,/async updateSettings\(patch: Record<string, any>, audit\?: AuditEntry/);assert.match(route,/postgresCmsRepository\.create\('service', newService, makeAuditEntry/);assert.match(route,/postgresCmsRepository\.update\('service', id, patch, makeAuditEntry/);assert.match(route,/postgresCmsRepository\.delete\('service', req\.params\.id, makeAuditEntry/);assert.match(route,/postgresCmsRepository\.updateSettings\(patch, makeAuditEntry/);});

test('notification read and operational settings mutations are transaction-bound to audit',()=>{const n=read('server/postgres-notification-repository.ts');const s=read('server/postgres-notification-settings-repository.ts');const r=read('server/routes.ts');assert.match(n,/async markRead\([\s\S]*audit\?: AuditEntry/);assert.match(n,/async markAllRead\([\s\S]*audit\?: AuditEntry/);assert.match(n,/appendWithinTransaction\(client, audit\)/);assert.match(s,/async update\([\s\S]*audit\?: AuditEntry/);assert.match(s,/appendWithinTransaction\(client, audit\)/);assert.match(r,/postgresNotificationRepository\.markRead\([^)]*makeAuditEntry/);assert.match(r,/postgresNotificationRepository\.markAllRead\([^)]*makeAuditEntry/);});

test('deferred PostgreSQL integrity constraints have a final validation migration',()=>{
  const source = read('db/postgres/019_validate_integrity_constraints.sql');
  for (const name of [
    'expenses_amount_v2_check','expenses_currency_v2_check','expenses_status_v2_check','expenses_version_v2_check','expenses_project_fk',
    'time_logs_hours_positive_v1','invoice_payments_amount_positive_v1','invoice_items_quantity_positive_v1','invoice_items_amount_nonnegative_v1',
    'proposal_items_quantity_positive_v1','invoices_amounts_nonnegative_v1','invoices_status_v1','approvals_status_v1'
  ]) assert.ok(source.includes(`VALIDATE CONSTRAINT ${name}`), name);
});

test('proposal generic update cannot bypass approval permission or invoice-conversion workflow',()=>{const route=read('server/routes.ts');const repo=read('server/postgres-proposal-repository.ts');const pg=route.slice(route.indexOf("apiRouter.put('/crm/proposals/:id'"),route.indexOf("apiRouter.post('/crm/proposals/:id/approve'"));assert.match(pg,/canApproveBudgets/);assert.match(pg,/status === 'Accepted'/);assert.match(repo,/ACCEPTED_PROPOSAL_WORKFLOW_ONLY/);});
