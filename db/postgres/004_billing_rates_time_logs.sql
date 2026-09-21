-- AMS PostgreSQL migration 004
-- Billing rates and authoritative Time Log financial snapshots.

BEGIN;

CREATE TABLE IF NOT EXISTS billing_rates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  hourly_rate NUMERIC(20,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'IDR',
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT billing_rates_hourly_rate_check
    CHECK (hourly_rate >= 0),

  CONSTRAINT billing_rates_currency_check
    CHECK (currency ~ '^[A-Z]{3}$'),

  CONSTRAINT billing_rates_dates_check
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS billing_rates_user_currency_from_unique
  ON billing_rates(user_id, currency, effective_from);

CREATE INDEX IF NOT EXISTS billing_rates_effective_lookup
  ON billing_rates(user_id, currency, effective_from DESC);

ALTER TABLE time_logs
  ADD COLUMN IF NOT EXISTS work_date DATE,
  ADD COLUMN IF NOT EXISTS rate NUMERIC(20,2),
  ADD COLUMN IF NOT EXISTS amount NUMERIC(20,2),
  ADD COLUMN IF NOT EXISTS currency CHAR(3),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

UPDATE time_logs
SET work_date = COALESCE(work_date, logged_at::date)
WHERE work_date IS NULL;

ALTER TABLE time_logs
  ALTER COLUMN work_date SET DEFAULT CURRENT_DATE;

ALTER TABLE time_logs DROP CONSTRAINT IF EXISTS time_logs_rate_v2_check;
ALTER TABLE time_logs
  ADD CONSTRAINT time_logs_rate_v2_check
  CHECK (rate IS NULL OR rate >= 0)
  NOT VALID;

ALTER TABLE time_logs DROP CONSTRAINT IF EXISTS time_logs_amount_v2_check;
ALTER TABLE time_logs
  ADD CONSTRAINT time_logs_amount_v2_check
  CHECK (amount IS NULL OR amount >= 0)
  NOT VALID;

ALTER TABLE time_logs DROP CONSTRAINT IF EXISTS time_logs_currency_v2_check;
ALTER TABLE time_logs
  ADD CONSTRAINT time_logs_currency_v2_check
  CHECK (currency IS NULL OR currency ~ '^[A-Z]{3}$')
  NOT VALID;

ALTER TABLE time_logs DROP CONSTRAINT IF EXISTS time_logs_status_v2_check;
ALTER TABLE time_logs
  ADD CONSTRAINT time_logs_status_v2_check
  CHECK (status IN ('draft','submitted','approved','rejected','voided'))
  NOT VALID;

ALTER TABLE time_logs DROP CONSTRAINT IF EXISTS time_logs_version_v2_check;
ALTER TABLE time_logs
  ADD CONSTRAINT time_logs_version_v2_check
  CHECK (version >= 1)
  NOT VALID;

ALTER TABLE time_logs DROP CONSTRAINT IF EXISTS time_logs_project_id_fkey;
ALTER TABLE time_logs
  ADD CONSTRAINT time_logs_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT
  NOT VALID;

ALTER TABLE time_logs DROP CONSTRAINT IF EXISTS time_logs_task_id_fkey;
ALTER TABLE time_logs
  ADD CONSTRAINT time_logs_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE RESTRICT
  NOT VALID;

ALTER TABLE time_logs DROP CONSTRAINT IF EXISTS time_logs_user_id_fkey;
ALTER TABLE time_logs
  ADD CONSTRAINT time_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
  NOT VALID;

CREATE UNIQUE INDEX IF NOT EXISTS time_logs_user_idempotency_unique
  ON time_logs(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS time_logs_project_work_date_idx
  ON time_logs(project_id, work_date DESC);

CREATE INDEX IF NOT EXISTS time_logs_user_work_date_idx
  ON time_logs(user_id, work_date DESC);

CREATE INDEX IF NOT EXISTS time_logs_status_work_date_idx
  ON time_logs(status, work_date DESC);

COMMIT;
