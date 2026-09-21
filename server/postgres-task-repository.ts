import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;
const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' ? v as Record<string, unknown> : {};
const iso = (v: Date | string): string => v instanceof Date ? v.toISOString() : new Date(v).toISOString();
const date = (v: unknown): string => v == null ? '' : v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10);

function mapTask(row: Row): Record<string, unknown> {
  const metadata = obj(row.metadata);
  return {
    ...metadata,
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    projectId: row.project_id ?? '',
    projectName: String(metadata.projectName ?? ''),
    assignee: String(metadata.assignee ?? metadata.assignedTo ?? ''),
    reporter: String(metadata.reporter ?? ''),
    priority: row.priority || 'medium',
    status: row.status,
    dueDate: date(row.due_date),
    estimatedHours: Number(metadata.estimatedHours ?? 0),
    actualHours: Number(metadata.actualHours ?? 0),
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    subtasks: Array.isArray(metadata.subtasks) ? metadata.subtasks : [],
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

function taskMetadata(task: Record<string, unknown>): Record<string, unknown> {
  const {
    id, title, description, projectId, projectName, assignee, reporter, priority, status, dueDate,
    createdAt, updatedAt, estimatedHours, actualHours, tags, subtasks, ...rest
  } = task;
  return { ...rest, projectName, assignee, reporter, estimatedHours, actualHours, tags, subtasks };
}

export class PostgresTaskRepository {
  async list(): Promise<Record<string, unknown>[]> {
    const result = await getPostgresPool().query('SELECT * FROM tasks ORDER BY created_at DESC');
    return (result.rows as Row[]).map(mapTask);
  }

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const result = await getPostgresPool().query('SELECT * FROM tasks WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ? mapTask(result.rows[0]) : null;
  }

  async create(task: Record<string, unknown>): Promise<Record<string, unknown>> {
    const now = typeof task.createdAt === 'string' ? task.createdAt : new Date().toISOString();
    const projectId = typeof task.projectId === 'string' && task.projectId ? task.projectId : null;
    return withPostgresTransaction(async client => {
      if (projectId) {
        const project = await client.query('SELECT id FROM projects WHERE id = $1 LIMIT 1', [projectId]);
        if (!project.rows[0]) throw new Error('Project not found.');
      }
      await client.query(
        `INSERT INTO tasks (id,project_id,title,description,status,priority,assignee_user_id,due_date,metadata,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,NULL,$7,$8,$9,$10)`,
        [
          task.id, projectId, task.title, task.description || null, task.status, task.priority || 'medium',
          task.dueDate || null, JSON.stringify(taskMetadata(task)), now, task.updatedAt || now
        ]
      );
      const result = await client.query('SELECT * FROM tasks WHERE id = $1', [task.id]);
      return mapTask(result.rows[0]);
    });
  }

  async update(id: string, patch: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    return withPostgresTransaction(async client => {
      const currentResult = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [id]);
      if (!currentResult.rows[0]) return null;
      const current = mapTask(currentResult.rows[0]);
      if (patch.updatedAt && iso(currentResult.rows[0].updated_at) !== patch.updatedAt) {
        throw new Error('Task has been modified since it was loaded. Refresh and retry.');
      }
      const next = { ...current, ...patch, id, updatedAt: new Date().toISOString() };
      const projectId = typeof next.projectId === 'string' && next.projectId ? next.projectId : null;
      if (projectId) {
        const project = await client.query('SELECT id FROM projects WHERE id = $1 LIMIT 1', [projectId]);
        if (!project.rows[0]) throw new Error('Project not found.');
      }
      await client.query(
        `UPDATE tasks
         SET project_id=$2,title=$3,description=$4,status=$5,priority=$6,due_date=$7,metadata=$8,updated_at=$9
         WHERE id=$1`,
        [id, projectId, next.title, next.description || null, next.status, next.priority || 'medium',
         next.dueDate || null, JSON.stringify(taskMetadata(next)), next.updatedAt]
      );
      const result = await client.query('SELECT * FROM tasks WHERE id = $1', [id]);
      return mapTask(result.rows[0]);
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await getPostgresPool().query('DELETE FROM tasks WHERE id = $1', [id]);
    return result.rowCount === 1;
  }
}

export const postgresTaskRepository = new PostgresTaskRepository();
