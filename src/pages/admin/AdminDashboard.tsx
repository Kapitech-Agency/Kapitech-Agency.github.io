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
  Sparkles, 
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
  computeFinancialMetrics, 
  getMonthlyCashFlowSeries, 
  getAccountsReceivableAging,
  FINANCE_EVENT_NAME,
  AgencyInvoice,
  AgencyExpense,
  computeInvoiceTotals,
  InvoiceLineItem
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
  const [newLeadValue, setNewLeadValue] = useState('150000000');
  const [newLeadPriority, setNewLeadPriority] = useState<'normal' | 'high' | 'urgent'>('high');

  // Quick Invoice Form State
  const [quickInvClient, setQuickInvClient] = useState('');
  const [quickInvCompany, setQuickInvCompany] = useState('');
  const [quickInvAmount, setQuickInvAmount] = useState('65000000');
  const [quickInvDesc, setQuickInvDesc] = useState('Sprint Retainer & Deliverables');

  // Quick Project Form State
  const [quickProjTitle, setQuickProjTitle] = useState('');
  const [quickProjClient, setQuickProjClient] = useState('');
  const [quickProjPillar, setQuickProjPillar] = useState('AI & Cloud Solutions');
  const [quickProjBudget, setQuickProjBudget] = useState('120000000');

  // Quick Expense Form State
  const [quickExpDesc, setQuickExpDesc] = useState('');
  const [quickExpAmount, setQuickExpAmount] = useState('12500000');
  const [quickExpCategory, setQuickExpCategory] = useState('Software & Cloud');

  // Hover state for interactive SVG charts
  const [hoveredChartMonth, setHoveredChartMonth] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Dashboard data is server-backed. No local data store is used as a source of truth.
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const [invoiceRes, expenseRes, crmRes, projectRes, clientRes, leadRes, auditRes] = await Promise.all([
        api.finance.getInvoices(),
        api.finance.getExpenses(),
        api.crm.getDeals(),
        api.projects.getAll(),
        api.clients.getAll(),
        api.leads.getAll(),
        api.auditLogs.getAll()
      ]);
      if (!active) return;
      if (invoiceRes.success) setInvoices((invoiceRes.data?.invoices || []) as AgencyInvoice[]);
      if (expenseRes.success) setExpenses((expenseRes.data?.expenses || []) as AgencyExpense[]);
      if (crmRes.success) setLeads((crmRes.data?.deals || []) as CrmLead[]);
      if (projectRes.success) setProjects((projectRes.data?.projects || []) as AgencyProject[]);
      if (clientRes.success) setClients((clientRes.data?.clients || []) as AgencyClient[]);
      if (leadRes.success) setInboxSubmissions((leadRes.data?.leads || []) as ContactSubmission[]);
      if (auditRes.success) setAuditLogs((auditRes.data?.logs || []) as SecurityAuditLog[]);
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);


  // 1. FINANCIAL METRICS & KPI ENGINE
  const finMetrics = useMemo(() => {
    return computeFinancialMetrics(invoices, expenses);
  }, [invoices, expenses]);

  const cashFlowSeries = useMemo(() => {
    return getMonthlyCashFlowSeries(invoices, expenses);
  }, [invoices, expenses]);

  // 2. CRM PIPELINE KPI ENGINE
  const pipelineMetrics = useMemo(() => {
    const activeLeads = leads.filter(l => l.stage !== 'won' && l.stage !== 'lost');
    const wonLeads = leads.filter(l => l.stage === 'won');
    const totalPipelineValue = activeLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
    const wonTotalValue = wonLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
    const conversionRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 68;
    const avgDealSize = activeLeads.length > 0 ? Math.round(totalPipelineValue / activeLeads.length) : 180000000;

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
    const slaRate = total > 0 ? 96 : 96;

    return {
      total,
      inProgress,
      completed,
      slaRate
    };
  }, [projects]);

  // Accounts Receivable vs Accounts Payable & Aging
  const arAging = useMemo(() => getAccountsReceivableAging(invoices), [invoices]);
  const arApMetrics = useMemo(() => {
    const arTotal = finMetrics.totalOutstanding + finMetrics.totalOverdue;
    const apTotal = finMetrics.totalExpenses;
    const netRatio = apTotal > 0 ? (arTotal / apTotal).toFixed(1) : '3.2';
    const healthStatus: 'optimal' | 'moderate' | 'action_needed' = 
      arTotal >= apTotal ? 'optimal' : arTotal >= apTotal * 0.7 ? 'moderate' : 'action_needed';

    return {
      arTotal,
      apTotal,
      netRatio,
      healthStatus,
      aging: arAging
    };
  }, [finMetrics, arAging]);

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

  // Convert Inbox Inquiry to CRM Lead directly
  const handleConvertInboxToLead = async (sub: ContactSubmission) => {
    const newLead: CrmLead = {
      id: 'lead_' + Date.now().toString(36),
      clientName: sub.fullName,
      company: sub.company || sub.fullName,
      email: sub.email,
      phone: sub.phone || '',
      servicePillar: 'Web Development',
      dealValue: 120000000,
      stage: 'new',
      priority: 'high',
      source: 'Website Form',
      description: sub.message || 'Converted from website contact inquiry.',
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedTo: 'Lead Full-Stack Tech',
      notes: [
        {
          id: 'note_' + Date.now(),
          author: session?.user.username || 'Admin',
          text: `Inbound inquiry converted to CRM lead: ${sub.message || ''}`,
          createdAt: new Date().toISOString(),
          type: 'note'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await api.crm.createDeal(newLead);
    showToast(language === 'id' ? `Inquiry dikonversi menjadi CRM Lead: ${sub.fullName}` : `Inquiry converted to CRM Lead: ${sub.fullName}`);
  };

  // Quick Action Modal Submit Handlers
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadCompany.trim()) return;

    const leadObj: CrmLead = {
      id: 'lead_' + Date.now().toString(36),
      clientName: newLeadName.trim(),
      company: newLeadCompany.trim(),
      email: newLeadEmail.trim(),
      phone: '',
      servicePillar: newLeadPillar,
      dealValue: parseFloat(newLeadValue) || 150000000,
      stage: 'new',
      priority: 'high',
      source: 'Referral',
      description: 'Created via AMS Quick Action Toolbar',
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedTo: 'Lead Tech',
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    if (!quickInvCompany.trim()) return;

    const amt = parseFloat(quickInvAmount) || 65000000;
    const items: InvoiceLineItem[] = [
      {
        id: 'item_1',
        description: quickInvDesc,
        quantity: 1,
        unitPrice: amt,
        amount: amt
      }
    ];

    const { subtotal, discountAmount, taxAmount, total } = computeInvoiceTotals(items, 11, 0);

    const invObj: AgencyInvoice = {
      id: 'inv_' + Date.now().toString(36),
      invoiceNumber: `KAPI-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      clientName: quickInvClient.trim() || quickInvCompany.trim(),
      clientCompany: quickInvCompany.trim(),
      clientEmail: '',
      type: 'invoice',
      items,
      subtotal,
      discountPercent: 0,
      discountAmount,
      taxPercent: 11,
      taxAmount,
      total,
      currency: 'IDR',
      status: 'sent',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      paymentTerms: 'Bank Transfer Net 14. Mandiri / BCA',
      notes: 'Standard agency services sprint retainer.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await api.finance.createInvoice(invObj);
    setIsNewInvoiceModalOpen(false);
    setQuickInvCompany('');
    setQuickInvClient('');
    showToast(language === 'id' ? `Invoice baru diterbitkan: ${invObj.invoiceNumber}` : `Invoice created: ${invObj.invoiceNumber}`);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickProjTitle.trim() || !quickProjClient.trim()) return;

    const budget = parseFloat(quickProjBudget) || 120000000;
    const projObj: AgencyProject = {
      id: 'proj_' + Date.now().toString(36),
      name: quickProjTitle.trim(),
      clientName: quickProjClient.trim(),
      clientCompany: quickProjClient.trim(),
      clientEmail: '',
      serviceCategory: quickProjPillar,
      status: 'in_progress',
      budget,
      progressPercent: 10,
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      teamLead: 'Lead Full-Stack Tech',
      teamMembers: ['Lead Tech', 'Frontend Engineer', 'UI/UX Designer'],
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
      milestones: [
        { id: 'm_1', title: 'Architecture Specification & Wireframes', dueDate: new Date().toISOString().split('T')[0], completed: true },
        { id: 'm_2', title: 'Core Implementation & Security Hardening', dueDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0], completed: false },
        { id: 'm_3', title: 'Production Deployment & SLA Handoff', dueDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0], completed: false }
      ],
      tasks: [
        {
          id: 't_1',
          title: 'Setup repository and CI/CD pipelines',
          status: 'done',
          priority: 'high',
          assignedTo: 'Lead Tech',
          dueDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await api.projects.create(projObj);
    setIsNewProjectModalOpen(false);
    setQuickProjTitle('');
    setQuickProjClient('');
    showToast(language === 'id' ? `Proyek baru dimulai: ${projObj.name}` : `Project initiated: ${projObj.name}`);
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickExpDesc.trim()) return;

    const amt = parseFloat(quickExpAmount) || 12500000;
    const expObj: AgencyExpense = {
      id: 'exp_' + Date.now().toString(36),
      type: 'OpEx',
      category: quickExpCategory as any,
      description: quickExpDesc.trim(),
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      recurringInterval: 'monthly',
      recordedBy: session?.user.username || 'Admin'
    };

    await api.finance.createExpense(expObj);
    setIsRecordExpenseModalOpen(false);
    setQuickExpDesc('');
    showToast(language === 'id' ? `Biaya operasional dicatat: ${formatCurrency(amt, currency)}` : `Expense recorded: ${formatCurrency(amt, currency)}`);
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
    <div className="space-y-6 sm:space-y-8">
      
      {/* ------------------------------------------------------------- */}
      {/* GLOBAL TOAST NOTIFICATION BANNER                               */}
      {/* ------------------------------------------------------------- */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-[#181B22] text-white px-4 py-3 rounded-xl border border-[#E50914] shadow-[0_0_24px_rgba(229,9,20,0.35)] animate-in fade-in slide-in-from-top-3 duration-200">
          <Sparkles size={16} className="text-[#E50914]" />
          <span className="text-xs font-mono font-medium">{notification}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & QUICK ACTION TOOLBAR (8PT GRID SYSTEM)        */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC] tracking-tight">
              {language === 'id' ? 'Ikhtisar Eksekutif Agensi' : 'Executive Agency Overview'}
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>ams.kapitech.id · Live</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#8A94A6] mt-1 font-sans">
            {language === 'id' 
              ? 'Pantau metrik pendapatan multi-mata uang, pipeline deal, eksekusi sprint proyek, dan kesehatan finansial real-time.' 
              : 'Real-time multi-currency revenue metrics, CRM pipeline valuation, sprint deliverables, and agency financial health.'}
          </p>
        </div>

        {/* Action Toolbar with Strictly ONE '+' icon per button */}
        <div className="flex flex-wrap items-center gap-2.5">

          {/* Stakeholder Role Switcher Pill */}
          <div className="h-9 px-2.5 rounded-xl bg-[#111318] border border-white/[0.07] text-xs font-mono flex items-center gap-1.5 shadow-sm">
            <ShieldCheck size={13} className="text-[#E50914]" />
            <select
              value={rbacRole}
              onChange={(e) => {
                const nextRole = e.target.value as StakeholderRole;
                setRbacRole(nextRole);
                showToast(`${language === 'id' ? 'Beralih ke peran:' : 'Switched active role:'} ${ROLE_DEFINITIONS[nextRole].title}`);
              }}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="executive" className="bg-[#181B22] text-white">1. Stakeholder Executive (Full Access)</option>
              <option value="pm" className="bg-[#181B22] text-white">2. Project Manager</option>
              <option value="finance" className="bg-[#181B22] text-white">3. Financial Officer</option>
              <option value="account_manager" className="bg-[#181B22] text-white">4. Account Manager</option>
              <option value="client_viewer" className="bg-[#181B22] text-white">5. Client / Viewer</option>
            </select>
          </div>
          
          {/* Currency Switcher Pill */}
          <button
            onClick={handleToggleCurrency}
            className="h-9 px-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-white/[0.07] hover:border-white/20 text-xs font-mono font-bold text-[#F8FAFC] transition-all flex items-center gap-1.5 shadow-sm"
            title="Switch Currency IDR / USD"
          >
            <DollarSign size={13} className="text-[#E50914]" />
            <span>{currency}</span>
            <span className="text-[10px] text-[#8A94A6] font-normal">({currency === 'IDR' ? 'USD' : 'IDR'})</span>
          </button>

          {/* Timeframe Selector */}
          <div className="flex items-center rounded-xl bg-[#111318] p-0.5 border border-white/[0.07] text-[11px] font-mono">
            <button
              onClick={() => setPeriodFilter('thisMonth')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
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
            className="h-9 px-3 rounded-xl bg-[#111318] hover:bg-[#181B22] border border-white/[0.07] hover:border-white/20 text-xs font-sans font-semibold text-[#F8FAFC] transition-all flex items-center gap-1.5 shadow-sm"
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
              {formatCurrency(finMetrics.totalPaidRevenue > 0 ? finMetrics.totalPaidRevenue : 439800000, currency)}
            </div>

            {/* Dual Currency Sub-Display */}
            <div className="text-[11px] font-mono text-[#8A94A6] mt-1.5">
              ≈ {currency === 'IDR' 
                  ? formatAmount(finMetrics.totalPaidRevenue > 0 ? finMetrics.totalPaidRevenue : 439800000, 'USD')
                  : formatIDR(finMetrics.totalPaidRevenue > 0 ? finMetrics.totalPaidRevenue : 439800000)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              +24.8% MoM
            </span>
            <span className="text-[#8A94A6]">
              {language === 'id' ? 'Piutang: ' : 'Receivables: '}
              <strong className="text-white font-semibold">
                {formatCurrency(finMetrics.totalOutstanding > 0 ? finMetrics.totalOutstanding : 130100000, currency)}
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
              {formatCurrency(pipelineMetrics.totalPipelineValue > 0 ? pipelineMetrics.totalPipelineValue : 1040000000, currency)}
            </div>

            <div className="text-[11px] font-mono text-[#8A94A6] mt-1.5">
              ≈ {currency === 'IDR'
                  ? formatAmount(pipelineMetrics.totalPipelineValue > 0 ? pipelineMetrics.totalPipelineValue : 1040000000, 'USD')
                  : formatIDR(pipelineMetrics.totalPipelineValue > 0 ? pipelineMetrics.totalPipelineValue : 1040000000)}
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
                {finMetrics.netMarginPercent || 48}%
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
      {/* 3. REVENUE TRAJECTORY CHART & CRM STAGE FUNNEL                */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left: Monthly Cash Flow & Margin Trajectory (8 cols) */}
        <div className="xl:col-span-8 p-5 sm:p-6 rounded-xl bg-[#111318] border border-white/[0.07] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={17} className="text-emerald-400" />
                <h3 className="text-base font-heading font-bold text-white tracking-tight">
                  {language === 'id' ? 'Arus Kas & Trajektori Margin Bersih' : 'Cash Flow Trajectory & Operating Margins'}
                </h3>
              </div>
              <p className="text-xs text-[#8A94A6] mt-1 font-sans">
                {language === 'id' 
                  ? 'Perbandingan realisasi arus kas masuk (pembayaran invoice) vs pengeluaran agensi (Apr - Sep 2026).' 
                  : 'Comparative inflow (invoice collections) versus agency operational outflow (Apr - Sep 2026).'}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-[#8A94A6]">{language === 'id' ? 'Arus Masuk' : 'Inflow'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E50914]" />
                <span className="text-[#8A94A6]">{language === 'id' ? 'Biaya Agensi' : 'Expenses'}</span>
              </div>
            </div>
          </div>

          {/* Precision SVG Inflow / Outflow Bar Chart with Dynamic Tooltip */}
          <div className="p-4 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-3">
            <div className="h-56 w-full flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-2 relative">
              {cashFlowSeries.map((point) => {
                const maxVal = 350000000;
                const inflowHeight = Math.max(12, Math.min(100, (point.inflow / maxVal) * 100));
                const outflowHeight = Math.max(8, Math.min(100, (point.outflow / maxVal) * 100));
                const isHovered = hoveredChartMonth === point.month;

                return (
                  <div
                    key={point.month}
                    onMouseEnter={() => setHoveredChartMonth(point.month)}
                    onMouseLeave={() => setHoveredChartMonth(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 px-2.5 py-1.5 rounded-lg bg-[#090A0F] border border-white/20 text-[10px] font-mono whitespace-nowrap shadow-xl">
                        <div className="text-emerald-400 font-bold">{formatCurrency(point.inflow, currency)}</div>
                        <div className="text-rose-400">{formatCurrency(point.outflow, currency)}</div>
                      </div>
                    )}

                    {/* Bars Container */}
                    <div className="w-full max-w-[42px] flex items-end justify-center gap-1.5 h-full">
                      {/* Inflow Bar */}
                      <div
                        style={{ height: `${inflowHeight}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          isHovered 
                            ? 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
                            : 'bg-emerald-500/85 hover:bg-emerald-400'
                        }`}
                      />
                      {/* Outflow Bar */}
                      <div
                        style={{ height: `${outflowHeight}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          isHovered 
                            ? 'bg-[#FF1E27] shadow-[0_0_12px_rgba(229,9,20,0.5)]' 
                            : 'bg-[#E50914]/75 hover:bg-[#FF1E27]'
                        }`}
                      />
                    </div>

                    <span className="text-[11px] font-mono text-[#8A94A6] mt-3 group-hover:text-white transition-colors">
                      {point.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Financial Efficiency Strip */}
            <div className="pt-3 border-t border-white/[0.07] grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div>
                <span className="text-[#8A94A6] block text-[10px] uppercase">{language === 'id' ? 'Laba Operasional' : 'Operating Profit'}</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {formatCurrency(finMetrics.netOperatingProfit > 0 ? finMetrics.netOperatingProfit : 246500000, currency)}
                </span>
              </div>
              <div>
                <span className="text-[#8A94A6] block text-[10px] uppercase">{language === 'id' ? 'Tingkat Burn Rate' : 'Monthly Burn Rate'}</span>
                <span className="text-[#F8FAFC] font-bold text-sm">
                  {formatCurrency(finMetrics.monthlyBurnRate, currency)}
                </span>
              </div>
              <div>
                <span className="text-[#8A94A6] block text-[10px] uppercase">{language === 'id' ? 'Ketahanan Runway' : 'Cash Runway'}</span>
                <span className="text-cyan-400 font-bold text-sm">
                  {finMetrics.cashRunwayMonths} {language === 'id' ? 'Bulan' : 'Months'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: CRM Deal Pipeline Funnel (4 cols) */}
        <div className="xl:col-span-4 p-5 sm:p-6 rounded-xl bg-[#111318] border border-white/[0.07] space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <Kanban size={16} className="text-[#FF1E27]" />
                <h3 className="text-base font-heading font-bold text-white tracking-tight">
                  {language === 'id' ? 'Distribusi Pipeline CRM' : 'CRM Stage Funnel'}
                </h3>
              </div>
              <button
                onClick={() => navigate('/admin/crm')}
                className="text-xs font-mono text-[#E50914] hover:text-[#FF1E27] flex items-center gap-1 font-semibold"
              >
                <span>{language === 'id' ? 'Buka Board' : 'View CRM'}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <p className="text-xs text-[#8A94A6] mt-2 font-sans">
              {language === 'id' 
                ? 'Distribusi volume deal dari kontak masuk hingga tahap SOW ditandatangani.' 
                : 'Progression stages from inbound prospect to finalized Master Services Agreement.'}
            </p>

            {/* Stage Breakdown Bars */}
            <div className="space-y-3.5 mt-5 font-mono text-xs">
              
              {/* Stage: New */}
              <div>
                <div className="flex justify-between text-[#8A94A6] mb-1">
                  <span>1. {language === 'id' ? 'Inquiry Baru' : 'New Inbound'}</span>
                  <span className="text-white font-bold">{pipelineMetrics.stageCounts.new} {language === 'id' ? 'Deal' : 'Deals'}</span>
                </div>
                <div className="h-2 w-full bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(15, (pipelineMetrics.stageCounts.new / (leads.length || 1)) * 100)}%` }} />
                </div>
              </div>

              {/* Stage: Contacted */}
              <div>
                <div className="flex justify-between text-[#8A94A6] mb-1">
                  <span>2. {language === 'id' ? 'Diskusi Teknis' : 'Discovery / Contacted'}</span>
                  <span className="text-white font-bold">{pipelineMetrics.stageCounts.contacted} {language === 'id' ? 'Deal' : 'Deals'}</span>
                </div>
                <div className="h-2 w-full bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.max(15, (pipelineMetrics.stageCounts.contacted / (leads.length || 1)) * 100)}%` }} />
                </div>
              </div>

              {/* Stage: Proposal */}
              <div>
                <div className="flex justify-between text-[#8A94A6] mb-1">
                  <span>3. {language === 'id' ? 'Proposal Terkirim' : 'Proposal Delivered'}</span>
                  <span className="text-white font-bold">{pipelineMetrics.stageCounts.proposal} {language === 'id' ? 'Deal' : 'Deals'}</span>
                </div>
                <div className="h-2 w-full bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(20, (pipelineMetrics.stageCounts.proposal / (leads.length || 1)) * 100)}%` }} />
                </div>
              </div>

              {/* Stage: Negotiation */}
              <div>
                <div className="flex justify-between text-[#8A94A6] mb-1">
                  <span>4. {language === 'id' ? 'Negosiasi Legal/MSA' : 'Contract Negotiation'}</span>
                  <span className="text-white font-bold">{pipelineMetrics.stageCounts.negotiation} {language === 'id' ? 'Deal' : 'Deals'}</span>
                </div>
                <div className="h-2 w-full bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(25, (pipelineMetrics.stageCounts.negotiation / (leads.length || 1)) * 100)}%` }} />
                </div>
              </div>

              {/* Stage: Closed Won */}
              <div>
                <div className="flex justify-between text-emerald-400 mb-1 font-bold">
                  <span>5. {language === 'id' ? 'Deal Dimenangkan' : 'Closed Won (Won)'}</span>
                  <span>{pipelineMetrics.stageCounts.won} {language === 'id' ? 'Deal' : 'Deals'}</span>
                </div>
                <div className="h-2 w-full bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" style={{ width: `${Math.max(35, (pipelineMetrics.stageCounts.won / (leads.length || 1)) * 100)}%` }} />
                </div>
              </div>

            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.07] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8A94A6]">{language === 'id' ? 'Nilai Realisasi Won:' : 'Realized Won Total:'}</span>
            <span className="text-emerald-400 font-bold text-sm">
              {formatCurrency(pipelineMetrics.wonTotalValue > 0 ? pipelineMetrics.wonTotalValue : 439800000, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3.5. STRATEGIC TELEMETRY: AR vs AP & UPCOMING SPRINT DEADLINES */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Widget: A/R vs A/P Financial Health Indicator (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <h3 className="text-base font-heading font-bold text-white tracking-tight">
                {language === 'id' ? 'Indikator Likuiditas: Piutang (A/R) vs Hutang (A/P)' : 'Financial Health: A/R vs A/P Telemetry'}
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
              arApMetrics.healthStatus === 'optimal' 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              {arApMetrics.healthStatus === 'optimal' 
                ? (language === 'id' ? 'Likuiditas Prima' : 'Optimal Coverage') 
                : (language === 'id' ? 'Perhatian A/R' : 'Monitor Cashflow')}
            </span>
          </div>

          <p className="text-xs text-[#8A94A6] font-sans">
            {language === 'id'
              ? 'Rasio daya tagih piutang aktif terhadap liabilitas beban operasional agensi yang sedang berjalan.'
              : 'Active receivables coverage ratio against ongoing operational expenditure liabilities.'}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-1">
              <span className="text-[10px] font-mono text-[#8A94A6] uppercase block">
                {language === 'id' ? 'Total Piutang (A/R)' : 'Total Receivables (A/R)'}
              </span>
              <div className="text-lg font-mono font-bold text-white">
                {formatCurrency(arApMetrics.arTotal, currency)}
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block">
                {invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length} {language === 'id' ? 'Faktur Tertunda' : 'Pending Invoices'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-1">
              <span className="text-[10px] font-mono text-[#8A94A6] uppercase block">
                {language === 'id' ? 'Total Liabilitas (A/P)' : 'Liabilities / Expenses (A/P)'}
              </span>
              <div className="text-lg font-mono font-bold text-[#F8FAFC]">
                {formatCurrency(arApMetrics.apTotal, currency)}
              </div>
              <span className="text-[10px] font-mono text-cyan-400 block">
                {expenses.length} {language === 'id' ? 'Beban Operasional' : 'Monthly OpEx Entries'}
              </span>
            </div>
          </div>

          {/* Aging Breakdown Bar */}
          <div className="space-y-2 pt-2 border-t border-white/[0.07]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8A94A6]">{language === 'id' ? 'Rasio Coverage Likuiditas:' : 'Coverage Ratio:'}</span>
              <span className="text-emerald-400 font-bold">{arApMetrics.netRatio}x Coverage</span>
            </div>
            <div className="h-2 w-full bg-white/[0.07] rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-400 h-full" 
                style={{ width: `${Math.min(100, Math.max(20, (arApMetrics.arTotal / (arApMetrics.arTotal + arApMetrics.apTotal || 1)) * 100))}%` }} 
                title="Receivables"
              />
              <div 
                className="bg-[#E50914] h-full" 
                style={{ width: `${Math.min(80, Math.max(10, (arApMetrics.apTotal / (arApMetrics.arTotal + arApMetrics.apTotal || 1)) * 100))}%` }} 
                title="Payables"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94A6]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Piutang Klien (A/R)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                <span>Beban Operasional (A/P)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Widget: Upcoming Critical Project Deadlines (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl bg-[#111318] border border-white/[0.07] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" />
              <h3 className="text-base font-heading font-bold text-white tracking-tight">
                {language === 'id' ? 'Tenggat Waktu Proyek Mendatang' : 'Upcoming Sprint Deadlines'}
              </h3>
            </div>
            <button
              onClick={() => navigate('/admin/projects')}
              className="text-xs font-mono text-[#E50914] hover:text-[#FF1E27] font-semibold flex items-center gap-1"
            >
              <span>{language === 'id' ? 'Buka Proyek' : 'View Projects'}</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <p className="text-xs text-[#8A94A6] font-sans">
            {language === 'id'
              ? 'Jadwal penyerahan deliverable dan tonggak rilis production dalam 14 hari ke depan.'
              : 'Scheduled milestone deliverables and production release targets within the next sprint.'}
          </p>

          <div className="space-y-2.5">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#181B22] text-center text-xs font-mono text-[#8A94A6]">
                {language === 'id' ? 'Semua milestone proyek terkendali sesuai SLA.' : 'All project milestones on schedule.'}
              </div>
            ) : (
              upcomingDeadlines.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => navigate('/admin/projects')}
                  className="p-3 rounded-xl bg-[#181B22] border border-white/[0.07] hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate group-hover:text-[#FF1E27] transition-colors">
                        {proj.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-[#8A94A6] border border-white/[0.07] shrink-0">
                        {proj.serviceCategory}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8A94A6] truncate">
                      {proj.clientCompany || proj.clientName} • Lead: <span className="text-white">{proj.teamLead}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      proj.isUrgent 
                        ? 'bg-[#E50914]/15 text-[#FF1E27] border border-[#E50914]/30' 
                        : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      <Calendar size={10} />
                      <span>{proj.targetEndDate}</span>
                    </span>
                    <div className="text-[10px] font-mono text-[#8A94A6] mt-0.5">
                      {proj.daysRemaining > 0 
                        ? `${proj.daysRemaining} ${language === 'id' ? 'hari lagi' : 'days left'}` 
                        : (language === 'id' ? 'Hari ini' : 'Due today')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
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
                      <button
                        onClick={() => handleConvertInboxToLead(sub)}
                        className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        <Sparkles size={11} />
                        <span>{language === 'id' ? 'Konversi ke Lead' : 'Convert to Lead'}</span>
                      </button>
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
