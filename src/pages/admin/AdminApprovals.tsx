import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Receipt, 
  DollarSign, 
  Layers, 
  MessageSquare, 
  User, 
  Calendar,
  Loader2,
  Check,
  X,
  FileText
} from 'lucide-react';
import { api } from '../../lib/apiClient';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, formatAmount, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';
import { hasAdminPermission } from '../../lib/adminAuth';

interface ApprovalItem {
  id: string;
  type: string;
  referenceId?: string;
  title: string;
  requester: string;
  requesterRole?: string;
  value: number;
  date: string;
  reason: string;
  riskLevel: 'Low' | 'Medium' | 'High' | string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Changes Requested' | string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export const AdminApprovals: React.FC = () => {
  const { language } = useLanguage();
  const canApproveBudgets = hasAdminPermission('canApproveBudgets');
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Decision Modal State
  const [activeItem, setActiveItem] = useState<ApprovalItem | null>(null);
  const [decisionAction, setDecisionAction] = useState<'Approve' | 'Reject' | 'Request Changes'>('Approve');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const loadApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await api.approvals.getAll();
      if (res.success && res.data?.approvals) {
        setApprovals(res.data.approvals);
      }
    } catch {
      showToast('Failed to load approvals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    if (!canApproveBudgets) {
      setActiveItem(null);
      showToast(language === 'id' ? 'Anda tidak memiliki hak persetujuan.' : 'You do not have approval permission.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.approvals.action(activeItem.id, decisionAction, decisionNotes);

      if (res.success && res.data?.approval) {
        setApprovals(prev => prev.map(a => a.id === activeItem.id ? res.data.approval : a));
        setActiveItem(null);
        setDecisionNotes('');
        const label = decisionAction === 'Approve' 
          ? (language === 'id' ? 'Permintaan disetujui.' : 'Request approved.')
          : decisionAction === 'Reject'
          ? (language === 'id' ? 'Permintaan ditolak.' : 'Request rejected.')
          : (language === 'id' ? 'Revisi diminta.' : 'Changes requested.');
        showToast(label);
      } else {
        showToast(res.error || 'Failed to submit decision.');
      }
    } catch {
      showToast('Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const pending = approvals.filter(a => a.status === 'Pending');
    const totalPendingValue = pending.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
    const highRiskPending = pending.filter(a => a.riskLevel?.toLowerCase() === 'high').length;
    const approvedCount = approvals.filter(a => a.status === 'Approved').length;

    return {
      pendingCount: pending.length,
      totalPendingValue,
      highRiskPending,
      approvedCount
    };
  }, [approvals]);

  // Filtered Items
  const filteredApprovals = useMemo(() => {
    return approvals.filter(item => {
      const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === 'all' || item.type.toLowerCase() === typeFilter.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesType && matchesSearch;
    });
  }, [approvals, statusFilter, typeFilter, searchQuery]);

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('invoice')) return <Receipt size={14} className="text-[var(--ams-red)]" />;
    if (t.includes('budget') || t.includes('expense')) return <DollarSign size={14} className="text-emerald-400" />;
    if (t.includes('proposal')) return <FileText size={14} className="text-blue-400" />;
    return <Layers size={14} className="text-purple-400" />;
  };

  const getRiskBadge = (level: string) => {
    const l = level?.toLowerCase();
    if (l === 'high') {
      return <span className="px-2 py-0.5 rounded text-xs font-sans bg-red-500/10 text-red-400 border border-red-500/30 normal-case font-bold">High Risk</span>;
    }
    if (l === 'medium') {
      return <span className="px-2 py-0.5 rounded text-xs font-sans bg-amber-500/10 text-amber-400 border border-amber-500/30 normal-case font-bold">Medium Risk</span>;
    }
    return <span className="px-2 py-0.5 rounded text-xs font-sans bg-zinc-800 text-zinc-300 border border-white/10 normal-case font-bold">Low Risk</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[var(--ams-surface)] border border-[var(--ams-red)]/40 text-white text-xs font-sans shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--ams-red)] animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2.5">
          <ShieldCheck className="text-[var(--ams-red)]" size={24} />
          <span>{language === 'id' ? 'Pusat Persetujuan Eksekutif' : 'Executive Approvals Center'}</span>
        </h1>
        <p className="text-xs font-sans text-[var(--ams-secondary)] mt-1">
          {language === 'id' 
            ? 'Otorisasi anggaran klien, invoice berisiko tinggi, proposal komersial, dan pengeluaran operasional.' 
            : 'Multi-level executive authorization for budgets, high-value invoices, and operational expenses.'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[var(--ams-bg)] border border-white/[0.07] space-y-1">
          <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center justify-between">
            <span>{language === 'id' ? 'Menunggu Otorisasi' : 'Pending Authorization'}</span>
            <Clock size={13} className="text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-sans text-amber-400">
            {metrics.pendingCount}
          </div>
          <div className="text-xs font-sans text-[var(--ams-secondary)]">
            {language === 'id' ? 'Perlu tindakan eksekutif' : 'Action required'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--ams-bg)] border border-white/[0.07] space-y-1">
          <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center justify-between">
            <span>{language === 'id' ? 'Nilai Tertunda' : 'Pending Value'}</span>
            <DollarSign size={13} className="text-[var(--ams-red)]" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-sans text-white">
            {formatAmount(metrics.totalPendingValue, currency)}
          </div>
          <div className="text-xs font-sans text-[var(--ams-secondary)]">
            {language === 'id' ? 'Total nilai menunggu review' : 'Total financial exposure'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--ams-bg)] border border-white/[0.07] space-y-1">
          <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center justify-between">
            <span>{language === 'id' ? 'Tinggi Risiko' : 'High Risk Items'}</span>
            <AlertTriangle size={13} className="text-red-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-sans text-red-400">
            {metrics.highRiskPending}
          </div>
          <div className="text-xs font-sans text-red-400/80">
            {language === 'id' ? 'Perlu hak persetujuan' : 'Requires approval permission'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--ams-bg)] border border-white/[0.07] space-y-1">
          <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center justify-between">
            <span>{language === 'id' ? 'Telah Disetujui' : 'Total Approved'}</span>
            <CheckCircle2 size={13} className="text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-sans text-emerald-400">
            {metrics.approvedCount}
          </div>
          <div className="text-xs font-sans text-[var(--ams-secondary)]">
            {language === 'id' ? 'Tercatat dalam audit trail' : 'Logged in audit trail'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--ams-bg)] border border-white/[0.07]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ams-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari judul, pemohon, atau catatan...' : 'Search title, requester, or notes...'}
            className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--ams-surface)] text-white placeholder-[var(--ams-secondary)] rounded-lg border border-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ams-red)]/40 focus:border-[var(--ams-red)] font-sans"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-[var(--ams-surface)] p-1 rounded-lg border border-white/[0.07]">
            {(['Pending', 'Approved', 'Rejected', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-sans capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-[var(--ams-bg)] text-white shadow-sm border border-white/10 font-bold'
                    : 'text-[var(--ams-secondary)] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-[var(--ams-surface)] text-[var(--ams-secondary)] border border-white/[0.07] text-xs font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ams-red)]/40"
          >
            <option value="all">All Types</option>
            <option value="invoice">Invoice</option>
            <option value="budget">Budget</option>
            <option value="proposal">Proposal</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 rounded-xl bg-[var(--ams-bg)] border border-white/[0.07] text-center text-xs font-sans text-[var(--ams-secondary)] flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-[var(--ams-red)]" size={20} />
            <span>Loading authorization items...</span>
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="p-12 rounded-xl bg-[var(--ams-bg)] border border-white/[0.07] text-center text-xs font-sans text-[var(--ams-secondary)]">
            {language === 'id' ? 'Tidak ada permintaan otorisasi.' : 'No authorization items match criteria.'}
          </div>
        ) : (
          filteredApprovals.map((item) => (
            <div 
              key={item.id}
              className="p-4 rounded-xl bg-[var(--ams-bg)] border border-white/[0.07] hover:border-white/20 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--ams-surface)] border border-white/[0.07] flex items-center justify-center shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{item.title}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-sans normal-case bg-[var(--ams-surface)] text-[var(--ams-secondary)] border border-white/[0.07]">
                        {item.type}
                      </span>
                      {getRiskBadge(item.riskLevel)}
                    </div>
                    {item.reason && (
                      <p className="text-xs text-[var(--ams-secondary)] mt-1 leading-relaxed">{item.reason}</p>
                    )}
                    <div className="text-xs font-sans text-[var(--ams-secondary)] flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        <span>Requested by {item.requester}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{item.date}</span>
                      </span>
                      {item.reviewedBy && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Decided by {item.reviewedBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
                  {item.value > 0 && (
                    <div className="text-right">
                      <div className="text-xs font-sans text-[var(--ams-secondary)]">Value</div>
                      <div className="font-bold font-sans text-white text-sm">
                        {formatAmount(item.value, currency)}
                      </div>
                    </div>
                  )}

                  {item.status.toLowerCase() === 'pending' && canApproveBudgets ? (
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => {
                          setActiveItem(item);
                          setDecisionAction('Approve');
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-sans font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Check size={12} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveItem(item);
                          setDecisionAction('Reject');
                        }}
                        className="px-3 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-sans font-semibold flex items-center gap-1 transition-colors"
                      >
                        <X size={12} />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded text-xs font-sans font-bold normal-case border ${
                      item.status.toLowerCase() === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : item.status.toLowerCase() === 'rejected'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>

              {item.reviewNotes && (
                <div className="text-xs font-sans text-[var(--ams-secondary)] bg-[var(--ams-surface)]/50 p-2.5 rounded-lg border border-white/[0.04] flex items-center gap-2">
                  <MessageSquare size={12} className="text-[var(--ams-red)] shrink-0" />
                  <span>Decision notes: {item.reviewNotes}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* DECISION MODAL */}
      {activeItem && canApproveBudgets && (
        <div className="fixed inset-0 z-50 bg-black/85  flex items-center justify-center p-4">
          <div className="bg-[var(--ams-bg)] border border-white/[0.07] rounded-card w-full max-w-md shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="p-4 border-b border-white/[0.07] flex items-center justify-between bg-[var(--ams-surface)]">
              <h3 className="text-sm font-bold font-sans text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-[var(--ams-red)]" />
                <span>Executive Decision Confirmation</span>
              </h3>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 text-[var(--ams-secondary)] hover:text-white rounded-lg hover:bg-white/[0.06]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDecisionSubmit} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <div className="font-bold text-white text-sm">{activeItem.title}</div>
                <div className="text-xs font-sans text-[var(--ams-secondary)] mt-0.5">
                  Requested by: {activeItem.requester}
                </div>
                {activeItem.value > 0 && (
                  <div className="text-xs font-sans font-bold text-emerald-400 mt-1">
                    Value: {formatAmount(activeItem.value, currency)}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-[var(--ams-secondary)]">Action</label>
                <div className="grid grid-cols-3 gap-2 font-sans text-xs">
                  <button
                    type="button"
                    onClick={() => setDecisionAction('Approve')}
                    className={`py-2 rounded-lg border text-center transition-all ${
                      decisionAction === 'Approve'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                        : 'bg-[var(--ams-surface)] text-[var(--ams-secondary)] border-white/[0.07]'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionAction('Request Changes')}
                    className={`py-2 rounded-lg border text-center transition-all ${
                      decisionAction === 'Request Changes'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold'
                        : 'bg-[var(--ams-surface)] text-[var(--ams-secondary)] border-white/[0.07]'
                    }`}
                  >
                    Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionAction('Reject')}
                    className={`py-2 rounded-lg border text-center transition-all ${
                      decisionAction === 'Reject'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50 font-bold'
                        : 'bg-[var(--ams-surface)] text-[var(--ams-secondary)] border-white/[0.07]'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans text-[var(--ams-secondary)]">Decision Notes / Reason</label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Record rationale for the immutable security audit log..."
                  className="w-full p-2.5 rounded-lg bg-[var(--ams-surface)] text-white border border-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ams-red)]/40 focus:border-[var(--ams-red)] text-xs resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.07] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="px-4 py-2 rounded-xl bg-[var(--ams-surface)] hover:bg-[var(--ams-elevated)] text-[var(--ams-secondary)] text-xs font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[var(--ams-red)] hover:bg-[var(--ams-red)] text-white text-xs font-sans font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>Confirm Decision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
