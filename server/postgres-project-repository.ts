import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;

function obj(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function iso(value: any): string {
  if (value == null) return '';
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function date(value: any): string | undefined {
  if (value == null || value === '') return undefined;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function metadataFrom(input: Record<string, any>, known: string[]): Record<string, any> {
  const metadata: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!known.includes(key) && value !== undefined) metadata[key] = value;
  }
  return metadata;
}

function mapProject(row: Row): Record<string, any> {
  const metadata = obj(row.metadata);
  return {
    ...metadata,
    id: row.id,
    name: row.name,
    title: metadata.title ?? row.name,
    clientId: row.client_id ?? metadata.clientId ?? undefined,
    client: metadata.client ?? metadata.clientCompany ?? '',
    clientName: metadata.clientName ?? '',
    clientCompany: metadata.clientCompany ?? metadata.client ?? '',
    clientEmail: metadata.clientEmail ?? '',
    description: row.description ?? '',
    status: row.status,
    owner: row.owner ?? '',
    health: metadata.health ?? 'Good',
    budget: Number(row.budget ?? 0),
    currency: row.currency ?? metadata.currency ?? 'IDR',
    progressPercent: Number(metadata.progressPercent ?? 0),
    startDate: date(row.start_date),
    targetEndDate: date(row.end_date),
    version: Number(row.version ?? 1),
    archivedAt: row.archived_at ? iso(row.archived_at) : undefined,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

function mapTask(row: Row): Record<string, any> {
  const metadata = obj(row.metadata);
  return {
    ...metadata,
    id: row.id,
    projectId: row.project_id ?? metadata.projectId ?? '',
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    priority: row.priority ?? metadata.priority ?? 'medium',
    assigneeUserId: row.assignee_user_id ?? metadata.assigneeUserId ?? undefined,
    assignedTo: metadata.assignedTo ?? metadata.assignee ?? '',
    dueDate: date(row.due_date) ?? '',
    estimatedHours: row.estimated_minutes == null
      ? Number(metadata.estimatedHours ?? 0)
      : Number(row.estimated_minutes) / 60,
    actualHours: Number(metadata.actualHours ?? 0),
    version: Number(row.version ?? 1),
    completedAt: row.completed_at ? iso(row.completed_at) : undefined,
    archivedAt: row.archived_at ? iso(row.archived_at) : undefined,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

export class ProjectVersionConflictError extends Error {
  readonly code = 'PROJECT_VERSION_CONFLICT';
}

export class TaskVersionConflictError extends Error {
  readonly code = 'TASK_VERSION_CONFLICT';
}

export class ProjectArchiveMutationError extends Error {
  readonly code = 'PROJECT_ARCHIVED';
}

export class PostgresProjectRepository {
  async list(): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM projects WHERE archived_at IS NULL ORDER BY created_at DESC'
    );
    return result.rows.map(mapProject);
  }

  async findById(id: string): Promise<Record<string, any> | null> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM projects WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] ? mapProject(result.rows[0]) : null;
  }

  async listByClientId(clientId: string): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM projects WHERE client_id = $1 AND archived_at IS NULL ORDER BY created_at DESC',
      [clientId]
    );
    return result.rows.map(mapProject);
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    const known = [
      'id','clientId','name','title','description','status','owner','budget','currency',
      'startDate','targetEndDate','createdAt','updatedAt','version'
    ];
    const metadata = metadataFrom(input, known);
    const now = new Date().toISOString();
    const result = await getPostgresPool().query<Row>(
      'INSERT INTO projects ' +
      '(id,client_id,name,description,status,owner,budget,start_date,end_date,currency,version,metadata,created_at,updated_at) ' +
      'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1,$11,$12,$13) RETURNING *',
      [
        String(input.id),
        input.clientId ? String(input.clientId) : null,
        String(input.name || input.title || ''),
        input.description ? String(input.description) : null,
        String(input.status || 'planning'),
        input.owner ? String(input.owner) : null,
        Number(input.budget || 0),
        input.startDate || null,
        input.targetEndDate || input.endDate || null,
        String(input.currency || 'IDR').toUpperCase().slice(0, 3),
        JSON.stringify(metadata),
        input.createdAt || now,
        input.updatedAt || now
      ]
    );
    return mapProject(result.rows[0]);
  }

  async update(id: string, patch: Record<string, any>): Promise<Record<string, any> | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    if (existing.archivedAt) throw new ProjectArchiveMutationError('Archived project cannot be updated.');

    const expectedVersion = patch.version == null ? undefined : Number(patch.version);
    const merged = { ...existing, ...patch, id };
    const known = [
      'id','clientId','name','title','description','status','owner','budget','currency',
      'startDate','targetEndDate','createdAt','updatedAt','version','archivedAt'
    ];
    const metadata = metadataFrom(merged, known);

    const params = [
      id,
      String(merged.name || merged.title || ''),
      merged.description ? String(merged.description) : null,
      String(merged.status || 'planning'),
      merged.owner ? String(merged.owner) : null,
      Number(merged.budget || 0),
      merged.startDate || null,
      merged.targetEndDate || merged.endDate || null,
      String(merged.currency || 'IDR').toUpperCase().slice(0, 3),
      JSON.stringify(metadata)
    ];

    const sql = expectedVersion === undefined
      ? 'UPDATE projects SET name=$2, description=$3, status=$4, owner=$5, budget=$6, ' +
        'start_date=$7, end_date=$8, currency=$9, metadata=$10, version=version+1, updated_at=NOW() ' +
        'WHERE id=$1 AND archived_at IS NULL RETURNING *'
      : 'UPDATE projects SET name=$2, description=$3, status=$4, owner=$5, budget=$6, ' +
        'start_date=$7, end_date=$8, currency=$9, metadata=$10, version=version+1, updated_at=NOW() ' +
        'WHERE id=$1 AND version=$11 AND archived_at IS NULL RETURNING *';

    const values = expectedVersion === undefined ? params : [...params, expectedVersion];
    const result = await getPostgresPool().query<Row>(sql, values);

    if (!result.rows[0]) {
      if (expectedVersion !== undefined) {
        throw new ProjectVersionConflictError('Project was modified by another user.');
      }
      return null;
    }
    return mapProject(result.rows[0]);
  }

  async archive(id: string): Promise<boolean> {
    return withPostgresTransaction(async client => {
      const current = await client.query<Row>(
        'SELECT id FROM projects WHERE id = $1 FOR UPDATE',
        [id]
      );
      if (!current.rows[0]) return false;

      const result = await client.query(
        'UPDATE projects SET status=$2, archived_at=NOW(), version=version+1, updated_at=NOW() ' +
        'WHERE id=$1 AND archived_at IS NULL',
        [id, 'archived']
      );
      return result.rowCount === 1;
    });
  }
}

