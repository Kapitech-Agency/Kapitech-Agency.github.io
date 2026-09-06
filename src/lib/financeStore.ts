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

const INVOICE_STORAGE_KEY = 'kapitech_agency_invoices_v2';
const EXPENSE_STORAGE_KEY = 'kapitech_agency_expenses_v2';
export const FINANCE_EVENT_NAME = 'kapitech_finance_updated';

const defaultInvoices: AgencyInvoice[] = [];
const defaultExpenses: AgencyExpense[] = [];

export const getAgencyInvoices = (): AgencyInvoice[] => {
  try {
    if (localStorage.getItem('kapitech_agency_invoices_v1')) {
      localStorage.removeItem('kapitech_agency_invoices_v1');
    }
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
    if (localStorage.getItem('kapitech_agency_expenses_v1')) {
      localStorage.removeItem('kapitech_agency_expenses_v1');
    }
    const raw = localStorage.getItem(EXPENSE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
