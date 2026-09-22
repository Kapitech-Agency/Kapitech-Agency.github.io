import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path: string) => fs.readFileSync(path, 'utf8');

test('invoice state machine excludes unsupported approved status', () => {
  const routes = read('server/routes.ts');
  assert.match(routes, /const INVOICE_STATUSES = new Set\(\['draft', 'sent', 'overdue', 'cancelled'\]\)/);
  assert.doesNotMatch(routes, /INVOICE_STATUSES = new Set\(\['draft', 'sent', 'approved'/);
});

test('project updates never delete-recreate all tasks', () => {
  const source = read('server/postgres-project-repository.ts');
  assert.match(source, /Never delete-and-recreate tasks/);
  assert.match(source, /TASK_HAS_TIME_LOGS/);
  assert.match(source, /existingById/);
});

test('task assignment uses the relational assignee column', () => {
  const source = read('server/postgres-task-repository.ts');
  assert.match(source, /assignee_user_id/);
  assert.match(source, /assignee: String\(row\.assignee_user_id/);
});

test('document update uses one transaction for metadata and ACL', () => {
  const source = read('server/postgres-document-repository.ts');
  const updateStart = source.indexOf('async update(id: string');
  const deleteStart = source.indexOf('async delete(id: string', updateStart);
  const update = source.slice(updateStart, deleteStart);
  assert.match(update, /BEGIN/);
  assert.match(update, /FOR UPDATE/);
  assert.match(update, /DELETE FROM document_access/);
  assert.match(update, /COMMIT/);
});

test('critical audit events can append inside the business transaction', () => {
  const audit = read('server/postgres-audit-log-repository.ts');
  assert.match(audit, /appendWithinTransaction/);
  assert.match(audit, /pg_advisory_xact_lock/);
  assert.match(audit, /INSERT INTO audit_logs/);
});

test('approval API rejects unsupported reference types', () => {
  const routes = read('server/routes.ts');
  assert.match(routes, /Unsupported approval type/);
  const approvalRepo = read('server/postgres-approval-repository.ts');
  assert.match(approvalRepo, /UNSUPPORTED_APPROVAL_TYPE/);
});
