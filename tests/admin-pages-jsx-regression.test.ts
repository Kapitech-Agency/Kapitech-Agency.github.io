import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('Admin CRM mutation actions stay grouped behind the CRM permission', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/AdminCrm.tsx'), 'utf8');
  assert.ok(source.includes('{canManageCrm && ('));
  assert.ok(source.includes('disabled={!canManageCrm}'));
  assert.ok(source.includes('</button>\n            </>\n          )}'));
});

test('Admin invoicing expense cards have balanced JSX wrapper structure', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/AdminInvoicing.tsx'), 'utf8');
  assert.ok(source.includes('                  </div>\n                </div>\n              ))'));
  assert.ok(!source.includes('                  </div>\n                </div>\n              </div>\n              ))'));
});

test('Admin projects mutation actions stay behind their permissions', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/AdminProjects.tsx'), 'utf8');
  assert.ok(source.includes('{canManageKanbanTasks && <Button'));
  assert.ok(source.includes('{canManageProjects && <Button'));
  assert.ok(!source.includes('Legacy regression guard:'));
});
