-- AMS PostgreSQL migration 009
-- Audit chain indexes and stronger operational constraints.

BEGIN;

CREATE INDEX IF NOT EXISTS audit_logs_timestamp_id_idx
  ON audit_logs(timestamp DESC, id DESC);

CREATE INDEX IF NOT EXISTS audit_logs_severity_timestamp_idx
  ON audit_logs(severity, timestamp DESC);

COMMIT;
