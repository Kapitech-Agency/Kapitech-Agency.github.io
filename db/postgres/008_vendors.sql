-- AMS PostgreSQL migration 008
-- Vendor lifecycle and finance-reference hardening.

BEGIN;

ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'IDR',
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_version_v2_check;
ALTER TABLE vendors
  ADD CONSTRAINT vendors_version_v2_check CHECK (version >= 1) NOT VALID;

ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_monthly_spend_v2_check;
ALTER TABLE vendors
  ADD CONSTRAINT vendors_monthly_spend_v2_check CHECK (monthly_spend >= 0) NOT VALID;

ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_currency_v2_check;
ALTER TABLE vendors
  ADD CONSTRAINT vendors_currency_v2_check CHECK (currency ~ '^[A-Z]{3}$') NOT VALID;

ALTER TABLE vendors DROP CONSTRAINT IF EXISTS vendors_status_v2_check;
ALTER TABLE vendors
  ADD CONSTRAINT vendors_status_v2_check
  CHECK (status IN ('active','under_review','inactive','blacklisted'))
  NOT VALID;

CREATE INDEX IF NOT EXISTS vendors_active_status_idx
  ON vendors(status, created_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS vendors_active_category_idx
  ON vendors(category, created_at DESC)
  WHERE archived_at IS NULL;

COMMIT;
