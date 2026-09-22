import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const contains=(source:string, expected:string)=>assert.ok(source.includes(expected), expected);
describe('object lifecycle and concurrency hardening contracts', () => {
  it('locks Client before checking business references during deletion', () => {
    const source = read('server/postgres-client-repository.ts');
    for (const expected of ['SELECT id FROM clients WHERE id=$1 FOR UPDATE','CLIENT_HAS_BUSINESS_RECORDS','BEGIN','COMMIT']) contains(source,expected);
  });
  it('locks Project before checking business references during deletion', () => {
    const source = read('server/postgres-project-repository.ts');
    for (const expected of ['SELECT id FROM projects WHERE id=$1 FOR UPDATE','PROJECT_HAS_BUSINESS_RECORDS','BEGIN','COMMIT']) contains(source,expected);
  });
  it('prevents Task deletion when time logs would be cascaded away', () => {
    const source = read('server/postgres-task-repository.ts');
    for (const expected of ['SELECT id FROM tasks WHERE id=$1 FOR UPDATE','SELECT COUNT(*)::int AS count FROM time_logs WHERE task_id=$1','TASK_HAS_TIME_LOGS']) contains(source,expected);
  });
  it('restricts Proposal deletion to Draft status and locks the row', () => {
    const source = read('server/postgres-proposal-repository.ts');
    for (const expected of ['SELECT id,status FROM proposals WHERE id=$1 FOR UPDATE',"status!=='Draft'",'PROPOSAL_DELETE_RESTRICTED']) contains(source,expected);
  });
  it('maps lifecycle conflicts to HTTP 409', () => {
    const source = read('server/routes.ts');
    for (const expected of ["error.message === 'TASK_HAS_TIME_LOGS'","error.message==='PROPOSAL_DELETE_RESTRICTED'",'res.status(409)']) contains(source,expected);
  });
});
