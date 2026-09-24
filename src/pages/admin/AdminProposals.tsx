import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Receipt, 
  Building2, 
  Calendar, 
  Trash2, 
  X, 
  Send, 
  ShieldCheck, 
  Eye, 
  Download,
  Loader2
} from 'lucide-react';
import { api } from '../../lib/apiClient';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, formatAmount, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';
import { getAdminSession, hasAdminPermission } from '../../lib/adminAuth';

interface ProposalLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Proposal {
  id: string;
  proposalNumber: string;
  title: string;
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
  status: 'draft' | 'review' | 'approved' | 'sent' | 'accepted' | 'rejected';
  lineItems: ProposalLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentTerms?: string;
  validUntil: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  invoiceId?: string;
}

const PROPOSAL_STATUS_TO_API: Record<Proposal['status'], string> = {
  draft: 'Draft',
  review: 'Internal Review',
  approved: 'Approved',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected'
};

function normalizeProposalStatus(value: unknown): Proposal['status'] {
  switch (String(value || '').trim().toLowerCase()) {
    case 'review':
    case 'internal review':
    case 'internal_review':
      return 'review';
    case 'approved':
      return 'approved';
    case 'sent':
      return 'sent';
    case 'accepted':
      return 'accepted';
    case 'rejected':
      return 'rejected';
    case 'draft':
    default:
      return 'draft';
  }
}

function normalizeProposal(raw: any): Proposal {
  return {
    id: String(raw.id || ''),
    proposalNumber: String(raw.proposalNumber || ''),
    title: String(raw.title || ''),
    clientName: String(raw.clientName || raw.name || ''),
    clientEmail: String(raw.clientEmail || raw.email || ''),
    clientCompany: String(raw.clientCompany || raw.company || ''),
    status: normalizeProposalStatus(raw.status),
    lineItems: Array.isArray(raw.lineItems || raw.items) ? (raw.lineItems || raw.items).map((item: any) => ({
      id: String(item.id || ''),
      description: String(item.description || ''),
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total ?? item.amount ?? ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)))
    })) : [],
    subtotal: Number(raw.subtotal) || 0,
    discount: Number(raw.discount) || 0,
    tax: Number(raw.tax ?? raw.taxAmount) || 0,
    total: Number(raw.total) || 0,
    paymentTerms: raw.paymentTerms,
    validUntil: String(raw.validUntil || raw.validityPeriod || ''),
    createdAt: String(raw.createdAt || raw.createdDate || new Date().toISOString()),
    approvedBy: raw.approvedBy,
    approvedAt: raw.approvedAt,
    invoiceId: raw.invoiceId || raw.invoice?.id
  };
}

