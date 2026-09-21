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

function mapInvoice(row: Row, items: Row[] = [], payments: Row[] = []): Record<string, any> {
  const metadata = obj(row.metadata);
  return {
    ...metadata,
    id: row.id,
    invoiceNumber: row.invoice_number,
    type: row.type,
    clientId: row.client_id ?? undefined,
    projectId: row.project_id ?? undefined,
    sourceProposalId: row.source_proposal_id ?? undefined,
    clientName: metadata.clientName ?? '',
    clientCompany: metadata.clientCompany ?? '',
    clientEmail: metadata.clientEmail ?? '',
    clientPhone: metadata.clientPhone ?? '',
    items: items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      amount: Number(item.amount)
    })),
    subtotal: Number(row.subtotal || 0),
    discountPercent: Number(row.discount_percent || 0),
    discountAmount: Number(row.discount_amount || 0),
    taxPercent: Number(row.tax_percent || 0),
    taxAmount: Number(row.tax_amount || 0),
    total: Number(row.total || 0),
    amountPaid: Number(row.amount_paid || 0),
    balanceDue: Number(row.balance_due || 0),
    currency: row.currency || 'IDR',
    status: row.status,
    issueDate: dateValue(row.issue_date),
    dueDate: dateValue(row.due_date),
    paidDate: dateValue(row.paid_date),
    notes: row.notes ?? '',
    paymentTerms: row.payment_terms ?? '',
    version: Number(row.version || 1),
    archivedAt: row.archived_at ? iso(row.archived_at) : undefined,
    cancelledAt: row.cancelled_at ? iso(row.cancelled_at) : undefined,
    payments: payments.map(payment => ({
      id: payment.id,
      amount: Number(payment.amount),
      date: dateValue(payment.paid_at),
      paidAt: dateValue(payment.paid_at),
      method: payment.method ?? undefined,
      reference: payment.reference ?? undefined,
      recordedByUserId: payment.metadata?.recordedByUserId ?? undefined,
      notes: payment.metadata?.notes ?? undefined
    })),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

export class InvoiceNotFoundError extends Error { readonly code = 'INVOICE_NOT_FOUND'; }
export class InvoiceImmutableError extends Error { readonly code = 'INVOICE_IMMUTABLE'; }
export class InvoiceVersionConflictError extends Error { readonly code = 'INVOICE_VERSION_CONFLICT'; }
export class InvoicePaymentError extends Error { readonly code = 'INVOICE_PAYMENT_INVALID'; }
export class InvoiceProposalConflictError extends Error { readonly code = 'INVOICE_PROPOSAL_CONFLICT'; }

async function loadInvoiceById(clientOrPool: any, id: string): Promise<{ row: Row; items: Row[]; payments: Row[] } | null> {
  const invoice = await clientOrPool.query('SELECT * FROM invoices WHERE id=$1 LIMIT 1', [id]);
  const invoiceRows = invoice.rows as Row[];
  if (!invoiceRows[0]) return null;

  const items = await clientOrPool.query('SELECT * FROM invoice_items WHERE invoice_id=$1 ORDER BY id', [id]);
  const itemRows = items.rows as Row[];

  const payments = await clientOrPool.query('SELECT * FROM invoice_payments WHERE invoice_id=$1 ORDER BY paid_at, id', [id]);
  const paymentRows = payments.rows as Row[];

  return { row: invoiceRows[0], items: itemRows, payments: paymentRows };
}

export class PostgresInvoiceRepository {
  async list(): Promise<Record<string, any>[]> {
    const invoices = await getPostgresPool().query<Row>(
      'SELECT * FROM invoices WHERE archived_at IS NULL ORDER BY created_at DESC'
    );
    const result: Record<string, any>[] = [];
    for (const row of invoices.rows) {
      const loaded = await loadInvoiceById(getPostgresPool(), String(row.id));
      if (loaded) result.push(mapInvoice(loaded.row, loaded.items, loaded.payments));
    }
    return result;
  }

  async findById(id: string): Promise<Record<string, any> | null> {
    const loaded = await loadInvoiceById(getPostgresPool(), id);
    return loaded ? mapInvoice(loaded.row, loaded.items, loaded.payments) : null;
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    const items = Array.isArray(input.items) ? input.items.slice(0, 100) : [];
    const validItems = items.filter(item => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      return String(item.description || '').trim() && Number.isFinite(quantity) && quantity > 0 &&
        Number.isFinite(unitPrice) && unitPrice >= 0;
    });
    if (!validItems.length) throw new InvoiceImmutableError('At least one valid invoice line item is required.');

