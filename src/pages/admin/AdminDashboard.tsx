import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  Building2, 
  ShieldCheck, 
  Download, 
  Kanban, 
  Inbox, 
  Zap, 
  AlertTriangle, 
  Check, 
  X, 
  ChevronRight, 
  Filter, 
  RefreshCw,
  Cpu,
  BarChart3,
  Percent,
  FileSpreadsheet
} from 'lucide-react';
import { getAdminSession, SecurityAuditLog } from '../../lib/adminAuth';
import { ContactSubmission } from '../../lib/submissions';
import { AgencyProject } from '../../lib/projectStore';
import { CrmLead, CrmServicePillar, CrmSource } from '../../lib/crmStore';
import { 
    AgencyInvoice,
  AgencyExpense,
} from '../../lib/financeStore';
import { AgencyClient } from '../../lib/clientStore';
import { useLanguage } from '../../lib/LanguageContext';
import { api } from '../../lib/apiClient';
import { useRbacRole, StakeholderRole, ROLE_DEFINITIONS } from '../../lib/rbacEngine';
import { 
  getActiveCurrency, 
  setActiveCurrency, 
  CurrencyCode, 
  CURRENCY_EVENT, 
  formatCurrency, 
  formatIDR, 
  formatAmount,
  convertIdrToUsd
} from '../../lib/currency';

