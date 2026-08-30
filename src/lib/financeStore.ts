/**
 * Kapitech Agency Invoicing & Financials Store
 * Handles client invoice generation, payment status tracking (Draft, Sent, Paid, Overdue),
 * expenses, and financial KPI metrics calculation.
 */

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // in IDR
  amount: number;
}

export interface AgencyInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone?: string;
  projectId?: string;
  leadId?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  taxPercent: number; // e.g. 11% PPN in Indonesia
  taxAmount: number;
  total: number;
  currency: 'IDR' | 'USD';
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyExpense {
  id: string;
  category: 'Software & Cloud' | 'Salaries & Contractors' | 'Office & Hardware' | 'Marketing & Ads' | 'Legal & Admin';
  description: string;
  amount: number;
  date: string;
  receiptUrl?: string;
  recordedBy: string;
}

const INVOICE_STORAGE_KEY = 'kapitech_agency_invoices_v1';
const EXPENSE_STORAGE_KEY = 'kapitech_agency_expenses_v1';
export const FINANCE_EVENT_NAME = 'kapitech_finance_updated';

const defaultInvoices: AgencyInvoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'KAPI-INV-2026-081',
    clientName: 'Marcus Thorne',
    clientCompany: 'Lumina Real Estate Global',
    clientEmail: 'm.thorne@luminarealestate.com',
    clientPhone: '+62 811-9872-441',
    leadId: 'crm_deal_01',
    items: [
      {
        id: 'item_1',
        description: 'Next.js Luxury Real Estate Portal - Sprint 1 & 2 Architecture & Frontend (50% Down Payment)',
        quantity: 1,
        unitPrice: 37500000,
        amount: 37500000
      }
    ],
    subtotal: 37500000,
    taxPercent: 11,
    taxAmount: 4125000,
    total: 41625000,
    currency: 'IDR',
    status: 'paid',
    issueDate: '2026-08-18',
    dueDate: '2026-08-25',
    paidDate: '2026-08-20',
    notes: 'DP 50% Milestone Received via Bank Mandiri Escrow. Thank you for partnering with Kapitech.',
    paymentTerms: 'Bank Transfer Net 7',
    createdAt: '2026-08-18T09:00:00.000Z',
    updatedAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'inv_002',
    invoiceNumber: 'KAPI-INV-2026-082',
    clientName: 'Michael Kross',
    clientCompany: 'Kross Cloud Systems',
    clientEmail: 'm.kross@krosscloud.com',
    clientPhone: '+60 12-345-6789',
    leadId: 'crm_deal_06',
    items: [
      {
        id: 'item_2',
        description: 'MVP DevOps SaaS Dashboard - Final Release & Handover Sign-off (100% Full Payment)',
        quantity: 1,
        unitPrice: 85000000,
        amount: 85000000
      }
    ],
    subtotal: 85000000,
    taxPercent: 11,
    taxAmount: 9350000,
    total: 94350000,
    currency: 'IDR',
    status: 'paid',
    issueDate: '2026-08-04',
    dueDate: '2026-08-11',
    paidDate: '2026-08-05',
    notes: 'Final Sign-off completed and source code transferred to client AWS production.',
    paymentTerms: 'International Wire Net 7',
    createdAt: '2026-08-04T08:00:00.000Z',
    updatedAt: '2026-08-05T12:00:00.000Z'
  },
  {
    id: 'inv_003',
    invoiceNumber: 'KAPI-INV-2026-083',
    clientName: 'David Miller',
    clientCompany: 'Nexus Fintech Group',
    clientEmail: 'david.miller@nexusfin.io',
    clientPhone: '+852 9123-4567',
    leadId: 'crm_deal_02',
    items: [
      {
        id: 'item_3',
        description: 'React Native Wealth Management Mobile App - Milestone 1 UX & Architecture Spec',
        quantity: 1,
        unitPrice: 50000000,
        amount: 50000000
      }
    ],
    subtotal: 50000000,
    taxPercent: 11,
    taxAmount: 5500000,
    total: 55500000,
    currency: 'IDR',
    status: 'sent',
    issueDate: '2026-08-25',
    dueDate: '2026-09-08',
    notes: 'Invoice sent for initial discovery sprint kick-off.',
    paymentTerms: 'Bank Transfer Net 14',
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z'
  },
  {
    id: 'inv_004',
    invoiceNumber: 'KAPI-INV-2026-079',
    clientName: 'Sarah Chen',
    clientCompany: 'Aura Creative Studio',
    clientEmail: 'sarah.chen@auracreative.sg',
    clientPhone: '+65 9876-5432',
    leadId: 'crm_deal_04',
    items: [
      {
        id: 'item_4',
        description: 'Brand Identity System & Interactive Guidelines Design Retainer',
        quantity: 1,
        unitPrice: 24000000,
        amount: 24000000
      }
    ],
    subtotal: 24000000,
    taxPercent: 11,
    taxAmount: 2640000,
    total: 26640000,
    currency: 'IDR',
    status: 'overdue',
    issueDate: '2026-08-01',
    dueDate: '2026-08-15',
    notes: 'Payment reminder sent via email and WhatsApp to Finance team.',
    paymentTerms: 'Net 14',
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-16T08:00:00.000Z'
  }
];

