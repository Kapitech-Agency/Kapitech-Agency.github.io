import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;

function iso(value: any): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString() : String(value);
}

function obj(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function mapVendor(row: Row): Record<string, any> {
  const metadata = obj(row.metadata);
  return {
    ...metadata,
    id: row.id,
    name: row.name,
    category: row.category ?? metadata.primaryCategory ?? '',
    contactPerson: row.contact_person ?? metadata.contactPerson ?? '',
    companyName: metadata.companyName ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    website: metadata.website ?? '',
    paymentTerms: row.payment_terms ?? '',
    status: row.status ?? 'active',
    monthlySpend: Number(row.monthly_spend ?? 0),
    hourlyRate: Number(metadata.hourlyRate ?? 0),
    currency: row.currency ?? metadata.currency ?? 'IDR',
    rating: Number(metadata.rating ?? 0),
    skills: Array.isArray(metadata.skills) ? metadata.skills : [],
    primaryCategory: metadata.primaryCategory ?? row.category ?? '',
    completedProjectsCount: Number(metadata.completedProjectsCount ?? 0),
    isVetted: Boolean(metadata.isVetted),
    location: metadata.location ?? '',
    portfolioUrl: metadata.portfolioUrl ?? '',
    githubUrl: metadata.githubUrl ?? '',
    contracts: Array.isArray(metadata.contracts) ? metadata.contracts : [],
    notes: row.notes ?? '',
    version: Number(row.version ?? 1),
    archivedAt: row.archived_at ? iso(row.archived_at) : undefined,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at ?? row.created_at)
  };
}

function metadataFrom(input: Record<string, any>): Record<string, any> {
  const known = new Set([
    'id','name','category','contactPerson','companyName','email','phone','website','paymentTerms',
    'status','monthlySpend','currency','hourlyRate','rating','skills','primaryCategory',
    'completedProjectsCount','isVetted','location','portfolioUrl','githubUrl','contracts',
    'notes','version','archivedAt','createdAt','updatedAt'
  ]);
  return Object.fromEntries(Object.entries(input).filter(([key,value]) => !known.has(key) && value !== undefined));
}

export class VendorNotFoundError extends Error { readonly code='VENDOR_NOT_FOUND'; }
export class VendorVersionConflictError extends Error { readonly code='VENDOR_VERSION_CONFLICT'; }
export class VendorImmutableError extends Error { readonly code='VENDOR_IMMUTABLE'; }

