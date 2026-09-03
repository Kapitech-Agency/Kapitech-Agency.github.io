import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Calendar, 
  Building2, 
  User, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download, 
  Edit3, 
  Trash2, 
  Send, 
  ExternalLink,
  CreditCard,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { 
  AgencyInvoice, 
  AgencyExpense, 
  InvoiceStatus, 
  getAgencyInvoices, 
  saveAgencyInvoice, 
  deleteAgencyInvoice, 
  updateInvoiceStatus, 
  getAgencyExpenses, 
  saveAgencyExpense, 
  deleteAgencyExpense, 
  computeFinancialMetrics, 
  FINANCE_EVENT_NAME 
} from '../../lib/financeStore';
import { formatAmount, formatIDR, getActiveCurrency, CURRENCY_EVENT, CurrencyCode } from '../../lib/currency';
import { useLanguage } from '../../lib/LanguageContext';
import { useDragToScroll } from '../../lib/useDragToScroll';
import { ScrollShadowContainer } from '../../components/ui/ScrollShadowContainer';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { InvoiceStatusDropdown } from '../../components/ui/InvoiceStatusDropdown';
import { getAgencyProjects, AgencyProject } from '../../lib/projectStore';
import { getAdminSession, hasAdminPermission } from '../../lib/adminAuth';

