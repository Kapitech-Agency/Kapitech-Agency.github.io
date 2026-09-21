import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('Admin CRM action conditional wraps multiple controls in a fragment', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/AdminCrm.tsx'), 'utf8');
  assert.ok(source.includes('{canManageCrm && (\n                        <>'));
});

test('Admin invoicing expense cards have balanced JSX wrapper structure', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/AdminInvoicing.tsx'), 'utf8');
  assert.ok(source.includes('                  </div>\n                </div>\n              ))'));
  assert.ok(!source.includes('                  </div>\n                </div>\n              </div>\n              ))'));
});

test('Admin projects action conditional is explicitly closed', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/admin/AdminProjects.tsx'), 'utf8');
  assert.ok(source.includes('            </button>\n          )}\n        </div>'));
});
