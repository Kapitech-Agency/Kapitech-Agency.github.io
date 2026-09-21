import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresClientRepository } from '../server/postgres-client-repository.ts';
import { closePostgresPool } from '../server/postgres.ts';
import {
  PostgresProjectRepository,
  PostgresTaskRepository
} from '../server/postgres-project-repository.ts';

test('PostgreSQL domain repositories expose stable CRUD contracts', () => {
  const clients = new PostgresClientRepository();
  const projects = new PostgresProjectRepository();
  const tasks = new PostgresTaskRepository();

  for (const method of ['list','findById','create','update','delete']) {
    assert.equal(typeof clients[method as keyof typeof clients], 'function', `client.${method}`);
  }

  for (const method of ['list','findById','listByClientId','create','update','archive']) {
    assert.equal(typeof projects[method as keyof typeof projects], 'function', `project.${method}`);
  }

  for (const method of ['list','findById','listByProjectId','create','update','archive']) {
    assert.equal(typeof tasks[method as keyof typeof tasks], 'function', `task.${method}`);
  }
});

test('PostgreSQL domain repositories fail closed when PostgreSQL is not configured', async t => {
  if (process.env.KAPITECH_POSTGRES_URL) {
    t.skip('live PostgreSQL configuration is present');
    return;
  }

  const projects = new PostgresProjectRepository();
  await assert.rejects(
    () => projects.list(),
    /KAPITECH_POSTGRES_URL/
  );
});

test('Projects enforce optimistic concurrency when PostgreSQL is configured', async t => {
  if (!process.env.KAPITECH_POSTGRES_URL) {
    t.skip('KAPITECH_POSTGRES_URL is not configured');
    return;
  }

  const clients = new PostgresClientRepository();
  const projects = new PostgresProjectRepository();
  const clientId = 'test_client_' + Date.now();
  const projectId = 'test_project_' + Date.now();

  const client = await clients.create({
    id: clientId,
    name: 'Integration Client',
    company: 'Integration Client Co',
    status: 'active'
  });

  const project = await projects.create({
    id: projectId,
    clientId: client.id,
    name: 'Integration Project',
    status: 'planning',
    budget: 100000,
    currency: 'IDR'
  });

  try {
    const updated = await projects.update(project.id, {
      name: 'Integration Project Updated',
      version: project.version
    });
    assert.equal(updated?.name, 'Integration Project Updated');
    assert.equal(updated?.version, Number(project.version) + 1);

    await assert.rejects(
      () => projects.update(project.id, {
        name: 'Stale Update',
        version: project.version
      }),
      error => (error as any)?.code === 'PROJECT_VERSION_CONFLICT'
    );
  } finally {
    await projects.archive(project.id);
    await closePostgresPool();
  }
});