    const subtotal = Math.round(validItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0) * 100) / 100;
    const discountPercent = Math.min(100, Math.max(0, Number(input.discountPercent || 0)));
    const discountAmount = Math.round(subtotal * discountPercent) / 100;
    const taxPercent = Math.min(100, Math.max(0, Number(input.taxPercent ?? 11)));
    const taxAmount = Math.round((subtotal - discountAmount) * taxPercent) / 100;
    const total = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;
    const currency = String(input.currency || 'IDR').toUpperCase().slice(0, 3);

    return withPostgresTransaction(async client => {
      const invoiceNumber = String(input.invoiceNumber || 'INV-KAPI-' + new Date().getFullYear() + '-' + crypto.randomInt(1000, 1000000));
      const metadata = {
        clientName: input.clientName,
        clientCompany: input.clientCompany,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        leadId: input.leadId
      };
      const inserted = await client.query<Row>(
        'INSERT INTO invoices ' +
        '(id,invoice_number,client_id,project_id,type,subtotal,discount_percent,discount_amount,tax_percent,tax_amount,total,amount_paid,balance_due,currency,status,issue_date,due_date,notes,payment_terms,metadata,version,created_at,updated_at) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,0,$12,$13,$14,$15,$16,$17,$18,$19,1,NOW(),NOW()) RETURNING *',
        [
          String(input.id),
          invoiceNumber,
          input.clientId ? String(input.clientId) : null,
          input.projectId ? String(input.projectId) : null,
          input.type === 'quotation' ? 'quotation' : 'invoice',
          subtotal,
          discountPercent,
          discountAmount,
          taxPercent,
          taxAmount,
          total,
          total,
          currency,
          ['draft','sent','approved'].includes(String(input.status)) ? String(input.status) : 'draft',
          input.issueDate || new Date().toISOString().slice(0, 10),
          input.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          input.notes ? String(input.notes) : null,
          input.paymentTerms ? String(input.paymentTerms) : null,
          JSON.stringify(metadata)
        ]
      );

      for (const item of validItems) {
        await client.query(
          'INSERT INTO invoice_items (id,invoice_id,description,quantity,unit_price,amount) VALUES ($1,$2,$3,$4,$5,ROUND($4*$5,2))',
          [
            String(item.id || 'line_' + crypto.randomUUID()),
            String(input.id),
            String(item.description).trim().slice(0, 500),
            Number(item.quantity),
            Number(item.unitPrice)
          ]
        );
      }

      const loaded = await loadInvoiceById(client, String(input.id));
      if (!loaded) throw new InvoiceNotFoundError('Invoice could not be loaded after creation.');
      return mapInvoice(loaded.row, loaded.items, loaded.payments);
    });
  }

  async update(id: string, input: Record<string, any>): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const loaded = await loadInvoiceById(client, id);
      if (!loaded) throw new InvoiceNotFoundError('Invoice not found.');
      const row = loaded.row;

      if (row.archived_at || row.status === 'cancelled') throw new InvoiceImmutableError('Cancelled or archived invoices cannot be updated.');
      if (Number(row.amount_paid || 0) > 0) throw new InvoiceImmutableError('Invoices with payments cannot have financial lines or totals changed.');

      const expectedVersion = input.version == null ? undefined : Number(input.version);
      if (expectedVersion != null && Number(row.version) !== expectedVersion) {
        throw new InvoiceVersionConflictError('Invoice was modified by another user.');
      }

      if (input.items !== undefined) {
        const items = Array.isArray(input.items) ? input.items.filter((item: any) =>
          String(item.description || '').trim() &&
          Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0 &&
          Number.isFinite(Number(item.unitPrice)) && Number(item.unitPrice) >= 0
        ).slice(0, 100) : [];
        if (!items.length) throw new InvoiceImmutableError('At least one valid invoice line item is required.');
        await client.query('DELETE FROM invoice_items WHERE invoice_id=$1', [id]);
        for (const item of items) {
          await client.query(
            'INSERT INTO invoice_items (id,invoice_id,description,quantity,unit_price,amount) VALUES ($1,$2,$3,$4,$5,ROUND($4*$5,2))',
            [String(item.id || 'line_' + crypto.randomUUID()), id, String(item.description).trim().slice(0, 500), Number(item.quantity), Number(item.unitPrice)]
          );
        }
      }

      const totals = await client.query<Row>(
        'SELECT COALESCE(SUM(amount),0)::numeric AS subtotal FROM invoice_items WHERE invoice_id=$1',
        [id]
      );
      const subtotal = Number(totals.rows[0]?.subtotal || 0);
      const discountPercent = input.discountPercent !== undefined ? Math.min(100, Math.max(0, Number(input.discountPercent) || 0)) : Number(row.discount_percent || 0);
      const taxPercent = input.taxPercent !== undefined ? Math.min(100, Math.max(0, Number(input.taxPercent) || 0)) : Number(row.tax_percent || 0);
      const discountAmount = Math.round(subtotal * discountPercent) / 100;
      const taxAmount = Math.round(Math.max(0, subtotal - discountAmount) * taxPercent) / 100;
      const total = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;

      const updated = await client.query<Row>(
        'UPDATE invoices SET ' +
        'client_id=COALESCE($2,client_id), project_id=COALESCE($3,project_id), notes=COALESCE($4,notes), payment_terms=COALESCE($5,payment_terms), ' +
        'discount_percent=$6,discount_amount=$7,tax_percent=$8,tax_amount=$9,subtotal=$10,total=$11,balance_due=$11, ' +
        'currency=COALESCE($12,currency),status=COALESCE($13,status),due_date=COALESCE($14,due_date),version=version+1,updated_at=NOW() ' +
        'WHERE id=$1 AND archived_at IS NULL RETURNING *',
        [
          id,
          input.clientId != null ? String(input.clientId) : null,
          input.projectId != null ? String(input.projectId) : null,
          input.notes != null ? String(input.notes).slice(0, 5000) : null,
          input.paymentTerms != null ? String(input.paymentTerms).slice(0, 500) : null,
          discountPercent,
          discountAmount,
          taxPercent,
          taxAmount,
          subtotal,
          total,
          input.currency != null ? String(input.currency).toUpperCase().slice(0, 3) : null,
          input.status != null ? String(input.status) : null,
          input.dueDate || null
        ]
      );

      if (!updated.rows[0]) throw new InvoiceNotFoundError('Invoice not found.');
      const loadedAfter = await loadInvoiceById(client, id);
      if (!loadedAfter) throw new InvoiceNotFoundError('Invoice not found.');
      return mapInvoice(loadedAfter.row, loadedAfter.items, loadedAfter.payments);
    });
  }

  async pay(id: string, input: Record<string, any>): Promise<{ invoice: Record<string, any>; payment: Record<string, any> }> {
    return withPostgresTransaction(async client => {
      const loaded = await loadInvoiceById(client, id);
      if (!loaded) throw new InvoiceNotFoundError('Invoice not found.');
      const row = loaded.row;
      if (row.status === 'cancelled' || row.archived_at) throw new InvoicePaymentError('Cancelled or archived invoices cannot receive payments.');

      const expectedVersion = input.version == null ? undefined : Number(input.version);
      if (expectedVersion != null && Number(row.version) !== expectedVersion) {
        throw new InvoiceVersionConflictError('Invoice was modified by another user.');
      }

      const idempotencyKey = input.idempotencyKey ? String(input.idempotencyKey).slice(0, 100) : null;
      if (idempotencyKey) {
        const prior = await client.query<Row>(
          'SELECT * FROM invoice_payments WHERE invoice_id=$1 AND idempotency_key=$2 LIMIT 1',
          [id, idempotencyKey]
        );
        if (prior.rows[0]) {
          const current = await loadInvoiceById(client, id);
          if (!current) throw new InvoiceNotFoundError('Invoice not found.');
          return {
            invoice: mapInvoice(current.row, current.items, current.payments),
            payment: {
              id: prior.rows[0].id,
              amount: Number(prior.rows[0].amount),
              date: dateValue(prior.rows[0].paid_at),
              method: prior.rows[0].method,
              reference: prior.rows[0].reference
            }
          };
        }
      }

      const amount = Number(input.amount);
      if (!Number.isFinite(amount) || amount <= 0) throw new InvoicePaymentError('Payment amount must be positive.');
      const balance = Number(row.balance_due || 0);
      if (amount > balance) throw new InvoicePaymentError('Payment exceeds the current invoice balance.');

      const paymentId = String(input.paymentId || 'pay_' + crypto.randomUUID());
      const payment = await client.query<Row>(
        'INSERT INTO invoice_payments (id,invoice_id,amount,paid_at,method,reference,idempotency_key,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [
          paymentId,
          id,
          Math.round(amount * 100) / 100,
          input.date || new Date().toISOString().slice(0, 10),
          ['bank_transfer','credit_card','cash','other'].includes(String(input.method)) ? String(input.method) : 'bank_transfer',
          input.reference ? String(input.reference).slice(0, 160) : null,
          idempotencyKey,
          JSON.stringify({ recordedByUserId: input.recordedByUserId, notes: input.notes })
        ]
      );

      const totals = await client.query<Row>(
        'SELECT COALESCE(SUM(amount),0)::numeric AS total_paid FROM invoice_payments WHERE invoice_id=$1',
        [id]
      );
      const amountPaid = Number(totals.rows[0]?.total_paid || 0);
      const balanceDue = Math.max(0, Number(row.total || 0) - amountPaid);
      const status = balanceDue <= 0 ? 'paid' : 'partially_paid';
      const updated = await client.query<Row>(
        'UPDATE invoices SET amount_paid=$2,balance_due=$3,status=$4,paid_date=CASE WHEN $3::numeric=0 THEN CURRENT_DATE ELSE paid_date END,version=version+1,updated_at=NOW() WHERE id=$1 RETURNING *',
        [id, amountPaid, balanceDue, status]
      );

      const loadedAfter = await loadInvoiceById(client, id);
      if (!loadedAfter) throw new InvoiceNotFoundError('Invoice not found.');
      return {
        invoice: mapInvoice(loadedAfter.row, loadedAfter.items, loadedAfter.payments),
        payment: mapInvoice(updated.rows[0], [], [payment.rows[0]]).payments[0]
      };
    });
  }

  async cancel(id: string, expectedVersion?: number): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const loaded = await loadInvoiceById(client, id);
      if (!loaded) throw new InvoiceNotFoundError('Invoice not found.');
      if (loaded.row.status === 'paid') throw new InvoiceImmutableError('Paid invoices cannot be cancelled.');
      if (loaded.row.status === 'cancelled') throw new InvoiceImmutableError('Invoice is already cancelled.');
      if (expectedVersion != null && Number(loaded.row.version) !== expectedVersion) {
        throw new InvoiceVersionConflictError('Invoice was modified by another user.');
      }

      const updated = await client.query<Row>(
        'UPDATE invoices SET status=$2,cancelled_at=NOW(),version=version+1,updated_at=NOW() WHERE id=$1 AND archived_at IS NULL RETURNING *',
        [id, 'cancelled']
      );
      const loadedAfter = await loadInvoiceById(client, id);
      if (!loadedAfter) throw new InvoiceNotFoundError('Invoice not found.');
      return mapInvoice(loadedAfter.row, loadedAfter.items, loadedAfter.payments);
    });
  }

  async convertProposal(proposalId: string, actorUserId?: string): Promise<{ invoice: Record<string, any>; proposal: Record<string, any> }> {
    return withPostgresTransaction(async client => {
      const proposal = await client.query<Row>(
        'SELECT * FROM proposals WHERE id=$1 FOR UPDATE',
        [proposalId]
      );
      if (!proposal.rows[0]) throw new InvoiceProposalConflictError('Proposal not found.');
      const proposalRow = proposal.rows[0];

      const existingInvoice = await client.query<Row>(
        'SELECT * FROM invoices WHERE source_proposal_id=$1 AND archived_at IS NULL LIMIT 1',
        [proposalId]
      );
      if (existingInvoice.rows[0]) {
        const proposalItems = await client.query<Row>('SELECT * FROM proposal_items WHERE proposal_id=$1 ORDER BY id', [proposalId]);
        const invoiceItems = await client.query<Row>('SELECT * FROM invoice_items WHERE invoice_id=$1 ORDER BY id', [existingInvoice.rows[0].id]);
        const payments = await client.query<Row>('SELECT * FROM invoice_payments WHERE invoice_id=$1 ORDER BY paid_at,id', [existingInvoice.rows[0].id]);
        return {
          invoice: mapInvoice(existingInvoice.rows[0], invoiceItems.rows, payments.rows),
          proposal: {
            ...obj(proposalRow.metadata),
            id: proposalRow.id,
            proposalNumber: proposalRow.proposal_number,
            status: proposalRow.status,
            version: Number(proposalRow.version || 1),
            items: proposalItems.rows
          }
        };
      }

      if (!['Approved','Accepted'].includes(String(proposalRow.status))) {
        throw new InvoiceProposalConflictError('Only approved or accepted proposals can be converted to an invoice.');
      }

      const proposalItems = await client.query<Row>(
        'SELECT * FROM proposal_items WHERE proposal_id=$1 ORDER BY id',
        [proposalId]
      );
      if (!proposalItems.rows.length) throw new InvoiceProposalConflictError('Proposal has no line items.');

      const proposalSubtotal = Number(proposalRow.subtotal || 0);
      const proposalDiscount = Number(proposalRow.discount || 0);
      const proposalDiscountPercent = proposalSubtotal > 0
        ? Math.min(100, Math.max(0, (proposalDiscount / proposalSubtotal) * 100))
        : 0;
      const proposalTaxPercent = Math.min(100, Math.max(0, Number(proposalRow.tax_percent || 0)));

      const year = new Date().getFullYear();
      const invoiceNumber = 'INV-KAPI-' + year + '-' + crypto.randomInt(1000, 1000000);
      const metadata = {
        clientName: obj(proposalRow.metadata).clientName,
        clientCompany: obj(proposalRow.metadata).company,
        sourceProposalNumber: proposalRow.proposal_number,
        convertedByUserId: actorUserId
      };

      const invoiceId = 'inv_' + crypto.randomUUID();
      const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const inserted = await client.query<Row>(
        'INSERT INTO invoices ' +
        '(id,invoice_number,client_id,project_id,type,subtotal,discount_percent,discount_amount,tax_percent,tax_amount,total,amount_paid,balance_due,currency,status,issue_date,due_date,notes,payment_terms,source_proposal_id,version,metadata,created_at,updated_at) ' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,0,$11,$12,$13,$14,$15,$16,$17,$18,1,$19,NOW(),NOW()) RETURNING *',
        [
          invoiceId,
          invoiceNumber,
          proposalRow.client_id ?? null,
          proposalRow.project_id ?? null,
          'invoice',
          proposalSubtotal,
          proposalDiscountPercent,
          proposalDiscount,
          proposalTaxPercent,
          Number(proposalRow.tax || 0),
          Number(proposalRow.total || 0),
          proposalRow.currency || 'IDR',
          'draft',
          new Date().toISOString().slice(0, 10),
          dueDate,
          proposalRow.notes || null,
          proposalRow.payment_terms || null,
          proposalId,
          JSON.stringify(metadata)
        ]
      );

      for (const item of proposalItems.rows) {
        await client.query(
          'INSERT INTO invoice_items (id,invoice_id,description,quantity,unit_price,amount) VALUES ($1,$2,$3,$4,$5,$6)',
          [String(item.id) + '_inv', invoiceId, item.description, Number(item.quantity), Number(item.unit_price), Number(item.amount)]
        );
      }

      const updatedProposal = await client.query<Row>(
        'UPDATE proposals SET status=$2,version=version+1,updated_at=NOW() WHERE id=$1 RETURNING *',
        [proposalId, 'Accepted']
      );

      const payments = await client.query<Row>('SELECT * FROM invoice_payments WHERE invoice_id=$1 ORDER BY paid_at,id', [invoiceId]);
      const invoiceItems = await client.query<Row>('SELECT * FROM invoice_items WHERE invoice_id=$1 ORDER BY id', [invoiceId]);
      return {
        invoice: mapInvoice(inserted.rows[0], invoiceItems.rows, payments.rows),
        proposal: {
          ...obj(updatedProposal.rows[0].metadata),
          id: updatedProposal.rows[0].id,
          proposalNumber: updatedProposal.rows[0].proposal_number,
          status: updatedProposal.rows[0].status,
          version: Number(updatedProposal.rows[0].version || 1),
          items: proposalItems.rows
        }
      };
    });
  }
}

export const postgresInvoiceRepository = new PostgresInvoiceRepository();