export const AdminInvoicing: React.FC = () => {
  const { t, language } = useLanguage();
  const session = getAdminSession();
  const userRole = session?.user?.role || 'Tier 1: Top Management / Sponsor';
  const canViewFinancials = hasAdminPermission('canViewFinancials');
  const canManageInvoices = hasAdminPermission('canManageInvoices');
  const canApproveBudgets = hasAdminPermission('canApproveBudgets');
  const canCreateInvoice = canManageInvoices || userRole.startsWith('Tier 1') || userRole.startsWith('Tier 2') || userRole.includes('Finance');
  const canDeleteInvoice = userRole.startsWith('Tier 1') || session?.user?.stakeholderType === 'Master';
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  const [invoices, setInvoices] = useState<AgencyInvoice[]>([]);
  const [expenses, setExpenses] = useState<AgencyExpense[]>([]);
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Drag-to-scroll hook for horizontal table view
  const tableScrollRef = useDragToScroll<HTMLDivElement>();

  // Modal State for Invoice
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<AgencyInvoice | null>(null);
  
  // Invoice Form Fields
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [availableProjects, setAvailableProjects] = useState<AgencyProject[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemAmount, setItemAmount] = useState<number>(35000000);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [taxPercent, setTaxPercent] = useState<number>(11);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('sent');
  const [invoiceNotes, setInvoiceNotes] = useState('Payment via Bank Mandiri / BCA Wire Transfer.');

  // Modal State for Expense
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<AgencyExpense['category']>('Software & Cloud');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(2500000);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  // Invoice Detail / Printable Preview Modal
  const [previewInvoice, setPreviewInvoice] = useState<AgencyInvoice | null>(null);

  const loadData = () => {
    setInvoices(getAgencyInvoices());
    setExpenses(getAgencyExpenses());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener(FINANCE_EVENT_NAME, handleUpdate);

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail?.currency || getActiveCurrency());
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);

    return () => {
      window.removeEventListener(FINANCE_EVENT_NAME, handleUpdate);
      window.removeEventListener(CURRENCY_EVENT, handleCurrencyChange);
    };
  }, []);

  const metrics = useMemo(() => computeFinancialMetrics(invoices, expenses), [invoices, expenses]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientCompany.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || inv.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [invoices, searchQuery, filterStatus]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleOpenCreateInvoice = () => {
    const allProj = getAgencyProjects();
    setAvailableProjects(allProj);
    const approvedProj = allProj.filter(p => p.status === 'in_progress' || p.status === 'completed' || p.status === 'review');
    
    if (approvedProj.length > 0) {
      const first = approvedProj[0];
      setSelectedProjectId(first.id);
      setClientName(first.clientName);
      setClientCompany(first.clientCompany);
      setClientEmail(first.clientEmail);
      setItemDesc(`${first.name} - Milestone Deliverable`);
      setItemAmount(Math.round(first.budget * 0.4));
    } else {
      setSelectedProjectId('');
      setClientName('');
      setClientCompany('');
      setClientEmail('');
      setItemDesc('Digital Product & Engineering Phase 1 Deliverables');
      setItemAmount(45000000);
    }

    setEditingInvoice(null);
    setClientPhone('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setTaxPercent(11);
    setInvoiceStatus('sent');
    setInvoiceNotes('Payment terms: Net 14 days. Bank Account Mandiri 123-00-998877-1 a/n PT Kapitech Digital Indonesia.');
    setIsInvoiceModalOpen(true);
  };

  const handleSelectProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    if (!projId) return;
    const found = availableProjects.find(p => p.id === projId);
    if (found) {
      setClientName(found.clientName);
      setClientCompany(found.clientCompany);
      setClientEmail(found.clientEmail);
      setItemDesc(`${found.name} - Sprint Deliverables`);
      setItemAmount(Math.round(found.budget * 0.5));
    }
  };

  const handleOpenEditInvoice = (inv: AgencyInvoice) => {
    setEditingInvoice(inv);
    setClientName(inv.clientName);
    setClientCompany(inv.clientCompany);
    setClientEmail(inv.clientEmail);
    setClientPhone(inv.clientPhone || '');
    setItemDesc(inv.items[0]?.description || 'Custom Web Engineering Services');
    setItemAmount(inv.items[0]?.amount || inv.subtotal);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setTaxPercent(inv.taxPercent || 0);
    setInvoiceStatus(inv.status);
    setInvoiceNotes(inv.notes || '');
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientCompany.trim()) {
      alert('Client Name and Company are required.');
      return;
    }

    const subtotal = Number(itemAmount) || 0;
    const taxVal = Math.round((subtotal * (Number(taxPercent) || 0)) / 100);
    const totalVal = subtotal + taxVal;

    const invData: AgencyInvoice = {
      id: editingInvoice?.id || 'inv_' + Date.now().toString(36),
      invoiceNumber: editingInvoice?.invoiceNumber || `KAPI-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      clientName,
      clientCompany,
      clientEmail,
      clientPhone,
      items: [
        {
          id: 'item_' + Date.now().toString(36),
          description: itemDesc,
          quantity: 1,
          unitPrice: subtotal,
          amount: subtotal
        }
      ],
      subtotal,
      taxPercent: Number(taxPercent) || 0,
      taxAmount: taxVal,
      total: totalVal,
      currency: 'IDR',
      status: invoiceStatus,
      issueDate,
      dueDate,
      notes: invoiceNotes,
      paymentTerms: 'Bank Transfer Net 14',
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveAgencyInvoice(invData);
    setIsInvoiceModalOpen(false);
    showToast(language === 'id' ? 'Invoice berhasil disimpan.' : 'Invoice successfully saved.');
  };

  const handleDeleteInvoice = (id: string, invNum: string) => {
    if (window.confirm(`Hapus invoice ${invNum}?`)) {
      deleteAgencyInvoice(id);
      showToast(language === 'id' ? 'Invoice dihapus.' : 'Invoice deleted.');
    }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim() || !expAmount) {
      alert('Description and amount are required.');
      return;
    }

    const newExpense: AgencyExpense = {
      id: 'exp_' + Date.now().toString(36),
      category: expCategory,
      description: expDesc,
      amount: Number(expAmount),
      date: expDate,
      recordedBy: 'Principal Admin'
    };

    saveAgencyExpense(newExpense);
    setIsExpenseModalOpen(false);
    setExpDesc('');
    showToast(language === 'id' ? 'Pengeluaran berhasil dicatat.' : 'Expense successfully recorded.');
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Hapus catatan pengeluaran ini?')) {
      deleteAgencyExpense(id);
      showToast(language === 'id' ? 'Pengeluaran dihapus.' : 'Expense deleted.');
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            <span>PAID</span>
          </span>
        );
      case 'sent':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
            <Send size={12} />
            <span>SENT</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5 animate-pulse">
            <AlertCircle size={12} />
            <span>OVERDUE</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
            <Clock size={12} />
            <span>DRAFT</span>
          </span>
        );
    }
  };

  if (!canViewFinancials) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl max-w-xl mx-auto my-12 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#FF1E27] flex items-center justify-center mb-4 shadow-lg shadow-red-500/5">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">
          {language === 'id' ? 'Akses Terbatas: Finansial & Invoicing' : 'Restricted Access: Financials & Invoicing'}
        </h2>
        <p className="text-sm text-[#8A94A6] mb-6 leading-relaxed">
          {language === 'id' 
            ? `Akun Anda (${session?.user?.name || session?.user?.username}) terdaftar dengan peran "${session?.user?.role}". Akses modul keuangan, pembukuan invoice, dan data billing dibatasi khusus untuk Eksekutif / Manajemen Sponsor Kapitech.`
            : `Your account (${session?.user?.name || session?.user?.username}) is registered as "${session?.user?.role}". Financial ledger, invoices, and billing metrics are restricted to Executive Stakeholders / Sponsors.`}
        </p>
        <div className="px-4 py-2.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-xs font-mono text-[#8A94A6]">
          {language === 'id' ? 'Hubungi Executive Sponsor untuk peningkatan otorisasi hak akses.' : 'Contact an Executive Sponsor for elevated authorization.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Receipt className="text-[#FF1E27]" size={26} />
            <span>{t('admin.fin.title')}</span>
          </h1>
          <p className="text-xs text-[#8A94A6] mt-1">
            {t('admin.fin.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white text-xs font-mono font-bold border border-[rgba(255,255,255,0.07)] transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
          >
            <Plus size={14} />
            <span>{t('admin.fin.recordExpense')}</span>
          </button>

          {canCreateInvoice && (
            <button
              onClick={handleOpenCreateInvoice}
              className="h-10 px-4 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#E50914]/20 min-h-[40px]"
            >
              <Plus size={14} />
              <span>{t('admin.fin.createInvoice')}</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check size={14} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Key Financial KPIs (1 col mobile, 2 col tablet, 4 col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Collected Revenue */}
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-[#484F58] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A94A6] mb-2">
              <span className="text-xs font-mono uppercase font-semibold">{t('admin.fin.revenuePaid')}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {formatAmount(metrics.totalPaidRevenue, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-mono">
            <span className="text-[#8A94A6]">{metrics.paidCount} {language === 'id' ? 'Invoice Lunas' : 'Paid Invoices'}</span>
            <span className="text-emerald-400 font-semibold">{metrics.collectionRate}% {language === 'id' ? 'Tertagih' : 'Collected'}</span>
          </div>
        </div>

        {/* Metric 2: Outstanding */}
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-[#484F58] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A94A6] mb-2">
              <span className="text-xs font-mono uppercase font-semibold">{t('admin.fin.outstanding')}</span>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {formatAmount(metrics.totalOutstanding, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-mono">
            <span className="text-[#8A94A6]">{metrics.sentCount} {language === 'id' ? 'Invoice Tertunda' : 'Pending Invoices'}</span>
            <span className="text-red-400 font-semibold">{language === 'id' ? 'Menunggu Pelunasan' : 'Awaiting Settlement'}</span>
          </div>
        </div>

        {/* Metric 3: Total Expenses */}
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-[#484F58] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A94A6] mb-2">
              <span className="text-xs font-mono uppercase font-semibold">{t('admin.fin.expenses')}</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <TrendingDown size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {formatAmount(metrics.totalExpenses, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-mono">
            <span className="text-[#8A94A6]">{expenses.length} {language === 'id' ? 'Catatan' : 'Records'}</span>
            <span className="text-rose-400 font-semibold">Infrastructure & Ops</span>
          </div>
        </div>

        {/* Metric 4: Net Operating Profit */}
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-[#484F58] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A94A6] mb-2">
              <span className="text-xs font-mono uppercase font-semibold">{t('admin.fin.netProfit')}</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {formatAmount(metrics.netOperatingProfit, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.07)] text-[11px] font-mono">
            <span className="text-[#8A94A6]">Margin</span>
            <span className="text-purple-400 font-semibold">
              {metrics.totalPaidRevenue > 0 ? Math.round((metrics.netOperatingProfit / metrics.totalPaidRevenue) * 100) : 0}% Net
            </span>
          </div>
        </div>

      </div>

      {/* 3. Tab Bar & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111318] border border-[rgba(255,255,255,0.07)] p-3 sm:p-4 rounded-2xl">
        
        {/* Left: Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#181B22] p-1 rounded-xl border border-[rgba(255,255,255,0.07)] shrink-0">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'invoices'
                ? 'bg-[#E50914] text-white font-bold shadow-md'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            <Receipt size={14} />
            <span>{t('admin.fin.invoicesList')} ({invoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'bg-[#E50914] text-white font-bold shadow-md'
                : 'text-[#8A94A6] hover:text-white'
            }`}
          >
            <CreditCard size={14} />
            <span>{t('admin.fin.expensesList')} ({expenses.length})</span>
          </button>
        </div>

        {/* Right: Search & Status Filter */}
        {activeTab === 'invoices' && (
          <div className="flex flex-wrap items-center gap-2 flex-1 sm:justify-end">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6]" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'id' ? 'Cari no invoice, klien...' : 'Search invoice number, client...'}
                className="w-full pl-8 pr-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914] font-mono"
              />
            </div>

            <CustomSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(val)}
              options={[
                { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                { value: 'paid', label: language === 'id' ? 'Lunas' : 'Paid' },
                { value: 'sent', label: language === 'id' ? 'Terkirim' : 'Sent' },
                { value: 'overdue', label: language === 'id' ? 'Jatuh Tempo' : 'Overdue' },
                { value: 'draft', label: 'Draft' }
              ]}
            />
          </div>
        )}
      </div>

      {/* 4. Table / Content Stream */}
      {activeTab === 'invoices' ? (
        <>
          {/* Mobile View: High-Efficiency Invoice Cards (Zero Horizontal Scrolling) */}
          <div className="md:hidden space-y-3">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl text-xs font-mono text-[#8A94A6]">
                {language === 'id' ? 'Tidak ada invoice yang sesuai kriteria.' : 'No invoices found matching criteria.'}
              </div>
            ) : (
              filteredInvoices.map((inv) => (
                <div 
                  key={inv.id}
                  className="bg-[#111318] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.15)] rounded-2xl p-4 space-y-3.5 transition-all shadow-lg"
                >
                  {/* Card Header: Invoice # & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <button 
                      onClick={() => setPreviewInvoice(inv)} 
                      className="font-bold text-white font-display text-sm hover:text-[#FF1E27] flex items-center gap-1.5 transition-colors"
                    >
                      <span>{inv.invoiceNumber}</span>
                      <ExternalLink size={12} className="text-[#8A94A6]" />
                    </button>
                    <div className="shrink-0">
                      <InvoiceStatusDropdown
                        status={inv.status}
                        onChange={(newStatus) => {
                          updateInvoiceStatus(inv.id, newStatus);
                          showToast(`Status updated to ${newStatus.toUpperCase()}`);
                        }}
                      />
                    </div>
                  </div>

                  {/* Client & Dates */}
                  <div className="bg-[#181B22]/60 rounded-xl p-3 border border-[rgba(255,255,255,0.04)] space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A94A6] text-[11px]">{language === 'id' ? 'Klien:' : 'Client:'}</span>
                      <span className="font-bold text-white text-right">{inv.clientName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8A94A6] text-[11px]">{language === 'id' ? 'Perusahaan:' : 'Company:'}</span>
                      <span className="text-[#C5CEE0] text-right truncate max-w-[180px]">{inv.clientCompany}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.05)] text-[11px]">
                      <span className="text-[#64748B]">Issue: {inv.issueDate}</span>
                      <span className="text-[#FF1E27] font-semibold">Due: {inv.dueDate}</span>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-[#8A94A6]">{language === 'id' ? 'Total Tagihan' : 'Total Amount'}</div>
                      <div className="text-base font-bold text-emerald-400 font-display">
                        {formatAmount(inv.total, currency)}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748B]">
                        incl. {inv.taxPercent}% PPN
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="h-9 px-3 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono flex items-center justify-center gap-1 transition-colors min-h-[36px]"
                        title="Preview & Print Invoice"
                      >
                        <FileText size={13} />
                        <span>{language === 'id' ? 'Lihat' : 'View'}</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditInvoice(inv)}
                        className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                        title="Edit Invoice"
                      >
                        <Edit3 size={14} />
                      </button>
                      {canDeleteInvoice && (
                        <button
                          onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                          className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/30 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                          title="Delete Invoice"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View: Full Data Table with Edge Shadows */}
          <ScrollShadowContainer
            externalRef={tableScrollRef}
            shadowBg="surface"
            shadowSize="md"
            className="hidden md:block rounded-2xl overflow-hidden"
            scrollClassName="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-x-auto shadow-xl select-none"
          >
            <table className="w-full text-left text-xs font-mono min-w-[750px]">
              <thead className="sticky top-0 z-10 bg-[#111318]">
                <tr className="border-b border-[rgba(255,255,255,0.07)] bg-[#181B22] text-[#8A94A6]">
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">Invoice #</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Klien & Perusahaan' : 'Client & Company'}</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Tanggal / Jatuh Tempo' : 'Issue / Due Date'}</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Nominal' : 'Amount'}</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px] text-right">{language === 'id' ? 'Aksi' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#8A94A6]">
                      {language === 'id' ? 'Tidak ada invoice yang sesuai kriteria.' : 'No invoices found matching criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#1C2128] transition-colors group">
                      <td className="py-3.5 px-4 font-bold text-white font-display">
                        <button 
                          onClick={() => setPreviewInvoice(inv)} 
                          className="hover:text-[#FF1E27] flex items-center gap-1.5"
                        >
                          <span>{inv.invoiceNumber}</span>
                          <ExternalLink size={11} className="text-[#8A94A6] group-hover:text-[#FF1E27]" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{inv.clientName}</div>
                        <div className="text-[11px] text-[#8A94A6]">{inv.clientCompany}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#8A94A6]">
                        <div>Issue: {inv.issueDate}</div>
                        <div className="text-[10px] text-[#64748B]">Due: {inv.dueDate}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400 font-display">
                        {formatAmount(inv.total, currency)}
                        <div className="text-[10px] font-mono text-[#64748B] font-normal">
                          incl. {inv.taxPercent}% PPN
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <InvoiceStatusDropdown
                          status={inv.status}
                          onChange={(newStatus) => {
                            updateInvoiceStatus(inv.id, newStatus);
                            showToast(`Status updated to ${newStatus.toUpperCase()}`);
                          }}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                            title="Preview & Print Invoice"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEditInvoice(inv)}
                            className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                            title="Edit Invoice"
                          >
                            <Edit3 size={14} />
                          </button>
                          {canDeleteInvoice && (
                            <button
                              onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                              className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/30 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                              title="Delete Invoice"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ScrollShadowContainer>
        </>
      ) : (
        /* Expenses List */
        <>
          {/* Mobile View: High-Efficiency Expense Cards */}
          <div className="md:hidden space-y-3">
            {expenses.length === 0 ? (
              <div className="p-8 text-center bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl text-xs font-mono text-[#8A94A6]">
                {language === 'id' ? 'Belum ada data pengeluaran operasional.' : 'No operational expenses recorded.'}
              </div>
            ) : (
              expenses.map((exp) => (
                <div 
                  key={exp.id}
                  className="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold">
                      {exp.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#8A94A6]">{exp.date}</span>
                  </div>

                  <div className="text-white font-medium text-sm font-sans">{exp.description}</div>

                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.05)]">
                    <div>
                      <div className="text-[10px] font-mono text-[#8A94A6]">{language === 'id' ? 'Nominal Pengeluaran' : 'Expense Amount'}</div>
                      <div className="text-base font-bold text-rose-400 font-display">
                        {formatAmount(exp.amount, currency)}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748B]">
                        {language === 'id' ? 'Oleh: ' : 'By: '} {exp.recordedBy}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/30 flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                      title="Delete Record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View: Full Expense Table */}
          <div 
            ref={tableScrollRef}
            className="hidden md:block bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-x-auto shadow-xl select-none"
          >
            <table className="w-full text-left text-xs font-mono min-w-[650px]">
              <thead className="sticky top-0 z-10 bg-[#111318]">
                <tr className="border-b border-[rgba(255,255,255,0.07)] bg-[#181B22] text-[#8A94A6]">
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Tanggal' : 'Date'}</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Kategori' : 'Category'}</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Deskripsi' : 'Description'}</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Nominal' : 'Amount'}</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Dicatat Oleh' : 'Recorded By'}</th>
                  <th className="py-3 px-4 font-semibold uppercase text-[10px] text-right">{language === 'id' ? 'Aksi' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#1C2128] transition-colors">
                    <td className="py-3.5 px-4 text-[#8A94A6]">{exp.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#181B22] text-amber-400 border border-amber-500/20 text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">{exp.description}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-400 font-display">
                      {formatAmount(exp.amount, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-[#8A94A6]">{exp.recordedBy}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="w-9 h-9 rounded-xl bg-[#181B22] hover:bg-red-950/40 text-[#8A94A6] hover:text-red-400 border border-[rgba(255,255,255,0.07)] hover:border-red-500/30 inline-flex items-center justify-center transition-colors min-h-[36px] min-w-[36px]"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 5. Create / Edit Invoice Modal (Mobile Fullscreen + Sticky Header) */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[#181B22] border-0 sm:border sm:border-[rgba(255,255,255,0.07)] rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[#181B22]/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between shrink-0">
              <h3 className="font-display font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <Receipt className="text-[#FF1E27]" size={20} />
                <span>{editingInvoice ? 'Edit Client Invoice' : 'Create New Invoice'}</span>
              </h3>
              <button 
                onClick={() => setIsInvoiceModalOpen(false)} 
                className="w-8 h-8 rounded-lg text-[#8A94A6] hover:text-white bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-colors shrink-0 ml-3"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono custom-scrollbar">
                {!editingInvoice && availableProjects.length > 0 && (
                  <div className="p-3 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl space-y-1.5">
                    <label className="block text-[#8A94A6] font-semibold flex items-center justify-between">
                      <span>{language === 'id' ? 'Tautkan ke Proyek yang Disetujui (Approved)' : 'Link to Approved Project'}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Status: Approved / In Progress</span>
                    </label>
                    <CustomSelect
                      value={selectedProjectId}
                      onChange={handleSelectProjectChange}
                      options={[
                        { value: '', label: language === 'id' ? '-- Buat Invoice Lepas (Ad-Hoc) --' : '-- Standalone Ad-Hoc Invoice --' },
                        ...availableProjects
                          .filter(p => p.status === 'in_progress' || p.status === 'completed' || p.status === 'review')
                          .map(p => ({
                            value: p.id,
                            label: `${p.name} (${p.clientCompany}) • Budget: ${formatAmount(p.budget, currency)}`
                          }))
                      ]}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Client Name *</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      placeholder="e.g. Marcus Thorne"
                      className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Company Name *</label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      required
                      placeholder="e.g. Lumina Real Estate"
                      className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+62 811-XXXX-XXXX"
                      className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl space-y-3">
                  <label className="block text-white font-bold">Line Item & Milestone Valuation</label>
                  <div>
                    <label className="block text-[#8A94A6] mb-1">Deliverable Description</label>
                    <textarea
                      rows={2}
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#8A94A6] mb-1">Amount (IDR Rupiah)</label>
                      <input
                        type="number"
                        value={itemAmount}
                        onChange={(e) => setItemAmount(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8A94A6] mb-1">PPN / Tax % (e.g. 11%)</label>
                      <input
                        type="number"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(Number(e.target.value))}
                        className="w-full px-3 py-2.5 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                  </div>
                  <div className="pt-2 text-right text-emerald-400 font-bold font-display text-sm">
                    Total Payable: {formatIDR(itemAmount + Math.round((itemAmount * taxPercent) / 100))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Issue Date</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Status</label>
                    <CustomSelect
                      value={invoiceStatus}
                      onChange={(val) => setInvoiceStatus(val as InvoiceStatus)}
                      options={[
                        { value: 'draft', label: 'Draft', badge: 'Draft', badgeColor: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' },
                        { value: 'sent', label: 'Sent', badge: 'Sent', badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
                        { value: 'paid', label: 'Paid', badge: 'Paid', badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
                        { value: 'overdue', label: 'Overdue', badge: 'Overdue', badgeColor: 'bg-red-500/10 text-red-400 border border-red-500/20' }
                      ]}
                      className="w-full"
                      triggerClassName="w-full justify-between"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">Bank Wire Instructions / Notes</label>
                  <textarea
                    rows={2}
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-20 bg-[#181B22]/95 backdrop-blur-md px-5 sm:px-6 py-3.5 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-[#0B0C0E] hover:bg-[#181B22] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono font-medium transition-colors min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-bold transition-all shadow-lg shadow-[#E50914]/20 min-h-[40px]"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Record Expense Modal (Mobile Fullscreen + Sticky Header) */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-[#181B22] border-0 sm:border sm:border-[rgba(255,255,255,0.07)] rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md shadow-2xl flex flex-col overflow-hidden">
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-[#181B22]/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between shrink-0">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="text-[#FF1E27]" size={18} />
                <span>Record Studio Expense</span>
              </h3>
              <button 
                onClick={() => setIsExpenseModalOpen(false)} 
                className="w-8 h-8 rounded-lg text-[#8A94A6] hover:text-white bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-colors shrink-0 ml-3"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3.5 text-xs font-mono custom-scrollbar">
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">Expense Category</label>
                  <CustomSelect
                    value={expCategory}
                    onChange={(val) => setExpCategory(val as any)}
                    options={[
                      { value: 'Software & Cloud', label: 'Software & Cloud (Vercel, AWS, Figma)' },
                      { value: 'Salaries & Contractors', label: 'Salaries & Contractors' },
                      { value: 'Office & Hardware', label: 'Office & Hardware' },
                      { value: 'Marketing & Ads', label: 'Marketing & Ads' },
                      { value: 'Legal & Admin', label: 'Legal & Admin' }
                    ]}
                    className="w-full"
                    triggerClassName="w-full justify-between"
                  />
                </div>

                <div>
                  <label className="block text-[#8A94A6] mb-1 font-semibold">Description *</label>
                  <input
                    type="text"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    required
                    placeholder="e.g. Google Cloud Run cluster billing"
                    className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Amount (IDR)</label>
                    <input
                      type="number"
                      value={expAmount}
                      onChange={(e) => setExpAmount(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A94A6] mb-1 font-semibold">Date</label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0B0C0E] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-20 bg-[#181B22]/95 backdrop-blur-md px-5 sm:px-6 py-3.5 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-[#0B0C0E] hover:bg-[#181B22] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono font-medium transition-colors min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-bold transition-all shadow-lg shadow-[#E50914]/20 min-h-[40px]"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Printable Invoice Preview Slide-Over / Modal (Mobile Fullscreen + Sticky Header) */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white text-zinc-900 rounded-none sm:rounded-2xl w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl shadow-2xl font-sans relative flex flex-col overflow-hidden">
            
            {/* Sticky Header for Preview Modal */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-zinc-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                  K
                </div>
                <div>
                  <span className="text-sm font-bold font-display tracking-tight text-zinc-900 block">KAPITECH INVOICE</span>
                  <span className="text-[11px] font-mono text-zinc-500">{previewInvoice.invoiceNumber}</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Printable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
              {/* Invoice Printable Header */}
              <div className="flex justify-between items-start border-b border-zinc-200 pb-6 mb-6">
                <div>
                  <span className="text-lg font-bold font-display tracking-tight text-zinc-900">PT Kapitech Digital Indonesia</span>
                  <p className="text-xs text-zinc-500 max-w-xs mt-1 leading-relaxed">
                    Linea Residence Block G No. 5, Paku Jaya, South Tangerang, Banten 15220, Indonesia
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold font-display text-zinc-900 block">INVOICE</span>
                  <span className="text-sm font-mono text-zinc-600 font-bold block">{previewInvoice.invoiceNumber}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded uppercase font-bold mt-2 inline-block bg-zinc-100 text-zinc-800">
                    Status: {previewInvoice.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-xs">
                <div>
                  <span className="text-zinc-400 uppercase font-mono font-semibold block mb-1">Billed To:</span>
                  <strong className="text-sm text-zinc-900 block">{previewInvoice.clientName}</strong>
                  <span className="text-zinc-700 block">{previewInvoice.clientCompany}</span>
                  <span className="text-zinc-500 block">{previewInvoice.clientEmail}</span>
                  {previewInvoice.clientPhone && <span className="text-zinc-500 block">{previewInvoice.clientPhone}</span>}
                </div>
                <div className="sm:text-right">
                  <span className="text-zinc-400 uppercase font-mono font-semibold block mb-1">Invoice Details:</span>
                  <div><strong>Issue Date:</strong> {previewInvoice.issueDate}</div>
                  <div><strong>Payment Due:</strong> {previewInvoice.dueDate}</div>
                  <div><strong>Currency:</strong> IDR (Indonesian Rupiah)</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-xs text-left border-collapse min-w-[320px]">
                  <thead>
                    <tr className="border-b-2 border-zinc-900 text-zinc-900 font-mono uppercase text-[10px]">
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {previewInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 font-medium text-zinc-800">{item.description}</td>
                        <td className="py-3 text-right font-mono">{item.quantity}</td>
                        <td className="py-3 text-right font-mono">{formatIDR(item.unitPrice)}</td>
                        <td className="py-3 text-right font-mono font-bold">{formatIDR(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Calculation */}
              <div className="flex justify-end mb-6 text-xs font-mono">
                <div className="w-64 space-y-1.5 text-right">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal:</span>
                    <span>{formatIDR(previewInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>PPN ({previewInvoice.taxPercent}%):</span>
                    <span>{formatIDR(previewInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-900 font-display">
                    <span>Total Amount:</span>
                    <span className="text-red-600">{formatIDR(previewInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Bank details & Signoff */}
              <div className="bg-zinc-50 p-4 rounded-xl text-xs text-zinc-600 border border-zinc-200">
                <strong className="text-zinc-900 block mb-1">Bank Payment Wire Instructions:</strong>
                <p className="font-mono text-[11px] leading-relaxed">
                  Bank Mandiri Indonesia (Cabang Serpong)<br />
                  Account Number: <strong className="text-zinc-900">123-00-998877-1</strong><br />
                  Beneficiary: <strong className="text-zinc-900">PT KAPITECH DIGITAL INDONESIA</strong>
                </p>
                {previewInvoice.notes && <p className="mt-2 text-zinc-500 italic">{previewInvoice.notes}</p>}
              </div>
            </div>

            {/* Sticky Footer for Preview Modal */}
            <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3.5 border-t border-zinc-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-zinc-400 font-mono">kapitech.id • Finance Division</span>
              <button
                onClick={() => window.print()}
                className="h-10 px-4 min-h-[40px] rounded-xl bg-zinc-900 text-white font-mono font-bold text-xs flex items-center gap-1.5 hover:bg-zinc-800 transition-colors"
              >
                <Download size={14} />
                <span>Print / Save PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