export const AdminProposals: React.FC = () => {
  const { language, t } = useLanguage();
  const session = getAdminSession();
  const canManageCrm = hasAdminPermission('canManageCrm');
  const canManageInvoices = hasAdminPermission('canManageInvoices');
  const canApproveBudgets = hasAdminPermission('canApproveBudgets');
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new proposal
  const [formTitle, setFormTitle] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formClientCompany, setFormClientCompany] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formPaymentTerms, setFormPaymentTerms] = useState('50% Upfront, 50% on Delivery');
  const [formValidDays, setFormValidDays] = useState(30);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formTaxRate, setFormTaxRate] = useState(11); // 11% PPN in Indonesia
  const [formItems, setFormItems] = useState<Array<{ id: string; description: string; quantity: number; unitPrice: number }>>([
    { id: '1', description: 'Enterprise Full-Stack Architecture & Design', quantity: 1, unitPrice: 75000000 }
  ]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const handleCurrency = (e: Event) => {
      const custom = e as CustomEvent<{ currency: CurrencyCode }>;
      if (custom.detail?.currency) {
        setCurrency(custom.detail.currency);
      }
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrency);
    return () => window.removeEventListener(CURRENCY_EVENT, handleCurrency);
  }, []);

  const loadProposals = async () => {
    setIsLoading(true);
    try {
      const res = await api.proposals.getAll();
      if (res.success && res.data?.proposals) {
        const normalized = res.data.proposals.map(normalizeProposal);
        setProposals(normalized);
      }
    } catch {
      showToast('Failed to load proposals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  // Calculated form subtotal
  const formSubtotal = useMemo(() => {
    return formItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }, [formItems]);

  const formTax = useMemo(() => {
    const afterDiscount = Math.max(0, formSubtotal - formDiscount);
    return (afterDiscount * formTaxRate) / 100;
  }, [formSubtotal, formDiscount, formTaxRate]);

  const formTotal = useMemo(() => {
    return Math.max(0, formSubtotal - formDiscount) + formTax;
  }, [formSubtotal, formDiscount, formTax]);

  const handleAddItem = () => {
    setFormItems(prev => [
      ...prev,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (formItems.length === 1) return;
    setFormItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: 'description' | 'quantity' | 'unitPrice', val: any) => {
    setFormItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCrm) {
      showToast(language === 'id' ? 'Anda tidak memiliki izin mengelola proposal.' : 'You do not have permission to manage proposals.');
      return;
    }
    if (!formTitle.trim() || !formClientName.trim()) {
      showToast('Please fill in title and client name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle,
        clientName: formClientName,
        company: formClientCompany,
        clientEmail: formClientEmail,
        paymentTerms: formPaymentTerms,
        validityPeriod: `${Number(formValidDays)} Days`,
        currency: currency,
        discount: Number(formDiscount),
        taxPercent: Number(formTaxRate),
        items: formItems.map(item => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      };

      const res = await api.proposals.create(payload);
      if (res.success && res.data?.proposal) {
        setProposals(prev => [normalizeProposal(res.data.proposal), ...prev]);
        setIsCreateModalOpen(false);
        showToast(language === 'id' ? 'Proposal berhasil diterbitkan!' : 'Proposal created successfully!');
        // Reset form
        setFormTitle('');
        setFormClientName('');
        setFormClientCompany('');
        setFormClientEmail('');
      } else {
        showToast(res.error || 'Failed to create proposal.');
      }
    } catch {
      showToast('Error creating proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveProposal = async (id: string) => {
    if (!canApproveBudgets) {
      showToast(language === 'id' ? 'Anda tidak memiliki izin persetujuan.' : 'You do not have approval permission.');
      return;
    }
    try {
      const res = await api.proposals.approve(id);
      if (res.success && res.data?.proposal) {
        const normalized = normalizeProposal(res.data.proposal);
        setProposals(prev => prev.map(p => p.id === id ? normalized : p));
        showToast(language === 'id' ? 'Proposal disetujui secara internal.' : 'Proposal approved internally.');
      } else {
        showToast(res.error || 'Approval failed.');
      }
    } catch {
      showToast('Approval action failed.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: Proposal['status']) => {
    if (!canManageCrm) {
      showToast(language === 'id' ? 'Anda tidak memiliki izin mengubah proposal.' : 'You do not have permission to update proposals.');
      return;
    }
    if (['approved', 'rejected'].includes(newStatus) && !canApproveBudgets) {
      showToast(language === 'id'
        ? 'Status Approved/Rejected hanya dapat diubah oleh user dengan hak Approval.'
        : 'Approved/Rejected status requires approval permission.');
      return;
    }
    try {
      const apiStatus = PROPOSAL_STATUS_TO_API[newStatus];
      const res = await api.proposals.update(id, { status: apiStatus });
      if (res.success && res.data?.proposal) {
        const normalized = normalizeProposal(res.data.proposal);
        setProposals(prev => prev.map(p => p.id === id ? normalized : p));
        showToast(`${language === 'id' ? 'Status diubah ke' : 'Status changed to'} ${normalized.status}`);
      }
    } catch {
      showToast('Failed to update status.');
    }
  };

  const handleConvertToInvoice = async (id: string) => {
    if (!canManageInvoices) {
      showToast(language === 'id' ? 'Anda tidak memiliki izin membuat invoice.' : 'You do not have invoice permission.');
      return;
    }
    if (!window.confirm(language === 'id' ? 'Konversi proposal ini menjadi invoice resmi?' : 'Convert this approved proposal to an official invoice?')) {
      return;
    }

    try {
      const res = await api.proposals.convertToInvoice(id);
      if (res.success && res.data?.invoice) {
        showToast(language === 'id' ? `Invoice diterbitkan: ${res.data.invoice.invoiceNumber}` : `Invoice issued: ${res.data.invoice.invoiceNumber}`);
        loadProposals();
      } else {
        showToast(res.error || 'Failed to convert proposal to invoice.');
      }
    } catch {
      showToast('Error converting to invoice.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!canManageCrm) {
      showToast(language === 'id' ? 'Anda tidak memiliki izin menghapus proposal.' : 'You do not have permission to delete proposals.');
      return;
    }
    if (!window.confirm('Delete proposal?')) return;
    try {
      const res = await api.proposals.delete(id);
      if (res.success) {
        setProposals(prev => prev.filter(p => p.id !== id));
        showToast('Proposal deleted.');
      }
    } catch {
      showToast('Failed to delete proposal.');
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalCount = proposals.length;
    const totalValue = proposals.reduce((sum, p) => sum + (p.total || 0), 0);
    const accepted = proposals.filter(p => p.status === 'accepted');
    const acceptedValue = accepted.reduce((sum, p) => sum + (p.total || 0), 0);
    const winRate = totalCount > 0 ? Math.round((accepted.length / totalCount) * 100) : 0;
    const activeProposals = proposals.filter(p => ['draft', 'review', 'approved', 'sent'].includes(p.status)).length;

    return { totalCount, totalValue, acceptedValue, winRate, activeProposals };
  }, [proposals]);

  // Filtered List
  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchQuery, statusFilter]);

  const getStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-0.5 rounded text-xs font-sans bg-zinc-800 text-zinc-300 border border-white/10">Draft</span>;
      case 'review':
        return <span className="px-2 py-0.5 rounded text-xs font-sans bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30">In Review</span>;
      case 'approved':
        return <span className="px-2 py-0.5 rounded text-xs font-sans bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/30">Approved</span>;
      case 'sent':
        return <span className="px-2 py-0.5 rounded text-xs font-sans bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/30">Sent</span>;
      case 'accepted':
        return <span className="px-2 py-0.5 rounded text-xs font-sans bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded text-xs font-sans bg-red-500/10 text-red-400 border border-red-500/30">Rejected</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-card bg-[var(--panel)] border border-[var(--ams-red)]/40 text-[var(--text)] text-xs font-sans shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--ams-red)] animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-[var(--text)] flex items-center gap-2.5">
            <FileText className="text-[var(--accent)]" size={24} />
            <span>{language === 'id' ? 'Proposal & Estimasi Anggaran' : 'Proposals & Quotations'}</span>
          </h1>
          <p className="text-xs font-sans text-[var(--ams-secondary)] mt-1">
            {language === 'id' 
              ? 'Penerbitan proposal komersial, persetujuan bertingkat, dan konversi instan ke invoice klien.' 
              : 'Commercial proposals, multi-tier executive approvals, and 1-click invoice conversion.'}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!canManageCrm}
          title={!canManageCrm ? 'Requires CRM permission' : undefined}
          className="px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)] text-white text-xs font-sans font-medium flex items-center justify-center gap-2 rounded-control min-h-10 px-3 transition-colors shrink-0"
        >
          <Plus size={15} />
          <span>{language === 'id' ? 'Buat Proposal Baru' : 'New Proposal'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-card bg-[var(--panel)] border border-[var(--line)] space-y-1">
          <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center justify-between">
            <span>{language === 'id' ? 'Total Nilai Ditawarkan' : 'Total Proposed'}</span>
            <TrendingUp size={13} className="text-[var(--accent)]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-sans text-[var(--text)]">
            {formatAmount(metrics.totalValue, currency)}
          </div>
          <div className="text-xs font-sans text-[var(--ams-secondary)]">
            {metrics.totalCount} {language === 'id' ? 'dokumen diterbitkan' : 'proposals generated'}
          </div>
        </div>

        <div className="p-4 rounded-card bg-[var(--panel)] border border-[var(--line)] space-y-1">
          <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center justify-between">
            <span>{language === 'id' ? 'Proposal Aktif' : 'Active Pipeline'}</span>
            <Clock size={13} className="text-[var(--warning)]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-sans text-[var(--warning)]">
            {metrics.activeProposals}
          </div>
          <div className="text-xs font-sans text-[var(--ams-secondary)]">
            {language === 'id' ? 'Menunggu keputusan klien' : 'Pending client decision'}
          </div>
        </div>

        <div className="p-4 rounded-card bg-[var(--panel)] border border-[var(--line)] space-y-1">
          <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center justify-between">
            <span>{language === 'id' ? 'Nilai Dimenangkan' : 'Won Revenue'}</span>
            <CheckCircle2 size={13} className="text-[var(--success)]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-sans text-[var(--success)]">
            {formatAmount(metrics.acceptedValue, currency)}
          </div>
          <div className="text-xs font-sans text-[var(--success)]/80">
            {language === 'id' ? 'Siap diterbitkan invoice' : 'Accepted deals'}
          </div>
        </div>

        <div className="p-4 rounded-card bg-[var(--panel)] border border-[var(--line)] space-y-1">
          <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center justify-between">
            <span>{language === 'id' ? 'Tingkat Kemenangan' : 'Win Rate'}</span>
            <ShieldCheck size={13} className="text-[var(--info)]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-sans text-[var(--info)]">
            {metrics.winRate}%
          </div>
          <div className="text-xs font-sans text-[var(--ams-secondary)]">
            {language === 'id' ? 'Berdasarkan konversi klien' : 'Proposal conversion'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-card bg-[var(--panel)] border border-[var(--line)]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ams-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari nomor proposal, judul proyek, atau nama klien...' : 'Search proposal #, project title, or client...'}
            className="w-full min-h-10 sm:h-9 pl-8 pr-3 text-xs bg-[var(--ams-surface)] text-[var(--text)] placeholder-[var(--ams-secondary)] rounded-control border border-[var(--line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ams-red)]/40 focus:border-[var(--ams-red)] font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'draft', 'review', 'approved', 'sent', 'accepted', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-sans capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[var(--ams-red)]/15 text-[var(--accent)] border border-[var(--ams-red)]/30 font-semibold'
                  : 'text-[var(--ams-secondary)] hover:text-[var(--text)] hover:bg-[var(--panel-hover)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals Table */}
      <div className="rounded-card bg-[var(--panel)] border border-[var(--line)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-sans text-[var(--ams-secondary)] flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-[var(--accent)]" size={20} />
            <span>Loading proposals...</span>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-12 text-center text-xs font-sans text-[var(--ams-secondary)]">
            {language === 'id' ? 'Tidak ada proposal yang sesuai.' : 'No proposals found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--ams-surface)]/50 text-xs font-sans text-[var(--ams-secondary)] normal-case">
                  <th className="py-3 px-4">Ref / Title</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-xs font-sans text-[var(--text)]">
                {filteredProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[var(--text)]">{p.title}</div>
                      <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center gap-2 mt-0.5">
                        <span className="text-[var(--accent)] font-semibold">{p.proposalNumber}</span>
                        <span>•</span>
                        <span>{p.lineItems?.length || 0} line items</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[var(--text)]">{p.clientName}</div>
                      {p.clientCompany && (
                        <div className="text-xs font-sans text-[var(--ams-secondary)]">{p.clientCompany}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold font-sans text-[var(--success)]">
                        {formatAmount(p.total, currency)}
                      </div>
                      {p.discount > 0 && (
                        <div className="text-xs font-sans text-[var(--ams-secondary)]">
                          Disc: {formatAmount(p.discount, currency)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-[var(--ams-secondary)]">
                      {p.validUntil}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Status update quick dropdown */}
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p.id, e.target.value as Proposal['status'])}
                          disabled={['approved', 'accepted', 'rejected'].includes(p.status)}
                          className="min-h-10 h-9 px-2 rounded-control bg-[var(--panel)] text-[var(--ams-secondary)] hover:text-[var(--text)] border border-[var(--line)] text-xs font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ams-red)]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="draft">Draft</option>
                          <option value="review">Review</option>
                          <option value="sent">Sent</option>
                          {!['draft', 'review', 'sent'].includes(p.status) && (
                            <option value={p.status} disabled>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</option>
                          )}
                        </select>

                        {/* Convert to invoice button if accepted or approved */}
                        {(p.status === 'accepted' || p.status === 'approved') && !p.invoiceId && (
                          <button
                            onClick={() => handleConvertToInvoice(p.id)}
                            disabled={!canManageInvoices}
                            title={!canManageInvoices ? 'Requires invoice permission' : 'Convert to Invoice'}
                            className="min-h-10 px-3 rounded-control bg-[var(--success)]/10 hover:bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30 text-xs font-sans font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Receipt size={11} />
                            <span>Invoice</span>
                          </button>
                        )}

                        {/* Preview */}
                        <button
                          onClick={() => setPreviewProposal(p)}
                          title="View Details"
                          className="min-h-10 min-w-10 p-2 rounded-control hover:bg-[var(--panel-hover)] text-[var(--ams-secondary)] hover:text-[var(--text)] transition-colors"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="Delete"
                          className="min-h-10 min-w-10 p-2 rounded-control hover:bg-[var(--danger)]/10 text-[var(--ams-secondary)] hover:text-[var(--danger)] transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE PROPOSAL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80  flex items-center justify-center p-4">
          <div className="bg-[var(--ams-bg)] border border-[var(--line)] rounded-card w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--ams-surface)]">
              <div className="flex items-center gap-2">
                <FileText className="text-[var(--accent)]" size={18} />
                <h3 className="text-sm font-bold font-sans text-[var(--text)]">
                  {language === 'id' ? 'Buat Proposal & Estimasi Baru' : 'New Commercial Proposal'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="min-h-10 min-w-10 p-2 text-[var(--ams-secondary)] hover:text-[var(--text)] rounded-control hover:bg-[var(--panel-hover)] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-[var(--ams-secondary)]">Proposal Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Kapitech AI Automation Platform"
                    className="w-full min-h-10 sm:h-9 px-3 rounded-control bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ams-red)]/40 focus:border-[var(--ams-red)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-sans text-[var(--ams-secondary)]">Client Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="e.g. Raditya Pratama"
                    className="w-full min-h-10 sm:h-9 px-3 rounded-control bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ams-red)]/40 focus:border-[var(--ams-red)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-sans text-[var(--ams-secondary)]">Company Name</label>
                  <input
                    type="text"
                    value={formClientCompany}
                    onChange={(e) => setFormClientCompany(e.target.value)}
                    placeholder="e.g. PT Nusantara Digital"
                    className="w-full min-h-10 sm:h-9 px-3 rounded-control bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ams-red)]/40 focus:border-[var(--ams-red)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-sans text-[var(--ams-secondary)]">Client Email</label>
                  <input
                    type="email"
                    value={formClientEmail}
                    onChange={(e) => setFormClientEmail(e.target.value)}
                    placeholder="e.g. client@company.id"
                    className="w-full min-h-10 sm:h-9 px-3 rounded-control bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ams-red)]/40 focus:border-[var(--ams-red)]"
                  />
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-[var(--ams-secondary)] normal-case tracking-normal">Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2 py-0.5 rounded-control bg-[var(--panel)] hover:bg-[var(--ams-elevated)] text-xs font-sans text-[var(--accent)] border border-[var(--ams-red)]/30 flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div key={item.id} className="p-3 rounded-card bg-[var(--panel)] border border-[var(--line)] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Scope description / Deliverable..."
                          className="w-full h-7 px-2.5 rounded bg-[var(--ams-bg)] text-[var(--text)] border border-[var(--line)] text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                          placeholder="Qty"
                          className="w-full h-7 px-2 rounded bg-[var(--ams-bg)] text-[var(--text)] border border-[var(--line)] text-xs font-sans"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="number"
                          min="0"
                          step="10000"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                          placeholder="Unit Price (IDR)"
                          className="w-full h-7 px-2 rounded bg-[var(--ams-bg)] text-[var(--text)] border border-[var(--line)] text-xs font-sans"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={formItems.length === 1}
                          className="p-1 text-[var(--ams-secondary)] hover:text-red-400 disabled:opacity-30"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals and Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--line)]">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-sans text-[var(--ams-secondary)]">Payment Terms</label>
                    <input
                      type="text"
                      value={formPaymentTerms}
                      onChange={(e) => setFormPaymentTerms(e.target.value)}
                      className="w-full min-h-10 sm:h-9 px-3 rounded-control bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-sans text-[var(--ams-secondary)]">Validity Period (Days)</label>
                    <input
                      type="number"
                      value={formValidDays}
                      onChange={(e) => setFormValidDays(Number(e.target.value))}
                      className="w-full min-h-10 sm:h-9 px-3 rounded-control bg-[var(--panel)] text-[var(--text)] border border-[var(--line)] text-xs font-sans"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-card bg-[var(--panel)] border border-[var(--line)] space-y-1.5 font-sans text-xs">
                  <div className="flex justify-between text-[var(--ams-secondary)]">
                    <span>Subtotal</span>
                    <span>{formatAmount(formSubtotal, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[var(--ams-secondary)]">
                    <span>Discount (IDR)</span>
                    <input
                      type="number"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(Number(e.target.value))}
                      className="w-24 h-6 px-1.5 rounded bg-[var(--ams-bg)] text-right text-[var(--text)] border border-[var(--line)]"
                    />
                  </div>
                  <div className="flex justify-between text-[var(--ams-secondary)]">
                    <span>PPN (11%)</span>
                    <span>{formatAmount(formTax, currency)}</span>
                  </div>
                  <div className="pt-2 border-t border-[var(--line)] flex justify-between text-sm font-bold text-[var(--text)]">
                    <span>Total Proposal</span>
                    <span className="text-[var(--success)]">{formatAmount(formTotal, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-card bg-[var(--panel)] hover:bg-[var(--ams-elevated)] text-[var(--ams-secondary)] hover:text-[var(--text)] text-xs font-sans transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[var(--ams-red)] hover:bg-[var(--ams-red)] text-[var(--text)] text-xs font-sans font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(229,9,20,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />}
                  <span>Generate Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW PROPOSAL MODAL */}
      {previewProposal && (
        <div className="fixed inset-0 z-50 bg-black/85  flex items-center justify-center p-4">
          <div className="bg-[var(--ams-bg)] border border-[var(--line)] rounded-card w-full max-w-xl shadow-[0_24px_64px_rgba(0,0,0,0.55)] overflow-hidden">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between bg-[var(--ams-surface)]">
              <div className="flex items-center gap-2">
                <span className="text-[var(--accent)] font-sans font-bold text-xs">{previewProposal.proposalNumber}</span>
                <span className="text-[var(--text)] font-semibold text-xs truncate max-w-[280px]">{previewProposal.title}</span>
              </div>
              <button
                onClick={() => setPreviewProposal(null)}
                className="min-h-10 min-w-10 p-2 text-[var(--ams-secondary)] hover:text-[var(--text)] rounded-control hover:bg-[var(--panel-hover)] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start border-b border-[var(--line)] pb-3">
                <div>
                  <div className="font-bold text-sm text-[var(--text)]">{previewProposal.clientName}</div>
                  <div className="text-xs font-sans text-[var(--ams-secondary)]">{previewProposal.clientCompany}</div>
                  {previewProposal.clientEmail && (
                    <div className="text-xs font-sans text-[var(--ams-secondary)]">{previewProposal.clientEmail}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-sans text-[var(--ams-secondary)]">Valid Until</div>
                  <div className="font-sans text-[var(--text)] font-semibold">{previewProposal.validUntil}</div>
                  <div className="mt-1">{getStatusBadge(previewProposal.status)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-sans text-[var(--ams-secondary)] normal-case tracking-normal">Scope Deliverables</div>
                <div className="divide-y divide-[var(--line)] bg-[var(--ams-surface)] rounded-xl border border-[var(--line)] p-3">
                  {previewProposal.lineItems?.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <div className="text-[var(--text)] font-medium">{item.description}</div>
                        <div className="text-xs font-sans text-[var(--ams-secondary)]">{item.quantity} × {formatAmount(item.unitPrice, currency)}</div>
                      </div>
                      <div className="font-sans font-bold text-[var(--success)]">
                        {formatAmount(item.total, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-card bg-[var(--panel)] border border-[var(--line)] space-y-1 text-xs font-sans">
                <div className="flex justify-between text-[var(--ams-secondary)]">
                  <span>Subtotal</span>
                  <span>{formatAmount(previewProposal.subtotal, currency)}</span>
                </div>
                {previewProposal.discount > 0 && (
                  <div className="flex justify-between text-[var(--ams-secondary)]">
                    <span>Discount</span>
                    <span>-{formatAmount(previewProposal.discount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--ams-secondary)]">
                  <span>Tax</span>
                  <span>+{formatAmount(previewProposal.tax, currency)}</span>
                </div>
                <div className="pt-2 border-t border-[var(--line)] flex justify-between text-sm font-bold text-[var(--text)]">
                  <span>Grand Total</span>
                  <span className="text-[var(--success)]">{formatAmount(previewProposal.total, currency)}</span>
                </div>
              </div>

              {previewProposal.paymentTerms && (
                <div className="text-xs font-sans text-[var(--ams-secondary)] bg-[var(--ams-surface)]/50 p-2.5 rounded-lg border border-white/[0.04]">
                  Terms: {previewProposal.paymentTerms}
                </div>
              )}

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3 py-1.5 rounded-control bg-[var(--panel)] hover:bg-[var(--ams-elevated)] text-xs font-sans text-[var(--ams-secondary)] hover:text-[var(--text)] flex items-center gap-1.5 border border-[var(--line)]"
                >
                  <Download size={13} />
                  <span>Export / Print</span>
                </button>

                <div className="flex items-center gap-2">
                  {previewProposal.status === 'review' && (
                    <button
                      onClick={() => {
                        handleApproveProposal(previewProposal.id);
                        setPreviewProposal(null);
                      }}
                      disabled={!canApproveBudgets}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-sans font-semibold"
                    >
                      Approve Proposal
                    </button>
                  )}
                  {previewProposal.status === 'accepted' && !previewProposal.invoiceId && (
                    <button
                      onClick={() => {
                        handleConvertToInvoice(previewProposal.id);
                        setPreviewProposal(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-xs font-sans"
                    >
                      Convert to Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
