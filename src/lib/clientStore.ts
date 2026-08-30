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
  createdAt: string;
  updatedAt: string;
}

const CLIENTS_STORAGE_KEY = 'kapitech_agency_clients_v1';
export const CLIENT_EVENT_NAME = 'kapitech_clients_updated';

const defaultClients: AgencyClient[] = [
  {
    id: 'client_001',
    name: 'Marcus Thorne',
    company: 'Lumina Real Estate Global',
    email: 'm.thorne@luminarealestate.com',
    phone: '+62 811-9872-441',
    website: 'https://luminarealestate.com',
    location: 'Jakarta, Indonesia',
    industry: 'Real Estate & Luxury Property',
    status: 'active',
    totalSpend: 75000000,
    projectsCount: 1,
    contactPersonRole: 'Managing Director',
    notes: 'Premium luxury developer. Very responsive on WhatsApp and prefers bi-weekly sprint demos.',
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'client_002',
    name: 'David Miller',
    company: 'Nexus Fintech Group',
    email: 'david.miller@nexusfin.io',
    phone: '+852 9123-4567',
    website: 'https://nexusfin.io',
    location: 'Hong Kong',
    industry: 'Financial Technology / Wealth Management',
    status: 'active',
    totalSpend: 145000000,
    projectsCount: 1,
    contactPersonRole: 'Head of Product',
    notes: 'Bank-grade compliance requirements. Security & AES-256 encryption are top priorities.',
    createdAt: '2026-08-12T11:00:00.000Z',
    updatedAt: '2026-08-28T09:00:00.000Z'
  },
  {
    id: 'client_003',
    name: 'Michael Kross',
    company: 'Kross Cloud Systems',
    email: 'm.kross@krosscloud.com',
    phone: '+60 12-345-6789',
    website: 'https://krosscloud.com',
    location: 'Kuala Lumpur, Malaysia',
    industry: 'Cloud Infrastructure & DevOps',
    status: 'completed',
    totalSpend: 85000000,
    projectsCount: 1,
    contactPersonRole: 'Chief Technology Officer',
    notes: 'Phase 1 MVP completed successfully. Discussing retainer for automated telemetry alerting.',
    createdAt: '2026-07-20T08:00:00.000Z',
    updatedAt: '2026-08-05T12:00:00.000Z'
  },
  {
    id: 'client_004',
    name: 'Sarah Chen',
    company: 'Aura Creative Studio',
    email: 'sarah.chen@auracreative.sg',
    phone: '+65 9876-5432',
    website: 'https://auracreative.sg',
    location: 'Singapore',
    industry: 'Creative & Fashion Design',
    status: 'active',
    totalSpend: 48000000,
    projectsCount: 1,
    contactPersonRole: 'Creative Director',
    notes: 'Brand guideline refresh & interactive 3D typography specs.',
    createdAt: '2026-08-22T07:30:00.000Z',
    updatedAt: '2026-08-29T14:00:00.000Z'
  },
  {
    id: 'client_005',
    name: 'Elena Rodriguez',
    company: 'Solaris CleanTech',
    email: 'e.rodriguez@solarisclean.com.au',
    phone: '+61 412-345-678',
    website: 'https://solarisclean.com.au',
    location: 'Melbourne, Australia',
    industry: 'Renewable Energy & IoT',
    status: 'lead',
    totalSpend: 120000000,
    projectsCount: 1,
    contactPersonRole: 'Operations VP',
    notes: 'Scoping telemetry visualization across 40+ solar farm stations in APAC.',
    createdAt: '2026-08-18T04:00:00.000Z',
    updatedAt: '2026-08-27T11:00:00.000Z'
  }
];

export const getAgencyClients = (): AgencyClient[] => {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(defaultClients));
      return defaultClients;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultClients;
  } catch {
    return defaultClients;
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
