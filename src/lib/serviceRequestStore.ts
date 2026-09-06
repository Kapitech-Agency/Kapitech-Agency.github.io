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

const STORAGE_KEY = 'kapitech_ams_service_requests_v2';
export const SERVICE_REQUEST_EVENT = 'kapitech_service_requests_updated';

const defaultServiceRequests: ServiceRequest[] = [];

export const weeklyVolumeDataset: DailyVolumeData[] = [
  { day: 'Monday', shortDay: 'Mon', seo: 0, content: 0, webDev: 0, design: 0, total: 0 },
  { day: 'Tuesday', shortDay: 'Tue', seo: 0, content: 0, webDev: 0, design: 0, total: 0 },
  { day: 'Wednesday', shortDay: 'Wed', seo: 0, content: 0, webDev: 0, design: 0, total: 0 },
  { day: 'Thursday', shortDay: 'Thu', seo: 0, content: 0, webDev: 0, design: 0, total: 0 },
  { day: 'Friday', shortDay: 'Fri', seo: 0, content: 0, webDev: 0, design: 0, total: 0 },
  { day: 'Saturday', shortDay: 'Sat', seo: 0, content: 0, webDev: 0, design: 0, total: 0 },
  { day: 'Sunday', shortDay: 'Sun', seo: 0, content: 0, webDev: 0, design: 0, total: 0 }
];

export function getServiceRequests(): ServiceRequest[] {
  try {
    if (localStorage.getItem('kapitech_ams_service_requests_v1')) {
      localStorage.removeItem('kapitech_ams_service_requests_v1');
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