export class PostgresTaskRepository {
  async list(): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM tasks WHERE archived_at IS NULL ORDER BY created_at DESC'
    );
    return result.rows.map(mapTask);
  }

  async findById(id: string): Promise<Record<string, any> | null> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM tasks WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows[0] ? mapTask(result.rows[0]) : null;
  }

  async listByProjectId(projectId: string): Promise<Record<string, any>[]> {
    const result = await getPostgresPool().query<Row>(
      'SELECT * FROM tasks WHERE project_id = $1 AND archived_at IS NULL ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows.map(mapTask);
  }

  async create(input: Record<string, any>): Promise<Record<string, any>> {
    if (!input.projectId) throw new Error('Task projectId is required.');

    const known = [
      'id','projectId','title','description','status','priority','assigneeUserId',
      'dueDate','estimatedHours','actualHours','createdAt','updatedAt','version'
    ];
    const metadata = metadataFrom(input, known);
    const now = new Date().toISOString();
    const estimatedMinutes = Math.round(Math.max(0, Number(input.estimatedHours || 0)) * 60);
    const result = await getPostgresPool().query<Row>(
      'INSERT INTO tasks ' +
      '(id,project_id,title,description,status,priority,assignee_user_id,due_date,estimated_minutes,version,metadata,created_at,updated_at) ' +
      'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1,$10,$11,$12) RETURNING *',
      [
        String(input.id),
        String(input.projectId),
        String(input.title || ''),
        input.description ? String(input.description) : null,
        String(input.status || 'todo'),
        input.priority ? String(input.priority) : 'medium',
        input.assigneeUserId ? String(input.assigneeUserId) : null,
        input.dueDate || null,
        estimatedMinutes,
        JSON.stringify(metadata),
        input.createdAt || now,
        input.updatedAt || now
      ]
    );
    return mapTask(result.rows[0]);
  }

  async update(id: string, patch: Record<string, any>): Promise<Record<string, any> | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    if (existing.archivedAt) throw new ProjectArchiveMutationError('Archived task cannot be updated.');

    const expectedVersion = patch.version == null ? undefined : Number(patch.version);
    const merged = { ...existing, ...patch, id };
    const known = [
      'id','projectId','title','description','status','priority','assigneeUserId',
      'dueDate','estimatedHours','actualHours','version','archivedAt','completedAt','createdAt','updatedAt'
    ];
    const metadata = metadataFrom(merged, known);
    const estimatedMinutes = Math.round(Math.max(0, Number(merged.estimatedHours || 0)) * 60);
    const completedAt = String(merged.status || '') === 'done'
      ? (merged.completedAt || new Date().toISOString())
      : null;

    const params = [
      id,
      String(merged.projectId || ''),
      String(merged.title || ''),
      merged.description ? String(merged.description) : null,
      String(merged.status || 'todo'),
      merged.priority ? String(merged.priority) : 'medium',
      merged.assigneeUserId ? String(merged.assigneeUserId) : null,
      merged.dueDate || null,
      estimatedMinutes,
      completedAt,
      JSON.stringify(metadata)
    ];

    const sql = expectedVersion === undefined
      ? 'UPDATE tasks SET project_id=$2, title=$3, description=$4, status=$5, priority=$6, ' +
        'assignee_user_id=$7, due_date=$8, estimated_minutes=$9, completed_at=$10, metadata=$11, ' +
        'version=version+1, updated_at=NOW() WHERE id=$1 AND archived_at IS NULL RETURNING *'
      : 'UPDATE tasks SET project_id=$2, title=$3, description=$4, status=$5, priority=$6, ' +
        'assignee_user_id=$7, due_date=$8, estimated_minutes=$9, completed_at=$10, metadata=$11, ' +
        'version=version+1, updated_at=NOW() WHERE id=$1 AND version=$12 AND archived_at IS NULL RETURNING *';

    const values = expectedVersion === undefined ? params : [...params, expectedVersion];
    const result = await getPostgresPool().query<Row>(sql, values);

    if (!result.rows[0]) {
      if (expectedVersion !== undefined) {
        throw new TaskVersionConflictError('Task was modified by another user.');
      }
      return null;
    }
    return mapTask(result.rows[0]);
  }

  async archive(id: string): Promise<boolean> {
    const result = await getPostgresPool().query(
      'UPDATE tasks SET archived_at=NOW(), version=version+1, updated_at=NOW() ' +
      'WHERE id=$1 AND archived_at IS NULL',
      [id]
    );
    return result.rowCount === 1;
  }
}

export const postgresProjectRepository = new PostgresProjectRepository();
export const postgresTaskRepository = new PostgresTaskRepository();
