import crypto from 'node:crypto';
import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;

function iso(value: any): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString() : String(value);
}

function dateValue(value: any): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function obj(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function mapProposal(row: Row, items: Row[] = []): Record<string, any> {
  const metadata = obj(row.metadata);
  return {
    ...metadata,
    id: row.id,
    proposalNumber: row.proposal_number,
    title: row.title,
    clientId: row.client_id ?? undefined,
    dealId: row.deal_id ?? undefined,
    projectId: row.project_id ?? undefined,
    clientName: metadata.clientName ?? metadata.client_name ?? '',
    company: metadata.company ?? metadata.clientCompany ?? '',
    items: items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      amount: Number(item.amount)
    })),
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    taxPercent: Number(row.tax_percent || 0),
    tax: Number(row.tax || 0),
    total: Number(row.total || 0),
    currency: row.currency || 'IDR',
    validityPeriod: row.validity_period ?? '',
    paymentTerms: row.payment_terms ?? '',
    owner: row.owner ?? '',
    status: row.status,
    notes: row.notes ?? '',
    createdDate: dateValue(row.created_date),
    sentDate: dateValue(row.sent_date),
    approvedDate: dateValue(row.approved_date),
    version: Number(row.version || 1),
    archivedAt: row.archived_at ? iso(row.archived_at) : undefined,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

export class ProposalNotFoundError extends Error {
  readonly code = 'PROPOSAL_NOT_FOUND';
}

export class ProposalImmutableError extends Error {
  readonly code = 'PROPOSAL_IMMUTABLE';
}

export class ProposalVersionConflictError extends Error {
  readonly code = 'PROPOSAL_VERSION_CONFLICT';
}

export class ProposalStatusError extends Error {
  readonly code = 'PROPOSAL_INVALID_STATUS';
}

