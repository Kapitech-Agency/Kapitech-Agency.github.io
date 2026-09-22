import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read=(p:string)=>fs.readFileSync(p,'utf8');

test('project task controls use task-specific permission in the admin UI',()=>{
  const s=read('src/pages/admin/AdminProjects.tsx');
  const taskSection=s.slice(s.indexOf('const handleAddTask'), s.indexOf('// Drag & Drop Handlers'));
  assert.match(taskSection,/canManageKanbanTasks/);
  assert.doesNotMatch(taskSection,/if \(!canManageProjects/);

  const board=s.slice(s.indexOf('Task Execution Board'), s.indexOf('CONTEXTUAL TASK DETAIL DRAWER'));
  assert.match(board,/draggable=\{canManageKanbanTasks\}/);
  assert.match(board,/\{canManageKanbanTasks && \(/);
});

test('project CRUD backend blocks unauthorized task mutation',()=>{
  const s=read('server/routes.ts');
  const start=s.indexOf("apiRouter.put('/projects/:id'");
  const block=s.slice(start,start+11000);
  assert.match(block,/Task mutations require task-management permission/);
  assert.match(block,/canManageKanbanTasks/);
});
