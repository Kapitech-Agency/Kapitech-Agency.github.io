/**
 * Kapitech Agency Management System (AMS)
 * Service Requests & Work Volume Data Store
 */

export type ServiceCategory = 'SEO' | 'Content' | 'Web Dev' | 'Design' | 'Cloud';
export type ServicePriority = 'urgent' | 'high' | 'medium' | 'low';
export type ServiceStatus = 'in_progress' | 'review' | 'completed' | 'pending';

export interface AssignedTeamMember {
  name: string;
  role: string;
  initials: string;
  colorBg: string;
}

export interface ServiceRequest {
  id: string;
  requestId: string; // e.g. "SR-8492"
  title: string;
  clientName: string;
  clientCompany: string;
  serviceType: ServiceCategory;
  priority: ServicePriority;
  assignedMember: AssignedTeamMember;
  status: ServiceStatus;
  createdAt: string;
  dueDate: string;
  estimatedHours: number;
  completedHours: number;
  description: string;
  slaDaysRemaining: number;
}

export interface DailyVolumeData {
  day: string;
  shortDay: string;
  seo: number;
  content: number;
  webDev: number;
  design: number;
  total: number;
}

const STORAGE_KEY = 'kapitech_ams_service_requests_v1';
export const SERVICE_REQUEST_EVENT = 'kapitech_service_requests_updated';

const defaultServiceRequests: ServiceRequest[] = [
  {
    id: 'sr_001',
    requestId: 'SR-8492',
    title: 'Enterprise Technical SEO & Core Web Vitals Audit',
    clientName: 'Marcus Thorne',
    clientCompany: 'Lumina Real Estate Global',
    serviceType: 'SEO',
    priority: 'high',
    assignedMember: {
      name: 'Pratama Wijaya',
      role: 'Lead SEO Architect',
      initials: 'PW',
      colorBg: 'bg-rose-600'
    },
    status: 'in_progress',
    createdAt: '2026-08-28',
    dueDate: '2026-09-03',
    estimatedHours: 24,
    completedHours: 16,
    description: 'Full automated crawl inspection, structured schema markup validation, CWV optimization, and canonical mapping.',
    slaDaysRemaining: 3
  },
  {
    id: 'sr_002',
    requestId: 'SR-8491',
    title: 'Interactive 3D Virtual Estate Tour & Mapbox Integration',
    clientName: 'Aura Luxury Group',
    clientCompany: 'Aura Luxury Estates',
    serviceType: 'Web Dev',
    priority: 'urgent',
    assignedMember: {
      name: 'Kevin Salim',
      role: 'Senior Full-Stack Engineer',
      initials: 'KS',
      colorBg: 'bg-indigo-600'
    },
    status: 'review',
    createdAt: '2026-08-27',
    dueDate: '2026-09-01',
    estimatedHours: 36,
    completedHours: 34,
    description: 'WebGL panoramic viewport rendering with high-resolution texture compression and spatial geo-pins.',
    slaDaysRemaining: 1
  },
  {
    id: 'sr_003',
    requestId: 'SR-8490',
    title: 'Q3 Thought Leadership & Editorial Content Strategy',
    clientName: 'Nathalie Chen',
    clientCompany: 'Nexus Logistics AI',
    serviceType: 'Content',
    priority: 'medium',
    assignedMember: {
      name: 'Sarah Triana',
      role: 'Editorial Director',
      initials: 'ST',
      colorBg: 'bg-purple-600'
    },
    status: 'in_progress',
    createdAt: '2026-08-29',
    dueDate: '2026-09-08',
    estimatedHours: 18,
    completedHours: 8,
    description: '12 pillar articles focusing on APAC automated logistics optimization, distribution models, and case studies.',
    slaDaysRemaining: 8
  },
  {
    id: 'sr_004',
    requestId: 'SR-8489',
    title: 'Fintech Dashboard Design System & Micro-Interactions',
    clientName: 'Hendro Kusuma',
    clientCompany: 'PT Fintek Inovasi Asia',
    serviceType: 'Design',
    priority: 'high',
    assignedMember: {
      name: 'Dian Nugraha',
      role: 'Lead Product Designer',
      initials: 'DN',
      colorBg: 'bg-emerald-600'
    },
    status: 'completed',
    createdAt: '2026-08-22',
    dueDate: '2026-08-30',
    estimatedHours: 40,
    completedHours: 40,
    description: 'Figma component tokens, dark-mode atomic primitives, motion guidelines, and interactive micro-animations.',
    slaDaysRemaining: 0
  },
  {
    id: 'sr_005',
    requestId: 'SR-8488',
    title: 'Zero-Downtime Cloud Migration & Redis Caching Layer',
    clientName: 'Vanguard Studios',
    clientCompany: 'Vanguard Media Group',
    serviceType: 'Cloud',
    priority: 'medium',
    assignedMember: {
      name: 'Budi Hartono',
      role: 'DevOps & SRE Engineer',
      initials: 'BH',
      colorBg: 'bg-cyan-600'
    },
    status: 'pending',
    createdAt: '2026-08-30',
    dueDate: '2026-09-12',
    estimatedHours: 20,
    completedHours: 2,
    description: 'Terraform infrastructure provisioning on Google Cloud Run with Cloud SQL read replicas and CDN caching.',
    slaDaysRemaining: 12
  },
  {
    id: 'sr_006',
    requestId: 'SR-8487',
    title: 'Multilingual Headless CMS Setup & Search Indexing',
    clientName: 'Siti Rahma',
    clientCompany: 'Elysian Hospitality Asia',
    serviceType: 'Web Dev',
    priority: 'low',
    assignedMember: {
      name: 'Kevin Salim',
      role: 'Senior Full-Stack Engineer',
      initials: 'KS',
      colorBg: 'bg-indigo-600'
    },
    status: 'in_progress',
    createdAt: '2026-08-25',
    dueDate: '2026-09-06',
    estimatedHours: 28,
    completedHours: 19,
    description: 'Sanity.io localized schemas with Algolia instant search indexing and dynamic edge routing.',
    slaDaysRemaining: 6
  }
];

