import { getPostgresPool } from './postgres.ts';

type Row = Record<string, any>;

function obj(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function iso(value: any): string {
  if (value == null) return '';
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function metadataFrom(input: Record<string, any>, known: string[]): Record<string, any> {
  const metadata: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!known.includes(key) && value !== undefined) metadata[key] = value;
  }
  return metadata;
}

function mapClient(row: Row): Record<string, any> {
  const metadata = obj(row.metadata);
  return {
    ...metadata,
    id: row.id,
    name: row.name,
    company: row.company ?? metadata.company ?? '',
    clientName: metadata.clientName ?? row.name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    website: metadata.website ?? '',
    location: metadata.location ?? '',
    industry: row.industry ?? '',
    status: row.status ?? 'active',
    totalSpend: Number(metadata.totalSpend ?? 0),
    projectsCount: Number(metadata.projectsCount ?? metadata.totalProjects ?? 0),
    contactPersonRole: metadata.contactPersonRole ?? '',
    notes: row.notes ?? '',
    avatarUrl: metadata.avatarUrl ?? '',
    slaDailyAdSpendBudget: Number(metadata.slaDailyAdSpendBudget ?? 0),
    currentDailyAdSpend: Number(metadata.currentDailyAdSpend ?? 0),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

export class ClientHasDependenciesError extends Error {
  readonly code = 'CLIENT_HAS_DEPENDENCIES';
}

export class PostgresClientRepository {
  async list(): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );
    return result.rows.map(mapClient);
  }

  async findById(id: string): Promise<Record<string, any> | null> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM clients WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] ? mapClient(result.rows[0]) : null;
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    const known = [
      'id','name','company','companyName','clientName','email','phone','industry','status','notes',
      'createdAt','updatedAt'
    ];
    const metadata = metadataFrom(input, known);
    const now = new Date().toISOString();
    const result = await getPostgresPool().query<Row>(
      'INSERT INTO clients ' +
      '(id,name,company,email,phone,industry,status,notes,metadata,created_at,updated_at) ' +
      'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [
        String(input.id),
        String(input.name || input.clientName || ''),
        String(input.company || input.companyName || ''),
        input.email ? String(input.email).toLowerCase() : null,
        input.phone ? String(input.phone) : null,
        input.industry ? String(input.industry) : null,
        String(input.status || 'prospect'),
        input.notes ? String(input.notes) : null,
        JSON.stringify(metadata),
        input.createdAt || now,
        input.updatedAt || now
      ]
    );
    return mapClient(result.rows[0]);
  }

  async update(id: string, patch: Record<string, any>): Promise<Record<string, any> | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const merged = { ...existing, ...patch, id };
    const known = [
      'id','name','company','companyName','clientName','email','phone','industry','status','notes',
      'createdAt','updatedAt'
    ];
    const metadata = metadataFrom(merged, known);
    const result = await getPostgresPool().query<Row>(
      'UPDATE clients SET name=$2, company=$3, email=$4, phone=$5, industry=$6, ' +
      'status=$7, notes=$8, metadata=$9, updated_at=$10 WHERE id=$1 RETURNING *',
      [
        id,
        String(merged.name || merged.clientName || ''),
        String(merged.company || merged.companyName || ''),
        merged.email ? String(merged.email).toLowerCase() : null,
        merged.phone ? String(merged.phone) : null,
        merged.industry ? String(merged.industry) : null,
        String(merged.status || 'prospect'),
        merged.notes ? String(merged.notes) : null,
        JSON.stringify(metadata),
        new Date().toISOString()
      ]
    );
    return result.rows[0] ? mapClient(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const dependency = await getPostgresPool().query<{ has_dependencies: boolean }>(
      'SELECT EXISTS (' +
      ' SELECT 1 FROM projects WHERE client_id = $1' +
      ' UNION ALL SELECT 1 FROM proposals WHERE client_id = $1' +
      ' UNION ALL SELECT 1 FROM invoices WHERE client_id = $1' +
      ' UNION ALL SELECT 1 FROM crm_deals WHERE client_id = $1' +
      ') AS has_dependencies',
      [id]
    );

    if (dependency.rows[0]?.has_dependencies) {
      throw new ClientHasDependenciesError(
        'Client cannot be deleted while related projects, proposals, invoices, or CRM deals exist.'
      );
    }

    const result = await getPostgresPool().query(
      'DELETE FROM clients WHERE id = $1',
      [id]
    );
    return result.rowCount === 1;
  }
}

export const postgresClientRepository = new PostgresClientRepository();
