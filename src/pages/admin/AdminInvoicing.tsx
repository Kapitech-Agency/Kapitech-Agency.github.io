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
import { CustomSelect } from '../../components/ui/CustomSelect';

export const AdminInvoicing: React.FC = () => {
  const { t, language } = useLanguage();
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
    const invNum = `KAPI-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    setEditingInvoice(null);
    setClientName('');
    setClientCompany('');
    setClientEmail('');
    setClientPhone('');
    setItemDesc('Digital Product & Engineering Phase 1 Deliverables');
    setItemAmount(45000000);
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setTaxPercent(11);
    setInvoiceStatus('sent');
    setInvoiceNotes('Payment terms: Net 14 days. Bank Account Mandiri 123-00-998877-1 a/n PT Kapitech Digital Indonesia.');
    setIsInvoiceModalOpen(true);
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

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262930]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Receipt className="text-brand-red" size={26} />
            <span>{t('admin.fin.title')}</span>
          </h1>
          <p className="text-xs text-[#8A909D] mt-1">
            {t('admin.fin.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#16181D] hover:bg-[#20232B] text-white text-xs font-mono font-bold border border-[#262930] transition-all flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>{t('admin.fin.recordExpense')}</span>
          </button>

          <button
            onClick={handleOpenCreateInvoice}
            className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-brand-red/20"
          >
            <Plus size={14} />
            <span>{t('admin.fin.createInvoice')}</span>
          </button>
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
        <div className="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-[#484F58] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-2">
              <span className="text-xs font-mono uppercase font-semibold">{t('admin.fin.revenuePaid')}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {formatAmount(metrics.totalPaidRevenue, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#30363D] text-[11px] font-mono">
            <span className="text-[#8A909D]">{metrics.paidCount} {language === 'id' ? 'Invoice Lunas' : 'Paid Invoices'}</span>
            <span className="text-emerald-400 font-semibold">{metrics.collectionRate}% {language === 'id' ? 'Tertagih' : 'Collected'}</span>
          </div>
        </div>

        {/* Metric 2: Outstanding */}
        <div className="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-[#484F58] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-2">
              <span className="text-xs font-mono uppercase font-semibold">{t('admin.fin.outstanding')}</span>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {formatAmount(metrics.totalOutstanding, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#30363D] text-[11px] font-mono">
            <span className="text-[#8A909D]">{metrics.sentCount} {language === 'id' ? 'Invoice Tertunda' : 'Pending Invoices'}</span>
            <span className="text-red-400 font-semibold">{language === 'id' ? 'Menunggu Pelunasan' : 'Awaiting Settlement'}</span>
          </div>
        </div>

        {/* Metric 3: Total Expenses */}
        <div className="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-[#484F58] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-2">
              <span className="text-xs font-mono uppercase font-semibold">{t('admin.fin.expenses')}</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <TrendingDown size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {formatAmount(metrics.totalExpenses, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#30363D] text-[11px] font-mono">
            <span className="text-[#8A909D]">{expenses.length} {language === 'id' ? 'Catatan' : 'Records'}</span>
            <span className="text-rose-400 font-semibold">Infrastructure & Ops</span>
          </div>
        </div>

        {/* Metric 4: Net Operating Profit */}
        <div className="bg-[#161B22] border border-[#30363D] p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-[#484F58] transition-all">
          <div>
            <div className="flex items-center justify-between text-[#8A909D] mb-2">
              <span className="text-xs font-mono uppercase font-semibold">{t('admin.fin.netProfit')}</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {formatAmount(metrics.netOperatingProfit, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#30363D] text-[11px] font-mono">
            <span className="text-[#8A909D]">Margin</span>
            <span className="text-purple-400 font-semibold">
              {metrics.totalPaidRevenue > 0 ? Math.round((metrics.netOperatingProfit / metrics.totalPaidRevenue) * 100) : 0}% Net
            </span>
          </div>
        </div>

      </div>

      {/* 3. Tab Bar & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161B22] border border-[#30363D] p-3 sm:p-4 rounded-2xl">
        
        {/* Left: Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0D1117] p-1 rounded-xl border border-[#30363D] shrink-0">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'invoices'
                ? 'bg-brand-red text-white font-bold shadow-md'
                : 'text-[#8A909D] hover:text-white'
            }`}
          >
            <Receipt size={14} />
            <span>{t('admin.fin.invoicesList')} ({invoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'bg-brand-red text-white font-bold shadow-md'
                : 'text-[#8A909D] hover:text-white'
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A909D]" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'id' ? 'Cari no invoice, klien...' : 'Search invoice number, client...'}
                className="w-full pl-8 pr-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-xl text-xs text-white placeholder-[#5C626E] focus:outline-none focus:border-brand-red font-mono"
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
        <div 
          ref={tableScrollRef}
          className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-x-auto shadow-xl select-none"
        >
          <table className="w-full text-left text-xs font-mono min-w-[750px]">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117] text-[#8A909D]">
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">Invoice #</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Klien & Perusahaan' : 'Client & Company'}</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Tanggal / Jatuh Tempo' : 'Issue / Due Date'}</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Nominal' : 'Amount'}</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">Status</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px] text-right">{language === 'id' ? 'Aksi' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8A909D]">
                    {language === 'id' ? 'Tidak ada invoice yang sesuai kriteria.' : 'No invoices found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#1C2128] transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-white font-display">
                      <button 
                        onClick={() => setPreviewInvoice(inv)} 
                        className="hover:text-brand-red flex items-center gap-1.5"
                      >
                        <span>{inv.invoiceNumber}</span>
                        <ExternalLink size={11} className="text-[#8A909D] group-hover:text-brand-red" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{inv.clientName}</div>
                      <div className="text-[11px] text-[#8A909D]">{inv.clientCompany}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#8A909D]">
                      <div>Issue: {inv.issueDate}</div>
                      <div className="text-[10px] text-[#5C626E]">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 font-display">
                      {formatAmount(inv.total, currency)}
                      <div className="text-[10px] font-mono text-[#5C626E] font-normal">
                        incl. {inv.taxPercent}% PPN
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={inv.status}
                        onChange={(e) => {
                          updateInvoiceStatus(inv.id, e.target.value as InvoiceStatus);
                          showToast(`Status updated to ${e.target.value.toUpperCase()}`);
                        }}
                        className="bg-[#0D1117] border border-[#30363D] text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-red font-mono"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 rounded-lg bg-[#0D1117] hover:bg-[#21262D] text-[#8A909D] hover:text-white border border-[#30363D] transition-colors"
                          title="Preview & Print Invoice"
                        >
                          <FileText size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEditInvoice(inv)}
                          className="p-1.5 rounded-lg bg-[#0D1117] hover:bg-[#21262D] text-[#8A909D] hover:text-white border border-[#30363D] transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                          className="p-1.5 rounded-lg bg-[#0D1117] hover:bg-red-950/40 text-[#8A909D] hover:text-red-400 border border-[#30363D] transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Expenses List */
        <div 
          ref={tableScrollRef}
          className="bg-[#161B22] border border-[#30363D] rounded-2xl overflow-x-auto shadow-xl select-none"
        >
          <table className="w-full text-left text-xs font-mono min-w-[650px]">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117] text-[#8A909D]">
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Tanggal' : 'Date'}</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Kategori' : 'Category'}</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Deskripsi' : 'Description'}</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Nominal' : 'Amount'}</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px]">{language === 'id' ? 'Dicatat Oleh' : 'Recorded By'}</th>
                <th className="py-3 px-4 font-semibold uppercase text-[10px] text-right">{language === 'id' ? 'Aksi' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#1C2128] transition-colors">
                  <td className="py-3.5 px-4 text-[#8A909D]">{exp.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#0D1117] text-amber-400 border border-amber-500/20 text-[10px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white">{exp.description}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-400 font-display">
                    {formatAmount(exp.amount, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-[#8A909D]">{exp.recordedBy}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 rounded-lg bg-[#0D1117] hover:bg-red-950/40 text-[#8A909D] hover:text-red-400 border border-[#30363D] transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Create / Edit Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#16181D] border border-[#262930] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#262930]">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <Receipt className="text-brand-red" size={20} />
                <span>{editingInvoice ? 'Edit Client Invoice' : 'Create New Invoice'}</span>
              </h3>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="p-1.5 text-[#8A909D] hover:text-white rounded-lg bg-[#0B0C0E] border border-[#262930]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Client Name *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    placeholder="e.g. Marcus Thorne"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    required
                    placeholder="e.g. Lumina Real Estate"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+62 811-XXXX-XXXX"
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#0B0C0E] border border-[#262930] rounded-xl space-y-3">
                <label className="block text-white font-bold">Line Item & Milestone Valuation</label>
                <div>
                  <label className="block text-[#8A909D] mb-1">Deliverable Description</label>
                  <textarea
                    rows={2}
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#16181D] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8A909D] mb-1">Amount (IDR Rupiah)</label>
                    <input
                      type="number"
                      value={itemAmount}
                      onChange={(e) => setItemAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#16181D] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8A909D] mb-1">PPN / Tax % (e.g. 11%)</label>
                    <input
                      type="number"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#16181D] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                    />
                  </div>
                </div>
                <div className="pt-2 text-right text-emerald-400 font-bold font-display text-sm">
                  Total Payable: {formatIDR(itemAmount + Math.round((itemAmount * taxPercent) / 100))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Status</label>
                  <select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value as InvoiceStatus)}
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">Bank Wire Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#262930]">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0B0C0E] text-[#8A909D] hover:text-white border border-[#262930]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white font-bold shadow-lg shadow-brand-red/20"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Record Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16181D] border border-[#262930] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#262930]">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="text-brand-red" size={18} />
                <span>Record Studio Expense</span>
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-1 text-[#8A909D] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                >
                  <option value="Software & Cloud">Software & Cloud (Vercel, AWS, Figma)</option>
                  <option value="Salaries & Contractors">Salaries & Contractors</option>
                  <option value="Office & Hardware">Office & Hardware</option>
                  <option value="Marketing & Ads">Marketing & Ads</option>
                  <option value="Legal & Admin">Legal & Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8A909D] mb-1 font-semibold">Description *</label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  required
                  placeholder="e.g. Google Cloud Run cluster billing"
                  className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Amount (IDR)</label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-[#8A909D] mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#262930] rounded-xl text-white focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#262930]">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0B0C0E] text-[#8A909D] hover:text-white border border-[#262930]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white font-bold shadow-md shadow-brand-red/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Printable Invoice Preview Slide-Over / Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-zinc-900 rounded-2xl w-full max-w-2xl p-8 shadow-2xl font-sans relative">
            <button
              onClick={() => setPreviewInvoice(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Invoice Printable Header */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                    K
                  </div>
                  <span className="text-xl font-bold font-display tracking-tight text-zinc-900">KAPITECH AGENCY</span>
                </div>
                <p className="text-xs text-zinc-500 font-mono">PT Kapitech Digital Indonesia</p>
                <p className="text-xs text-zinc-500 max-w-xs mt-1">
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
            <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
              <div>
                <span className="text-zinc-400 uppercase font-mono font-semibold block mb-1">Billed To:</span>
                <strong className="text-sm text-zinc-900 block">{previewInvoice.clientName}</strong>
                <span className="text-zinc-700 block">{previewInvoice.clientCompany}</span>
                <span className="text-zinc-500 block">{previewInvoice.clientEmail}</span>
                {previewInvoice.clientPhone && <span className="text-zinc-500 block">{previewInvoice.clientPhone}</span>}
              </div>
              <div className="text-right">
                <span className="text-zinc-400 uppercase font-mono font-semibold block mb-1">Invoice Details:</span>
                <div><strong>Issue Date:</strong> {previewInvoice.issueDate}</div>
                <div><strong>Payment Due:</strong> {previewInvoice.dueDate}</div>
                <div><strong>Currency:</strong> IDR (Indonesian Rupiah)</div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-xs text-left mb-6 border-collapse">
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
            <div className="bg-zinc-50 p-4 rounded-xl text-xs text-zinc-600 border border-zinc-200 mb-6">
              <strong className="text-zinc-900 block mb-1">Bank Payment Wire Instructions:</strong>
              <p className="font-mono text-[11px] leading-relaxed">
                Bank Mandiri Indonesia (Cabang Serpong)<br />
                Account Number: <strong className="text-zinc-900">123-00-998877-1</strong><br />
                Beneficiary: <strong className="text-zinc-900">PT KAPITECH DIGITAL INDONESIA</strong>
              </p>
              {previewInvoice.notes && <p className="mt-2 text-zinc-500 italic">{previewInvoice.notes}</p>}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 text-xs">
              <span className="text-zinc-400 font-mono">kapitech.id • Finance Division</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-mono font-bold text-xs flex items-center gap-1.5 hover:bg-zinc-800 transition-colors"
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
