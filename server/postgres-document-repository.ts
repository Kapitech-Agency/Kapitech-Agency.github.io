import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;

function iso(value: any): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapDocument(row: Row): Record<string, any> {
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
    ? row.metadata
    : {};
  return {
    ...metadata,
    id: row.id,
    name: row.name,
    title: metadata.title ?? row.name,
    type: row.type,
    mimeType: row.mime_type ?? '',
    sizeBytes: row.size_bytes == null ? 0 : Number(row.size_bytes),
    size: metadata.size ?? (row.size_bytes == null ? '0 B' : String(row.size_bytes) + ' B'),
    category: row.category ?? '',
    relatedEntity: row.related_entity ?? '',
    relatedId: row.related_id ?? '',
    ownerUserId: row.owner_user_id ?? undefined,
    sourceType: row.source_type,
    storageKey: row.storage_key ?? undefined,
    externalUrl: row.external_url ?? undefined,
    status: row.status,
    version: Number(row.version ?? 1),
    checksumSha256: row.checksum_sha256 ?? undefined,
    encryptedAtRest: Boolean(row.encrypted_at_rest),
    archivedAt: row.archived_at ? iso(row.archived_at) : undefined,
    uploadedAt: iso(row.uploaded_at),
    createdAt: iso(row.created_at)
  };
}

export class DocumentNotFoundError extends Error { readonly code = 'DOCUMENT_NOT_FOUND'; }
export class DocumentAccessDeniedError extends Error { readonly code = 'DOCUMENT_ACCESS_DENIED'; }
export class DocumentImmutableError extends Error { readonly code = 'DOCUMENT_IMMUTABLE'; }
export class DocumentVersionConflictError extends Error { readonly code = 'DOCUMENT_VERSION_CONFLICT'; }
export class DocumentSourceError extends Error { readonly code = 'DOCUMENT_SOURCE_INVALID'; }

export class PostgresDocumentRepository {
  private async accessible(id: string, userId: string, isMaster: boolean): Promise<boolean> {
    if (isMaster) return true;
    const result = await getPostgresPool().query(
      'SELECT 1 FROM documents d LEFT JOIN document_access a ON a.document_id=d.id AND a.user_id=$2 ' +
      'WHERE d.id=$1 AND d.archived_at IS NULL AND (d.owner_user_id=$2 OR a.user_id IS NOT NULL) LIMIT 1',
      [id, userId]
    );
    return result.rows.length === 1;
  }

