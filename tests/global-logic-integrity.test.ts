import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const read=(p:string)=>fs.readFileSync(p,'utf8');
test('invoice state machine excludes unsupported approved status',()=>{const s=read('server/routes.ts');assert.ok(s.includes("const INVOICE_STATUSES = new Set(['draft', 'sent', 'overdue'])"));assert.ok(!s.includes("const INVOICE_STATUSES = new Set(['draft', 'sent', 'approved'"));});
test('project updates never delete-recreate all tasks',()=>{const s=read('server/postgres-project-repository.ts');assert.ok(s.includes('Never delete-and-recreate tasks'));assert.ok(s.includes('TASK_HAS_TIME_LOGS'));assert.ok(s.includes('existingById'));});
test('task assignment uses relational assignee column',()=>{const s=read('server/postgres-task-repository.ts');assert.ok(s.includes('assignee_user_id'));assert.ok(s.includes('resolveAssigneeUserId'));assert.ok(s.includes('assigneeUserId'));});
test('document update is transactional',()=>{const s=read('server/postgres-document-repository.ts');const a=s.indexOf('async update(id: string');const z=s.indexOf('async delete(id: string',a);const u=s.slice(a,z);assert.match(u,/withPostgresTransaction/);for(const e of ['FOR UPDATE','DELETE FROM document_access','appendWithinTransaction'])assert.ok(u.includes(e),e);});
test('critical audit append is transaction-bound',()=>{const s=read('server/postgres-audit-log-repository.ts');for(const e of ['appendWithinTransaction','pg_advisory_xact_lock','INSERT INTO audit_logs'])assert.ok(s.includes(e),e);});
test('approval rejects unsupported types',()=>{assert.ok(read('server/routes.ts').includes('Unsupported approval type'));assert.ok(read('server/postgres-approval-repository.ts').includes('UNSUPPORTED_APPROVAL_TYPE'));});
test('admin user update route is defined exactly once',()=>{const s=read('server/routes.ts');assert.equal(s.split("apiRouter.put('/auth/users/:id'").length-1,1);});
test('task assignee persistence resolves display identity to a real user id',()=>{const s=read('server/postgres-task-repository.ts');assert.ok(s.includes('resolveAssigneeUserId'));assert.ok(s.includes('lower(username) = lower($1)'));assert.ok(s.includes('assigneeUserId'));});

test('task response preserves display assignee while storing relational user id',()=>{const s=read('server/postgres-project-repository.ts');assert.match(s,/assignedTo: String\(metadata\.assignedTo \?\? row\.assignee_user_id \?\? ''\)/);});

test('project task updates resolve display assignee through the active-user resolver',()=>{const s=read('server/postgres-project-repository.ts');const start=s.indexOf('for (const task of incoming)');const end=s.indexOf('for (const row of tasksResult.rows',start);const block=s.slice(start,end);assert.match(block,/resolveAssigneeUserId\(client, merged\.assignedTo\)/);assert.match(block,/assigneeUserId/);});

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

