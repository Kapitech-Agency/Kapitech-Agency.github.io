import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('object lifecycle and concurrency hardening contracts', () => {
  it('locks Client before checking business references during deletion', () => {
    const source = read('server/postgres-client-repository.ts');
    expect(source).toContain('SELECT id FROM clients WHERE id=$1 FOR UPDATE');
    expect(source).toContain('CLIENT_HAS_BUSINESS_RECORDS');
    expect(source).toContain('BEGIN');
    expect(source).toContain('COMMIT');
  });

  it('locks Project before checking business references during deletion', () => {
    const source = read('server/postgres-project-repository.ts');
    expect(source).toContain('SELECT id FROM projects WHERE id=$1 FOR UPDATE');
    expect(source).toContain('PROJECT_HAS_BUSINESS_RECORDS');
    expect(source).toContain('BEGIN');
    expect(source).toContain('COMMIT');
  });

  it('prevents Task deletion when time logs would be cascaded away', () => {
    const source = read('server/postgres-task-repository.ts');
    expect(source).toContain('SELECT id FROM tasks WHERE id=$1 FOR UPDATE');
    expect(source).toContain('SELECT COUNT(*)::int AS count FROM time_logs WHERE task_id=$1');
    expect(source).toContain('TASK_HAS_TIME_LOGS');
  });

  it('restricts Proposal deletion to Draft status and locks the row', () => {
    const source = read('server/postgres-proposal-repository.ts');
    expect(source).toContain('SELECT id,status FROM proposals WHERE id=$1 FOR UPDATE');
    expect(source).toContain("status!=='Draft'");
    expect(source).toContain('PROPOSAL_DELETE_RESTRICTED');
  });

  it('maps lifecycle conflicts to HTTP 409', () => {
    const source = read('server/routes.ts');
    expect(source).toContain("error.message === 'TASK_HAS_TIME_LOGS'");
    expect(source).toContain("error.message==='PROPOSAL_DELETE_RESTRICTED'");
    expect(source).toContain('res.status(409)');
  });
});
