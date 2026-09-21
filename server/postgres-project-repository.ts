import type { AgencyProject, ProjectTask } from '../src/lib/projectStore.ts';
import { getPostgresPool, withPostgresTransaction } from './postgres.ts';

type Row = Record<string, any>;
const iso = (v: Date | string): string => v instanceof Date ? v.toISOString() : new Date(v).toISOString();
const date = (v: unknown): string => v == null ? '' : v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10);
const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' ? v as Record<string, unknown> : {};

export class ProjectConcurrencyError extends Error {
  constructor() { super('Project has been modified since it was loaded. Refresh and retry.'); this.name = 'ProjectConcurrencyError'; }
}

function mapTask(row: Row): ProjectTask {
  const metadata = obj(row.metadata);
  return {
    ...(metadata as Partial<ProjectTask>),
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status as ProjectTask['status'],
    priority: (row.priority || 'medium') as ProjectTask['priority'],
    assignedTo: typeof row.assignee_user_id === 'string' ? row.assignee_user_id : String(metadata.assignedTo || ''),
    dueDate: date(row.due_date),
    createdAt: iso(row.created_at)
  };
}

function mapProject(row: Row, tasks: ProjectTask[]): AgencyProject {
  const metadata = obj(row.metadata);
  return {
    ...(metadata as Partial<AgencyProject>),
    id: row.id,
    name: row.name,
    clientId: row.client_id ?? (metadata.clientId ? String(metadata.clientId) : undefined),
    clientName: String(metadata.clientName ?? ''),
    clientCompany: String(metadata.clientCompany ?? ''),
    clientEmail: String(metadata.clientEmail ?? ''),
    crmLeadId: metadata.crmLeadId ? String(metadata.crmLeadId) : undefined,
    serviceCategory: String(metadata.serviceCategory ?? ''),
    status: row.status as AgencyProject['status'],
    budget: Number(row.budget || 0),
    progressPercent: Number(metadata.progressPercent ?? 0),
    startDate: date(row.start_date),
    targetEndDate: date(row.end_date),
    teamLead: String(metadata.teamLead ?? row.owner ?? ''),
    teamMembers: Array.isArray(metadata.teamMembers) ? metadata.teamMembers as string[] : [],
    techStack: Array.isArray(metadata.techStack) ? metadata.techStack as string[] : [],
    milestones: Array.isArray(metadata.milestones) ? metadata.milestones as AgencyProject['milestones'] : [],
    tasks,
    repositoryUrl: typeof metadata.repositoryUrl === 'string' ? metadata.repositoryUrl : undefined,
    figmaUrl: typeof metadata.figmaUrl === 'string' ? metadata.figmaUrl : undefined,
    liveStagingUrl: typeof metadata.liveStagingUrl === 'string' ? metadata.liveStagingUrl : undefined,
    notes: typeof row.description === 'string' ? row.description : undefined,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

function projectMetadata(project: AgencyProject): Record<string, unknown> {
  const { id, name, clientId, clientName, clientCompany, clientEmail, crmLeadId, serviceCategory, status, budget, startDate, targetEndDate, teamLead, teamMembers, techStack, milestones, tasks, repositoryUrl, figmaUrl, liveStagingUrl, notes, createdAt, updatedAt, progressPercent, ...rest } = project;
  return { ...rest, clientId, clientName, clientCompany, clientEmail, crmLeadId, serviceCategory, progressPercent, teamLead, teamMembers, techStack, milestones, repositoryUrl, figmaUrl, liveStagingUrl };
}

function taskMetadata(task: ProjectTask): Record<string, unknown> {
  const { id, title, description, status, priority, assignedTo, dueDate, createdAt, ...metadata } = task;
  return metadata;
}

export class PostgresProjectRepository {
  async list(): Promise<AgencyProject[]> {
    const pool = getPostgresPool();
    const [projects, tasks] = await Promise.all([
      pool.query('SELECT * FROM projects ORDER BY created_at DESC'),
      pool.query('SELECT * FROM tasks ORDER BY created_at ASC')
    ]);
    const grouped = new Map<string, ProjectTask[]>();
    for (const row of tasks.rows as Row[]) {
      if (!row.project_id) continue;
      const list = grouped.get(row.project_id) ?? [];
      list.push(mapTask(row));
      grouped.set(row.project_id, list);
    }
    return (projects.rows as Row[]).map(row => mapProject(row, grouped.get(row.id) ?? []));
  }

  async findById(id: string): Promise<AgencyProject | null> {
    const pool = getPostgresPool();
    const [project, tasks] = await Promise.all([
      pool.query('SELECT * FROM projects WHERE id = $1 LIMIT 1', [id]),
      pool.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC', [id])
    ]);
    return project.rows[0] ? mapProject(project.rows[0], (tasks.rows as Row[]).map(mapTask)) : null;
  }

  async create(project: AgencyProject): Promise<AgencyProject> {
    return withPostgresTransaction(async client => {
      if (project.clientId) {
        const linkedClient = await client.query('SELECT id FROM clients WHERE id = $1 LIMIT 1', [project.clientId]);
        if (!linkedClient.rows[0]) throw new Error('Client not found.');
      }
      await client.query(
        `INSERT INTO projects (id,client_id,name,description,status,owner,budget,start_date,end_date,metadata,created_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [project.id, project.clientId || null, project.name, project.notes || null, project.status, project.teamLead || null, project.budget,
         project.startDate || null, project.targetEndDate || null, JSON.stringify(projectMetadata(project)), project.createdAt, project.updatedAt]
      );
      for (const task of project.tasks || []) await this.insertTask(client, project.id, task);
      return project;
    });
  }

  async update(id: string, patch: Partial<AgencyProject>): Promise<AgencyProject | null> {
    return withPostgresTransaction(async client => {
      const currentResult = await client.query('SELECT * FROM projects WHERE id = $1 FOR UPDATE', [id]);
      if (!currentResult.rows[0]) return null;
      const current = currentResult.rows[0] as Row;
      if (patch.updatedAt && iso(current.updated_at) !== patch.updatedAt) throw new ProjectConcurrencyError();
      const tasksResult = await client.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC', [id]);
      const currentProject = mapProject(current, (tasksResult.rows as Row[]).map(mapTask));
      const next = { ...currentProject, ...patch, id, updatedAt: new Date().toISOString() };
      if (next.clientId) {
        const linkedClient = await client.query('SELECT id FROM clients WHERE id = $1 LIMIT 1', [next.clientId]);
        if (!linkedClient.rows[0]) throw new Error('Client not found.');
      }
      await client.query(
        `UPDATE projects SET client_id=$2,name=$3,description=$4,status=$5,owner=$6,budget=$7,start_date=$8,end_date=$9,metadata=$10,updated_at=$11 WHERE id=$1`,
        [id, next.clientId || null, next.name, next.notes || null, next.status, next.teamLead || null, next.budget, next.startDate || null,
         next.targetEndDate || null, JSON.stringify(projectMetadata(next)), next.updatedAt]
      );
      if (patch.tasks !== undefined) {
        await client.query('DELETE FROM tasks WHERE project_id = $1', [id]);
        for (const task of next.tasks || []) await this.insertTask(client, id, task);
      }
      const refreshed = await client.query('SELECT * FROM projects WHERE id = $1', [id]);
      const refreshedTasks = await client.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC', [id]);
      return mapProject(refreshed.rows[0], (refreshedTasks.rows as Row[]).map(mapTask));
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await getPostgresPool().query('DELETE FROM projects WHERE id = $1', [id]);
    return result.rowCount === 1;
  }

  private async insertTask(client: { query: (text: string, values?: unknown[]) => Promise<any> }, projectId: string, task: ProjectTask): Promise<void> {
    await client.query(
      `INSERT INTO tasks (id,project_id,title,description,status,priority,assignee_user_id,due_date,metadata,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,NULL,$7,$8,$9,$9)`,
      [task.id, projectId, task.title, task.description || null, task.status, task.priority || 'medium', task.dueDate || null,
       JSON.stringify({ ...taskMetadata(task), assignedTo: task.assignedTo || '' }), task.createdAt]
    );
  }
}

export const postgresProjectRepository = new PostgresProjectRepository();