  async listForUser(userId: string, isMaster: boolean): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      isMaster
        ? 'SELECT * FROM documents WHERE archived_at IS NULL ORDER BY created_at DESC'
        : 'SELECT DISTINCT d.* FROM documents d LEFT JOIN document_access a ON a.document_id=d.id AND a.user_id=$1 ' +
          'WHERE d.archived_at IS NULL AND (d.owner_user_id=$1 OR a.user_id IS NOT NULL) ORDER BY d.created_at DESC',
      isMaster ? [] : [userId]
    );
    return result.rows.map(mapDocument);
  }

  async findById(id: string, userId: string, isMaster: boolean): Promise<Record<string, any> | null> {
    if (!(await this.accessible(id, userId, isMaster))) return null;
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM documents WHERE id=$1 AND archived_at IS NULL LIMIT 1',
      [id]
    );
    return result.rows[0] ? mapDocument(result.rows[0]) : null;
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    const sourceType = String(input.sourceType || 'private_file');
    const ownerUserId = String(input.ownerUserId || '');
    if (!ownerUserId) throw new DocumentSourceError('Document owner is required.');
    if (sourceType === 'private_file' && !input.storageKey) throw new DocumentSourceError('Private documents require a storage key.');
    if (sourceType === 'external_link' && !input.externalUrl) throw new DocumentSourceError('External documents require an HTTPS URL.');

    return withPostgresTransaction(async client => {
      const metadata = input.metadata && typeof input.metadata === 'object' ? input.metadata : {};
      const result = await client.query<Row>(
        'INSERT INTO documents ' +
        '(id,name,type,mime_type,size_bytes,category,related_entity,related_id,source_type,storage_key,owner_user_id,external_url,status,uploaded_at,created_at,metadata,version,encrypted_at_rest) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),$15,1,$16) RETURNING *',
        [
          String(input.id),
          String(input.name || 'Document'),
          String(input.type || 'Document'),
          input.mimeType || null,
          Number.isFinite(Number(input.sizeBytes)) ? Math.max(0, Math.floor(Number(input.sizeBytes))) : 0,
          input.category || null,
          input.relatedEntity || null,
          input.relatedId || null,
          sourceType,
          sourceType === 'private_file' ? String(input.storageKey) : null,
          ownerUserId,
          sourceType === 'external_link' ? String(input.externalUrl) : null,
          String(input.status || 'pending_upload'),
          input.uploadedAt || new Date().toISOString(),
          JSON.stringify(metadata),
          sourceType === 'private_file'
        ]
      );

      await client.query(
        'INSERT INTO document_access (document_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [String(input.id), ownerUserId]
      );
      return mapDocument(result.rows[0]);
    });
  }

  async updateContentMetadata(id: string, userId: string, isMaster: boolean, patch: Record<string, any>): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const access = await client.query<Row>(
        'SELECT * FROM documents WHERE id=$1 AND archived_at IS NULL AND ' +
        '(owner_user_id=$2 OR $3=TRUE OR EXISTS (SELECT 1 FROM document_access WHERE document_id=$1 AND user_id=$2)) FOR UPDATE',
        [id, userId, isMaster]
      );
      if (!access.rows[0]) throw new DocumentNotFoundError('Document not found or access denied.');
      if (access.rows[0].source_type !== 'private_file' || !access.rows[0].storage_key) {
        throw new DocumentSourceError('This document is not backed by a private file.');
      }

      const metadata = access.rows[0].metadata && typeof access.rows[0].metadata === 'object'
        ? access.rows[0].metadata
        : {};
      const nextMetadata = {
        ...metadata,
        ...(patch.size !== undefined ? { size: patch.size } : {}),
        ...(patch.owner !== undefined ? { owner: patch.owner } : {})
      };

      const expectedVersion = patch.version == null ? undefined : Number(patch.version);
      if (expectedVersion != null && Number(access.rows[0].version) !== expectedVersion) {
        throw new DocumentVersionConflictError('Document metadata was modified by another user.');
      }

      const result = await client.query<Row>(
        'UPDATE documents SET mime_type=$2,type=$3,size_bytes=$4,status=$5,checksum_sha256=$6,' +
        'uploaded_at=COALESCE($7,uploaded_at),metadata=$8,version=version+1 WHERE id=$1 AND archived_at IS NULL RETURNING *',
        [
          id,
          patch.mimeType || access.rows[0].mime_type || null,
          patch.type || access.rows[0].type || 'FILE',
          Math.max(0, Math.floor(Number(patch.sizeBytes ?? access.rows[0].size_bytes ?? 0))),
          String(patch.status || access.rows[0].status || 'ready'),
          patch.checksumSha256 || null,
          patch.uploadedAt || null,
          JSON.stringify(nextMetadata)
        ]
      );
      return mapDocument(result.rows[0]);
    });
  }

  async archive(id: string, userId: string, isMaster: boolean, expectedVersion?: number): Promise<boolean> {
    return withPostgresTransaction(async client => {
      const current = await client.query<Row>(
        'SELECT * FROM documents WHERE id=$1 AND archived_at IS NULL AND ' +
        '(owner_user_id=$2 OR $3=TRUE OR EXISTS (SELECT 1 FROM document_access WHERE document_id=$1 AND user_id=$2)) FOR UPDATE',
        [id, userId, isMaster]
      );
      if (!current.rows[0]) return false;
      if (expectedVersion != null && Number(current.rows[0].version) !== expectedVersion) {
        throw new DocumentVersionConflictError('Document metadata was modified by another user.');
      }
      await client.query(
        'UPDATE documents SET archived_at=NOW(),status=$2,version=version+1 WHERE id=$1',
        [id, 'archived']
      );
      return true;
    });
  }

  async grantAccess(id: string, userId: string, targetUserId: string, isMaster: boolean): Promise<void> {
    if (!isMaster && userId !== targetUserId) {
      throw new DocumentAccessDeniedError('Only the document owner or a master administrator can change document access.');
    }
    const owner = await getPostgresPool().query('SELECT owner_user_id FROM documents WHERE id=$1 AND archived_at IS NULL', [id]);
    if (!owner.rows[0]) throw new DocumentNotFoundError('Document not found.');
    if (!isMaster && String(owner.rows[0].owner_user_id) !== userId) {
      throw new DocumentAccessDeniedError('Only the document owner or a master administrator can change document access.');
    }
    await getPostgresPool().query(
      'INSERT INTO document_access (document_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [id,targetUserId]
    );
  }

  async revokeAccess(id: string, userId: string, targetUserId: string, isMaster: boolean): Promise<void> {
    const owner = await getPostgresPool().query('SELECT owner_user_id FROM documents WHERE id=$1 AND archived_at IS NULL', [id]);
    if (!owner.rows[0]) throw new DocumentNotFoundError('Document not found.');
    if (!isMaster && String(owner.rows[0].owner_user_id) !== userId) {
      throw new DocumentAccessDeniedError('Only the document owner or a master administrator can change document access.');
    }
    if (String(owner.rows[0].owner_user_id) === targetUserId) return;
    await getPostgresPool().query('DELETE FROM document_access WHERE document_id=$1 AND user_id=$2', [id,targetUserId]);
  }
}

export const postgresDocumentRepository = new PostgresDocumentRepository();
