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

function mapExpense(row: Row): Record<string, any> {
  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
    ? row.metadata
    : {};

  return {
    ...metadata,
    id: row.id,
    type: row.type,
    category: row.category,
    description: row.description,
    amount: Number(row.amount || 0),
    currency: row.currency || 'IDR',
    date: dateValue(row.expense_date),
    expenseDate: dateValue(row.expense_date),
    recurringInterval: row.recurring_interval ?? metadata.recurringInterval ?? 'none',
    projectId: row.project_id ?? undefined,
    recordedByUserId: row.recorded_by_user_id ?? undefined,
    recordedBy: row.recorded_by || metadata.recordedBy || '',
    status: row.status || 'posted',
    version: Number(row.version || 1),
    archivedAt: row.archived_at ? iso(row.archived_at) : undefined,
    createdAt: iso(row.created_at)
  };
}

export class ExpenseNotFoundError extends Error {
  readonly code = 'EXPENSE_NOT_FOUND';
}

export class ExpenseImmutableError extends Error {
  readonly code = 'EXPENSE_IMMUTABLE';
}

export class ExpenseVersionConflictError extends Error {
  readonly code = 'EXPENSE_VERSION_CONFLICT';
}

export class ExpenseProjectNotFoundError extends Error {
  readonly code = 'EXPENSE_PROJECT_NOT_FOUND';
}

export class PostgresExpenseRepository {
  async list(): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM expenses WHERE archived_at IS NULL AND status <> $1 ORDER BY expense_date DESC, created_at DESC',
      ['voided']
    );
    return result.rows.map(mapExpense);
  }

  async findById(id: string): Promise<Record<string, any> | null> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM expenses WHERE id=$1 LIMIT 1',
      [id]
    );
    return result.rows[0] ? mapExpense(result.rows[0]) : null;
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    const userId = String(input.recordedByUserId || '');
    const amount = Number(input.amount);
    const currency = String(input.currency || 'IDR').toUpperCase();
    const expenseDate = String(input.date || input.expenseDate || '').slice(0, 10);
    const projectId = input.projectId ? String(input.projectId) : null;
    const idempotencyKey = input.idempotencyKey ? String(input.idempotencyKey).slice(0, 100) : null;

    if (!userId || !expenseDate || !/^[A-Z]{3}$/.test(currency) || !Number.isFinite(amount) || amount <= 0) {
      throw new Error('Valid user, date, currency, and positive expense amount are required.');
    }

    return withPostgresTransaction(async client => {
      if (idempotencyKey) {
        const existing = await client.query<Row>(
          'SELECT * FROM expenses WHERE recorded_by_user_id=$1 AND idempotency_key=$2 LIMIT 1',
          [userId, idempotencyKey]
        );
        if (existing.rows[0]) return mapExpense(existing.rows[0]);
      }

      if (projectId) {
        const project = await client.query<Row>(
          'SELECT id FROM projects WHERE id=$1 FOR SHARE',
          [projectId]
        );
        if (!project.rows[0]) throw new ExpenseProjectNotFoundError('Project not found.');
      }

      const metadata = {
        ...(input.metadata && typeof input.metadata === 'object' ? input.metadata : {}),
        recurringInterval: input.recurringInterval ?? 'none'
      };

      const result = await client.query<Row>(
        'INSERT INTO expenses ' +
        '(id,type,category,description,amount,currency,expense_date,recurring_interval,project_id,recorded_by_user_id,recorded_by,status,version,idempotency_key,metadata,created_at) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,1,$13,$14,NOW()) RETURNING *',
        [
          String(input.id),
          String(input.type || 'OpEx'),
          String(input.category || 'General'),
          String(input.description || ''),
          Math.round(amount * 100) / 100,
          currency,
          expenseDate,
          String(input.recurringInterval || 'none'),
          projectId,
          userId,
          String(input.recordedBy || ''),
          'posted',
          idempotencyKey,
          JSON.stringify(metadata)
        ]
      );
      return mapExpense(result.rows[0]);
    });
  }

  async void(id: string, expectedVersion?: number): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const current = await client.query<Row>(
        'SELECT * FROM expenses WHERE id=$1 FOR UPDATE',
        [id]
      );
      if (!current.rows[0]) throw new ExpenseNotFoundError('Expense not found.');

      const row = current.rows[0];
      if (row.status === 'voided' || row.archived_at) {
        throw new ExpenseImmutableError('Expense is already voided.');
      }
      if (expectedVersion != null && Number(row.version) !== Number(expectedVersion)) {
        throw new ExpenseVersionConflictError('Expense was modified by another user.');
      }

      const result = await client.query<Row>(
        'UPDATE expenses SET status=$2, archived_at=NOW(), version=version+1 WHERE id=$1 RETURNING *',
        [id, 'voided']
      );
      return mapExpense(result.rows[0]);
    });
  }
}

export const postgresExpenseRepository = new PostgresExpenseRepository();
