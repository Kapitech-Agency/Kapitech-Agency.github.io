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


test('Mutation audit logging is consistent across JSON and PostgreSQL route paths', async () => {
  const source = await fs.readFile(path.join(root, 'server/routes.ts'), 'utf8');
  for (const action of [
    'CRM_DEAL_CREATED', 'CRM_DEAL_UPDATED', 'CRM_DEAL_DELETED',
    'CLIENT_CREATED', 'CLIENT_UPDATED', 'CLIENT_DELETED',
    'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED',
    'VENDOR_CREATED', 'VENDOR_UPDATED', 'VENDOR_DELETED',
    'CMS_SERVICE_CREATED', 'CMS_SERVICE_UPDATED', 'CMS_SERVICE_DELETED',
    'CMS_PROJECT_CREATED', 'CMS_PROJECT_UPDATED', 'CMS_PROJECT_DELETED',
    'CMS_TESTIMONIAL_CREATED', 'CMS_TESTIMONIAL_UPDATED', 'CMS_TESTIMONIAL_DELETED',
    'CMS_SETTINGS_UPDATED'
  ]) {
    assert.ok(source.includes(action), `Missing mutation audit action: ${action}`);
  }
});

test('Read-only admin states keep mutation UI controls behind the same permissions as the API', async () => {
  const invoicing = await fs.readFile(path.join(root, 'src/pages/admin/AdminInvoicing.tsx'), 'utf8');
  assert.ok(invoicing.includes('const canCreateInvoice = canManageInvoices;'));
  assert.ok(invoicing.includes('disabled={!canManageInvoices}'));
  assert.ok(invoicing.includes('{canManageInvoices && ('));

  const projects = await fs.readFile(path.join(root, 'src/pages/admin/AdminProjects.tsx'), 'utf8');
  assert.ok(projects.includes('if (!canManageProjects || selectedProject'));
  assert.ok(projects.includes('draggable={canManageProjects}'));
  assert.ok(projects.includes('{canManageProjects && ('));

  const clients = await fs.readFile(path.join(root, 'src/pages/admin/AdminClients.tsx'), 'utf8');
  assert.ok(clients.includes('{canManageClients && ('));
  assert.ok(clients.includes('if (!canManageClients) return;'));

  const crm = await fs.readFile(path.join(root, 'src/pages/admin/AdminCrm.tsx'), 'utf8');
  assert.ok(crm.includes('const canManageCrm = hasAdminPermission(\'canManageCrm\');'));
  assert.ok(crm.includes('if (!canManageCrm) return;'));
  assert.ok(crm.includes('disabled={!canManageCrm}'));
});