export class PostgresProposalRepository {
  private async itemsByProposalIds(ids: string[]): Promise<Map<string, Row[]>> {
    if (!ids.length) return new Map();
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM proposal_items WHERE proposal_id = ANY($1::text[]) ORDER BY proposal_id, id',
      [ids]
    );
    const map = new Map<string, Row[]>();
    for (const row of result.rows) {
      const items = map.get(String(row.proposal_id)) || [];
      items.push(row);
      map.set(String(row.proposal_id), items);
    }
    return map;
  }

  async list(): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM proposals WHERE archived_at IS NULL ORDER BY created_at DESC'
    );
    const itemMap = await this.itemsByProposalIds(result.rows.map(row => String(row.id)));
    return result.rows.map(row => mapProposal(row, itemMap.get(String(row.id)) || []));
  }

  async findById(id: string): Promise<Record<string, any> | null> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM proposals WHERE id=$1 LIMIT 1',
      [id]
    );
    if (!result.rows[0]) return null;
    const items = await getPostgresPool().query<Row>(
      'SELECT * FROM proposal_items WHERE proposal_id=$1 ORDER BY id',
      [id]
    );
    return mapProposal(result.rows[0], items.rows);
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    const items = Array.isArray(input.items) ? input.items.slice(0, 100) : [];
    if (!items.length) throw new ProposalImmutableError('Proposal requires at least one line item.');

    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      return sum + (Number.isFinite(quantity) && quantity > 0 && Number.isFinite(unitPrice) && unitPrice >= 0
        ? Math.round(quantity * unitPrice * 100) / 100
        : 0);
    }, 0);
    if (subtotal <= 0) throw new ProposalImmutableError('Proposal must contain a positive subtotal.');

    const discount = Math.min(subtotal, Math.max(0, Number(input.discount || 0)));
    const taxPercent = Math.min(100, Math.max(0, Number(input.taxPercent ?? 11)));
    const tax = Math.round(Math.max(0, subtotal - discount) * (taxPercent / 100) * 100) / 100;
    const total = Math.round((subtotal - discount + tax) * 100) / 100;
    const currency = String(input.currency || 'IDR').toUpperCase();

    return withPostgresTransaction(async client => {
      const createdAt = input.createdAt || new Date().toISOString();
      const updatedAt = input.updatedAt || createdAt;
      const status = ['Draft','Internal Review','Sent','Approved','Rejected','Accepted'].includes(String(input.status))
        ? String(input.status)
        : 'Draft';

      const metadata = {
        clientName: input.clientName,
        company: input.company,
        itemsSource: 'proposal_items'
      };

      const proposal = await client.query<Row>(
        'INSERT INTO proposals ' +
        '(id,proposal_number,title,client_id,deal_id,project_id,subtotal,discount,tax_percent,tax,total,currency,validity_period,payment_terms,owner,status,notes,created_date,sent_date,approved_date,metadata,version,created_at,updated_at) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,1,$22,$23) RETURNING *',
        [
          String(input.id),
          String(input.proposalNumber),
          String(input.title || 'Digital Engineering Proposal'),
          input.clientId ? String(input.clientId) : null,
          input.dealId ? String(input.dealId) : null,
          input.projectId ? String(input.projectId) : null,
          subtotal,
          discount,
          taxPercent,
          tax,
          total,
          currency.slice(0, 3),
          input.validityPeriod ? String(input.validityPeriod) : '30 Days',
          input.paymentTerms ? String(input.paymentTerms) : '50% Upfront, 50% on Delivery',
          input.owner ? String(input.owner) : null,
          status,
          input.notes ? String(input.notes) : null,
          input.createdDate || new Date().toISOString().slice(0, 10),
          input.sentDate || null,
          input.approvedDate || null,
          JSON.stringify(metadata),
          createdAt,
          updatedAt
        ]
      );

      for (const item of items) {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        if (!item.description || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) continue;
        await client.query(
          'INSERT INTO proposal_items (id,proposal_id,description,quantity,unit_price) VALUES ($1,$2,$3,$4,$5)',
          [
            String(item.id || 'line_' + crypto.randomUUID()),
            String(input.id),
            String(item.description).trim().slice(0, 500),
            quantity,
            unitPrice
          ]
        );
      }

      const insertedItems = await client.query<Row>(
        'SELECT * FROM proposal_items WHERE proposal_id=$1 ORDER BY id',
        [String(input.id)]
      );
      return mapProposal(proposal.rows[0], insertedItems.rows);
    });
  }

  async update(id: string, patch: Record<string, any>): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const current = await client.query<Row>('SELECT * FROM proposals WHERE id=$1 FOR UPDATE', [id]);
      if (!current.rows[0]) throw new ProposalNotFoundError('Proposal not found.');
      const row = current.rows[0];
      if (row.archived_at) throw new ProposalImmutableError('Archived proposal cannot be updated.');

      const expectedVersion = patch.version == null ? undefined : Number(patch.version);
      if (expectedVersion != null && Number(row.version) !== expectedVersion) {
        throw new ProposalVersionConflictError('Proposal was modified by another user.');
      }

      if (['Accepted','Rejected'].includes(String(row.status)) && patch.status === undefined && patch.items === undefined) {
        throw new ProposalImmutableError('Accepted or rejected proposals are immutable except through their lifecycle actions.');
      }

      let items = patch.items;
      if (items !== undefined) {
        items = Array.isArray(items) ? items.slice(0, 100) : [];
        if (!items.length) throw new ProposalImmutableError('Proposal requires at least one line item.');

        await client.query('DELETE FROM proposal_items WHERE proposal_id=$1', [id]);
        for (const item of items) {
          const quantity = Number(item.quantity);
          const unitPrice = Number(item.unitPrice);
          if (!item.description || quantity <= 0 || !Number.isFinite(quantity) || !Number.isFinite(unitPrice) || unitPrice < 0) continue;
          await client.query(
            'INSERT INTO proposal_items (id,proposal_id,description,quantity,unit_price) VALUES ($1,$2,$3,$4,$5)',
            [
              String(item.id || 'line_' + crypto.randomUUID()),
              id,
              String(item.description).trim().slice(0, 500),
              quantity,
              unitPrice
            ]
          );
        }

        const validItems = await client.query<{ subtotal: string }>(
          'SELECT COALESCE(SUM(amount),0)::text AS subtotal FROM proposal_items WHERE proposal_id=$1',
          [id]
        );
        const subtotal = Number(validItems.rows[0]?.subtotal || 0);
        if (subtotal <= 0) throw new ProposalImmutableError('Proposal must contain a positive subtotal.');

        const discount = Math.min(subtotal, Math.max(0, Number(patch.discount ?? row.discount ?? 0)));
        const taxPercent = Math.min(100, Math.max(0, Number(patch.taxPercent ?? row.tax_percent ?? 0)));
        const tax = Math.round(Math.max(0, subtotal - discount) * (taxPercent / 100) * 100) / 100;
        const total = Math.round((subtotal - discount + tax) * 100) / 100;

        patch.__subtotal = subtotal;
        patch.__discount = discount;
        patch.__taxPercent = taxPercent;
        patch.__tax = tax;
        patch.__total = total;
      }

      const result = await client.query<Row>(
        'UPDATE proposals SET ' +
        'proposal_number=COALESCE($2,proposal_number), title=COALESCE($3,title), client_id=COALESCE($4,client_id), ' +
        'deal_id=COALESCE($5,deal_id), project_id=COALESCE($6,project_id), subtotal=COALESCE($7,subtotal), ' +
        'discount=COALESCE($8,discount), tax_percent=COALESCE($9,tax_percent), tax=COALESCE($10,tax), ' +
        'total=COALESCE($11,total), currency=COALESCE($12,currency), validity_period=COALESCE($13,validity_period), ' +
        'payment_terms=COALESCE($14,payment_terms), notes=COALESCE($15,notes), status=COALESCE($16,status), ' +
        'sent_date=COALESCE($17,sent_date), version=version+1, updated_at=NOW() ' +
        'WHERE id=$1 AND archived_at IS NULL RETURNING *',
        [
          id,
          patch.proposalNumber != null ? String(patch.proposalNumber) : null,
          patch.title != null ? String(patch.title) : null,
          patch.clientId != null ? String(patch.clientId) : null,
          patch.dealId != null ? String(patch.dealId) : null,
          patch.projectId != null ? String(patch.projectId) : null,
          patch.__subtotal ?? null,
          patch.__discount ?? null,
          patch.__taxPercent ?? null,
          patch.__tax ?? null,
          patch.__total ?? null,
          patch.currency != null ? String(patch.currency).toUpperCase().slice(0, 3) : null,
          patch.validityPeriod != null ? String(patch.validityPeriod) : null,
          patch.paymentTerms != null ? String(patch.paymentTerms) : null,
          patch.notes != null ? String(patch.notes) : null,
          patch.status != null ? String(patch.status) : null,
          patch.sentDate ?? null
        ]
      );

      if (!result.rows[0]) throw new ProposalNotFoundError('Proposal not found.');
      const insertedItems = await client.query<Row>('SELECT * FROM proposal_items WHERE proposal_id=$1 ORDER BY id', [id]);
      return mapProposal(result.rows[0], insertedItems.rows);
    });
  }

  async approve(id: string, expectedVersion?: number): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const current = await client.query<Row>('SELECT * FROM proposals WHERE id=$1 FOR UPDATE', [id]);
      if (!current.rows[0]) throw new ProposalNotFoundError('Proposal not found.');
      if (current.rows[0].archived_at) throw new ProposalImmutableError('Archived proposal cannot be approved.');
      if (!['Draft','Internal Review','Sent'].includes(String(current.rows[0].status))) {
        throw new ProposalStatusError('Only draft, internal review, or sent proposals can be approved.');
      }
      if (expectedVersion != null && Number(current.rows[0].version) !== Number(expectedVersion)) {
        throw new ProposalVersionConflictError('Proposal was modified by another user.');
      }

      const updated = await client.query<Row>(
        'UPDATE proposals SET status=$2, approved_date=CURRENT_DATE, version=version+1, updated_at=NOW() WHERE id=$1 RETURNING *',
        [id, 'Approved']
      );
      const items = await client.query<Row>('SELECT * FROM proposal_items WHERE proposal_id=$1 ORDER BY id', [id]);
      return mapProposal(updated.rows[0], items.rows);
    });
  }

  async archive(id: string): Promise<boolean> {
    return withPostgresTransaction(async client => {
      const result = await client.query(
        'UPDATE proposals SET archived_at=NOW(), version=version+1, updated_at=NOW() WHERE id=$1 AND archived_at IS NULL',
        [id]
      );
      return result.rowCount === 1;
    });
  }
}

export const postgresProposalRepository = new PostgresProposalRepository();
