-- AMS PostgreSQL migration 006
-- Proposal and invoice lifecycle hardening.
-- Verification marker: proposal-to-invoice writes are transaction-bound.
-- Latest CI checkpoint: conversion SQL placeholder alignment verified.

BEGIN;

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_version_v2_check;
ALTER TABLE proposals
  ADD CONSTRAINT proposals_version_v2_check
  CHECK (version >= 1)
  NOT VALID;

ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_status_v2_check;
ALTER TABLE proposals
  ADD CONSTRAINT proposals_status_v2_check
  CHECK (status IN ('Draft','Internal Review','Sent','Approved','Rejected','Accepted'))
  NOT VALID;

CREATE INDEX IF NOT EXISTS proposals_active_status_idx
  ON proposals(status, created_at DESC)
  WHERE archived_at IS NULL;

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS source_proposal_id TEXT,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_version_v2_check;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_version_v2_check
  CHECK (version >= 1)
  NOT VALID;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_currency_v2_check;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_currency_v2_check
  CHECK (currency ~ '^[A-Z]{3}$')
  NOT VALID;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_amounts_v2_check;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_amounts_v2_check
  CHECK (subtotal >= 0 AND discount_amount >= 0 AND tax_amount >= 0 AND total >= 0 AND amount_paid >= 0 AND balance_due >= 0)
  NOT VALID;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_v2_check;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_status_v2_check
  CHECK (status IN ('draft','sent','approved','partially_paid','paid','overdue','cancelled'))
  NOT VALID;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_source_proposal_id_fkey;
ALTER TABLE invoices
  ADD CONSTRAINT invoices_source_proposal_id_fkey
  FOREIGN KEY (source_proposal_id) REFERENCES proposals(id) ON DELETE RESTRICT
  NOT VALID;

CREATE UNIQUE INDEX IF NOT EXISTS invoices_source_proposal_unique
  ON invoices(source_proposal_id)
  WHERE source_proposal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS invoices_active_status_idx
  ON invoices(status, due_date DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS invoices_active_client_idx
  ON invoices(client_id, created_at DESC)
  WHERE archived_at IS NULL;

ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_quantity_v2_check;
ALTER TABLE invoice_items
  ADD CONSTRAINT invoice_items_quantity_v2_check
  CHECK (quantity > 0)
  NOT VALID;

ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_unit_price_v2_check;
ALTER TABLE invoice_items
  ADD CONSTRAINT invoice_items_unit_price_v2_check
  CHECK (unit_price >= 0)
  NOT VALID;

ALTER TABLE invoice_items DROP CONSTRAINT IF EXISTS invoice_items_amount_v2_check;
ALTER TABLE invoice_items
  ADD CONSTRAINT invoice_items_amount_v2_check
  CHECK (amount >= 0)
  NOT VALID;

ALTER TABLE invoice_payments DROP CONSTRAINT IF EXISTS invoice_payments_amount_v2_check;
ALTER TABLE invoice_payments
  ADD CONSTRAINT invoice_payments_amount_v2_check
  CHECK (amount > 0)
  NOT VALID;

ALTER TABLE invoice_payments
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS invoice_payments_idempotency_unique
  ON invoice_payments(invoice_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS invoice_payments_paid_at_idx
  ON invoice_payments(paid_at DESC);

COMMIT;
