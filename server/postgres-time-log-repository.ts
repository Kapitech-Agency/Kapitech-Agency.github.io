import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;

function iso(value: any): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString() : String(value);
}

function dateValue(value: any): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function mapTimeLog(row: Row): Record<string, any> {
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
    ? row.metadata
    : {};
  return {
    ...metadata,
    id: row.id,
    projectId: row.project_id ?? undefined,
    taskId: row.task_id ?? undefined,
    userId: row.user_id ?? undefined,
    user: metadata.user ?? '',
    durationMinutes: Math.round(Number(row.hours || 0) * 60),
    hours: Number(row.hours || 0),
    billable: metadata.billable !== undefined ? Boolean(metadata.billable) : true,
    date: dateValue(row.work_date || row.logged_at),
    workDate: dateValue(row.work_date || row.logged_at),
    rate: row.rate == null ? undefined : Number(row.rate),
    amount: row.amount == null ? undefined : Number(row.amount),
    currency: row.currency ?? undefined,
    status: row.status ?? 'draft',
    version: Number(row.version ?? 1),
    approvedAt: row.approved_at ? iso(row.approved_at) : undefined,
    archivedAt: row.archived_at ? iso(row.archived_at) : undefined,
    createdAt: iso(row.created_at),
    loggedAt: iso(row.logged_at)
  };
}

export class BillingRateNotConfiguredError extends Error {
  readonly code = 'BILLING_RATE_NOT_CONFIGURED';
}

export class TimeLogImmutableError extends Error {
  readonly code = 'TIMELOG_IMMUTABLE';
}

export class TimeLogVersionConflictError extends Error {
  readonly code = 'TIMELOG_VERSION_CONFLICT';
}

export class TimeLogNotFoundError extends Error {
  readonly code = 'TIMELOG_NOT_FOUND';
}

export class TimeLogProjectMismatchError extends Error {
  readonly code = 'TIMELOG_PROJECT_MISMATCH';
}

