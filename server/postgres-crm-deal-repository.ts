import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;
const iso = (v: Date | string): string => v instanceof Date ? v.toISOString() : new Date(v).toISOString();
const date = (v: unknown): string => v == null ? '' : v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10);
const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' ? v as Record<string, unknown> : {};

function mapDeal(row: Row): any {
  const metadata = obj(row.metadata);
  return {
    ...(metadata as Record<string, unknown>),
    id: row.id,
    title: row.title ?? metadata.title ?? '',
    clientId: row.client_id ?? undefined,
    clientName: row.client_name ?? metadata.clientName ?? '',
    company: row.company ?? metadata.company ?? '',
    email: row.email ?? metadata.email ?? '',
    phone: row.phone ?? metadata.phone ?? '',
    servicePillar: row.service_pillar ?? metadata.servicePillar ?? '',
    value: Number(row.value ?? metadata.value ?? 0),
    stage: row.stage ?? metadata.stage ?? 'new',
    priority: row.priority ?? metadata.priority ?? 'medium',
    probability: Number(row.probability ?? metadata.probability ?? 0),
    owner: row.owner ?? metadata.owner ?? '',
    expectedCloseDate: row.expected_close_date ? date(row.expected_close_date) : (typeof metadata.expectedCloseDate === 'string' ? metadata.expectedCloseDate : ''),
    notes: metadata.notes ?? '',
    source: metadata.source ?? '',
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

function toMetadata(deal: any): Record<string, unknown> {
  const {
    id, title, clientId, clientName, company, email, phone, servicePillar,
    value, stage, priority, probability, owner, expectedCloseDate,
    createdAt, updatedAt, ...metadata
  } = deal;
  return metadata;
}

export class PostgresCrmDealRepository {
  async list(): Promise<any[]> {
    const result = await getPostgresPool().query('SELECT * FROM crm_deals ORDER BY created_at DESC');
    return result.rows.map(mapDeal);
  }

  async findById(id: string): Promise<any | null> {
    const result = await getPostgresPool().query('SELECT * FROM crm_deals WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ? mapDeal(result.rows[0]) : null;
  }

  async create(deal: any): Promise<any> {
    const result = await getPostgresPool().query(
      `INSERT INTO crm_deals
       (id,title,client_id,client_name,company,email,phone,service_pillar,value,stage,priority,probability,owner,expected_close_date,metadata,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        deal.id,
        deal.title || 'Untitled Deal',
        deal.clientId || null,
        deal.clientName || null,
        deal.company || null,
        deal.email || null,
        deal.phone || null,
        deal.servicePillar || null,
        Number(deal.value || 0),
        deal.stage || 'new',
        deal.priority || 'medium',
        Number(deal.probability || 0),
        deal.owner || null,
        deal.expectedCloseDate || null,
        JSON.stringify(toMetadata(deal)),
        deal.createdAt,
        deal.updatedAt
      ]
    );
    return mapDeal(result.rows[0]);
  }

  async update(id: string, patch: Record<string, unknown>): Promise<any | null> {
    return withPostgresTransaction(async client => {
      const current = await client.query('SELECT * FROM crm_deals WHERE id = $1 FOR UPDATE', [id]);
      if (!current.rows[0]) return null;
      const existing = mapDeal(current.rows[0]);
      const next = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
      const result = await client.query(
        `UPDATE crm_deals SET title=$2,client_id=$3,client_name=$4,company=$5,email=$6,phone=$7,service_pillar=$8,value=$9,stage=$10,priority=$11,probability=$12,owner=$13,expected_close_date=$14,metadata=$15,updated_at=$16
         WHERE id=$1 RETURNING *`,
        [id, next.title || 'Untitled Deal', next.clientId || null, next.clientName || null,
         next.company || null, next.email || null, next.phone || null, next.servicePillar || null,
         Number(next.value || 0), next.stage || 'new', next.priority || 'medium', Number(next.probability || 0),
         next.owner || null, next.expectedCloseDate || null, JSON.stringify(toMetadata(next)), next.updatedAt]
      );
      return result.rows[0] ? mapDeal(result.rows[0]) : null;
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await getPostgresPool().query('DELETE FROM crm_deals WHERE id = $1', [id]);
    return result.rowCount === 1;
  }

  async convertLead(lead: any, client: any, deal: any, clientAlreadyExists = false): Promise<{ client: any; deal: any }> {
    return withPostgresTransaction(async db => {
      const clientResult = clientAlreadyExists ? null : await db.query(
        `INSERT INTO clients
         (id,name,company,email,phone,industry,status,notes,metadata,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [client.id, client.name, client.company || null, client.email || null, client.phone || null, client.industry || null,
         client.status || 'active', client.notes || null, JSON.stringify({
           ...client,
           id: undefined, name: undefined, company: undefined, email: undefined, phone: undefined,
           industry: undefined, status: undefined, notes: undefined, createdAt: undefined, updatedAt: undefined
         }), client.createdAt, client.updatedAt]
      );
      const dealResult = await db.query(
        `INSERT INTO crm_deals
         (id,title,client_id,client_name,company,email,phone,service_pillar,value,stage,priority,probability,owner,expected_close_date,metadata,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING *`,
        [
          deal.id,
          deal.title || 'Untitled Deal',
          client.id,
          deal.clientName || null,
          deal.company || client.company || null,
          deal.email || client.email || null,
          deal.phone || client.phone || null,
          deal.servicePillar || null,
          Number(deal.value || 0),
          deal.stage || 'new',
          deal.priority || 'medium',
          Number(deal.probability || 0),
          deal.owner || null,
          deal.expectedCloseDate || null,
          JSON.stringify(toMetadata(deal)),
          deal.createdAt,
          deal.updatedAt
        ]
      );
      const leadResult = await db.query('UPDATE leads SET status=$2,updated_at=$3 WHERE id=$1 RETURNING *', [lead.id, 'closed', deal.createdAt]);
      if (!leadResult.rows[0]) throw new Error('Lead not found during conversion.');
      return {
        client: { ...client, id: clientResult?.rows[0]?.id || client.id },
        deal: mapDeal(dealResult.rows[0])
      };
    });
  }
}

export const postgresCrmDealRepository = new PostgresCrmDealRepository();
