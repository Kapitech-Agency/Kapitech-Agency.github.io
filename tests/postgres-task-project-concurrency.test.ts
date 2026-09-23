import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('task mutations lock parent projects before task rows and bump project updated_at', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'server/postgres-task-repository.ts'), 'utf8');

  assert.match(source, /SELECT id FROM projects WHERE id = \$1 FOR UPDATE/);
  assert.match(source, /UPDATE projects SET updated_at = NOW\(\) WHERE id = \$1/);
  assert.match(source, /SELECT project_id, updated_at FROM tasks WHERE id = \$1 LIMIT 1/);
  assert.match(source, /SELECT \* FROM tasks WHERE id = \$1 FOR UPDATE/);
  assert.match(source, /Array\.from\(new Set\(\[currentProjectId, requestedProjectId\]/);
  assert.match(source, /SELECT project_id FROM tasks WHERE id=\$1 LIMIT 1/);
  assert.match(source, /SELECT id, project_id FROM tasks WHERE id=\$1 FOR UPDATE/);
});

test('task/project concurrency regression test documents the aggregate contract', () => {
  const source = fs.readFileSync(path.resolve(process.cwd(), 'server/postgres-task-repository.ts'), 'utf8');
  const projectLock = source.indexOf("SELECT id FROM projects WHERE id = $1 FOR UPDATE");
  const taskLock = source.indexOf("SELECT * FROM tasks WHERE id = $1 FOR UPDATE");
  assert.ok(projectLock >= 0 && taskLock > projectLock, 'parent project must be locked before the task row in update flow');
});