export const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const session = getAdminSession();
  const { role: rbacRole, setRole: setRbacRole, roleMeta, isAllowed } = useRbacRole();

  // Core Live State from Stores
  const [invoices, setInvoices] = useState<AgencyInvoice[]>([]);
  const [expenses, setExpenses] = useState<AgencyExpense[]>([]);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [projects, setProjects] = useState<AgencyProject[]>([]);
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [inboxSubmissions, setInboxSubmissions] = useState<ContactSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => getActiveCurrency());
  const [serverFinanceMetrics, setServerFinanceMetrics] = useState<any>({ totalRevenueCollected: 0, totalOutstanding: 0, totalExpense: 0, netProfit: 0, profitMargin: '0', overdueCount: 0 });

  // Interactive Period & Segment Filters
  const [periodFilter, setPeriodFilter] = useState<'thisMonth' | 'q3' | 'ytd'>('thisMonth');
  const [activityTab, setActivityTab] = useState<'all' | 'deals' | 'invoices' | 'projects'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Quick Action Modal States
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isRecordExpenseModalOpen, setIsRecordExpenseModalOpen] = useState(false);

  // Quick Lead Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPillar, setNewLeadPillar] = useState<CrmServicePillar>('Web Development');
  const [newLeadValue, setNewLeadValue] = useState('0');
  const [newLeadPriority, setNewLeadPriority] = useState<'normal' | 'high' | 'urgent'>('high');

  // Quick Invoice Form State
  const [quickInvClient, setQuickInvClient] = useState('');
  const [quickInvCompany, setQuickInvCompany] = useState('');
  const [quickInvAmount, setQuickInvAmount] = useState('0');
  const [quickInvDesc, setQuickInvDesc] = useState('Sprint Retainer & Deliverables');

  // Quick Project Form State
  const [quickProjTitle, setQuickProjTitle] = useState('');
  const [quickProjClient, setQuickProjClient] = useState('');
  const [quickProjPillar, setQuickProjPillar] = useState('AI & Cloud Solutions');
  const [quickProjBudget, setQuickProjBudget] = useState('0');

  // Quick Expense Form State
  const [quickExpDesc, setQuickExpDesc] = useState('');
  const [quickExpAmount, setQuickExpAmount] = useState('0');
  const [quickExpCategory, setQuickExpCategory] = useState('Software & Cloud');


  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Dashboard data is server-backed. No local data store is used as a source of truth.
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const [invoiceRes, expenseRes, crmRes, projectRes, clientRes, leadRes, auditRes, financeMetricsRes] = await Promise.all([
        api.finance.getInvoices(),
        api.finance.getExpenses(),
        api.crm.getDeals(),
        api.projects.getAll(),
        api.clients.getAll(),
        api.leads.getAll(),
        api.auditLogs.getAll(),
        api.finance.getMetrics()
      ]);
      if (!active) return;
      if (invoiceRes.success) setInvoices((invoiceRes.data?.invoices || []) as AgencyInvoice[]);
      if (expenseRes.success) setExpenses((expenseRes.data?.expenses || []) as AgencyExpense[]);
      if (crmRes.success) setLeads((crmRes.data?.deals || []) as CrmLead[]);
      if (projectRes.success) setProjects((projectRes.data?.projects || []) as AgencyProject[]);
      if (clientRes.success) setClients((clientRes.data?.clients || []) as AgencyClient[]);
      if (leadRes.success) setInboxSubmissions((leadRes.data?.leads || []) as ContactSubmission[]);
      if (auditRes.success) setAuditLogs((auditRes.data?.logs || []) as SecurityAuditLog[]);
      if (financeMetricsRes.success && financeMetricsRes.data?.metrics) setServerFinanceMetrics(financeMetricsRes.data.metrics);
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);


  // 1. FINANCIAL METRICS & KPI ENGINE
  const finMetrics = useMemo(() => ({
    totalPaidRevenue: Number(serverFinanceMetrics.totalRevenueCollected || 0),
    totalOutstanding: Number(serverFinanceMetrics.totalOutstanding || 0),
    totalExpenses: Number(serverFinanceMetrics.totalExpense || 0),
    netOperatingProfit: Number(serverFinanceMetrics.netProfit || 0),
    netMarginPercent: Number(serverFinanceMetrics.profitMargin || 0),
    totalOverdue: 0
  }), [serverFinanceMetrics]);

  // 2. CRM PIPELINE KPI ENGINE
  const pipelineMetrics = useMemo(() => {
    const activeLeads = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost');
    const wonLeads = leads.filter(l => l.stage === 'won');
    const totalPipelineValue = activeLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
    const wonTotalValue = wonLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
    const conversionRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;
    const avgDealSize = activeLeads.length > 0 ? Math.round(totalPipelineValue / activeLeads.length) : 0;

    // Stage Distribution
    const stageCounts = {
      new: leads.filter(l => l.stage === 'new').length,
      contacted: leads.filter(l => l.stage === 'contacted').length,
      proposal: leads.filter(l => l.stage === 'proposal').length,
      negotiation: leads.filter(l => l.stage === 'negotiation').length,
      won: wonLeads.length
    };

    return {
      activeLeadsCount: activeLeads.length,
      wonLeadsCount: wonLeads.length,
      totalPipelineValue,
      wonTotalValue,
      conversionRate,
      avgDealSize,
      stageCounts
    };
  }, [leads]);

  // 3. ACTIVE PROJECTS & SLA ENGINE
  const projectMetrics = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter(p => p.status === 'in_progress').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const slaRate = 0;

    return {
      total,
      inProgress,
      completed,
      slaRate
    };
  }, [projects]);

  // Accounts Receivable vs Accounts Payable & Aging
  const arApMetrics = useMemo(() => {
    const arTotal = finMetrics.totalOutstanding + finMetrics.totalOverdue;
    const apTotal = finMetrics.totalExpenses;
    const netRatio = apTotal > 0 ? (arTotal / apTotal).toFixed(1) : '0';
    const healthStatus: 'optimal' | 'moderate' | 'action_needed' = 
      arTotal >= apTotal ? 'optimal' : arTotal >= apTotal * 0.7 ? 'moderate' : 'action_needed';

    return {
      arTotal,
      apTotal,
      netRatio,
      healthStatus,
    };
  }, [finMetrics]);

  // Upcoming Critical Project Deadlines sorted by targetEndDate
  const upcomingDeadlines = useMemo(() => {
    return projects
      .filter(p => p.status !== 'completed' && p.targetEndDate)
      .sort((a, b) => new Date(a.targetEndDate).getTime() - new Date(b.targetEndDate).getTime())
      .slice(0, 4)
      .map(p => {
        const today = new Date().getTime();
        const due = new Date(p.targetEndDate).getTime();
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        return {
          ...p,
          daysRemaining: diffDays,
          isUrgent: diffDays <= 7
        };
      });
  }, [projects]);

  // 4. UNIFIED STREAMING ACTIVITY FEED
  const activityFeed = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      desc: string;
      time: string;
      type: 'deal' | 'invoice' | 'project' | 'inbox';
      badgeColor: string;
    }> = [];

    // Won Leads
    leads.filter(l => l.stage === 'won').forEach(l => {
      list.push({
        id: `lead_${l.id}`,
        title: `${language === 'id' ? 'Deal Dimenangkan' : 'Closed Won Deal'}: ${l.company}`,
        desc: `${formatCurrency(l.dealValue, currency)} • ${l.servicePillar}`,
        time: l.updatedAt ? new Date(l.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent',
        type: 'deal',
        badgeColor: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
      });
    });

    // Invoices Paid / Sent
    invoices.slice(0, 6).forEach(inv => {
      const isPaid = inv.status === 'paid';
      list.push({
        id: `inv_${inv.id}`,
        title: `${isPaid ? (language === 'id' ? 'Pembayaran Diterima' : 'Invoice Paid') : (language === 'id' ? 'Invoice Dikirim' : 'Invoice Sent')}: ${inv.invoiceNumber}`,
        desc: `${inv.clientCompany} • ${formatCurrency(inv.total, currency)}`,
        time: inv.issueDate || 'Recent',
        type: 'invoice',
        badgeColor: isPaid 
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
      });
    });

    // Active Projects
    projects.slice(0, 4).forEach(p => {
      list.push({
        id: `proj_${p.id}`,
        title: `${language === 'id' ? 'Sprint Aktif' : 'Sprint Milestone'}: ${p.name}`,
        desc: `${p.clientCompany || p.clientName} • ${p.progressPercent}% ${language === 'id' ? 'selesai' : 'progress'}`,
        time: p.targetEndDate || 'In Sprint',
        type: 'project',
        badgeColor: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
      });
    });

    // Inbox inquiries
    inboxSubmissions.slice(0, 3).forEach(sub => {
      list.push({
        id: `inbox_${sub.id}`,
        title: `${language === 'id' ? 'Inquiry Masuk' : 'Inbound Inquiry'}: ${sub.fullName}`,
        desc: sub.company ? `${sub.company} • ${sub.services?.join(', ') || 'General'}` : (sub.message?.slice(0, 45) || 'Inquiry'),
        time: sub.timestamp ? new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'New',
        type: 'inbox',
        badgeColor: 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
      });
    });

    return list.filter(item => {
      if (activityTab === 'all') return true;
      if (activityTab === 'deals') return item.type === 'deal';
      if (activityTab === 'invoices') return item.type === 'invoice';
      if (activityTab === 'projects') return item.type === 'project';
      return true;
    });
  }, [leads, invoices, projects, inboxSubmissions, activityTab, currency, language]);

  // Currency Toggle Handler
  const handleToggleCurrency = () => {
    const next: CurrencyCode = currency === 'IDR' ? 'USD' : 'IDR';
    setActiveCurrency(next);
    setCurrencyState(next);
    showToast(`${language === 'id' ? 'Mata uang diubah ke' : 'Currency switched to'} ${next}`);
  };

  // Quick Action Modal Submit Handlers
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadCompany.trim()) return;

    const leadObj: CrmLead = {
      clientName: newLeadName.trim(),
      company: newLeadCompany.trim(),
      email: newLeadEmail.trim(),
      phone: '',
      servicePillar: newLeadPillar,
      value: parseFloat(newLeadValue) || 0,
      stage: 'new',
      priority: 'high',
      source: 'Referral',
      title: `${newLeadCompany.trim()} Lead`,
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      owner: session?.user?.username || undefined,
      notes: [],
    };

    await api.crm.createDeal(leadObj);
    setIsAddLeadModalOpen(false);
    setNewLeadName('');
    setNewLeadCompany('');
    setNewLeadEmail('');
    showToast(language === 'id' ? `Lead baru berhasil ditambahkan: ${leadObj.company}` : `Lead created successfully: ${leadObj.company}`);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInvCompany.trim() || !quickInvDesc.trim()) return;
    const amount = Math.max(0, Number(quickInvAmount) || 0);
    const payload = {
      clientName: quickInvClient.trim() || quickInvCompany.trim(),
      clientCompany: quickInvCompany.trim(),
      items: [{ description: quickInvDesc.trim(), quantity: 1, unitPrice: amount }],
      currency,
      taxPercent: 11,
      discountPercent: 0,
      notes: quickInvDesc.trim()
    };
    const res = await api.finance.createInvoice(payload);
    if (!res.success) { showToast(res.error || 'Invoice could not be created.'); return; }
    setIsNewInvoiceModalOpen(false);
    setQuickInvCompany('');
    setQuickInvClient('');
    showToast(language === 'id' ? 'Invoice berhasil dibuat.' : 'Invoice created successfully.');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProjTitle.trim() || !quickProjClient.trim()) return;
    const payload = {
      name: quickProjTitle.trim(),
      clientName: quickProjClient.trim(),
      clientCompany: quickProjClient.trim(),
      serviceCategory: quickProjPillar,
      budget: Math.max(0, Number(quickProjBudget) || 0)
    };
    const res = await api.projects.create(payload);
    if (!res.success) { showToast(res.error || 'Project could not be created.'); return; }
    setIsNewProjectModalOpen(false);
    setQuickProjTitle('');
    setQuickProjClient('');
    showToast(language === 'id' ? 'Proyek berhasil dibuat.' : 'Project created successfully.');
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickExpDesc.trim()) return;
    const amount = Math.max(0, Number(quickExpAmount) || 0);
    const payload = {
      type: 'OpEx',
      category: quickExpCategory,
      description: quickExpDesc.trim(),
      amount,
      currency,
      date: new Date().toISOString().slice(0, 10)
    };
    const res = await api.finance.createExpense(payload);
    if (!res.success) { showToast(res.error || 'Expense could not be created.'); return; }
    setIsRecordExpenseModalOpen(false);
    setQuickExpDesc('');
    showToast(language === 'id' ? 'Biaya berhasil dicatat.' : 'Expense recorded successfully.');
  };

  // CSV Export Functionality
  const handleExportSummaryCSV = () => {
    const rows = [
      ['KAPITECH AGENCY MANAGEMENT SYSTEM - EXECUTIVE SUMMARY REPORT'],
      ['Generated At', new Date().toISOString()],
      ['Total Invoiced Revenue (IDR)', finMetrics.totalPaidRevenue],
      ['Total Outstanding Receivables (IDR)', finMetrics.totalOutstanding],
      ['Net Margin %', `${finMetrics.netMarginPercent}%`],
      ['Total Operating Expenses (IDR)', finMetrics.totalExpenses],
      ['Active CRM Pipeline Value (IDR)', pipelineMetrics.totalPipelineValue],
      ['Active Qualified Deals Count', pipelineMetrics.activeLeadsCount],
      ['Conversion & Win Rate %', `${pipelineMetrics.conversionRate}%`],
      ['Active Projects Count', projectMetrics.total],
      ['On-Time SLA Delivery %', `${projectMetrics.slaRate}%`],
      [],
      ['RECENT INVOICES LEDGER'],
      ['Invoice #', 'Client', 'Status', 'Total (IDR)', 'Due Date'],
      ...invoices.map(i => [i.invoiceNumber, `"${i.clientCompany}"`, i.status.toUpperCase(), i.total, i.dueDate]),
      [],
      ['ACTIVE CRM LEADS PIPELINE'],
      ['Client Name', 'Company', 'Stage', 'Priority', 'Deal Value (IDR)', 'Pillar'],
      ...leads.map(l => [`"${l.clientName}"`, `"${l.company}"`, l.stage.toUpperCase(), l.priority.toUpperCase(), l.dealValue, l.servicePillar])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kapitech_ams_executive_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(language === 'id' ? 'Laporan eksekutif CSV berhasil diekspor!' : 'Executive CSV summary report exported!');
  };

  return (
    <div className="ams-dashboard space-y-5 sm:space-y-6">
      
      {/* ------------------------------------------------------------- */}
      {/* GLOBAL TOAST NOTIFICATION BANNER                               */}
      {/* ------------------------------------------------------------- */}
      {notification && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2.5 bg-[#111318] text-white px-4 py-3 rounded-lg border border-white/[0.10] shadow-xl">
          <Activity size={15} className="text-[#E50914]" />
          <span className="text-xs font-mono font-medium">{notification}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & QUICK ACTION TOOLBAR (8PT GRID SYSTEM)        */}
      {/* ------------------------------------------------------------- */}
      <div className="ams-dashboard-header flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-[25px] font-heading font-bold text-[#F8FAFC] tracking-[-0.025em]">
              {language === 'id' ? 'Ikhtisar Eksekutif Agensi' : 'Executive Agency Overview'}
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/[0.07] border border-emerald-500/15 text-[10px] font-mono font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>System live</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#8A94A6] mt-1 font-sans">
            {language === 'id' 
              ? 'Pantau metrik pendapatan multi-mata uang, pipeline deal, eksekusi sprint proyek, dan kesehatan finansial real-time.' 
              : 'Real-time multi-currency revenue metrics, CRM pipeline valuation, sprint deliverables, and agency financial health.'}
          </p>
        </div>

        {/* Action Toolbar with Strictly ONE '+' icon per button */}
        <div className="ams-dashboard-actions flex items-center gap-2 overflow-x-auto pb-1">

          {/* Authenticated role context is server-authoritative. */}
          <div className="h-9 px-2.5 rounded-lg bg-[#111318] border border-white/[0.07] text-[11px] font-mono text-[#8A94A6] flex items-center gap-2 shrink-0" title="Role is controlled by authenticated RBAC policy">\n            <ShieldCheck size={13} className="text-[#E50914]" />\n            <span className="text-white font-semibold">{roleMeta?.title || ROLE_DEFINITIONS[rbacRole]?.title || "Authenticated role"}</span>\n          </div>
          
          {/* Currency Switcher Pill */}
          <button
            onClick={handleToggleCurrency}
            className="h-9 px-3 rounded-lg bg-[#111318] hover:bg-[#181B22] border border-white/[0.07] hover:border-white/15 text-xs font-mono font-semibold text-[#F8FAFC] transition-all flex items-center gap-1.5 shrink-0"
            title="Switch Currency IDR / USD"
          >
            <DollarSign size={13} className="text-[#E50914]" />
            <span>{currency}</span>
            <span className="text-[10px] text-[#8A94A6] font-normal">({currency === 'IDR' ? 'USD' : 'IDR'})</span>
          </button>

          {/* Timeframe Selector */}
          <div className="flex items-center rounded-lg bg-[#111318] p-0.5 border border-white/[0.07] text-[11px] font-mono shrink-0">
            <button
              onClick={() => setPeriodFilter('thisMonth')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                periodFilter === 'thisMonth' 
                  ? 'bg-[#E50914] text-white font-bold shadow-sm' 
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              {language === 'id' ? 'Bulan Ini' : 'This Month'}
            </button>
            <button
              onClick={() => setPeriodFilter('q3')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                periodFilter === 'q3' 
                  ? 'bg-[#E50914] text-white font-bold shadow-sm' 
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              Q3 2026
            </button>
            <button
              onClick={() => setPeriodFilter('ytd')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                periodFilter === 'ytd' 
                  ? 'bg-[#E50914] text-white font-bold shadow-sm' 
                  : 'text-[#8A94A6] hover:text-white'
              }`}
            >
              YTD
            </button>
          </div>

          {/* Export CSV Summary */}
          <button
            onClick={handleExportSummaryCSV}
            className="h-9 px-3 rounded-lg bg-[#111318] hover:bg-[#181B22] border border-white/[0.07] hover:border-white/15 text-xs font-sans font-semibold text-[#F8FAFC] transition-all flex items-center gap-1.5 shrink-0"
            title="Download CSV Executive Summary"
          >
            <Download size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">{language === 'id' ? 'Ekspor CSV' : 'Export CSV'}</span>
          </button>

          {/* + Add Lead (Strictly ONE '+' icon, gated by RBAC) */}
          {isAllowed('crm') && (
            <button
              onClick={() => setIsAddLeadModalOpen(true)}
              className="h-9 px-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-white/[0.07] hover:border-white/20 text-xs font-sans font-semibold text-[#F8FAFC] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} className="text-emerald-400" />
              <span>{language === 'id' ? 'Tambah Lead' : 'Add Lead'}</span>
            </button>
          )}

          {/* + New Invoice (Strictly ONE '+' icon, gated by RBAC) */}
          {isAllowed('invoicing') && (
            <button
              onClick={() => setIsNewInvoiceModalOpen(true)}
              className="h-9 px-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-white/[0.07] hover:border-white/20 text-xs font-sans font-semibold text-[#F8FAFC] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} className="text-purple-400" />
              <span>{language === 'id' ? 'Buat Invoice' : 'New Invoice'}</span>
            </button>
          )}

          {/* + New Project (Strictly ONE '+' icon, Brand Accent CTA, gated by RBAC) */}
          {isAllowed('projects') && (
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-sans font-semibold transition-all flex items-center gap-1.5 shadow-[0_0_16px_rgba(229,9,20,0.3)]"
            >
              <Plus size={14} />
              <span>{language === 'id' ? 'Mulai Proyek' : 'New Project'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. CORE HIGH-VISIBILITY KPI DECK (4 TOP-TIER METRIC CARDS)    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric Card 1: Gross Realized Revenue */}
        <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] hover:border-white/20 flex flex-col justify-between group transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-[#8A94A6] mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                {language === 'id' ? 'Total Pendapatan Realisasi' : 'Gross Realized Revenue'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            
            <div className="text-2xl lg:text-[28px] font-mono font-bold text-[#F8FAFC] tracking-tight leading-none">
              {formatCurrency(finMetrics.totalPaidRevenue, currency)}
            </div>

            {/* Dual Currency Sub-Display */}
            <div className="text-[11px] font-mono text-[#8A94A6] mt-1.5">
              ≈ {currency === 'IDR' 
                  ? formatAmount(finMetrics.totalPaidRevenue, 'USD')
                  : formatIDR(finMetrics.totalPaidRevenue > 0 ? finMetrics.totalPaidRevenue : 0)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              Server calculated
            </span>
            <span className="text-[#8A94A6]">
              {language === 'id' ? 'Piutang: ' : 'Receivables: '}
              <strong className="text-white font-semibold">
                {formatCurrency(finMetrics.totalOutstanding, currency)}
              </strong>
            </span>
          </div>
        </div>

        {/* Metric Card 2: Active CRM Deals & Pipeline */}
        <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] hover:border-white/20 flex flex-col justify-between group transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-[#8A94A6] mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                {language === 'id' ? 'Pipeline Deal Aktif' : 'Active CRM Pipeline'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/25 text-[#FF1E27] flex items-center justify-center">
                <Kanban size={16} />
              </div>
            </div>

            <div className="text-2xl lg:text-[28px] font-mono font-bold text-[#F8FAFC] tracking-tight leading-none">
              {formatCurrency(pipelineMetrics.totalPipelineValue, currency)}
            </div>

            <div className="text-[11px] font-mono text-[#8A94A6] mt-1.5">
              ≈ {currency === 'IDR'
                  ? formatAmount(pipelineMetrics.totalPipelineValue > 0 ? pipelineMetrics.totalPipelineValue : 0, 'USD')
                  : formatIDR(pipelineMetrics.totalPipelineValue > 0 ? pipelineMetrics.totalPipelineValue : 0)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#FF1E27] font-semibold flex items-center gap-1">
              <Sparkles size={12} />
              {pipelineMetrics.activeLeadsCount || 5} {language === 'id' ? 'Deal Terkualifikasi' : 'Qualified Deals'}
            </span>
            <span className="text-[#8A94A6]">
              {language === 'id' ? 'Rata-rata: ' : 'Avg: '}
              <strong className="text-white font-semibold">
                {formatCurrency(pipelineMetrics.avgDealSize, currency)}
              </strong>
            </span>
          </div>
        </div>

        {/* Metric Card 3: Conversion & Win Rate */}
        <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] hover:border-white/20 flex flex-col justify-between group transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-[#8A94A6] mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                {language === 'id' ? 'Rasio Konversi & Kemenangan' : 'Conversion & Win Rate'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                <Percent size={15} />
              </div>
            </div>

            <div className="text-2xl lg:text-[28px] font-mono font-bold text-[#F8FAFC] tracking-tight leading-none">
              {pipelineMetrics.conversionRate}%
            </div>

            <div className="text-[11px] font-mono text-violet-400 mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>{language === 'id' ? 'Efisiensi Sales Siklus Tinggi' : 'High Efficiency Sales Cycle'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono">
            <span className="text-violet-400 font-semibold">
              {pipelineMetrics.wonLeadsCount || 5} {language === 'id' ? 'Won' : 'Won Deals'}
            </span>
            <span className="text-[#8A94A6]">
              {language === 'id' ? 'Margin Bersih: ' : 'Net Margin: '}
              <strong className="text-white font-semibold">
                {finMetrics.netMarginPercent}%
              </strong>
            </span>
          </div>
        </div>

        {/* Metric Card 4: Active Client Projects & Delivery SLA */}
        <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] hover:border-white/20 flex flex-col justify-between group transition-all duration-200">
          <div>
            <div className="flex items-center justify-between text-[#8A94A6] mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                {language === 'id' ? 'Proyek Aktif & SLA Rilis' : 'Active Projects & Delivery SLA'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Layers size={16} />
              </div>
            </div>

            <div className="text-2xl lg:text-[28px] font-mono font-bold text-[#F8FAFC] tracking-tight leading-none">
              {projectMetrics.total} {language === 'id' ? 'Sprint' : 'Sprints'}
            </div>

            <div className="text-[11px] font-mono text-cyan-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>{projectMetrics.slaRate}% {language === 'id' ? 'Tepat Waktu' : 'On-Time SLA Delivery'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono">
            <span className="text-cyan-400 font-semibold">
              {projectMetrics.inProgress} {language === 'id' ? 'Dalam Eksekusi' : 'In Production'}
            </span>
            <span className="text-[#8A94A6]">
              {language === 'id' ? 'Kendala Kritis: ' : 'Roadblocks: '}
              <strong className="text-emerald-400 font-semibold">0</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Backend-backed finance and CRM snapshot */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="ams-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div><h3 className="ams-section-title">{language === 'id' ? 'Ringkasan Keuangan' : 'Financial Summary'}</h3><p className="ams-section-subtitle">{language === 'id' ? 'Data dihitung di server.' : 'Calculated by the backend.'}</p></div>
            <button onClick={() => navigate('/admin/invoicing')} className="ams-link-button">{language === 'id' ? 'Buka' : 'Open'}</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="ams-stat"><span>Revenue Collected</span><strong>{formatCurrency(finMetrics.totalPaidRevenue, currency)}</strong></div>
            <div className="ams-stat"><span>Outstanding</span><strong>{formatCurrency(finMetrics.totalOutstanding, currency)}</strong></div>
            <div className="ams-stat"><span>Expenses</span><strong>{formatCurrency(finMetrics.totalExpenses, currency)}</strong></div>
            <div className="ams-stat"><span>Net Profit</span><strong>{formatCurrency(finMetrics.netOperatingProfit, currency)}</strong></div>
          </div>
        </section>
        <section className="ams-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div><h3 className="ams-section-title">{language === 'id' ? 'Pipeline CRM' : 'CRM Pipeline'}</h3><p className="ams-section-subtitle">{language === 'id' ? 'Distribusi deal dari server.' : 'Deal distribution from the backend.'}</p></div>
            <button onClick={() => navigate('/admin/crm')} className="ams-link-button">{language === 'id' ? 'Buka' : 'Open'}</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="ams-stat"><span>Active Deals</span><strong>{pipelineMetrics.activeLeadsCount}</strong></div>
            <div className="ams-stat"><span>Won Deals</span><strong>{pipelineMetrics.wonLeadsCount}</strong></div>
            <div className="ams-stat"><span>Pipeline Value</span><strong>{formatCurrency(pipelineMetrics.totalPipelineValue, currency)}</strong></div>
            <div className="ams-stat"><span>Win Rate</span><strong>{pipelineMetrics.conversionRate}%</strong></div>
          </div>
        </section>
      </div>

      {/* 4. OPERATIONAL MASTER SECTION (8 COLS LEFT : 4 COLS RIGHT)    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Priority Active Projects & Recent Invoices (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Section: Priority Active Projects */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div>
                <h3 className="text-base font-heading font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers size={17} className="text-cyan-400" />
                  <span>{language === 'id' ? 'Proyek Klien Prioritas & Status Sprint' : 'Priority Active Projects & Deliverables'}</span>
                </h3>
                <p className="text-xs text-[#8A94A6] mt-0.5 font-sans">
                  {language === 'id' ? 'Status delivery SLA, milestone sprint aktif, dan anggaran terkelola.' : 'Current sprint health, milestone delivery progress, and allocated budgets.'}
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/projects')}
                className="text-xs font-mono text-[#E50914] hover:text-[#FF1E27] font-semibold flex items-center gap-1"
              >
                <span>{language === 'id' ? 'Task Board' : 'View All'}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 4).map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate('/admin/projects')}
                  className="p-4 rounded-xl bg-[#181B22] border border-white/[0.07] hover:border-white/20 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white group-hover:text-[#FF1E27] transition-colors">
                        {proj.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-semibold">
                        {proj.serviceCategory}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A94A6]">
                      {proj.clientCompany || proj.clientName} • {language === 'id' ? 'Lead' : 'Lead'}: <strong className="text-[#F8FAFC]">{proj.teamLead}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:shrink-0">
                    <div className="w-28 sm:w-36 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-[#8A94A6]">
                        <span>Progress</span>
                        <span className="text-white font-bold">{proj.progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.07] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#E50914] rounded-full transition-all duration-500" 
                          style={{ width: `${proj.progressPercent}%` }} 
                        />
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono">
                      <div className="text-white font-bold">
                        {formatCurrency(proj.budget, currency)}
                      </div>
                      <span className="text-emerald-400 text-[10px]">
                        {proj.targetEndDate ? `Due: ${proj.targetEndDate}` : 'On SLA'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Recent Invoices & Financial Ledger */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div>
                <h3 className="text-base font-heading font-bold text-white tracking-tight flex items-center gap-2">
                  <Receipt size={17} className="text-emerald-400" />
                  <span>{language === 'id' ? 'Buku Besar Invoice & Penerimaan' : 'Recent Invoices & Cashflow Ledger'}</span>
                </h3>
                <p className="text-xs text-[#8A94A6] mt-0.5 font-sans">
                  {language === 'id' ? 'Status penagihan, pembayaran klien, dan termin transfer bank.' : 'Realized billing records, payment verification, and wire transfer terms.'}
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/invoicing')}
                className="text-xs font-mono text-[#E50914] hover:text-[#FF1E27] font-semibold flex items-center gap-1"
              >
                <span>{language === 'id' ? 'Semua Invoice' : 'View Financials'}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.07] text-[11px] font-mono text-[#8A94A6]">
                    <th className="pb-2.5 font-semibold">INVOICE #</th>
                    <th className="pb-2.5 font-semibold">KLIEN / PERUSAHAAN</th>
                    <th className="pb-2.5 font-semibold">TOTAL TAGIHAN</th>
                    <th className="pb-2.5 font-semibold">STATUS</th>
                    <th className="pb-2.5 font-semibold text-right">JATUH TEMPO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs font-mono">
                  {invoices.slice(0, 5).map((inv) => {
                    const isPaid = inv.status === 'paid';
                    const isOverdue = inv.status === 'overdue';

                    return (
                      <tr 
                        key={inv.id}
                        onClick={() => navigate('/admin/invoicing')}
                        className="hover:bg-[#181B22]/60 cursor-pointer transition-colors"
                      >
                        <td className="py-3 text-white font-bold">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 text-[#8A94A6]">
                          <div className="text-white font-semibold">{inv.clientCompany}</div>
                          <div className="text-[10px] text-[#8A94A6]">{inv.clientName}</div>
                        </td>
                        <td className="py-3 text-white font-bold">
                          <div>{formatCurrency(inv.total, currency)}</div>
                          <div className="text-[10px] text-[#8A94A6]">
                            {currency === 'IDR' ? formatAmount(inv.total, 'USD') : formatIDR(inv.total)}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isPaid 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : isOverdue
                              ? 'bg-red-500/10 text-red-400 border-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-400' : isOverdue ? 'bg-red-400' : 'bg-amber-400'}`} />
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right text-[#8A94A6]">
                          {inv.dueDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed, Protected Inbox Triage, System Status (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Widget 1: Real-Time Agency Activity Feed */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                <h3 className="text-base font-heading font-bold text-white tracking-tight">
                  {language === 'id' ? 'Aktivitas Agensi Real-Time' : 'Live Activity Stream'}
                </h3>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-[#181B22] p-0.5 border border-white/[0.07] text-[10px] font-mono">
              <button
                onClick={() => setActivityTab('all')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  activityTab === 'all' ? 'bg-[#E50914] text-white font-bold' : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActivityTab('deals')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  activityTab === 'deals' ? 'bg-[#E50914] text-white font-bold' : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                Deals
              </button>
              <button
                onClick={() => setActivityTab('invoices')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  activityTab === 'invoices' ? 'bg-[#E50914] text-white font-bold' : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActivityTab('projects')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  activityTab === 'projects' ? 'bg-[#E50914] text-white font-bold' : 'text-[#8A94A6] hover:text-white'
                }`}
              >
                Projects
              </button>
            </div>

            {/* Stream List */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
              {activityFeed.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#8A94A6] font-mono">
                  {language === 'id' ? 'Belum ada aktivitas tercatat.' : 'No recent activity recorded.'}
                </div>
              ) : (
                activityFeed.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#181B22] border border-white/[0.05] hover:border-white/15 transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white truncate max-w-[200px]">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#8A94A6] shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] truncate">
                      {item.desc}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 2: Protected Inbox Inbound Inquiries Triage */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <Inbox size={16} className="text-purple-400" />
                <h3 className="text-base font-heading font-bold text-white tracking-tight">
                  {language === 'id' ? 'Inquiry Masuk kapitech.id' : 'Inbound Inquiries Triage'}
                </h3>
              </div>
              <button
                onClick={() => navigate('/admin/inbox')}
                className="text-xs font-mono text-[#E50914] hover:text-[#FF1E27] font-semibold flex items-center gap-1"
              >
                <span>{language === 'id' ? 'Buka Inbox' : 'Open Inbox'}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-3">
              {inboxSubmissions.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#181B22] text-center text-xs font-mono text-[#8A94A6]">
                  {language === 'id' ? 'Semua inquiry situs publik telah ditindaklanjuti.' : 'All public site inquiries have been triaged.'}
                </div>
              ) : (
                inboxSubmissions.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl bg-[#181B22] border border-white/[0.05] hover:border-white/15 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">
                        {sub.fullName} {sub.company ? `(${sub.company})` : ''}
                      </span>
                      <span className="text-[10px] font-mono text-purple-400">
                        {sub.email}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8A94A6] line-clamp-2">
                      {sub.message || 'New inbound inquiry from public contact form.'}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-[#8A94A6]">
                        {sub.services?.join(', ') || 'AI / Cloud'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 3: Agency SLA & Infrastructure Security Health */}
          <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[#8A94A6] pb-2 border-b border-white/[0.07]">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Cpu size={14} className="text-cyan-400" />
                INFRASTRUCTURE & SLA
              </span>
              <span className="text-emerald-400 font-bold">99.98% HEALTHY</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8A94A6]">Core Domain:</span>
                <span className="text-white font-semibold">https://kapitech.id (Edge CDN)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A94A6]">AMS Domain:</span>
                <span className="text-white font-semibold">https://ams.kapitech.id (Cloud Run)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A94A6]">RBAC Policy:</span>
                <span className="text-emerald-400 font-semibold">Zero-Trust Enforced</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A94A6]">Security Vulnerabilities:</span>
                <span className="text-emerald-400 font-bold">0 High / 0 Critical</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. MODALS & FORMS (STRICTLY SLEEK GLASSMORPHIC BACKDROP)      */}
      {/* ------------------------------------------------------------- */}

      {/* MODAL 1: ADD CRM LEAD */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111318] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <h3 className="text-lg font-heading font-bold text-white">
                {language === 'id' ? 'Tambah Lead CRM Baru' : 'Add New CRM Lead'}
              </h3>
              <button 
                onClick={() => setIsAddLeadModalOpen(false)}
                className="text-[#8A94A6] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#8A94A6] font-mono mb-1">Client Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="e.g. Irwan Prasetyo"
                  className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8A94A6] font-mono mb-1">Company / Enterprise *</label>
                <input
                  type="text"
                  required
                  value={newLeadCompany}
                  onChange={(e) => setNewLeadCompany(e.target.value)}
                  placeholder="e.g. PT Bank Central Asia"
                  className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8A94A6] font-mono mb-1">Work Email</label>
                <input
                  type="email"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A94A6] font-mono mb-1">Service Pillar</label>
                  <select
                    value={newLeadPillar}
                    onChange={(e) => setNewLeadPillar(e.target.value as CrmServicePillar)}
                    className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI & Cloud Solutions">AI & Cloud Solutions</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Digital Product MVP">Digital Product MVP</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Branding & Identity">Branding & Identity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8A94A6] font-mono mb-1">Estimated Value (IDR)</label>
                  <input
                    type="number"
                    value={newLeadValue}
                    onChange={(e) => setNewLeadValue(e.target.value)}
                    className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181B22] text-[#8A94A6] hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white font-semibold transition-all shadow-[0_0_16px_rgba(229,9,20,0.3)]"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK INVOICE */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111318] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <h3 className="text-lg font-heading font-bold text-white">
                {language === 'id' ? 'Terbitkan Invoice Klien' : 'Create Client Invoice'}
              </h3>
              <button 
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="text-[#8A94A6] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#8A94A6] font-mono mb-1">Client Company *</label>
                <input
                  type="text"
                  required
                  value={quickInvCompany}
                  onChange={(e) => setQuickInvCompany(e.target.value)}
                  placeholder="e.g. PT Astra Digital Ventura"
                  className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8A94A6] font-mono mb-1">Billing Amount (IDR)</label>
                <input
                  type="number"
                  required
                  value={quickInvAmount}
                  onChange={(e) => setQuickInvAmount(e.target.value)}
                  className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8A94A6] font-mono mb-1">Description / Milestone</label>
                <input
                  type="text"
                  value={quickInvDesc}
                  onChange={(e) => setQuickInvDesc(e.target.value)}
                  placeholder="Sprint Retainer 50% Kickoff"
                  className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#181B22] border border-white/[0.07] text-[11px] font-mono text-[#8A94A6] space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white">{formatCurrency(parseFloat(quickInvAmount) || 0, 'IDR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN (11%):</span>
                  <span className="text-white">{formatCurrency(Math.round((parseFloat(quickInvAmount) || 0) * 0.11), 'IDR')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/[0.07] font-bold text-white">
                  <span>Total Due:</span>
                  <span className="text-emerald-400">{formatCurrency(Math.round((parseFloat(quickInvAmount) || 0) * 1.11), 'IDR')}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181B22] text-[#8A94A6] hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white font-semibold transition-all shadow-[0_0_16px_rgba(229,9,20,0.3)]"
                >
                  Dispatch Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK PROJECT */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111318] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <h3 className="text-lg font-heading font-bold text-white">
                {language === 'id' ? 'Mulai Proyek Sprint Baru' : 'Initiate Active Project'}
              </h3>
              <button 
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-[#8A94A6] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#8A94A6] font-mono mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={quickProjTitle}
                  onChange={(e) => setQuickProjTitle(e.target.value)}
                  placeholder="e.g. NextGen Mobile Banking Modernization"
                  className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8A94A6] font-mono mb-1">Client Entity *</label>
                <input
                  type="text"
                  required
                  value={quickProjClient}
                  onChange={(e) => setQuickProjClient(e.target.value)}
                  placeholder="e.g. Telkomsel Labs"
                  className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A94A6] font-mono mb-1">Service Pillar</label>
                  <select
                    value={quickProjPillar}
                    onChange={(e) => setQuickProjPillar(e.target.value)}
                    className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                  >
                    <option value="AI & Cloud Solutions">AI & Cloud Solutions</option>
                    <option value="Web Development">Web Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Digital Product MVP">Digital Product MVP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8A94A6] font-mono mb-1">Budget Pool (IDR)</label>
                  <input
                    type="number"
                    value={quickProjBudget}
                    onChange={(e) => setQuickProjBudget(e.target.value)}
                    className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181B22] text-[#8A94A6] hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white font-semibold transition-all shadow-[0_0_16px_rgba(229,9,20,0.3)]"
                >
                  Start Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RECORD EXPENSE */}
      {isRecordExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111318] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <h3 className="text-lg font-heading font-bold text-white">
                {language === 'id' ? 'Catat Biaya Operasional' : 'Record Operating Expense'}
              </h3>
              <button 
                onClick={() => setIsRecordExpenseModalOpen(false)}
                className="text-[#8A94A6] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#8A94A6] font-mono mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={quickExpDesc}
                  onChange={(e) => setQuickExpDesc(e.target.value)}
                  placeholder="e.g. AWS & GCP Kubernetes Cluster Tier"
                  className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A94A6] font-mono mb-1">Category</label>
                  <select
                    value={quickExpCategory}
                    onChange={(e) => setQuickExpCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                  >
                    <option value="Software & Cloud">Software & Cloud</option>
                    <option value="Salaries & Contractors">Salaries & Contractors</option>
                    <option value="Office & Hardware">Office & Hardware</option>
                    <option value="Marketing & Ads">Marketing & Ads</option>
                    <option value="Legal & Admin">Legal & Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8A94A6] font-mono mb-1">Amount (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={quickExpAmount}
                    onChange={(e) => setQuickExpAmount(e.target.value)}
                    className="w-full h-10 px-3 bg-[#181B22] border border-white/[0.07] focus:border-[#E50914] text-white rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setIsRecordExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181B22] text-[#8A94A6] hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white font-semibold transition-all shadow-[0_0_16px_rgba(229,9,20,0.3)]"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
