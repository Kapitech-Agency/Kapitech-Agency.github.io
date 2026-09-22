import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('time log creation rejects a task with no project when a project is explicitly selected', () => {
  const source = fs.readFileSync('server/postgres-time-log-repository.ts', 'utf8');
  const start = source.indexOf('if (taskId)');
  const end = source.indexOf('const metadata = logMetadata', start);
  assert.ok(start >= 0 && end > start);
  const block = source.slice(start, end);
  assert.match(block, /taskProjectId !== resolvedProjectId/);
  assert.doesNotMatch(block, /resolvedProjectId && taskProjectId && taskProjectId !== resolvedProjectId/);
});