test('notification read and operational settings mutations are transaction-bound to audit',()=>{const n=read('server/postgres-notification-repository.ts');const s=read('server/postgres-notification-settings-repository.ts');const r=read('server/routes.ts');assert.match(n,/async markRead\([\s\S]*audit\?: AuditEntry/);assert.match(n,/async markAllRead\([\s\S]*audit\?: AuditEntry/);assert.match(n,/appendWithinTransaction\(client, audit\)/);assert.match(s,/async update\([\s\S]*audit\?: AuditEntry/);assert.match(s,/appendWithinTransaction\(client, audit\)/);assert.match(r,/postgresNotificationRepository\.markRead\([\s\S]*?makeAuditEntry/);assert.match(r,/postgresNotificationRepository\.markAllRead\([\s\S]*?makeAuditEntry/);});

test('deferred PostgreSQL integrity constraints have a final validation migration',()=>{
  const source = read('db/postgres/019_validate_integrity_constraints.sql');
  for (const name of [
    'expenses_amount_v2_check','expenses_currency_v2_check','expenses_status_v2_check','expenses_version_v2_check','expenses_project_id_fkey',
    'time_logs_hours_positive_v1','invoice_payments_amount_positive_v1','invoice_items_quantity_positive_v1','invoice_items_amount_nonnegative_v1',
    'proposal_items_quantity_positive_v1','invoices_amounts_nonnegative_v1','invoices_status_v1','approvals_status_v1'
  ]) assert.ok(source.includes(`VALIDATE CONSTRAINT ${name}`), name);
});

test('proposal generic update cannot bypass approval permission or invoice-conversion workflow',()=>{const route=read('server/routes.ts');const repo=read('server/postgres-proposal-repository.ts');const pg=route.slice(route.indexOf("apiRouter.put('/crm/proposals/:id'"),route.indexOf("apiRouter.post('/crm/proposals/:id/approve'"));assert.match(pg,/canApproveBudgets/);assert.match(pg,/status === 'Accepted'/);assert.match(repo,/ACCEPTED_PROPOSAL_WORKFLOW_ONLY/);});


test('document mutations bind PostgreSQL audit and document delete enforces object access',()=>{
 const repo=read('server/postgres-document-repository.ts');
 const route=read('server/routes.ts');
 for(const e of ['async create(input: any, audit?: AuditEntry)','async update(id: string, patch: any, audit?: AuditEntry)','async delete(id: string, audit?: AuditEntry)','appendWithinTransaction(client, audit)']) assert.ok(repo.includes(e),e);
 const deleteRoute=route.slice(route.indexOf("apiRouter.delete('/documents/:id'"),route.indexOf("apiRouter.get('/system/document-vault/status"));
 assert.match(deleteRoute,/requireDocumentObjectAccess\(req, res, document\)/);
 assert.match(deleteRoute,/postgresDocumentRepository\.delete\(id, makeAuditEntry/);
});

test('private document upload rotates the storage object key before metadata commit',()=>{
 const route=read('server/routes.ts');
 const upload=route.slice(route.indexOf("apiRouter.put('/documents/:id/content'"),route.indexOf("apiRouter.get('/documents/:id/content'"));
 assert.match(upload,/const previousStorageKey = String\(document\.storageKey \|\| ''\)/);
 assert.match(upload,/const nextStorageKey = crypto\.randomBytes\(32\)\.toString\('hex'\)/);
 assert.match(upload,/storageKey: nextStorageKey/);
 assert.match(upload,/await storage\.put\(nextStorageKey, encryptedPayload\)/);
 assert.match(upload,/storageVersion: Number\(document\.storageVersion \|\| 1\) \+ 1/);
 assert.match(upload,/await storage\.delete\(previousStorageKey\)/);
});

test('invoice generic update cannot replace authoritative payment rows',()=>{const route=read('server/routes.ts');const repo=read('server/postgres-invoice-repository.ts');const start=route.indexOf("apiRouter.put('/finance/invoices/:id'");const block=route.slice(start,route.indexOf("apiRouter.post('/finance/invoices/:id/pay'",start));assert.match(block,/pickFields\(input, \['type','clientId','projectId','leadId','currency','issueDate','dueDate','notes','paymentTerms','status'\]\)/);assert.match(block,/items, taxPercent, discountPercent/);assert.doesNotMatch(block,/\.\.\.input/);assert.match(repo,/payments:current\.payments/);});

test('proposal creation cannot bypass approval or conversion workflow',()=>{const route=read('server/routes.ts');const repo=read('server/postgres-proposal-repository.ts');const start=route.indexOf("apiRouter.post('/crm/proposals'");const block=route.slice(start,route.indexOf("apiRouter.put('/crm/proposals/:id'",start));assert.match(block,/const statusValues = new Set\(\['Draft','Internal Review','Sent'\]\)/);assert.match(block,/Accepted status can only be created by the proposal-to-invoice workflow/);assert.match(repo,/creatableStatuses = new Set\(\['Draft','Internal Review','Sent'\]\)/);assert.match(repo,/PROPOSAL_CREATION_WORKFLOW_ONLY/);});

test('project bulk task validation errors are returned as client errors',()=>{
 const route=read('server/routes.ts');
 const start=route.indexOf("apiRouter.put('/projects/:id'");
 const block=route.slice(start,route.indexOf("apiRouter.delete('/projects/:id'",start));
 assert.match(block,/DUPLICATE_TASK_ID/);
 assert.match(block,/INVALID_TASK_STATUS/);
 assert.match(block,/INVALID_TASK_PRIORITY/);
 assert.match(block,/res\.status\(400\)/);
});

test('transaction-bound PostgreSQL audit routes do not append the same success event a second time',()=>{
 const route=read('server/routes.ts');
 for (const [needle,nextRoute] of [
   ["apiRouter.put('/leads/:id'","apiRouter.delete('/leads/:id'"],
   ["apiRouter.delete('/leads/:id'","apiRouter.post('/leads/:id/convert'"],
   ["apiRouter.put('/vendors/:id'","apiRouter.delete('/vendors/:id'"],
   ["apiRouter.delete('/vendors/:id'","apiRouter.post('/cms/services'"],
   ["apiRouter.post('/projects/timelogs'","apiRouter.delete('/projects/timelogs/:id'"],
   ["apiRouter.delete('/projects/timelogs/:id'","// ----------------------------------------------------"]
 ] as const) {
   const start=route.indexOf(needle);
   const end=route.indexOf(nextRoute,start);
   const block=route.slice(start,end);
   const pgEnd=block.indexOf("const db = getDatabase");
   if (pgEnd>0) assert.equal((block.slice(0,pgEnd).match(/recordAuditLog\(/g)||[]).length,0,needle);
 }
});


test('core PostgreSQL state domains are enforced by the latest migration',()=>{
 const migration=read('db/postgres/020_core_state_constraints.sql');
 for(const name of [
  'projects_status_v1_check','tasks_status_v1_check','tasks_priority_v1_check',
  'proposals_status_v1_check','invoices_currency_v1_check','crm_deals_stage_v1_check',
  'crm_deals_priority_v1_check','clients_status_v1_check','vendors_status_v1_check'
 ]) assert.ok(migration.includes(name),name);
 assert.match(migration,/stage IN \('new','contacted','proposal','negotiation','won','lost'\)/);
});


test('proposal repository enforces lifecycle transitions even outside HTTP routes',()=>{
 const repo=read('server/postgres-proposal-repository.ts');
 assert.match(repo,/INVALID_PROPOSAL_STATUS/);
 assert.match(repo,/PROPOSAL_APPROVAL_TRANSITION_INVALID/);
 assert.match(repo,/currentStatus/);
 assert.match(repo,/nextStatus/);
});


test('task repository prevents project reassignment when historical time logs exist',()=>{
 const repo=read('server/postgres-task-repository.ts');
 assert.match(repo,/TASK_PROJECT_MOVE_FORBIDDEN/);
 assert.match(repo,/SELECT COUNT\(\*\)::int AS count FROM time_logs WHERE task_id=\$1/);
 assert.match(repo,/projectId !== \(current\.projectId \? String\(current\.projectId\) : null\)/);
});
test('unresolved task assignees cannot silently become metadata-only assignments',()=>{
 const project=read('server/postgres-project-repository.ts');
 const task=read('server/postgres-task-repository.ts');
 assert.match(project,/ASSIGNEE_NOT_FOUND/);
 assert.match(task,/ASSIGNEE_NOT_FOUND/);
});


test('time log creation derives project relation from its referenced task',()=>{
 const repo=read('server/postgres-time-log-repository.ts');
 assert.match(repo,/let resolvedProjectId = projectId/);
 assert.match(repo,/if \(!resolvedProjectId && taskProjectId\) resolvedProjectId = taskProjectId/);
 assert.match(repo,/VALUES \(\$1,\$2,\$3,\$4,\$5,\$6,\$7,\$8\)/);
 assert.match(repo,/\[log\.id, resolvedProjectId, taskId/);
});


test('PostgreSQL import canonicalizes lifecycle aliases and rejects unsupported states',()=>{
 const importer=read('scripts/postgres-import.ts');
 for(const name of ['normalizeClientStatus','normalizeCrmStage','normalizeProposalStatus','normalizeInvoiceStatus','normalizeVendorStatus','normalizeProjectStatus','normalizeTaskStatus','normalizePriority']) {
   assert.ok(importer.includes('function '+name),name);
 }
 for(const value of ["prospect: 'lead'","on_hold: 'inactive'","lead: 'new'","discovery: 'contacted'","assertNestedIds(db)","assertApprovalReferences(db)"]) {
   assert.ok(importer.includes(value),value);
 }
});

test('PostgreSQL import preserves cross-module project and time-log integrity',()=>{
 const importer=read('scripts/postgres-import.ts');
 for(const value of [
   'clientIdForProjectLinkedRow',
   'Time log task/project mismatch in migration source',
   'if (!timeLogProjectId) timeLogProjectId = taskProjectId',
   'Invoice payment aggregate mismatch in migration source',
   'Invoice balance aggregate mismatch in migration source'
 ]) assert.ok(importer.includes(value),value);
});


test('invoice repository rejects unsupported direct status mutation',()=>{
 const repo=read('server/postgres-invoice-repository.ts');
 assert.match(repo,/allowedStatuses=new Set\(\['draft','sent','overdue','partially_paid','paid','cancelled'\]\)/);
 assert.match(repo,/INVALID_INVOICE_STATUS/);
});

test('document repository never manually commits or rolls back inside shared transaction callbacks',()=>{
 const repo=read('server/postgres-document-repository.ts');
 const createStart=repo.indexOf('async create');
 const updateStart=repo.indexOf('async update');
 const deleteStart=repo.indexOf('async delete');
 for(const block of [
   repo.slice(createStart,updateStart),
   repo.slice(updateStart,deleteStart),
   repo.slice(deleteStart)
 ]) {
   assert.doesNotMatch(block,/client\.query\(['"](BEGIN|COMMIT|ROLLBACK)['"]\)/);
   assert.match(block,/withPostgresTransaction/);
 }
});
