import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;

function dateOnly(value: any): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function mapRate(row: Row): Record<string, any> {
  return {
    id: row.id,
    userId: row.user_id,
    hourlyRate: Number(row.hourly_rate),
    currency: String(row.currency || 'IDR'),
    effectiveFrom: row.effective_from instanceof Date
      ? row.effective_from.toISOString().slice(0, 10)
      : String(row.effective_from || ''),
    effectiveTo: row.effective_to
      ? (row.effective_to instanceof Date ? row.effective_to.toISOString().slice(0, 10) : String(row.effective_to))
      : undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at || ''),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at || '')
  };
}

export class BillingRateOverlapError extends Error {
  readonly code = 'BILLING_RATE_OVERLAP';
}

export class BillingRateNotFoundError extends Error {
  readonly code = 'BILLING_RATE_NOT_CONFIGURED';
}

export class PostgresBillingRateRepository {
  async list(userId?: string, currency?: string): Promise<Record<string, any>[]> {
    const values: any[] = [];
    const where: string[] = [];

    if (userId) {
      values.push(userId);
      where.push('user_id = $' + values.length);
    }
    if (currency) {
      values.push(currency.toUpperCase());
      where.push('currency = $' + values.length);
    }

    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM billing_rates ' +
      (where.length ? 'WHERE ' + where.join(' AND ') + ' ' : '') +
      'ORDER BY user_id, currency, effective_from DESC',
      values
    );
    return result.rows.map(mapRate);
  }

  async findEffective(userId: string, currency: string, workDate: string): Promise<Record<string, any> | null> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM billing_rates ' +
      'WHERE user_id = $1 AND currency = $2 AND effective_from <= $3 ' +
      'AND (effective_to IS NULL OR effective_to >= $3) ' +
      'ORDER BY effective_from DESC LIMIT 1',
      [userId, currency.toUpperCase(), workDate]
    );
    return result.rows[0] ? mapRate(result.rows[0]) : null;
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    const userId = String(input.userId || '');
    const currency = String(input.currency || 'IDR').toUpperCase();
    const effectiveFrom = dateOnly(input.effectiveFrom);
    const hourlyRate = Number(input.hourlyRate);

    if (!userId || !effectiveFrom || !/^[A-Z]{3}$/.test(currency) || !Number.isFinite(hourlyRate) || hourlyRate < 0) {
      throw new Error('Valid userId, effectiveFrom, currency, and non-negative hourlyRate are required.');
    }

    return withPostgresTransaction(async client => {
      const existing = await client.query<Row>(
        'SELECT * FROM billing_rates WHERE user_id=$1 AND currency=$2 ORDER BY effective_from DESC FOR UPDATE',
        [userId, currency]
      );

      for (const row of existing.rows) {
        const from = dateOnly(row.effective_from);
        const to = row.effective_to ? dateOnly(row.effective_to) : null;

        if (from === effectiveFrom) {
          throw new BillingRateOverlapError('A billing rate already exists for this effective date.');
        }

        if (from > effectiveFrom) {
          throw new BillingRateOverlapError('A future billing rate exists; add new rates chronologically.');
        }

        if (from < effectiveFrom && to && to >= effectiveFrom) {
          throw new BillingRateOverlapError('A billing rate already covers this effective date.');
        }
      }

      const previous = existing.rows.find(row => {
        const from = dateOnly(row.effective_from);
        return from < effectiveFrom && !row.effective_to;
      });
      if (previous) {
        const dayBefore = new Date(effectiveFrom + 'T00:00:00Z');
        dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
        await client.query(
          'UPDATE billing_rates SET effective_to=$2, updated_at=NOW() WHERE id=$1',
          [previous.id, dayBefore.toISOString().slice(0, 10)]
        );
      }

      const result = await client.query<Row>(
        'INSERT INTO billing_rates (id,user_id,hourly_rate,currency,effective_from,created_at,updated_at) ' +
        'VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING *',
        [
          String(input.id),
          userId,
          hourlyRate,
          currency,
          effectiveFrom
        ]
      );
      return mapRate(result.rows[0]);
    });
  }
}

export const postgresBillingRateRepository = new PostgresBillingRateRepository();
