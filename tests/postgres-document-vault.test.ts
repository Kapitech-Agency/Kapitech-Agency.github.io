import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { getPostgresPool, closePostgresPool } from '../server/postgres.ts';
import {
  PostgresDocumentRepository,
  DocumentVersionConflictError
} from '../server/postgres-document-repository.ts';

const configured = Boolean(process.env.KAPITECH_POSTGRES_URL);

function token(prefix: string): string {
  return prefix + '_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
}

test('PostgreSQL document vault enforces owner ACL and archive lifecycle', async t => {
  if (!configured) {
    t.skip('KAPITECH_POSTGRES_URL is not configured');
    return;
  }

  const pool = getPostgresPool();
  const documents = new PostgresDocumentRepository();
  const ownerId = token('doc_owner');
  const readerId = token('doc_reader');
  const outsiderId = token('doc_outsider');
  const documentId = token('document');
  const storageKey = crypto.randomBytes(32).toString('hex');

  const seedUser = async (id: string) => {
    await pool.query(
      'INSERT INTO users (id,name,username,email,password_hash,salt,role,stakeholder_type,permissions,division,status) ' +
      'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [
        id,
        id,
        id,
        id + '@example.test',
        'test-password-hash',
        'test-salt',
        'Integration',
        'Operations',
        '{}',
        'Operations',
        'active'
      ]
    );
  };

  await seedUser(ownerId);
  await seedUser(readerId);
  await seedUser(outsiderId);

  try {
    const created = await documents.create({
      id: documentId,
      name: 'Private Agreement.pdf',
      type: 'PDF',
      mimeType: 'application/pdf',
      sizeBytes: 1234,
      category: 'Contracts',
      relatedEntity: 'Client',
      relatedId: token('client'),
      ownerUserId: ownerId,
      sourceType: 'private_file',
      storageKey,
      status: 'pending_upload',
      uploadedAt: new Date().toISOString(),
      metadata: { owner: 'Integration Owner' }
    });

    assert.equal(created.id, documentId);
    assert.equal(created.encryptedAtRest, true);
    assert.equal(created.version, 1);

    const ownerRead = await documents.findById(documentId, ownerId, false);
    assert.equal(ownerRead?.id, documentId);

    const outsiderRead = await documents.findById(documentId, outsiderId, false);
    assert.equal(outsiderRead, null);

    await documents.grantAccess(documentId, ownerId, readerId, false);

    const readerRead = await documents.findById(documentId, readerId, false);
    assert.equal(readerRead?.id, documentId);

    await documents.updateContentMetadata(documentId, ownerId, false, {
      mimeType: 'application/pdf',
      type: 'PDF',
      sizeBytes: 2048,
      size: '2 KB',
      status: 'ready',
      checksumSha256: crypto.createHash('sha256').update('integration-document').digest('hex'),
      uploadedAt: new Date().toISOString(),
      version: 1
    });

    const updated = await documents.findById(documentId, ownerId, false);
    assert.equal(updated?.sizeBytes, 2048);
    assert.equal(updated?.version, 2);
    assert.equal(updated?.status, 'ready');

    await assert.rejects(
      () => documents.updateContentMetadata(documentId, ownerId, false, {
        status: 'ready',
        version: 1
      }),
      error => error instanceof DocumentVersionConflictError
    );

    await documents.revokeAccess(documentId, ownerId, readerId, false);
    assert.equal(await documents.findById(documentId, readerId, false), null);

    assert.equal(await documents.archive(documentId, ownerId, false, updated?.version), true);
    assert.equal(await documents.findById(documentId, ownerId, false), null);
  } finally {
    await pool.query('DELETE FROM documents WHERE id=$1', [documentId]);
    await pool.query('DELETE FROM users WHERE id IN ($1,$2,$3)', [ownerId, readerId, outsiderId]);
    await closePostgresPool();
  }
});
