/**
 * Kapitech Agency CRM Data Store
 * Handles Lead & Pipeline Management, Deal Valuations in IDR, Activity Timelines,
 * Notes, and Direct Submissions <-> CRM conversion synchronization.
 */

import { ContactSubmission, getLocalSubmissions } from './submissions';

export type CrmStage = 'new' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type CrmPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CrmServicePillar = 
  | 'Web Development' 
  | 'UI/UX Design' 
  | 'Mobile App' 
  | 'Branding & Identity' 
  | 'AI & Cloud Solutions' 
  | 'Digital Product MVP';

export type CrmSource = 
  | 'Website Form' 
  | 'WhatsApp Direct' 
  | 'Referral' 
  | 'LinkedIn / Outreach' 
  | 'Event / Partner';

export interface CrmNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  type?: 'note' | 'call' | 'meeting' | 'proposal_sent' | 'whatsapp' | 'stage_change';
}

export interface CrmDocumentItem {
  id: string;
  title: string;
  status: 'draft' | 'sent' | 'signed' | 'approved';
  updatedAt: string;
}

export interface CrmLead {
  id: string;
  clientName: string;
  company: string;
  email: string;
  phone: string;
  servicePillar: CrmServicePillar;
  dealValue: number; // in IDR
  stage: CrmStage;
  priority: CrmPriority;
  source: CrmSource;
  description: string;
  inquiryId?: string; // reference to contact submission
  expectedCloseDate?: string;
  assignedTo: string;
  notes: CrmNote[];
  documents?: CrmDocumentItem[];
  createdAt: string;
  updatedAt: string;
}

const CRM_STORAGE_KEY = 'kapitech_agency_crm_leads';
export const CRM_EVENT_NAME = 'kapitech_crm_updated';

export const CRM_STAGE_DEFINITIONS: {
  key: CrmStage;
  label: string;
  labelId: string;
  color: string;
  borderColor: string;
  bgLight: string;
  probability: number;
}[] = [
  {
    key: 'new',
    label: 'New Inbound Lead',
    labelId: 'Prospek Baru',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bgLight: 'bg-rose-950/20',
    probability: 0.1
  },
  {
    key: 'contacted',
    label: 'Initial Contact & Scoping',
    labelId: 'Kontak Awal & Brief',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgLight: 'bg-amber-950/20',
    probability: 0.3
  },
  {
    key: 'proposal',
    label: 'Proposal & Pitch Sent',
    labelId: 'Proposal Dikirim',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgLight: 'bg-blue-950/20',
    probability: 0.6
  },
  {
    key: 'negotiation',
    label: 'Negotiation & SOW',
    labelId: 'Negosiasi Kontrak',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgLight: 'bg-purple-950/20',
    probability: 0.8
  },
  {
    key: 'won',
    label: 'Closed Won',
    labelId: 'Deal Berhasil (Won)',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgLight: 'bg-emerald-950/20',
    probability: 1.0
  },
  {
    key: 'lost',
    label: 'Closed Lost',
    labelId: 'Tidak Lanjut (Lost)',
    color: 'text-zinc-400',
    borderColor: 'border-zinc-500/30',
    bgLight: 'bg-zinc-950/20',
    probability: 0.0
  }
];