const defaultExpenses: AgencyExpense[] = [
  {
    id: 'exp_001',
    category: 'Software & Cloud',
    description: 'Vercel Enterprise, Google Cloud Run & AWS Telemetry Clusters',
    amount: 8500000,
    date: '2026-08-01',
    recordedBy: 'Admin'
  },
  {
    id: 'exp_002',
    category: 'Software & Cloud',
    description: 'Figma Enterprise Organization & JetBrains IDE Team Seats',
    amount: 4200000,
    date: '2026-08-05',
    recordedBy: 'Admin'
  },
  {
    id: 'exp_003',
    category: 'Salaries & Contractors',
    description: 'Senior UI/UX Specialist Contract Retainer (August)',
    amount: 22000000,
    date: '2026-08-25',
    recordedBy: 'Admin'
  },
  {
    id: 'exp_004',
    category: 'Marketing & Ads',
    description: 'LinkedIn B2B Ads & Digital PR Sponsorship',
    amount: 5500000,
    date: '2026-08-12',
    recordedBy: 'Admin'
  }
];

export const getAgencyInvoices = (): AgencyInvoice[] => {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(defaultInvoices));
      return defaultInvoices;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultInvoices;
  } catch {
    return defaultInvoices;
  }
};

export const saveAgencyInvoice = (invoice: AgencyInvoice): void => {
  const current = getAgencyInvoices();
  const idx = current.findIndex(i => i.id === invoice.id);
  const now = new Date().toISOString();

  let updated: AgencyInvoice[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...invoice, updatedAt: now };
  } else {
    updated = [{ ...invoice, createdAt: invoice.createdAt || now, updatedAt: now }, ...current];
  }

  localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(FINANCE_EVENT_NAME, { detail: updated }));
};

export const deleteAgencyInvoice = (id: string): void => {
  const current = getAgencyInvoices();
  const updated = current.filter(i => i.id !== id);
  localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(FINANCE_EVENT_NAME, { detail: updated }));
};

export const updateInvoiceStatus = (id: string, status: InvoiceStatus): void => {
  const current = getAgencyInvoices();
  const inv = current.find(i => i.id === id);
  if (!inv) return;

  const now = new Date().toISOString();
  const updated: AgencyInvoice = {
    ...inv,
    status,
    paidDate: status === 'paid' ? now.split('T')[0] : inv.paidDate,
    updatedAt: now
  };

  saveAgencyInvoice(updated);
};

export const getAgencyExpenses = (): AgencyExpense[] => {
  try {
    const raw = localStorage.getItem(EXPENSE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(defaultExpenses));
      return defaultExpenses;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultExpenses;
  } catch {
    return defaultExpenses;
  }
};

export const saveAgencyExpense = (expense: AgencyExpense): void => {
  const current = getAgencyExpenses();
  const idx = current.findIndex(e => e.id === expense.id);

  let updated: AgencyExpense[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = expense;
  } else {
    updated = [expense, ...current];
  }

  localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(FINANCE_EVENT_NAME, { detail: updated }));
};

export const deleteAgencyExpense = (id: string): void => {
  const current = getAgencyExpenses();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(FINANCE_EVENT_NAME, { detail: updated }));
};

export const computeFinancialMetrics = (invoices: AgencyInvoice[], expenses: AgencyExpense[]) => {
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const sentInvoices = invoices.filter(i => i.status === 'sent');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');

  const totalPaidRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalOutstanding = sentInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = totalPaidRevenue - totalExpenses;

  return {
    totalInvoicesCount: invoices.length,
    paidCount: paidInvoices.length,
    sentCount: sentInvoices.length,
    overdueCount: overdueInvoices.length,
    totalPaidRevenue,
    totalOutstanding,
    totalOverdue,
    totalExpenses,
    netOperatingProfit,
    collectionRate: invoices.length > 0 ? Math.round((paidInvoices.length / invoices.length) * 100) : 0
  };
};
