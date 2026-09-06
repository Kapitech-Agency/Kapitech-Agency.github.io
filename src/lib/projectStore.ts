/**
 * Kapitech Agency Project & Task Execution Store
 * Tracks active development/design projects converted from CRM Won deals,
 * Kanban Task Boards (To Do, In Progress, Review, Done), Milestones, and Assigned Team members.
 */

export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  subtasks?: TaskSubtask[];
  tags?: string[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  paymentTrigger?: number; // amount in IDR
}

export interface AgencyProject {
  id: string;
  name: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  crmLeadId?: string;
  serviceCategory: string;
  status: ProjectStatus;
  budget: number; // in IDR
  progressPercent: number;
  startDate: string;
  targetEndDate: string;
  teamLead: string;
  teamMembers: string[];
  techStack: string[];
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  repositoryUrl?: string;
  figmaUrl?: string;
  liveStagingUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const PROJECTS_STORAGE_KEY = 'kapitech_agency_active_projects_v2';
export const PROJECT_EVENT_NAME = 'kapitech_projects_updated';

const defaultProjects: AgencyProject[] = [];

export const getAgencyProjects = (): AgencyProject[] => {
  try {
    if (localStorage.getItem('kapitech_agency_active_projects_v1')) {
      localStorage.removeItem('kapitech_agency_active_projects_v1');
    }
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getActiveProjects = getAgencyProjects;

export const saveAgencyProject = (project: AgencyProject): void => {
  const current = getAgencyProjects();
  const idx = current.findIndex(p => p.id === project.id);
  const now = new Date().toISOString();

  let updated: AgencyProject[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...project, updatedAt: now };
  } else {
    updated = [{ ...project, createdAt: project.createdAt || now, updatedAt: now }, ...current];
  }

  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(PROJECT_EVENT_NAME, { detail: updated }));
};

export const deleteAgencyProject = (id: string): void => {
  const current = getAgencyProjects();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(PROJECT_EVENT_NAME, { detail: updated }));
};

export const updateTaskStatus = (projectId: string, taskId: string, newStatus: TaskStatus): void => {
  const current = getAgencyProjects();
  const proj = current.find(p => p.id === projectId);
  if (!proj) return;

  const updatedTasks = proj.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
  const updated: AgencyProject = {
    ...proj,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString()
  };

  saveAgencyProject(updated);
};