// Initial Realistic CRM Deals Seed (in Indonesian Rupiah IDR)
const defaultCrmLeads: CrmLead[] = [
  {
    id: 'crm_deal_01',
    clientName: 'Marcus Thorne',
    company: 'Lumina Real Estate Global',
    email: 'm.thorne@luminarealestate.com',
    phone: '+62 811-9872-441',
    servicePillar: 'Web Development',
    dealValue: 75000000, // Rp 75.000.000
    stage: 'won',
    priority: 'high',
    source: 'Website Form',
    description: 'Pengembangan portal real estate luxury multi-listing headless Next.js dengan optimasi SEO internasional dan integrasi Virtual Tour 360.',
    expectedCloseDate: '2026-08-20',
    assignedTo: 'Lead Full-Stack Tech',
    notes: [
      {
        id: 'n_01',
        author: 'Principal Admin',
        text: 'Kontrak Master Service Agreement dan DP 50% telah diterima. Proyek masuk ke tahap sprint perancangan arsitektur.',
        createdAt: '2026-08-19T10:30:00.000Z',
        type: 'stage_change'
      },
      {
        id: 'n_02',
        author: 'Marcus Thorne',
        text: 'Sangat puas dengan proposal teknis microservices dari tim Kapitech.',
        createdAt: '2026-08-15T14:20:00.000Z',
        type: 'meeting'
      }
    ],
    documents: [
      { id: 'd_01', title: 'Kapitech_Lumina_Signed_SOW.pdf', status: 'signed', updatedAt: '2026-08-19' },
      { id: 'd_02', title: 'Tech_Architecture_Spec_v2.pdf', status: 'approved', updatedAt: '2026-08-16' }
    ],
    createdAt: '2026-08-10T08:00:00.000Z',
    updatedAt: '2026-08-19T10:30:00.000Z'
  },
  {
    id: 'crm_deal_02',
    clientName: 'David Miller',
    company: 'Nexus Fintech Group',
    email: 'david.miller@nexusfin.io',
    phone: '+852 9123-4567',
    servicePillar: 'Mobile App',
    dealValue: 145000000, // Rp 145.000.000
    stage: 'negotiation',
    priority: 'urgent',
    source: 'Referral',
    description: 'Perancangan UI/UX Design System dan arsitektur frontend React Native untuk aplikasi mobile wealth management B2C.',
    expectedCloseDate: '2026-09-10',
    assignedTo: 'Principal UI/UX Lead',
    notes: [
      {
        id: 'n_03',
        author: 'David Miller',
        text: 'Legal team sedang mereview klausul SLA perbankan dan enkripsi AES-256 pada backend.',
        createdAt: '2026-08-28T09:15:00.000Z',
        type: 'meeting'
      },
      {
        id: 'n_04',
        author: 'Principal Admin',
        text: 'Kirim revisi SOW klausul keamanan & jadwal implementasi 12 minggu.',
        createdAt: '2026-08-26T16:00:00.000Z',
        type: 'proposal_sent'
      }
    ],
    documents: [
      { id: 'd_03', title: 'Nexus_Fintech_Commercial_Proposal.pdf', status: 'sent', updatedAt: '2026-08-26' },
      { id: 'd_04', title: 'Mutual_NDA_Nexus_Kapitech.pdf', status: 'signed', updatedAt: '2026-08-14' }
    ],
    createdAt: '2026-08-12T11:00:00.000Z',
    updatedAt: '2026-08-28T09:15:00.000Z'
  },
  {
    id: 'crm_deal_03',
    clientName: 'Elena Rodriguez',
    company: 'Solaris CleanTech',
    email: 'e.rodriguez@solarisclean.com.au',
    phone: '+61 412-345-678',
    servicePillar: 'AI & Cloud Solutions',
    dealValue: 120000000, // Rp 120.000.000
    stage: 'proposal',
    priority: 'high',
    source: 'Website Form',
    description: 'Dashboard telemetri IoT & AI solar farm analytics dengan realtime charting D3/WebGL dan prediksi anomali energi.',
    expectedCloseDate: '2026-09-15',
    assignedTo: 'Lead Cloud & AI Engineer',
    notes: [
      {
        id: 'n_05',
        author: 'Principal Admin',
        text: 'Proposal teknis dan demo prototype interaktif telah dikirim ke Board of Directors.',
        createdAt: '2026-08-27T11:30:00.000Z',
        type: 'proposal_sent'
      }
    ],
    documents: [
      { id: 'd_05', title: 'Solaris_AI_IoT_Proposal_v1.pdf', status: 'sent', updatedAt: '2026-08-27' }
    ],
    createdAt: '2026-08-18T04:00:00.000Z',
    updatedAt: '2026-08-27T11:30:00.000Z'
  },
  {
    id: 'crm_deal_04',
    clientName: 'Sarah Chen',
    company: 'Aura Creative Studio',
    email: 'sarah.chen@auracreative.sg',
    phone: '+65 9876-5432',
    servicePillar: 'Branding & Identity',
    dealValue: 48000000, // Rp 48.000.000
    stage: 'contacted',
    priority: 'medium',
    source: 'LinkedIn / Outreach',
    description: 'Rebranding visual identity, luxury 3D guidelines, typography licensing, dan brand book interactive guidelines.',
    expectedCloseDate: '2026-09-25',
    assignedTo: 'Creative Brand Director',
    notes: [
      {
        id: 'n_06',
        author: 'Principal Admin',
        text: 'Discovery call selesai. Klien meminta estimasi milestone 6 minggu untuk pengerjaan brand book.',
        createdAt: '2026-08-29T14:00:00.000Z',
        type: 'call'
      }
    ],
    documents: [],
    createdAt: '2026-08-22T07:30:00.000Z',
    updatedAt: '2026-08-29T14:00:00.000Z'
  },
  {
    id: 'crm_deal_05',
    clientName: 'Julian Vane',
    company: 'Vivid Commerce Indonesia',
    email: 'julian@vividcommerce.co.id',
    phone: '+62 812-8877-6655',
    servicePillar: 'Web Development',
    dealValue: 65000000, // Rp 65.000.000
    stage: 'new',
    priority: 'high',
    source: 'Website Form',
    description: 'Migrasi e-commerce headless Shopify Plus dengan checkout custom Midtrans, optimasi Core Web Vitals, dan mobile-first UI.',
    expectedCloseDate: '2026-09-30',
    assignedTo: 'Lead Full-Stack Tech',
    notes: [
      {
        id: 'n_07',
        author: 'System',
        text: 'Inbound submission masuk dari formulir website /contact. Perlu penjadwalan Discovery Call.',
        createdAt: '2026-08-30T03:00:00.000Z',
        type: 'note'
      }
    ],
    documents: [],
    createdAt: '2026-08-30T03:00:00.000Z',
    updatedAt: '2026-08-30T03:00:00.000Z'
  },
  {
    id: 'crm_deal_06',
    clientName: 'Michael Kross',
    company: 'Kross Cloud Systems',
    email: 'm.kross@krosscloud.com',
    phone: '+60 12-345-6789',
    servicePillar: 'Digital Product MVP',
    dealValue: 85000000, // Rp 85.000.000
    stage: 'won',
    priority: 'high',
    source: 'WhatsApp Direct',
    description: 'Pengembangan MVP SaaS devops dashboard dengan multi-cloud telemetry exporter dan micro-billing integration.',
    expectedCloseDate: '2026-08-05',
    assignedTo: 'Lead Full-Stack Tech',
    notes: [
      {
        id: 'n_08',
        author: 'Principal Admin',
        text: 'Proyek MVP berhasil di-deliver tepat waktu, klien sedang mempersiapkan fase 2 enterprise scaling.',
        createdAt: '2026-08-05T12:00:00.000Z',
        type: 'stage_change'
      }
    ],
    documents: [
      { id: 'd_06', title: 'Kross_Cloud_Final_Handover_Signoff.pdf', status: 'signed', updatedAt: '2026-08-05' }
    ],
    createdAt: '2026-07-20T08:00:00.000Z',
    updatedAt: '2026-08-05T12:00:00.000Z'
  }
];

