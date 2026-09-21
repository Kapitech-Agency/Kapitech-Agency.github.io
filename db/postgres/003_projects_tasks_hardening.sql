-- AMS PostgreSQL migration 003
-- Projects / Tasks hardening. Additive and backward-compatible with migration 001.

BEGIN;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'IDR',
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_v2_check;
ALTER TABLE projects
  ADD CONSTRAINT projects_status_v2_check
  CHECK (status IN ('planning','in_progress','review','completed','on_hold','archived'))
  NOT VALID;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_budget_v2_check;
ALTER TABLE projects
  ADD CONSTRAINT projects_budget_v2_check
  CHECK (budget >= 0)
  NOT VALID;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_dates_v2_check;
ALTER TABLE projects
  ADD CONSTRAINT projects_dates_v2_check
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
  NOT VALID;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_v2_check;
ALTER TABLE tasks
  ADD CONSTRAINT tasks_status_v2_check
  CHECK (status IN ('todo','in_progress','review','done'))
  NOT VALID;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_v2_check;
ALTER TABLE tasks
  ADD CONSTRAINT tasks_priority_v2_check
  CHECK (priority IS NULL OR priority IN ('low','medium','high','urgent'))
  NOT VALID;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_estimated_minutes_v2_check;
ALTER TABLE tasks
  ADD CONSTRAINT tasks_estimated_minutes_v2_check
  CHECK (estimated_minutes IS NULL OR estimated_minutes >= 0)
  NOT VALID;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
ALTER TABLE projects
  ADD CONSTRAINT projects_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE tasks
  ADD CONSTRAINT tasks_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_projects_active_updated_at
  ON projects(updated_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_projects_client_active
  ON projects(client_id, updated_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_project_active
  ON tasks(project_id, updated_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_active
  ON tasks(assignee_user_id, updated_at DESC)
  WHERE archived_at IS NULL;

COMMIT;