export class PostgresTimeLogRepository {
  async list(): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM time_logs WHERE archived_at IS NULL ORDER BY work_date DESC, created_at DESC'
    );
    return result.rows.map(mapTimeLog);
  }

  async findById(id: string): Promise<Record<string, any> | null> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM time_logs WHERE id=$1 LIMIT 1',
      [id]
    );
    return result.rows[0] ? mapTimeLog(result.rows[0]) : null;
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    const userId = String(input.userId || '');
    const projectId = String(input.projectId || '');
    const taskId = input.taskId ? String(input.taskId) : null;
    const workDate = String(input.workDate || input.date || '').slice(0, 10);
    const durationMinutes = Number(input.durationMinutes);
    const currency = String(input.currency || 'IDR').toUpperCase();

    if (!userId || !projectId || !workDate || !/^[A-Z]{3}$/.test(currency) || !Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > 1440) {
      throw new Error('Valid user, project, work date, currency, and duration are required.');
    }

    return withPostgresTransaction(async client => {
      const project = await client.query<Row>(
        'SELECT id, currency, archived_at FROM projects WHERE id=$1 FOR SHARE',
        [projectId]
      );
      if (!project.rows[0]) throw new TimeLogNotFoundError('Project not found.');
      if (project.rows[0].archived_at) throw new TimeLogNotFoundError('Project is archived.');

      const projectCurrency = String(project.rows[0].currency || 'IDR').toUpperCase();
      if (projectCurrency !== currency) {
        throw new TimeLogProjectMismatchError('Time log currency must match the project currency.');
      }

      if (taskId) {
        const task = await client.query<Row>(
          'SELECT id, project_id, archived_at FROM tasks WHERE id=$1 FOR SHARE',
          [taskId]
        );
        if (!task.rows[0] || String(task.rows[0].project_id) !== projectId) {
          throw new TimeLogProjectMismatchError('Task does not belong to the selected project.');
        }
        if (task.rows[0].archived_at) throw new TimeLogNotFoundError('Task is archived.');
      }

      const rate = await client.query<Row>(
        'SELECT * FROM billing_rates WHERE user_id=$1 AND currency=$2 ' +
        'AND effective_from <= $3 AND (effective_to IS NULL OR effective_to >= $3) ' +
        'ORDER BY effective_from DESC LIMIT 1',
        [userId, currency, workDate]
      );
      if (!rate.rows[0]) {
        throw new BillingRateNotConfiguredError('No billing rate is configured for this user and work date.');
      }

      const hourlyRate = Number(rate.rows[0].hourly_rate);
      const rateMinor = Math.round(hourlyRate * 100);
      const amountMinor = Math.round(durationMinutes * rateMinor / 60);
      const amount = amountMinor / 100;

      const metadata = {
        ...(input.metadata && typeof input.metadata === 'object' ? input.metadata : {}),
        projectName: input.projectName,
        taskTitle: input.taskTitle,
        user: input.user,
        billable: input.billable !== undefined ? Boolean(input.billable) : true,
        notes: input.notes
      };

      const idempotencyKey = input.idempotencyKey ? String(input.idempotencyKey).slice(0, 100) : null;
      if (idempotencyKey) {
        const existing = await client.query<Row>(
          'SELECT * FROM time_logs WHERE user_id=$1 AND idempotency_key=$2 LIMIT 1',
          [userId, idempotencyKey]
        );
        if (existing.rows[0]) return mapTimeLog(existing.rows[0]);
      }

      const loggedAt = input.loggedAt || (workDate + 'T12:00:00.000Z');
      const result = await client.query<Row>(
        'INSERT INTO time_logs ' +
        '(id,project_id,task_id,user_id,hours,description,logged_at,work_date,rate,amount,currency,status,version,idempotency_key,created_at) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,1,$13,NOW()) RETURNING *',
        [
          String(input.id),
          projectId,
          taskId,
          userId,
          durationMinutes / 60,
          input.notes ? String(input.notes).slice(0, 2000) : null,
          loggedAt,
          workDate,
          hourlyRate,
          amount,
          currency,
          'draft',
          idempotencyKey
        ]
      );
      return mapTimeLog(result.rows[0]);
    });
  }

  async submit(id: string, expectedVersion?: number): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const result = await client.query<Row>(
        'SELECT * FROM time_logs WHERE id=$1 FOR UPDATE',
        [id]
      );
      if (!result.rows[0]) throw new TimeLogNotFoundError('Time log not found.');
      const row = result.rows[0];

      if (row.status !== 'draft' && row.status !== 'rejected') {
        throw new TimeLogImmutableError('Only draft or rejected time logs can be submitted.');
      }
      if (expectedVersion != null && Number(row.version) !== Number(expectedVersion)) {
        throw new TimeLogVersionConflictError('Time log was modified by another user.');
      }

      const updated = await client.query<Row>(
        'UPDATE time_logs SET status=$2, version=version+1 WHERE id=$1 RETURNING *',
        [id, 'submitted']
      );
      return mapTimeLog(updated.rows[0]);
    });
  }

  async approve(id: string, expectedVersion?: number): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const result = await client.query<Row>(
        'SELECT * FROM time_logs WHERE id=$1 FOR UPDATE',
        [id]
      );
      if (!result.rows[0]) throw new TimeLogNotFoundError('Time log not found.');
      const row = result.rows[0];

      if (row.status !== 'submitted') {
        throw new TimeLogImmutableError('Only submitted time logs can be approved.');
      }
      if (expectedVersion != null && Number(row.version) !== Number(expectedVersion)) {
        throw new TimeLogVersionConflictError('Time log was modified by another user.');
      }

      const updated = await client.query<Row>(
        'UPDATE time_logs SET status=$2, approved_at=NOW(), version=version+1 WHERE id=$1 RETURNING *',
        [id, 'approved']
      );
      return mapTimeLog(updated.rows[0]);
    });
  }

  async void(id: string, expectedVersion?: number): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const result = await client.query<Row>(
        'SELECT * FROM time_logs WHERE id=$1 FOR UPDATE',
        [id]
      );
      if (!result.rows[0]) throw new TimeLogNotFoundError('Time log not found.');
      const row = result.rows[0];

      if (row.status === 'approved') {
        throw new TimeLogImmutableError('Approved time logs cannot be voided; use an adjustment entry.');
      }
      if (expectedVersion != null && Number(row.version) !== Number(expectedVersion)) {
        throw new TimeLogVersionConflictError('Time log was modified by another user.');
      }

      const updated = await client.query<Row>(
        'UPDATE time_logs SET status=$2, archived_at=NOW(), version=version+1 WHERE id=$1 RETURNING *',
        [id, 'voided']
      );
      return mapTimeLog(updated.rows[0]);
    });
  }
}

export const postgresTimeLogRepository = new PostgresTimeLogRepository();