export const getCmsLeads = (): CrmLead[] => {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(defaultCrmLeads));
      return defaultCrmLeads;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultCrmLeads;
  } catch (err) {
    console.debug('Error reading CRM leads:', err);
    return defaultCrmLeads;
  }
};

export const saveCrmLead = (lead: CrmLead): void => {
  const current = getCmsLeads();
  const existingIdx = current.findIndex(l => l.id === lead.id);
  const now = new Date().toISOString();
  
  let updated: CrmLead[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = {
      ...lead,
      updatedAt: now
    };
  } else {
    updated = [
      {
        ...lead,
        createdAt: lead.createdAt || now,
        updatedAt: now
      },
      ...current
    ];
  }

  localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(CRM_EVENT_NAME, { detail: updated }));
};

export const deleteCrmLead = (id: string): void => {
  const current = getCmsLeads();
  const filtered = current.filter(l => l.id !== id);
  localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent(CRM_EVENT_NAME, { detail: filtered }));
};

export const updateLeadStage = (id: string, newStage: CrmStage): void => {
  const current = getCmsLeads();
  const lead = current.find(l => l.id === id);
  if (!lead) return;

  const oldStage = lead.stage;
  const stageDef = CRM_STAGE_DEFINITIONS.find(s => s.key === newStage);

  const stageNote: CrmNote = {
    id: 'note_' + Date.now().toString(36),
    author: 'Principal Admin',
    text: `Tahap deal dipindahkan dari '${oldStage.toUpperCase()}' ke '${stageDef?.label || newStage.toUpperCase()}'.`,
    createdAt: new Date().toISOString(),
    type: 'stage_change'
  };

  const updated: CrmLead = {
    ...lead,
    stage: newStage,
    notes: [stageNote, ...(lead.notes || [])],
    updatedAt: new Date().toISOString()
  };

  saveCrmLead(updated);
};

