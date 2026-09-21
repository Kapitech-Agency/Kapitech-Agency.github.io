-- AMS PostgreSQL migration 007
-- Private document vault metadata, ACL, integrity, and lifecycle hardening.

BEGIN;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS checksum_sha256 CHAR(64),
  ADD COLUMN IF NOT EXISTS encrypted_at_rest BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_version_v2_check;
ALTER TABLE documents
  ADD CONSTRAINT documents_version_v2_check
  CHECK (version >= 1)
  NOT VALID;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_checksum_v2_check;
ALTER TABLE documents
  ADD CONSTRAINT documents_checksum_v2_check
  CHECK (checksum_sha256 IS NULL OR checksum_sha256 ~ '^[a-f0-9]{64}$')
  NOT VALID;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_storage_source_v2_check;
ALTER TABLE documents
  ADD CONSTRAINT documents_storage_source_v2_check
  CHECK (
    (source_type = 'private_file' AND storage_key IS NOT NULL AND encrypted_at_rest = TRUE)
    OR
    (source_type = 'external_link' AND external_url IS NOT NULL)
  )
  NOT VALID;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_owner_user_id_fkey;
ALTER TABLE documents
  ADD CONSTRAINT documents_owner_user_id_fkey
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT
  NOT VALID;

CREATE INDEX IF NOT EXISTS documents_active_created_idx
  ON documents(created_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS documents_active_owner_idx
  ON documents(owner_user_id, created_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS documents_checksum_idx
  ON documents(checksum_sha256)
  WHERE checksum_sha256 IS NOT NULL;

CREATE INDEX IF NOT EXISTS document_access_user_document_idx
  ON document_access(user_id, document_id);

COMMIT;
