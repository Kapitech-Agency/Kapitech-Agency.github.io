import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Approval UI never exposes decision actions without approval permission', async () => {
  const source = await fs.readFile(path.join(root, 'src/pages/admin/AdminApprovals.tsx'), 'utf8');
  assert.ok(source.includes("hasAdminPermission('canApproveBudgets')"));
  assert.ok(source.includes("item.status.toLowerCase() === 'pending' && canApproveBudgets"));
  assert.ok(source.includes('activeItem && canApproveBudgets'));
  assert.ok(source.includes('You do not have approval permission.'));
});

test('PostgreSQL proposal mutations and approval creation retain audit logging', async () => {
  const source = await fs.readFile(path.join(root, 'server/routes.ts'), 'utf8');
  for (const action of [
    'PROPOSAL_UPDATED',
    'PROPOSAL_APPROVED',
    'PROPOSAL_CONVERTED_TO_INVOICE',
    'PROPOSAL_DELETED',
    'APPROVAL_CREATED'
  ]) {
    assert.ok(source.includes(action), `Missing audit action: ${action}`);
  }
});

test('Proposal approval status guard allows only the server approval permission or Master', async () => {
  const source = await fs.readFile(path.join(root, 'server/routes.ts'), 'utf8');
  assert.ok(source.includes("['Approved', 'Rejected'].includes(String(patch.status))"));
  assert.ok(source.includes("!Boolean(req.user!.permissions?.canApproveBudgets)"));
  assert.ok(source.includes("req.user!.stakeholderType !== 'Master'"));
});