export const addLeadNote = (leadId: string, text: string, type: CrmNote['type'] = 'note'): void => {
  const current = getCmsLeads();
  const lead = current.find(l => l.id === leadId);
  if (!lead) return;

  const newNote: CrmNote = {
    id: 'note_' + Date.now().toString(36),
    author: 'Principal Admin',
    text,
    createdAt: new Date().toISOString(),
    type
  };

  const updated: CrmLead = {
    ...lead,
    notes: [newNote, ...(lead.notes || [])],
    updatedAt: new Date().toISOString()
  };

  saveCrmLead(updated);
};

/**
 * Check if an inbox submission is already converted to a CRM Lead
 */
export const isSubmissionConverted = (inquiryId: string): boolean => {
  const current = getCmsLeads();
  return current.some(l => l.inquiryId === inquiryId);
};

/**
 * Convert any ContactSubmission directly into a high-value CRM Lead
 */
export const convertInquiryToCrmLead = (
  submission: ContactSubmission,
  customValue?: number,
  options?: {
    stage?: CrmStage;
    pillar?: CrmServicePillar;
    assignedTo?: string;
  }
): { success: boolean; lead: CrmLead } => {
  const existing = getCmsLeads().find(l => l.inquiryId === submission.id);
  if (existing) {
    return { success: true, lead: existing };
  }

  // Parse estimated budget to IDR
  let estimatedValue = customValue || 35000000; // default Rp 35.000.000
  if (submission.budget && !customValue) {
    const b = submission.budget.toLowerCase();
    if (b.includes('25,000') || b.includes('50,000') || b.includes('100jt') || b.includes('100m')) {
      estimatedValue = 120000000;
    } else if (b.includes('10,000') || b.includes('25,000') || b.includes('50jt')) {
      estimatedValue = 75000000;
    } else if (b.includes('5,000') || b.includes('15,000') || b.includes('25jt')) {
      estimatedValue = 45000000;
    }
  }

  // Map service
  let pillar: CrmServicePillar = options?.pillar || 'Web Development';
  if (!options?.pillar) {
    const servicesJoined = (submission.services || []).join(' ').toLowerCase() + ' ' + (submission.specialty || '').toLowerCase();
    if (servicesJoined.includes('ui/ux') || servicesJoined.includes('design') || servicesJoined.includes('figma')) {
      pillar = 'UI/UX Design';
    } else if (servicesJoined.includes('mobile') || servicesJoined.includes('app') || servicesJoined.includes('ios') || servicesJoined.includes('android')) {
      pillar = 'Mobile App';
    } else if (servicesJoined.includes('brand') || servicesJoined.includes('logo') || servicesJoined.includes('identity')) {
      pillar = 'Branding & Identity';
    } else if (servicesJoined.includes('ai') || servicesJoined.includes('cloud') || servicesJoined.includes('machine learning')) {
      pillar = 'AI & Cloud Solutions';
    } else if (servicesJoined.includes('mvp') || servicesJoined.includes('saas') || servicesJoined.includes('prototype')) {
      pillar = 'Digital Product MVP';
    }
  }

  const newLead: CrmLead = {
    id: 'crm_' + Date.now().toString(36),
    clientName: submission.fullName,
    company: submission.company || submission.positionTitle || 'Individual Client',
    email: submission.email,
    phone: submission.phone || '',
    servicePillar: pillar,
    dealValue: estimatedValue,
    stage: options?.stage || 'new',
    priority: estimatedValue >= 75000000 ? 'urgent' : estimatedValue >= 45000000 ? 'high' : 'medium',
    source: submission.source === 'Admin Simulated Live Lead' ? 'Referral' : 'Website Form',
    description: submission.message,
    inquiryId: submission.id,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: options?.assignedTo || 'Lead Full-Stack Tech',
    notes: [
      {
        id: 'n_conv_' + Date.now().toString(36),
        author: 'System',
        text: `Lead dikonversi dari Inbound Inbox Form (${submission.type || 'inquiry'}). Pesan awal: "${submission.message.substring(0, 100)}..."`,
        createdAt: new Date().toISOString(),
        type: 'note'
      }
    ],
    documents: [],
    createdAt: submission.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  saveCrmLead(newLead);
  return { success: true, lead: newLead };
};

/**
 * Format IDR currency cleanly
 * e.g. Rp 75.000.000
 */
export const formatIDR = (value: number): string => {
  return 'Rp ' + (value || 0).toLocaleString('id-ID');
};

/**
 * Format short IDR for charts/badges
 * e.g. Rp 75M (Juta)
 */
export const formatShortIDR = (value: number): string => {
  if (value >= 1000000000) {
    return 'Rp ' + (value / 1000000000).toFixed(1) + 'M'; // Miliar
  }
  if (value >= 1000000) {
    return 'Rp ' + (value / 1000000).toFixed(0) + ' Jt'; // Juta
  }
  if (value >= 1000) {
    return 'Rp ' + (value / 1000).toFixed(0) + ' Rb';
  }
  return 'Rp ' + value;
};

/**
 * Compute key agency CRM metrics
 */
export const computeCrmMetrics = (leads: CrmLead[]) => {
  const totalDeals = leads.length;
  
  // Total pipeline value across active non-lost deals
  const activeDeals = leads.filter(l => l.stage !== 'lost');
  const totalPipelineValue = activeDeals.reduce((sum, l) => sum + (l.dealValue || 0), 0);

  // Won value
  const wonDeals = leads.filter(l => l.stage === 'won');
  const totalWonValue = wonDeals.reduce((sum, l) => sum + (l.dealValue || 0), 0);

  // In Negotiation & Proposal
  const inNegotiation = leads.filter(l => l.stage === 'negotiation' || l.stage === 'proposal');
  const negotiationValue = inNegotiation.reduce((sum, l) => sum + (l.dealValue || 0), 0);

  // Weighted pipeline value based on probability
  const weightedPipelineValue = leads.reduce((sum, l) => {
    const stageDef = CRM_STAGE_DEFINITIONS.find(s => s.key === l.stage);
    const prob = stageDef ? stageDef.probability : 0.2;
    return sum + ((l.dealValue || 0) * prob);
  }, 0);

  // Conversion / Win Rate
  const completedDeals = wonDeals.length + leads.filter(l => l.stage === 'lost').length;
  const winRate = completedDeals > 0 
    ? Math.round((wonDeals.length / completedDeals) * 100) 
    : totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0;

  // Average deal size
  const avgDealSize = activeDeals.length > 0
    ? Math.round(totalPipelineValue / activeDeals.length)
    : 0;

  return {
    totalDeals,
    activeDealsCount: activeDeals.length,
    wonDealsCount: wonDeals.length,
    totalPipelineValue,
    totalWonValue,
    negotiationValue,
    weightedPipelineValue,
    winRate,
    avgDealSize
  };
};

/**
 * Export CRM dataset to clean CSV format
 */
export const exportCrmLeadsToCsv = (leads: CrmLead[]): void => {
  const headers = ['ID', 'Client Name', 'Company', 'Email', 'Phone', 'Service Pillar', 'Deal Value (IDR)', 'Stage', 'Priority', 'Source', 'Expected Close Date', 'Created At'];
  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${(l.clientName || '').replace(/"/g, '""')}"`,
    `"${(l.company || '').replace(/"/g, '""')}"`,
    `"${l.email || ''}"`,
    `"${l.phone || ''}"`,
    `"${l.servicePillar || ''}"`,
    l.dealValue || 0,
    `"${l.stage}"`,
    `"${l.priority}"`,
    `"${l.source}"`,
    `"${l.expectedCloseDate || ''}"`,
    `"${l.createdAt}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kapitech_agency_crm_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