export class PostgresVendorRepository {
  async list(): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM vendors WHERE archived_at IS NULL ORDER BY created_at DESC'
    );
    return result.rows.map(mapVendor);
  }

  async findById(id: string): Promise<Record<string, any> | null> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM vendors WHERE id=$1 LIMIT 1',
      [id]
    );
    return result.rows[0] ? mapVendor(result.rows[0]) : null;
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    const currency = String(input.currency || 'IDR').toUpperCase().slice(0,3);
    const metadata = {
      ...metadataFrom(input),
      companyName: input.companyName,
      website: input.website,
      hourlyRate: Number(input.hourlyRate ?? 0),
      rating: Number(input.rating ?? 0),
      skills: Array.isArray(input.skills) ? input.skills.slice(0,100) : [],
      primaryCategory: input.primaryCategory,
      completedProjectsCount: Number(input.completedProjectsCount ?? 0),
      isVetted: Boolean(input.isVetted),
      location: input.location,
      portfolioUrl: input.portfolioUrl,
      githubUrl: input.githubUrl,
      contracts: Array.isArray(input.contracts) ? input.contracts.slice(0,50) : []
    };

    const result = await getPostgresPool().query<Row>(
      'INSERT INTO vendors ' +
      '(id,name,category,contact_person,email,phone,payment_terms,status,monthly_spend,currency,notes,metadata,created_at) ' +
      'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW()) RETURNING *',
      [
        String(input.id),
        String(input.name || '').trim().slice(0,160),
        input.category ? String(input.category).slice(0,120) : null,
        input.contactPerson ? String(input.contactPerson).slice(0,160) : null,
        input.email ? String(input.email).toLowerCase().slice(0,254) : null,
        input.phone ? String(input.phone).slice(0,40) : null,
        input.paymentTerms ? String(input.paymentTerms).slice(0,300) : null,
        ['active','under_review','inactive','blacklisted'].includes(String(input.status)) ? String(input.status) : 'under_review',
        Number(input.monthlySpend ?? 0),
        currency,
        input.notes ? String(input.notes).slice(0,3000) : null,
        JSON.stringify(metadata)
      ]
    );
    return mapVendor(result.rows[0]);
  }

  async update(id: string, input: Record<string, any>): Promise<Record<string, any>> {
    return withPostgresTransaction(async client => {
      const current = await client.query<Row>('SELECT * FROM vendors WHERE id=$1 FOR UPDATE', [id]);
      if (!current.rows[0]) throw new VendorNotFoundError('Vendor not found.');
      if (current.rows[0].archived_at) throw new VendorImmutableError('Archived vendor cannot be updated.');

      const expectedVersion = input.version == null ? undefined : Number(input.version);
      if (expectedVersion != null && Number(current.rows[0].version) !== expectedVersion) {
        throw new VendorVersionConflictError('Vendor was modified by another user.');
      }

      const currentMapped = mapVendor(current.rows[0]);
      const merged: Record<string, any> = { ...currentMapped, ...input, id };
      const currentMetadata = obj(current.rows[0].metadata);
      const nextMetadata = {
        ...currentMetadata,
        companyName: merged.companyName,
        website: merged.website,
        hourlyRate: Number(merged.hourlyRate ?? 0),
        rating: Number(merged.rating ?? 0),
        skills: Array.isArray(merged.skills) ? merged.skills.slice(0,100) : [],
        primaryCategory: merged.primaryCategory,
        completedProjectsCount: Number(merged.completedProjectsCount ?? 0),
        isVetted: Boolean(merged.isVetted),
        location: merged.location,
        portfolioUrl: merged.portfolioUrl,
        githubUrl: merged.githubUrl,
        contracts: Array.isArray(merged.contracts) ? merged.contracts.slice(0,50) : []
      };

      const updated = await client.query<Row>(
        'UPDATE vendors SET name=$2,category=$3,contact_person=$4,email=$5,phone=$6,payment_terms=$7,status=$8,' +
        'monthly_spend=$9,currency=$10,notes=$11,metadata=$12,version=version+1 WHERE id=$1 AND archived_at IS NULL RETURNING *',
        [
          id,
          String(merged.name || '').trim().slice(0,160),
          merged.category ? String(merged.category).slice(0,120) : null,
          merged.contactPerson ? String(merged.contactPerson).slice(0,160) : null,
          merged.email ? String(merged.email).toLowerCase().slice(0,254) : null,
          merged.phone ? String(merged.phone).slice(0,40) : null,
          merged.paymentTerms ? String(merged.paymentTerms).slice(0,300) : null,
          ['active','under_review','inactive','blacklisted'].includes(String(merged.status)) ? String(merged.status) : 'under_review',
          Number(merged.monthlySpend ?? 0),
          String(merged.currency || 'IDR').toUpperCase().slice(0,3),
          merged.notes ? String(merged.notes).slice(0,3000) : null,
          JSON.stringify(nextMetadata)
        ]
      );
      if (!updated.rows[0]) throw new VendorNotFoundError('Vendor not found.');
      return mapVendor(updated.rows[0]);
    });
  }

  async archive(id: string, expectedVersion?: number): Promise<boolean> {
    return withPostgresTransaction(async client => {
      const current = await client.query<Row>('SELECT * FROM vendors WHERE id=$1 FOR UPDATE', [id]);
      if (!current.rows[0]) return false;
      if (expectedVersion != null && Number(current.rows[0].version) !== expectedVersion) {
        throw new VendorVersionConflictError('Vendor was modified by another user.');
      }
      const result = await client.query(
        'UPDATE vendors SET status=$2,archived_at=NOW(),version=version+1 WHERE id=$1 AND archived_at IS NULL',
        [id,'inactive']
      );
      return result.rowCount === 1;
    });
  }
}

export const postgresVendorRepository = new PostgresVendorRepository();
