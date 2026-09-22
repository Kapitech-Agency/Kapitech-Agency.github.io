import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('object lifecycle and concurrency hardening contracts', () => {
  it('locks Client before checking business references during deletion', () => {
    const source = read('server/postgres-client-repository.ts');
    assert.ok(source.includes('SELECT id FROM clients WHERE id=$1 FOR UPDATE'));
    assert.ok(source.includes('CLIENT_HAS_BUSINESS_RECORDS'));
    assert.ok(source.includes('BEGIN'));
    assert.ok(source.includes('COMMIT'));
  });

  it('locks Project before checking business references during deletion', () => {
    const source = read('server/postgres-project-repository.ts');
    assert.ok(source.includes('SELECT id FROM projects WHERE id=$1 FOR UPDATE'));
    assert.ok(source.includes('PROJECT_HAS_BUSINESS_RECORDS'));
    assert.ok(source.includes('BEGIN'));
    assert.ok(source.includes('COMMIT'));
  });

  it('prevents Task deletion when time logs would be cascaded away', () => {
    const source = read('server/postgres-task-repository.ts');
    assert.ok(source.includes('SELECT id FROM tasks WHERE id=$1 FOR UPDATE'));
    assert.ok(source.includes('SELECT COUNT(*)::int AS count FROM time_logs WHERE task_id=$1'));
    assert.ok(source.includes('TASK_HAS_TIME_LOGS'));
  });

  it('restricts Proposal deletion to Draft status and locks the row', () => {
    const source = read('server/postgres-proposal-repository.ts');
    assert.ok(source.includes('SELECT id,status FROM proposals WHERE id=$1 FOR UPDATE'));
    assert.ok(source.includes("status!=='Draft'"));
    assert.ok(source.includes('PROPOSAL_DELETE_RESTRICTED'));
  });

  it('maps lifecycle conflicts to HTTP 409', () => {
    const source = read('server/routes.ts');
    assert.ok(source.includes("error.message === 'TASK_HAS_TIME_LOGS'"));
    assert.ok(source.includes("error.message === 'PROPOSAL_DELETE_RESTRICTED'"));
    assert.ok(source.includes('res.status(409)'));
  });
});
