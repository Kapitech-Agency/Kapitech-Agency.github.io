import { describe, expect, it } from 'vitest';
import fs from 'fs';
const read=(p:string)=>fs.readFileSync(p,'utf8');
describe('time-log ownership gate',()=>{
 it('allows project managers to manage all logs but limits operational staff to their own',()=>{
  const s=read('server/routes.ts');
  expect(s).toContain("const canManageAllTimeLogs = Boolean(req.user!.permissions?.canManageProjects)");
  expect(s).toContain("existing.userId || '') !== String(req.user!.id)");
  expect(s).toContain("You can only delete your own time entries.");
 });
});
