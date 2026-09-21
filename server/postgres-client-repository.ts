import type { AgencyClient } from '../src/lib/clientStore.ts';
import { getPostgresPool } from './postgres.ts';

type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  status: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
};

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapClient(row: ClientRow): AgencyClient {
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  return {
    ...(metadata as Partial<AgencyClient>),
    id: row.id,
    name: row.name,
    company: row.company ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    industry: row.industry ?? '',
    status: (row.status === 'completed' || row.status === 'lead' || row.status === 'inactive' ? row.status : 'active') as AgencyClient['status'],
    notes: row.notes ?? undefined,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

function toMetadata(client: AgencyClient): Record<string, unknown> {
  const { id, name, company, email, phone, industry, status, notes, createdAt, updatedAt, ...metadata } = client;
  return metadata;
}

export class PostgresClientRepository {
  async list(): Promise<AgencyClient[]> {
    const result = await getPostgresPool().query<ClientRow>('SELECT * FROM clients ORDER BY created_at DESC');
    return result.rows.map(mapClient);
  }

  async findById(id: string): Promise<AgencyClient | null> {
    const result = await getPostgresPool().query<ClientRow>('SELECT * FROM clients WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ? mapClient(result.rows[0]) : null;
  }

  async create(client: AgencyClient): Promise<AgencyClient> {
    const result = await getPostgresPool().query<ClientRow>(
      `INSERT INTO clients
       (id,name,company,email,phone,industry,status,notes,metadata,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [client.id, client.name, client.company || null, client.email || null, client.phone || null,
       client.industry || null, client.status, client.notes || null, JSON.stringify(toMetadata(client)),
       client.createdAt, client.updatedAt]
    );
    return mapClient(result.rows[0]);
  }

  async update(id: string, patch: Partial<AgencyClient>): Promise<AgencyClient | null> {
    const current = await this.findById(id);
    if (!current) return null;
    const next = { ...current, ...patch, id, updatedAt: new Date().toISOString() };
    const result = await getPostgresPool().query<ClientRow>(
      `UPDATE clients SET name=$2,company=$3,email=$4,phone=$5,industry=$6,status=$7,notes=$8,metadata=$9,updated_at=$10
       WHERE id=$1 RETURNING *`,
      [id, next.name, next.company || null, next.email || null, next.phone || null, next.industry || null,
       next.status, next.notes || null, JSON.stringify(toMetadata(next)), next.updatedAt]
    );
    return result.rows[0] ? mapClient(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await getPostgresPool().query('DELETE FROM clients WHERE id = $1', [id]);
    return result.rowCount === 1;
  }
}

export const postgresClientRepository = new PostgresClientRepository();
