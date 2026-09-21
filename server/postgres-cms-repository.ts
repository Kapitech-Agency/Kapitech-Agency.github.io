import { getPostgresPool } from './postgres.ts';

type CmsKind = 'service' | 'project' | 'testimonial';

const tableFor = (kind: CmsKind): string => ({
  service: 'cms_services',
  project: 'cms_projects',
  testimonial: 'cms_testimonials'
}[kind]);

const mapRow = (kind: CmsKind, row: any): any => ({
  ...(row.data && typeof row.data === 'object' ? row.data : {}),
  id: row.id,
  ...(kind === 'service' ? { name: row.name || row.data?.name || row.data?.title, slug: row.slug || row.data?.slug, description: row.description || row.data?.description } : {}),
  ...(kind === 'project' ? { name: row.name || row.data?.name || row.data?.title, slug: row.slug || row.data?.slug, description: row.description || row.data?.description } : {}),
  ...(kind === 'testimonial' ? { name: row.name || row.data?.name || row.data?.author, company: row.company || row.data?.company, quote: row.quote || row.data?.quote } : {}),
  createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
  updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString()
});

export class PostgresCmsRepository {
  async list(kind: CmsKind): Promise<any[]> {
    const { rows } = await getPostgresPool().query(`SELECT * FROM ${tableFor(kind)} ORDER BY created_at DESC`);
    return rows.map(row => mapRow(kind, row));
  }

  async findById(kind: CmsKind, id: string): Promise<any | null> {
    const { rows } = await getPostgresPool().query(`SELECT * FROM ${tableFor(kind)} WHERE id=$1`, [id]);
    return rows[0] ? mapRow(kind, rows[0]) : null;
  }

  async create(kind: CmsKind, input: any): Promise<any> {
    const table = tableFor(kind);
    const now = input.createdAt || new Date().toISOString();
    const name = input.name || input.title || input.author || '';
    const description = input.description || input.desc || '';
    const company = input.company || '';
    const quote = input.quote || '';
    const { rows } = await getPostgresPool().query(
      `INSERT INTO ${table} (id,name,slug,description,company,quote,data,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$8)
       RETURNING *`,
      [input.id,name,input.slug || null,description,company,quote,JSON.stringify(input),now]
    );
    return mapRow(kind, rows[0]);
  }

  async update(kind: CmsKind, id: string, patch: any): Promise<any | null> {
    const current = await this.findById(kind, id);
    if (!current) return null;
    const merged = { ...current, ...patch, updatedAt: new Date().toISOString() };
    const table = tableFor(kind);
    const name = merged.name || merged.title || merged.author || '';
    const description = merged.description || merged.desc || '';
    const company = merged.company || '';
    const quote = merged.quote || '';
    const { rows } = await getPostgresPool().query(
      `UPDATE ${table}
       SET name=$2,slug=$3,description=$4,company=$5,quote=$6,data=$7::jsonb,updated_at=$8
       WHERE id=$1 RETURNING *`,
      [id,name,merged.slug || null,description,company,quote,JSON.stringify(merged),merged.updatedAt]
    );
    return rows[0] ? mapRow(kind, rows[0]) : null;
  }

  async delete(kind: CmsKind, id: string): Promise<boolean> {
    const { rowCount } = await getPostgresPool().query(`DELETE FROM ${tableFor(kind)} WHERE id=$1`, [id]);
    return (rowCount || 0) > 0;
  }

  async getSettings(): Promise<Record<string, any>> {
    const { rows } = await getPostgresPool().query('SELECT key,value,updated_at FROM cms_settings ORDER BY key');
    const settings: Record<string, any> = {};
    for (const row of rows) settings[row.key] = row.value;
    if (rows[0]?.updated_at) settings.updatedAt = rows[0].updated_at instanceof Date ? rows[0].updated_at.toISOString() : new Date(rows[0].updated_at).toISOString();
    return settings;
  }

  async updateSettings(patch: Record<string, any>): Promise<Record<string, any>> {
    const current = await this.getSettings();
    const merged = { ...current, ...patch, updatedAt: new Date().toISOString() };
    const client = await getPostgresPool().connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(merged)) {
        if (key === 'updatedAt') continue;
        await client.query(
          `INSERT INTO cms_settings (key,value,updated_at) VALUES ($1,$2::jsonb,NOW())
           ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,
          [key, JSON.stringify(value)]
        );
      }
      await client.query('COMMIT');
      return merged;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const postgresCmsRepository = new PostgresCmsRepository();
