import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  DollarSign,
  Receipt,
  CheckCircle2,
  Layers,
  Activity,
  ShieldCheck,
  Download,
  Columns3,
  Inbox,
  X,
  ChevronRight,
  Cpu,
  Percent
} from 'lucide-react';

const Kanban = Columns3;
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
import { CustomSelect } from '../../components/ui/CustomSelect';
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
    totalOverdue: Number(serverFinanceMetrics.overdueCount || 0)
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

  // 3. ACTIVE PROJECTS & DELIVERY ENGINE
  const projectMetrics = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter(p => p.status === 'in_progress').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const projectsWithProgress = projects.filter(p => typeof p.progressPercent === 'number');
    const averageProgress = projectsWithProgress.length > 0
      ? Math.round(projectsWithProgress.reduce((sum, p) => sum + (p.progressPercent || 0), 0) / projectsWithProgress.length)
      : 0;

    return {
      total,
      inProgress,
      completed,
      averageProgress
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
        badgeColor: 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30'
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
          ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30' 
          : 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30'
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
        badgeColor: 'bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/30'
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
        badgeColor: 'bg-[var(--info)]/10 text-[var(--info)] border border-[var(--info)]/30'
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

    const leadPayload = {
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
      notes: [],
    };

    const res = await api.crm.createDeal(leadPayload);
    if (!res.success) { showToast(res.error || 'Lead could not be created.'); return; }
    setIsAddLeadModalOpen(false);
    setNewLeadName('');
    setNewLeadCompany('');
    setNewLeadEmail('');
    showToast(language === 'id' ? `Lead baru berhasil ditambahkan: ${newLeadCompany.trim()}` : `Lead created successfully: ${newLeadCompany.trim()}`);
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
      ['Average Project Progress %', `${projectMetrics.averageProgress}%`],
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
        <div className="fixed top-16 left-3 right-3 sm:left-auto sm:top-20 sm:right-5 z-50 flex items-center gap-2.5 bg-[var(--panel)] text-[var(--text)] px-4 py-3 rounded-control border border-[var(--line)] shadow-none">
          <Activity size={15} className="text-[var(--accent)]" />
          <span className="text-xs font-sans font-medium">{notification}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & QUICK ACTION TOOLBAR (8PT GRID SYSTEM)        */}
      {/* ------------------------------------------------------------- */}
      <div className="ams-dashboard-header flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-heading font-semibold text-[var(--text)] tracking-[-0.025em]">
              {language === 'id' ? 'Ikhtisar Eksekutif Agensi' : 'Executive Agency Overview'}
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--success)]/10 border border-[var(--success)]/20 text-[10px] font-sans font-semibold text-[var(--success)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
              <span>Live data</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-sans leading-[18px] max-w-3xl text-left">
            {language === 'id' 
              ? 'Pantau metrik pendapatan multi-mata uang, pipeline deal, eksekusi sprint proyek, dan kesehatan finansial real-time.' 
              : 'Real-time multi-currency revenue metrics, CRM pipeline valuation, sprint deliverables, and agency financial health.'}
          </p>
        </div>

        {/* Action Toolbar with Strictly ONE '+' icon per button */}
        <div className="ams-dashboard-actions flex flex-wrap items-center gap-2 w-full xl:w-auto">

          {/* Authenticated role context is server-authoritative. */}
          <div className="min-h-10 xl:h-9 px-2.5 rounded-control bg-[var(--panel)] border border-line text-[11px] font-sans text-[var(--muted)] flex items-center gap-2 shrink-0 max-w-full" title="Role is controlled by authenticated RBAC policy">
            <ShieldCheck size={13} className="text-[var(--accent)]" />\n            <span className="text-[var(--text)] font-semibold">{roleMeta?.title || ROLE_DEFINITIONS[rbacRole]?.title || "Authenticated role"}</span>
          </div>
          
          {/* Currency Switcher Pill */}
          <button
            onClick={handleToggleCurrency}
            className="min-h-10 xl:h-9 px-3 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] border border-line hover:border-accent/30 text-xs font-sans font-semibold text-[var(--text)] transition-all flex items-center gap-1.5 shrink-0"
            title="Switch Currency IDR / USD"
          >
            <DollarSign size={13} className="text-[var(--accent)]" />
            <span>{currency}</span>
            <span className="text-[10px] text-[var(--muted)] font-normal">({currency === 'IDR' ? 'USD' : 'IDR'})</span>
          </button>

          {/* Export CSV Summary */}
          <button
            onClick={handleExportSummaryCSV}
            className="min-h-10 xl:h-9 px-3 rounded-control bg-[var(--panel)] hover:bg-[var(--panel)] border border-line hover:border-accent/30 text-xs font-sans font-semibold text-[var(--text)] transition-all flex items-center gap-1.5 shrink-0"
            title="Download CSV Executive Summary"
          >
            <Download size={13} className="text-[var(--muted)]" />
            <span className="hidden sm:inline">{language === 'id' ? 'Ekspor CSV' : 'Export CSV'}</span>
          </button>

          {/* + Add Lead (Strictly ONE '+' icon, gated by RBAC) */}
          {isAllowed('crm') && (
            <button
              onClick={() => setIsAddLeadModalOpen(true)}
              className="min-h-10 px-3 rounded-control bg-[var(--panel)] hover:bg-[var(--panel-hover)] border border-[var(--line)]  text-xs font-sans font-semibold text-[var(--text)] transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} className="text-[var(--success)]" />
              <span>{language === 'id' ? 'Tambah Lead' : 'Add Lead'}</span>
            </button>
          )}

          {/* + New Invoice (Strictly ONE '+' icon, gated by RBAC) */}
          {isAllowed('invoicing') && (
            <button
              onClick={() => setIsNewInvoiceModalOpen(true)}
              className="min-h-10 px-3 rounded-control bg-[var(--panel)] hover:bg-[var(--panel-hover)] border border-[var(--line)]  text-xs font-sans font-semibold text-[var(--text)] transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} className="text-purple-400" />
              <span>{language === 'id' ? 'Buat Invoice' : 'New Invoice'}</span>
            </button>
          )}

          {/* + New Project (Strictly ONE '+' icon, Brand Accent CTA, gated by RBAC) */}
          {isAllowed('projects') && (
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="min-h-10 xl:h-9 px-3.5 rounded-control bg-[var(--accent)] hover:bg-[var(--accent)] text-white text-xs font-sans font-semibold transition-colors flex items-center gap-1.5"
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
      <div className="ams-kpi-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        
        {/* Metric Card 1: Gross Realized Revenue */}
        <div className="p-4 sm:p-5 rounded-card bg-[var(--panel)] border border-line flex flex-col justify-between group transition-colors duration-150 min-w-0">
          <div>
            <div className="flex items-center justify-between text-[var(--muted)] mb-3">
              <span className="text-[11px] font-sans normal-case tracking-normal font-semibold">
                {language === 'id' ? 'Total Pendapatan Realisasi' : 'Gross Realized Revenue'}
              </span>
              <div className="w-8 h-8 rounded-control bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            
            <div className="text-2xl lg:text-[28px] font-sans font-semibold text-[var(--text)] tracking-tight leading-none">
              {formatCurrency(finMetrics.totalPaidRevenue, currency)}
            </div>

            {/* Dual Currency Sub-Display */}
            <div className="text-[11px] font-sans text-[var(--muted)] mt-1.5">
              ≈ {currency === 'IDR' 
                  ? formatAmount(finMetrics.totalPaidRevenue, 'USD')
                  : formatIDR(finMetrics.totalPaidRevenue > 0 ? finMetrics.totalPaidRevenue : 0)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-[11px] font-sans">
            <span className="text-[var(--success)] font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              Server calculated
            </span>
            <span className="text-[var(--muted)]">
              {language === 'id' ? 'Piutang: ' : 'Receivables: '}
              <strong className="text-[var(--text)] font-semibold">
                {formatCurrency(finMetrics.totalOutstanding, currency)}
              </strong>
            </span>
          </div>
        </div>

        {/* Metric Card 2: Active CRM Deals & Pipeline */}
        <div className="p-4 sm:p-5 rounded-card bg-[var(--panel)] border border-line flex flex-col justify-between group transition-colors duration-150 min-w-0">
          <div>
            <div className="flex items-center justify-between text-[var(--muted)] mb-3">
              <span className="text-[11px] font-sans normal-case tracking-normal font-semibold">
                {language === 'id' ? 'Pipeline Deal Aktif' : 'Active CRM Pipeline'}
              </span>
              <div className="w-8 h-8 rounded-control bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-[var(--danger)] flex items-center justify-center">
                <Kanban size={16} />
              </div>
            </div>

            <div className="text-2xl lg:text-[28px] font-sans font-semibold text-[var(--text)] tracking-tight leading-none">
              {formatCurrency(pipelineMetrics.totalPipelineValue, currency)}
            </div>

            <div className="text-[11px] font-sans text-[var(--muted)] mt-1.5">
              ≈ {currency === 'IDR'
                  ? formatAmount(pipelineMetrics.totalPipelineValue > 0 ? pipelineMetrics.totalPipelineValue : 0, 'USD')
                  : formatIDR(pipelineMetrics.totalPipelineValue > 0 ? pipelineMetrics.totalPipelineValue : 0)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-[11px] font-sans">
            <span className="text-[var(--accent-text)] font-semibold flex items-center gap-1">
              {pipelineMetrics.activeLeadsCount} {language === 'id' ? 'Deal Terkualifikasi' : 'Qualified Deals'}
            </span>
            <span className="text-[var(--muted)]">
              {language === 'id' ? 'Rata-rata: ' : 'Avg: '}
              <strong className="text-[var(--text)] font-semibold">
                {formatCurrency(pipelineMetrics.avgDealSize, currency)}
              </strong>
            </span>
          </div>
        </div>

        {/* Metric Card 3: Conversion & Win Rate */}
        <div className="p-4 sm:p-5 rounded-card bg-[var(--panel)] border border-line flex flex-col justify-between group transition-colors duration-150 min-w-0">
          <div>
            <div className="flex items-center justify-between text-[var(--muted)] mb-3">
              <span className="text-[11px] font-sans normal-case tracking-normal font-semibold">
                {language === 'id' ? 'Rasio Konversi & Kemenangan' : 'Conversion & Win Rate'}
              </span>
              <div className="w-8 h-8 rounded-control bg-violet-500/10 border border-violet-500/20 text-[var(--accent-text)] flex items-center justify-center">
                <Percent size={15} />
              </div>
            </div>

            <div className="text-2xl lg:text-[28px] font-sans font-semibold text-[var(--text)] tracking-tight leading-none">
              {pipelineMetrics.conversionRate}%
            </div>

            <div className="text-[11px] font-sans text-[var(--accent-text)] mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>{language === 'id' ? 'Efisiensi Sales Siklus Tinggi' : 'High Efficiency Sales Cycle'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-[11px] font-sans">
            <span className="text-[var(--accent-text)] font-semibold">
              {pipelineMetrics.wonLeadsCount} {language === 'id' ? 'Won' : 'Won Deals'}
            </span>
            <span className="text-[var(--muted)]">
              {language === 'id' ? 'Margin Bersih: ' : 'Net Margin: '}
              <strong className="text-[var(--text)] font-semibold">
                {finMetrics.netMarginPercent}%
              </strong>
            </span>
          </div>
        </div>

        {/* Metric Card 4: Active Client Projects & Delivery Progress */}
        <div className="p-4 sm:p-5 rounded-card bg-[var(--panel)] border border-line flex flex-col justify-between group transition-colors duration-150 min-w-0">
          <div>
            <div className="flex items-center justify-between text-[var(--muted)] mb-3">
              <span className="text-[11px] font-sans normal-case tracking-normal font-semibold">
                {language === 'id' ? 'Proyek Aktif & Progress Delivery' : 'Active Projects & Delivery Progress'}
              </span>
              <div className="w-8 h-8 rounded-control bg-cyan-500/10 border border-cyan-500/20 text-[var(--muted)] flex items-center justify-center">
                <Layers size={16} />
              </div>
            </div>

            <div className="text-2xl lg:text-[28px] font-sans font-semibold text-[var(--text)] tracking-tight leading-none">
              {projectMetrics.total} {language === 'id' ? 'Sprint' : 'Sprints'}
            </div>

            <div className="text-[11px] font-sans text-[var(--muted)] mt-1.5 flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>{projectMetrics.averageProgress}% {language === 'id' ? 'Progress Rata-rata' : 'Average Progress'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-[11px] font-sans">
            <span className="text-[var(--muted)] font-semibold">
              {projectMetrics.inProgress} {language === 'id' ? 'Dalam Eksekusi' : 'In Production'}
            </span>
            <span className="text-[var(--muted)]">
              {language === 'id' ? 'Kendala Kritis: ' : 'Roadblocks: '}
              <strong className="text-[var(--success)] font-semibold">0</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Backend-backed finance and CRM snapshot */}
      <div className="ams-summary-grid grid grid-cols-1 xl:grid-cols-2 gap-3">
        <section className="ams-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
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
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
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
      <div className="ams-detail-grid grid grid-cols-1 xl:grid-cols-12 gap-3">
        
        {/* Left Column: Priority Active Projects & Recent Invoices (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Section: Priority Active Projects */}
          <div className="p-4 sm:p-5 rounded-card bg-[var(--panel)] border border-line space-y-4 min-w-0">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-base font-heading font-semibold text-[var(--text)] tracking-tight flex items-center gap-2">
                  <Layers size={17} className="text-[var(--muted)]" />
                  <span>{language === 'id' ? 'Proyek Klien Prioritas & Status Sprint' : 'Priority Active Projects & Deliverables'}</span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5 font-sans">
                  {language === 'id' ? 'Progress delivery, milestone sprint aktif, dan anggaran terkelola.' : 'Current delivery progress, sprint milestones, and allocated budgets.'}
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/projects')}
                className="text-xs font-sans text-[var(--accent)] hover:text-[var(--accent-text)] font-semibold flex items-center gap-1"
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
                  className="p-4 rounded-card bg-[var(--panel)] border border-[var(--line)]  transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[var(--text)]  transition-colors">
                        {proj.name}
                      </span>
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-cyan-500/10 text-[var(--muted)] border border-cyan-500/25 font-semibold">
                        {proj.serviceCategory}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {proj.clientCompany || proj.clientName} • {language === 'id' ? 'Lead' : 'Lead'}: <strong className="text-[var(--text)]">{proj.teamLead}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:shrink-0 min-w-0">
                    <div className="w-24 sm:w-36 space-y-1 shrink-0">
                      <div className="flex justify-between text-[10px] font-sans text-[var(--muted)]">
                        <span>Progress</span>
                        <span className="text-[var(--text)] font-semibold">{proj.progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-panel/[0.07] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" 
                          style={{ width: `${proj.progressPercent}%` }} 
                        />
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-sans min-w-0 max-w-[46%]">
                      <div className="text-[var(--text)] font-semibold">
                        {formatCurrency(proj.budget, currency)}
                      </div>
                      <span className="text-[var(--success)] text-[10px]">
                        {proj.targetEndDate ? `Due: ${proj.targetEndDate}` : 'On SLA'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Recent Invoices & Financial Ledger */}
          <div className="p-4 sm:p-5 rounded-card bg-[var(--panel)] border border-line space-y-4 min-w-0">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-base font-heading font-semibold text-[var(--text)] tracking-tight flex items-center gap-2">
                  <Receipt size={17} className="text-[var(--success)]" />
                  <span>{language === 'id' ? 'Buku Besar Invoice & Penerimaan' : 'Recent Invoices & Cashflow Ledger'}</span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5 font-sans">
                  {language === 'id' ? 'Status penagihan, pembayaran klien, dan termin transfer bank.' : 'Realized billing records, payment verification, and wire transfer terms.'}
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/invoicing')}
                className="text-xs font-sans text-[var(--accent)] hover:text-[var(--accent-text)] font-semibold flex items-center gap-1"
              >
                <span>{language === 'id' ? 'Semua Invoice' : 'View Financials'}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[11px] font-sans text-[var(--muted)]">
                    <th className="pb-2.5 font-semibold">INVOICE #</th>
                    <th className="pb-2.5 font-semibold">KLIEN / PERUSAHAAN</th>
                    <th className="pb-2.5 font-semibold">TOTAL TAGIHAN</th>
                    <th className="pb-2.5 font-semibold">STATUS</th>
                    <th className="pb-2.5 font-semibold text-right">JATUH TEMPO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs font-sans">
                  {invoices.slice(0, 5).map((inv) => {
                    const isPaid = inv.status === 'paid';
                    const isOverdue = inv.status === 'overdue';

                    return (
                      <tr 
                        key={inv.id}
                        onClick={() => navigate('/admin/invoicing')}
                        className="hover:bg-[var(--panel)]/60 cursor-pointer transition-colors"
                      >
                        <td className="py-3 text-[var(--text)] font-semibold">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 text-[var(--muted)]">
                          <div className="text-[var(--text)] font-semibold">{inv.clientCompany}</div>
                          <div className="text-[10px] text-[var(--muted)]">{inv.clientName}</div>
                        </td>
                        <td className="py-3 text-[var(--text)] font-semibold">
                          <div>{formatCurrency(inv.total, currency)}</div>
                          <div className="text-[10px] text-[var(--muted)]">
                            {currency === 'IDR' ? formatAmount(inv.total, 'USD') : formatIDR(inv.total)}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full border ${
                            isPaid 
                              ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/25 shadow-none'
                              : isOverdue
                              ? 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/25 shadow-none'
                              : 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/25 shadow-none'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-[var(--success)]' : isOverdue ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]'}`} />
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right text-[var(--muted)]">
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
          <div className="p-4 sm:p-5 rounded-card bg-[var(--panel)] border border-line space-y-4 min-w-0">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[var(--success)]" />
                <h3 className="text-base font-heading font-semibold text-[var(--text)] tracking-tight">
                  {language === 'id' ? 'Aktivitas Agensi Real-Time' : 'Live Activity Stream'}
                </h3>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 rounded-control bg-[var(--bg)] p-0.5 border border-line text-[10px] font-sans">
              <button
                onClick={() => setActivityTab('all')}
                className={`flex-1 py-1 rounded-control transition-all ${
                  activityTab === 'all' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActivityTab('deals')}
                className={`flex-1 py-1 rounded-control transition-all ${
                  activityTab === 'deals' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                Deals
              </button>
              <button
                onClick={() => setActivityTab('invoices')}
                className={`flex-1 py-1 rounded-control transition-all ${
                  activityTab === 'invoices' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActivityTab('projects')}
                className={`flex-1 py-1 rounded-control transition-all ${
                  activityTab === 'projects' ? 'bg-[var(--accent)] text-white font-semibold' : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                Projects
              </button>
            </div>

            {/* Stream List */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
              {activityFeed.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--muted)] font-sans">
                  {language === 'id' ? 'Belum ada aktivitas tercatat.' : 'No recent activity recorded.'}
                </div>
              ) : (
                activityFeed.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-card bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--line)] transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[var(--text)] truncate max-w-[200px]">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-sans text-[var(--muted)] shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] truncate">
                      {item.desc}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 2: Protected Inbox Inbound Inquiries Triage */}
          <div className="p-4 sm:p-5 rounded-card bg-[var(--panel)] border border-line space-y-4 min-w-0">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Inbox size={16} className="text-purple-400" />
                <h3 className="text-base font-heading font-semibold text-[var(--text)] tracking-tight">
                  {language === 'id' ? 'Inquiry Masuk kapitech.id' : 'Inbound Inquiries Triage'}
                </h3>
              </div>
              <button
                onClick={() => navigate('/admin/inbox')}
                className="text-xs font-sans text-[var(--accent)] hover:text-[var(--accent-text)] font-semibold flex items-center gap-1"
              >
                <span>{language === 'id' ? 'Buka Inbox' : 'Open Inbox'}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-3">
              {inboxSubmissions.length === 0 ? (
                <div className="p-4 rounded-card bg-[var(--panel)] text-center text-xs font-sans text-[var(--muted)]">
                  {language === 'id' ? 'Semua inquiry situs publik telah ditindaklanjuti.' : 'All public site inquiries have been triaged.'}
                </div>
              ) : (
                inboxSubmissions.slice(0, 3).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-card bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--line)] transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3 text-xs min-w-0">
                      <span className="font-semibold text-[var(--text)]">
                        {sub.fullName} {sub.company ? `(${sub.company})` : ''}
                      </span>
                      <span className="text-[10px] font-sans text-purple-400">
                        {sub.email}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--muted)] line-clamp-2">
                      {sub.message || 'New inbound inquiry from public contact form.'}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-sans text-[var(--muted)]">
                        {sub.services?.join(', ') || 'AI / Cloud'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 3: Operational Controls */}
          <div className="p-5 rounded-card bg-[var(--panel)] border border-[var(--line)] space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between text-[var(--muted)] pb-2 border-b border-[var(--line)]">
              <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                <Cpu size={14} className="text-[var(--muted)]" />
                OPERATIONAL CONTROLS
              </span>
              <span className="text-[var(--success)] font-semibold">ACTIVE</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-[var(--muted)]">Authenticated role:</span>
                <span className="text-[var(--text)] font-semibold text-right">{roleMeta?.title || 'Authenticated role'}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-[var(--muted)]">RBAC modules:</span>
                <span className="text-[var(--text)] font-semibold text-right">{Object.keys(ROLE_DEFINITIONS[rbacRole]?.permissions || {}).length} configured</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-[var(--muted)]">Audit events:</span>
                <span className="text-[var(--text)] font-semibold">{auditLogs.length}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-[var(--muted)]">Data source:</span>
                <span className="text-[var(--success)] font-semibold">Server-backed</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-[var(--panel)] border border-line rounded-card p-4 sm:p-6 shadow-none space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="text-lg font-heading font-semibold text-[var(--text)]">
                {language === 'id' ? 'Tambah Lead CRM Baru' : 'Add New CRM Lead'}
              </h3>
              <button 
                onClick={() => setIsAddLeadModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[var(--muted)] font-sans mb-1">Client Contact Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="e.g. Irwan Prasetyo"
                  className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-sans mb-1">Company / Enterprise *</label>
                <input
                  type="text"
                  required
                  value={newLeadCompany}
                  onChange={(e) => setNewLeadCompany(e.target.value)}
                  placeholder="e.g. PT Bank Central Asia"
                  className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-sans mb-1">Work Email</label>
                <input
                  type="email"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] font-sans mb-1">Service Pillar</label>
                  <CustomSelect value={newLeadPillar} onChange={(value) => setNewLeadPillar(value as CrmServicePillar)} options={[{value:'Web Development',label:'Web Development'},{value:'AI & Cloud Solutions',label:'AI & Cloud Solutions'},{value:'UI/UX Design',label:'UI/UX Design'},{value:'Digital Product MVP',label:'Digital Product MVP'},{value:'Branding & Identity',label:'Branding & Identity'}]} className="w-full" />
                </div>

                <div>
                  <label className="block text-[var(--muted)] font-sans mb-1">Estimated Value (IDR)</label>
                  <input
                    type="number"
                    value={newLeadValue}
                    onChange={(e) => setNewLeadValue(e.target.value)}
                    className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-card bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-card bg-[var(--accent)] hover:bg-[var(--accent)] text-white font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-[var(--panel)] border border-line rounded-card p-4 sm:p-6 shadow-none space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="text-lg font-heading font-semibold text-[var(--text)]">
                {language === 'id' ? 'Terbitkan Invoice Klien' : 'Create Client Invoice'}
              </h3>
              <button 
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[var(--muted)] font-sans mb-1">Client Company *</label>
                <input
                  type="text"
                  required
                  value={quickInvCompany}
                  onChange={(e) => setQuickInvCompany(e.target.value)}
                  placeholder="e.g. PT Astra Digital Ventura"
                  className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-sans mb-1">Billing Amount (IDR)</label>
                <input
                  type="number"
                  required
                  value={quickInvAmount}
                  onChange={(e) => setQuickInvAmount(e.target.value)}
                  className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-sans mb-1">Description / Milestone</label>
                <input
                  type="text"
                  value={quickInvDesc}
                  onChange={(e) => setQuickInvDesc(e.target.value)}
                  placeholder="Sprint Retainer 50% Kickoff"
                  className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                />
              </div>

              <div className="p-3 rounded-card bg-[var(--panel)] border border-[var(--line)] text-[11px] font-sans text-[var(--muted)] space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span>Subtotal:</span>
                  <span className="text-[var(--text)]">{formatCurrency(parseFloat(quickInvAmount) || 0, 'IDR')}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span>PPN (11%):</span>
                  <span className="text-[var(--text)]">{formatCurrency(Math.round((parseFloat(quickInvAmount) || 0) * 0.11), 'IDR')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[var(--line)] font-semibold text-[var(--text)]">
                  <span>Total Due:</span>
                  <span className="text-[var(--success)]">{formatCurrency(Math.round((parseFloat(quickInvAmount) || 0) * 1.11), 'IDR')}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-card bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-card bg-[var(--accent)] hover:bg-[var(--accent)] text-white font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-[var(--panel)] border border-line rounded-card p-4 sm:p-6 shadow-none space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="text-lg font-heading font-semibold text-[var(--text)]">
                {language === 'id' ? 'Mulai Proyek Sprint Baru' : 'Initiate Active Project'}
              </h3>
              <button 
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[var(--muted)] font-sans mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={quickProjTitle}
                  onChange={(e) => setQuickProjTitle(e.target.value)}
                  placeholder="e.g. NextGen Mobile Banking Modernization"
                  className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-sans mb-1">Client Entity *</label>
                <input
                  type="text"
                  required
                  value={quickProjClient}
                  onChange={(e) => setQuickProjClient(e.target.value)}
                  placeholder="e.g. Telkomsel Labs"
                  className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] font-sans mb-1">Service Pillar</label>
                  <CustomSelect value={quickProjPillar} onChange={setQuickProjPillar} options={[{value:'AI & Cloud Solutions',label:'AI & Cloud Solutions'},{value:'Web Development',label:'Web Development'},{value:'UI/UX Design',label:'UI/UX Design'},{value:'Digital Product MVP',label:'Digital Product MVP'}]} className="w-full" />
                </div>

                <div>
                  <label className="block text-[var(--muted)] font-sans mb-1">Budget Pool (IDR)</label>
                  <input
                    type="number"
                    value={quickProjBudget}
                    onChange={(e) => setQuickProjBudget(e.target.value)}
                    className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-card bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-card bg-[var(--accent)] hover:bg-[var(--accent)] text-white font-semibold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-[var(--panel)] border border-line rounded-card p-4 sm:p-6 shadow-none space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="text-lg font-heading font-semibold text-[var(--text)]">
                {language === 'id' ? 'Catat Biaya Operasional' : 'Record Operating Expense'}
              </h3>
              <button 
                onClick={() => setIsRecordExpenseModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[var(--muted)] font-sans mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={quickExpDesc}
                  onChange={(e) => setQuickExpDesc(e.target.value)}
                  placeholder="e.g. AWS & GCP Kubernetes Cluster Tier"
                  className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] font-sans mb-1">Category</label>
                  <CustomSelect value={quickExpCategory} onChange={setQuickExpCategory} options={[{value:'Software & Cloud',label:'Software & Cloud'},{value:'Salaries & Contractors',label:'Salaries & Contractors'},{value:'Office & Hardware',label:'Office & Hardware'},{value:'Marketing & Ads',label:'Marketing & Ads'},{value:'Legal & Admin',label:'Legal & Admin'}]} className="w-full" />
                </div>

                <div>
                  <label className="block text-[var(--muted)] font-sans mb-1">Amount (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={quickExpAmount}
                    onChange={(e) => setQuickExpAmount(e.target.value)}
                    className="w-full h-10 px-3 bg-[var(--panel)] border border-[var(--line)] focus:border-[var(--accent)] text-[var(--text)] rounded-card outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsRecordExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-card bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-card bg-[var(--accent)] hover:bg-[var(--accent)] text-white font-semibold transition-colors"
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
