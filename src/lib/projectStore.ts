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

const PROJECTS_STORAGE_KEY = 'kapitech_agency_active_projects_v1';
export const PROJECT_EVENT_NAME = 'kapitech_projects_updated';

const defaultProjects: AgencyProject[] = [
  {
    id: 'proj_001',
    name: 'Lumina Luxury Real Estate Headless Web Platform',
    clientName: 'Marcus Thorne',
    clientCompany: 'Lumina Real Estate Global',
    clientEmail: 'm.thorne@luminarealestate.com',
    crmLeadId: 'crm_deal_01',
    serviceCategory: 'Web Development',
    status: 'in_progress',
    budget: 75000000,
    progressPercent: 65,
    startDate: '2026-08-15',
    targetEndDate: '2026-09-30',
    teamLead: 'Lead Full-Stack Tech',
    teamMembers: ['Senior Frontend Dev', 'UI/UX Specialist', 'DevOps Engineer'],
    techStack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Mapbox GL'],
    repositoryUrl: 'https://github.com/kapitech-agency/lumina-real-estate',
    figmaUrl: 'https://figma.com/@kapitech/lumina-design-system',
    liveStagingUrl: 'https://staging.lumina.kapitech.id',
    notes: 'Sprint 2 frontend underway. Virtual 360 viewer integration scheduled for next week.',
    milestones: [
      { id: 'm_1', title: 'Architecture Specification & Wireframing', dueDate: '2026-08-20', completed: true, paymentTrigger: 37500000 },
      { id: 'm_2', title: 'Interactive Frontend & 360 Tour Viewer', dueDate: '2026-09-10', completed: false },
      { id: 'm_3', title: 'CMS Integration & SEO Final Audit', dueDate: '2026-09-25', completed: false, paymentTrigger: 37500000 },
      { id: 'm_4', title: 'Production Go-Live & Staff Handover', dueDate: '2026-09-30', completed: false }
    ],
    tasks: [
      {
        id: 't_101',
        title: 'Optimize Core Web Vitals LCP & Image Loader',
        description: 'Implement Next/Image modern WebP/AVIF compression with blur hash placeholders.',
        status: 'done',
        priority: 'high',
        assignedTo: 'Senior Frontend Dev',
        dueDate: '2026-08-28',
        createdAt: '2026-08-20T08:00:00.000Z',
        subtasks: [
          { id: 'st_1', title: 'Audit bundle size and code splits', completed: true },
          { id: 'st_2', title: 'Configure Sharp WebP image loader', completed: true },
          { id: 'st_3', title: 'Test Lighthouse score >= 95', completed: true }
        ],
        tags: ['Performance', 'Frontend']
      },
      {
        id: 't_102',
        title: 'Setup Mapbox Vector Tile Cluster for 500+ Properties',
        description: 'Integrate dynamic clustering on interactive property search map.',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'Senior Frontend Dev',
        dueDate: '2026-09-05',
        createdAt: '2026-08-22T08:00:00.000Z',
        subtasks: [
          { id: 'st_4', title: 'Connect Mapbox GL SDK with token', completed: true },
          { id: 'st_5', title: 'Build custom property pin popup marker', completed: false },
          { id: 'st_6', title: 'Spatial bounding box query API', completed: false }
        ],
        tags: ['Maps', 'Interactive']
      },
      {
        id: 't_103',
        title: 'Virtual 360 Matterport Canvas Embed Component',
        description: 'Create responsive webgl canvas container for luxury penthouse virtual walk-throughs.',
        status: 'todo',
        priority: 'urgent',
        assignedTo: 'UI/UX Specialist',
        dueDate: '2026-09-08',
        createdAt: '2026-08-25T08:00:00.000Z',
        subtasks: [
          { id: 'st_7', title: 'Matterport iframe and direct WebGL wrapper', completed: false },
          { id: 'st_8', title: 'Touch gesture zoom controls on mobile', completed: false }
        ],
        tags: ['3D Tour', 'WebGL']
      },
      {
        id: 't_104',
        title: 'Headless CMS Schema Definition for Penthouse Listings',
        description: 'Configure localized fields for specs, price in IDR/USD, and high-res asset galleries.',
        status: 'review',
        priority: 'medium',
        assignedTo: 'Lead Full-Stack Tech',
        dueDate: '2026-09-02',
        createdAt: '2026-08-21T08:00:00.000Z',
        subtasks: [
          { id: 'st_9', title: 'Create Sanity/Strapi content models', completed: true },
          { id: 'st_10', title: 'Setup revalidation webhook', completed: true }
        ],
        tags: ['Backend', 'CMS']
      }
    ],
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-29T16:00:00.000Z'
  },
  {
    id: 'proj_002',
    name: 'Kross Cloud SaaS DevOps Telemetry MVP',
    clientName: 'Michael Kross',
    clientCompany: 'Kross Cloud Systems',
    clientEmail: 'm.kross@krosscloud.com',
    crmLeadId: 'crm_deal_06',
    serviceCategory: 'Digital Product MVP',
    status: 'completed',
    budget: 85000000,
    progressPercent: 100,
    startDate: '2026-07-20',
    targetEndDate: '2026-08-05',
    teamLead: 'Lead Full-Stack Tech',
    teamMembers: ['Cloud & AI Engineer', 'Backend Go Specialist'],
    techStack: ['React', 'Go', 'Docker', 'Prometheus', 'Tailwind CSS'],
    repositoryUrl: 'https://github.com/kapitech-agency/kross-telemetry',
    liveStagingUrl: 'https://app.krosscloud.com',
    notes: 'Project successfully handed over. Phase 2 scoping in discussion.',
    milestones: [
      { id: 'm_21', title: 'Architecture & Docker Clusters', dueDate: '2026-07-25', completed: true },
      { id: 'm_22', title: 'Realtime WebSocket Telemetry', dueDate: '2026-08-01', completed: true },
      { id: 'm_23', title: 'Production Handover & Documentation', dueDate: '2026-08-05', completed: true, paymentTrigger: 85000000 }
    ],
    tasks: [
      {
        id: 't_201',
        title: 'Production Docker image hardening and CIS benchmark audit',
        status: 'done',
        priority: 'high',
        assignedTo: 'Cloud & AI Engineer',
        dueDate: '2026-08-04',
        createdAt: '2026-07-28T08:00:00.000Z'
      }
    ],
    createdAt: '2026-07-20T08:00:00.000Z',
    updatedAt: '2026-08-05T12:00:00.000Z'
  }
];

export const getAgencyProjects = (): AgencyProject[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(defaultProjects));
      return defaultProjects;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultProjects;
  } catch {
    return defaultProjects;
  }
};

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
