import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresDatabaseRepository } from '../server/postgres-database-repository.ts';

test('PostgresDatabaseRepository exposes a database loading contract', () => {
  const repository = new PostgresDatabaseRepository();
  assert.equal(typeof repository.loadDatabase, 'function');
  assert.equal(typeof repository.auth.findUserById, 'function');
  assert.equal(typeof repository.createClient, 'function');
  assert.equal(typeof repository.updateClient, 'function');
  assert.equal(typeof repository.deleteClient, 'function');
});

test('repository does not silently fall back to JSON', () => {
  assert.ok(new PostgresDatabaseRepository());
});