export const weeklyVolumeDataset: DailyVolumeData[] = [
  { day: 'Monday', shortDay: 'Mon', seo: 14, content: 18, webDev: 32, design: 20, total: 84 },
  { day: 'Tuesday', shortDay: 'Tue', seo: 22, content: 15, webDev: 38, design: 24, total: 99 },
  { day: 'Wednesday', shortDay: 'Wed', seo: 18, content: 24, webDev: 42, design: 28, total: 112 },
  { day: 'Thursday', shortDay: 'Thu', seo: 28, content: 20, webDev: 48, design: 32, total: 128 },
  { day: 'Friday', shortDay: 'Fri', seo: 25, content: 22, webDev: 40, design: 26, total: 113 },
  { day: 'Saturday', shortDay: 'Sat', seo: 10, content: 8, webDev: 18, design: 12, total: 48 },
  { day: 'Sunday', shortDay: 'Sun', seo: 8, content: 6, webDev: 14, design: 10, total: 38 }
];

export function getServiceRequests(): ServiceRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultServiceRequests));
      return defaultServiceRequests;
    }
    return JSON.parse(raw);
  } catch {
    return defaultServiceRequests;
  }
}

export function saveServiceRequests(requests: ServiceRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent(SERVICE_REQUEST_EVENT, { detail: requests }));
  } catch (err) {
    console.error('Failed to save service requests:', err);
  }
}

export function updateServiceRequestStatus(id: string, status: ServiceStatus): void {
  const list = getServiceRequests();
  const updated = list.map(item => item.id === id ? { ...item, status } : item);
  saveServiceRequests(updated);
}

export function deleteServiceRequest(id: string): void {
  const list = getServiceRequests();
  const updated = list.filter(item => item.id !== id);
  saveServiceRequests(updated);
}

export function addServiceRequest(req: Omit<ServiceRequest, 'id' | 'requestId' | 'createdAt'>): ServiceRequest {
  const list = getServiceRequests();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const newReq: ServiceRequest = {
    ...req,
    id: `sr_${Date.now()}`,
    requestId: `SR-${randNum}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  saveServiceRequests([newReq, ...list]);
  return newReq;
}
