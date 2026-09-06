/**
 * Kapitech Agency Client Directory Store
 * Centralized client records database with associated projects, invoices history,
 * feedback/testimonials, direct contact info, and lifetime value tracking.
 */

export interface AgencyClient {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  location: string;
  industry: string;
  status: 'active' | 'completed' | 'lead' | 'inactive';
  totalSpend: number; // in IDR
  projectsCount: number;
  contactPersonRole: string;
  notes?: string;
  avatarUrl?: string;
  slaDailyAdSpendBudget?: number; // agreed daily ad spend SLA cap in IDR
  currentDailyAdSpend?: number; // current actual daily ad spend in IDR
  createdAt: string;
  updatedAt: string;
}

const CLIENTS_STORAGE_KEY = 'kapitech_agency_clients_v2';
export const CLIENT_EVENT_NAME = 'kapitech_clients_updated';

const defaultClients: AgencyClient[] = [];

export const getAgencyClients = (): AgencyClient[] => {
  try {
    if (localStorage.getItem('kapitech_agency_clients_v1')) {
      localStorage.removeItem('kapitech_agency_clients_v1');
    }
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveAgencyClient = (client: AgencyClient): void => {
  const current = getAgencyClients();
  const idx = current.findIndex(c => c.id === client.id);
  const now = new Date().toISOString();

  let updated: AgencyClient[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...client, updatedAt: now };
  } else {
    updated = [{ ...client, createdAt: client.createdAt || now, updatedAt: now }, ...current];
  }

  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(CLIENT_EVENT_NAME, { detail: updated }));
};

export const deleteAgencyClient = (id: string): void => {
  const current = getAgencyClients();
  const updated = current.filter(c => c.id !== id);
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(CLIENT_EVENT_NAME, { detail: updated }));
};
