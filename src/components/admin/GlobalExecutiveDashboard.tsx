import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Layers, 
  Users, 
  FileText, 
  DollarSign, 
  Briefcase, 
  Search, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  PenTool, 
  Code2, 
  Check, 
  X, 
  Filter, 
  ArrowUpRight, 
  FolderGit2, 
  FileCheck, 
  TrendingUp, 
  Cpu, 
  Palette, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Zap, 
  Kanban,
  Terminal,
  Server,
  HardDrive,
  Play,
  Pause,
  Plus,
  Download,
  Database,
  Lock,
  Timer,
  Radio,
  FileCheck2,
  CalendarCheck,
  Percent,
  TrendingDown,
  Receipt
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, setActiveCurrency, CurrencyCode, formatCurrency, formatIDR } from '../../lib/currency';
import { useRbacRole, StakeholderRole, ROLE_DEFINITIONS } from '../../lib/rbacEngine';
import { 
  getAgencyInvoices, 
  getAgencyExpenses, 
  saveAgencyInvoice, 
  saveAgencyExpense, 
  computeFinancialMetrics, 
  getMonthlyCashFlowSeries, 
  approveInvoice, 
  computeInvoiceTotals,
  AgencyInvoice, 
  AgencyExpense, 
  ExpenseCategory,
  ExpenseType,
  FINANCE_EVENT_NAME 
} from '../../lib/financeStore';
import { 
  getAgencyProjects, 
  saveAgencyProject, 
  AgencyProject, 
  PROJECT_EVENT_NAME 
} from '../../lib/projectStore';

// ============================================================================
// TYPE DEFINITIONS & RBAC ROLES
// ============================================================================
export type AgencySegment = 'all' | 'visual_experience' | 'innovation_dev';

export interface GlobalExecutiveDashboardProps {
  onNavigateModule?: (moduleKey: string) => void;
  standalone?: boolean;
  showSidebar?: boolean;
}

// Data models
interface ProjectItem {
  id: string;
  name: string;
  client: string;
  segment: 'visual_experience' | 'innovation_dev';
  category: string;
  status: 'In Production' | 'Creative Review' | 'Sprint QA' | 'Staging Test' | 'Final Milestone';
  progress: number;
  budget: number;
  marginPercent: number;
  deadline: string;
  teamLead: string;
  currentMilestone: string;
  externalLink?: string;
  externalType?: 'figma' | 'github' | 'staging';
  aiWinScore?: number;
}

interface ResourceItem {
  id: string;
  name: string;
  role: string;
  segment: 'visual_experience' | 'innovation_dev';
  avatar: string;
  activeTasks: number;
  allocatedHours: number;
  maxHours: number;
  isOverallocated: boolean;
}

interface ApprovalItem {
  id: string;
  title: string;
  client: string;
  segment: 'visual_experience' | 'innovation_dev';
  type: 'NDA / Contract' | 'Milestone Signoff' | 'Architecture Plan' | 'Change Request';
  value: number;
  dateSubmitted: string;
  status: 'pending' | 'signed' | 'revised';
  urgency: 'high' | 'normal';
}

interface TechServiceItem {
  name: string;
  type: string;
  status: 'healthy' | 'warning' | 'degraded';
  uptime: string;
  latency: string;
  cpuUsage: number;
  ramUsage: number;
  port?: number;
}

interface StaffTaskItem {
  id: string;
  title: string;
  project: string;
  segment: 'visual_experience' | 'innovation_dev';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  estimatedHours: number;
  completed: boolean;
}

// ============================================================================
// INITIAL ZERO-DATA SETS & REALISTIC AGENCY DATA FIXTURES
// ============================================================================
const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_101',
    name: 'Enterprise Zero-Trust & RBAC Architecture',
    client: 'PT Bank Mandiri FinTech',
    segment: 'innovation_dev',
    category: 'Innovation Development & Cloud',
    budget: 210000000,
    marginPercent: 48,
    progress: 85,
    status: 'In Production',
    currentMilestone: 'Sprint 4 UAT & Security Audit',
    deadline: '2026-09-28',
    teamLead: 'Cloud DevOps Lead',
    aiWinScore: 94
  },
  {
    id: 'proj_102',
    name: 'Interactive 3D WebGL Brand Experience',
    client: 'Telkomsel Innovation Labs',
    segment: 'visual_experience',
    category: 'Visual Experience & 3D',
    budget: 120000000,
    marginPercent: 54,
    progress: 92,
    status: 'In Production',
    currentMilestone: 'Final Spatial Release & Handoff',
    deadline: '2026-09-22',
    teamLead: 'Lead 3D Artist',
    aiWinScore: 98
  },
  {
    id: 'proj_103',
    name: 'Microservices Payment Orchestrator',
    client: 'ShopeePay Regional Tech',
    segment: 'innovation_dev',
    category: 'Innovation Development & Cloud',
    budget: 95000000,
    marginPercent: 45,
    progress: 60,
    status: 'In Production',
    currentMilestone: 'High-Throughput Load Testing',
    deadline: '2026-10-05',
    teamLead: 'Principal Architect',
    aiWinScore: 89
  },
  {
    id: 'proj_104',
    name: 'Digital Venture Cloud Commerce Ecosystem',
    client: 'PT Astra Digital Ventura',
    segment: 'innovation_dev',
    category: 'Innovation Development & Cloud',
    budget: 165000000,
    marginPercent: 46,
    progress: 40,
    status: 'In Production',
    currentMilestone: 'Sprint 2 Core API Gateway Integration',
    deadline: '2026-10-18',
    teamLead: 'Senior Backend Lead',
    aiWinScore: 91
  }
];

const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'res_1',
    name: 'Ahmad Fauzi',
    role: 'Principal Full-Stack Architect',
    segment: 'innovation_dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    activeTasks: 4,
    allocatedHours: 34,
    maxHours: 40,
    isOverallocated: false
  },
  {
    id: 'res_2',
    name: 'Clara Wijaya',
    role: 'Lead 3D & Creative Developer',
    segment: 'visual_experience',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    activeTasks: 5,
    allocatedHours: 38,
    maxHours: 40,
    isOverallocated: false
  },
  {
    id: 'res_3',
    name: 'David Hartono',
    role: 'Senior Cloud Infrastructure Engineer',
    segment: 'innovation_dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    activeTasks: 3,
    allocatedHours: 30,
    maxHours: 40,
    isOverallocated: false
  }
];

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'inv_103',
    title: 'PT Bank Mandiri - Zero-Trust Portal Final Signoff',
    client: 'PT Bank Mandiri FinTech',
    segment: 'innovation_dev',
    type: 'Milestone Signoff',
    value: 233100000,
    dateSubmitted: '2026-09-02',
    status: 'pending',
    urgency: 'high'
  },
  {
    id: 'inv_104',
    title: 'ShopeePay Tech - Phase 1 Delivery Milestone',
    client: 'ShopeePay Regional Tech',
    segment: 'innovation_dev',
    type: 'Milestone Signoff',
    value: 105450000,
    dateSubmitted: '2026-09-05',
    status: 'pending',
    urgency: 'normal'
  },
  {
    id: 'inv_101',
    title: 'PT Astra Digital - Master Retainer SOW Agreement',
    client: 'PT Astra Digital Ventura',
    segment: 'innovation_dev',
    type: 'Milestone Signoff',
    value: 183150000,
    dateSubmitted: '2026-08-01',
    status: 'signed',
    urgency: 'normal'
  }
];

const INITIAL_TECH_SERVICES: TechServiceItem[] = [
  {
    name: 'ams-frontend-app',
    type: 'Cloud Run Service (Vite + React)',
    status: 'healthy',
    uptime: '99.98%',
    latency: '38ms',
    cpuUsage: 22,
    ramUsage: 48,
    port: 3000
  },
  {
    name: 'ams-api-gateway',
    type: 'FastAPI / Node Backend Proxy',
    status: 'healthy',
    uptime: '99.99%',
    latency: '42ms',
    cpuUsage: 35,
    ramUsage: 64,
    port: 8080
  },
  {
    name: 'cloud-sql-postgres',
    type: 'Relational Transactional Database',
    status: 'healthy',
    uptime: '100%',
    latency: '14ms',
    cpuUsage: 28,
    ramUsage: 72,
    port: 5432
  },
  {
    name: 'redis-edge-cache',
    type: 'In-Memory Distributed Session Cache',
    status: 'healthy',
    uptime: '100%',
    latency: '4ms',
    cpuUsage: 12,
    ramUsage: 31,
    port: 6379
  }
];

const INITIAL_STAFF_TASKS: StaffTaskItem[] = [];

// ============================================================================
// MAIN SINGLE UNIFIED DASHBOARD COMPONENT
// ============================================================================
export const GlobalExecutiveDashboard: React.FC<GlobalExecutiveDashboardProps> = ({ 
  onNavigateModule,
  standalone = false,
  showSidebar = true
}) => {
  const { language } = useLanguage();
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());
  
  // 1. DYNAMIC RBAC ROLE STATE & PERMISSIONS ENGINE
  const { role: currentRole, setRole: setCurrentRole, roleMeta, isAllowed } = useRbacRole();
  
  // Cross-cutting filters & states
  const [selectedSegment, setSelectedSegment] = useState<AgencySegment>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('executive');
  const [notification, setNotification] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [staffTasks, setStaffTasks] = useState<StaffTaskItem[]>(INITIAL_STAFF_TASKS);
  
  // Live Finance Data Synchronizer
  const [invoices, setInvoices] = useState<AgencyInvoice[]>(getAgencyInvoices());
  const [expenses, setExpenses] = useState<AgencyExpense[]>(getAgencyExpenses());

  useEffect(() => {
    const handleFinanceChange = () => {
      setInvoices(getAgencyInvoices());
      setExpenses(getAgencyExpenses());
    };
    window.addEventListener(FINANCE_EVENT_NAME, handleFinanceChange);
    return () => window.removeEventListener(FINANCE_EVENT_NAME, handleFinanceChange);
  }, []);

  const finMetrics = useMemo(() => {
    return computeFinancialMetrics(invoices, expenses);
  }, [invoices, expenses]);

  const cashFlowSeries = useMemo(() => {
    return getMonthlyCashFlowSeries(invoices, expenses);
  }, [invoices, expenses]);

  const [hoveredCashMonth, setHoveredCashMonth] = useState<string | null>(null);

  // Modal state for adding project
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectClient, setNewProjectClient] = useState<string>('');
  const [newProjectSegment, setNewProjectSegment] = useState<'visual_experience' | 'innovation_dev'>('visual_experience');
  const [newProjectBudget, setNewProjectBudget] = useState<string>('');

  // Quick Action Modal States
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState<boolean>(false);
  const [isRecordExpenseModalOpen, setIsRecordExpenseModalOpen] = useState<boolean>(false);

  // Quick Invoice Form Fields
  const [quickInvClient, setQuickInvClient] = useState('');
  const [quickInvCompany, setQuickInvCompany] = useState('');
  const [quickInvEmail, setQuickInvEmail] = useState('');
  const [quickInvDesc, setQuickInvDesc] = useState('');
  const [quickInvAmount, setQuickInvAmount] = useState<number>(45000000);
  const [quickInvTax, setQuickInvTax] = useState<number>(11);
  const [quickInvDiscount, setQuickInvDiscount] = useState<number>(0);
  const [quickInvType, setQuickInvType] = useState<'invoice' | 'quotation'>('invoice');

  // Quick Expense Form Fields
  const [quickExpType, setQuickExpType] = useState<ExpenseType>('OpEx');
  const [quickExpCategory, setQuickExpCategory] = useState<ExpenseCategory>('Software & Cloud');
  const [quickExpDesc, setQuickExpDesc] = useState('');
  const [quickExpAmount, setQuickExpAmount] = useState<number>(7500000);

  // Interactive Time Tracker state (Operational Staff)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState<string>('');
  const [isBillable, setIsBillable] = useState<boolean>(true);

  // DevOps terminal activity state (IT / Engineer)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[00:00:00] Cloud Run microservices healthy. Listening on port 3000.',
    '[00:00:00] Zero-trust security boundary active. Awaiting dispatch triggers.'
  ]);

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Format seconds to HH:MM:SS
  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCurrencyToggle = () => {
    const nextCurr = currency === 'IDR' ? 'USD' : 'IDR';
    setActiveCurrency(nextCurr);
    setCurrency(nextCurr);
    showToast(`Currency changed to ${nextCurr}`);
  };

  // Sign approval action & sync with financeStore
  const handleSignApproval = (id: string, client: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'signed' } : a));
    approveInvoice(id, 'Managing Partner', 'Authorized via Financial Sign-Off Desk');
    showToast(`Executive e-Signature executed for: ${client}`);
  };

  // Quick Invoice Submit Handler
  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInvClient.trim() || !quickInvCompany.trim()) {
      showToast('Client Name and Company are required.');
      return;
    }

    const { subtotal, discountAmount, taxAmount, total } = computeInvoiceTotals(
      quickInvAmount,
      quickInvDiscount,
      quickInvTax
    );

    const newInv: AgencyInvoice = {
      id: 'inv_' + Date.now().toString(36),
      invoiceNumber: `KAPI-${quickInvType === 'quotation' ? 'QT' : 'INV'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      clientName: quickInvClient.trim(),
      clientCompany: quickInvCompany.trim(),
      clientEmail: quickInvEmail.trim(),
      type: quickInvType,
      items: [
        {
          id: 'item_' + Date.now().toString(36),
          description: quickInvDesc.trim() || 'Milestone Deliverable SOW',
          quantity: 1,
          unitPrice: quickInvAmount,
          amount: quickInvAmount
        }
      ],
      subtotal,
      discountPercent: quickInvDiscount,
      discountAmount,
      taxPercent: quickInvTax,
      taxAmount,
      total,
      currency: 'IDR',
      status: 'sent',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Payment via Bank Mandiri / BCA Wire Transfer.',
      paymentTerms: 'Bank Transfer Net 14',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveAgencyInvoice(newInv);
    setIsCreateInvoiceModalOpen(false);
    setQuickInvClient('');
    setQuickInvCompany('');
    setQuickInvEmail('');
    setQuickInvDesc('');
    showToast(`Invoice ${newInv.invoiceNumber} created & sent.`);
  };

  // Quick Expense Submit Handler
  const handleRecordExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickExpDesc.trim() || !quickExpAmount) {
      showToast('Description and amount are required.');
      return;
    }

    const newExp: AgencyExpense = {
      id: 'exp_' + Date.now().toString(36),
      type: quickExpType,
      category: quickExpCategory,
      description: quickExpDesc.trim(),
      amount: Number(quickExpAmount),
      date: new Date().toISOString().split('T')[0],
      recurringInterval: 'monthly',
      recordedBy: 'Executive Sponsor'
    };

    saveAgencyExpense(newExp);
    setIsRecordExpenseModalOpen(false);
    setQuickExpDesc('');
    showToast(`Expense recorded: ${formatIDR(newExp.amount)}`);
  };

  // Toggle staff task completion
  const handleToggleTask = (id: string) => {
    setStaffTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Trigger DevOps action
  const handleDevOpsAction = (actionName: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = `[${timestamp}] DEVOPS EXEC: ${actionName} initiated by Lead Engineer. Status: SUCCESS.`;
    setTerminalLogs(prev => [newLog, ...prev.slice(0, 7)]);
    showToast(`Executed: ${actionName}`);
  };

  // Add new project handler
  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectClient.trim()) return;
    const numericBudget = parseFloat(newProjectBudget.replace(/[^0-9]/g, '')) || 50000000;
    const newPrj: ProjectItem = {
      id: `PRJ-${Date.now().toString().slice(-4)}`,
      name: newProjectName.trim(),
      client: newProjectClient.trim(),
      segment: newProjectSegment,
      category: newProjectSegment === 'visual_experience' ? 'Visual Experience & 3D' : 'Innovation Development & Cloud',
      status: 'In Production',
      progress: 5,
      budget: numericBudget,
      marginPercent: 48,
      deadline: '2026-11-30',
      teamLead: 'Lead Architect',
      currentMilestone: 'Sprint 0 Kickoff & Specification',
      aiWinScore: 92
    };
    setProjects(prev => [newPrj, ...prev]);
    setNewProjectName('');
    setNewProjectClient('');
    setNewProjectBudget('');
    setIsAddProjectModalOpen(false);
    showToast(`Project created: ${newPrj.name}`);
  };

  // Filtered projects based on segment and search
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSegment = selectedSegment === 'all' || p.segment === selectedSegment;
      const matchSearch = searchQuery.trim() === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.client.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSegment && matchSearch;
    });
  }, [projects, selectedSegment, searchQuery]);

  // Financial aggregates for Executive
  const totalRevenue = useMemo(() => {
    return filteredProjects.reduce((acc, curr) => acc + curr.budget, 0);
  }, [filteredProjects]);

  const avgMargin = useMemo(() => {
    if (filteredProjects.length === 0) return 0;
    const sum = filteredProjects.reduce((acc, curr) => acc + curr.marginPercent, 0);
    return Math.round(sum / filteredProjects.length);
  }, [filteredProjects]);

  // Standard AMS Module Navigation Config for Standalone View
  const STANDALONE_NAV_SECTIONS = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { key: 'dashboard', label: 'Dashboard Overview', icon: BarChart3, badge: 'LIVE' },
        { key: 'inbox', label: 'Leads & Inbox', icon: Sparkles, badge: 'NEW' },
        { key: 'crm', label: 'CRM & Pipeline', icon: Kanban, badge: '6 Deals' },
        { key: 'projects', label: 'Projects & Tasks', icon: Layers, badge: '8 Tasks' },
      ]
    },
    {
      title: 'FINANCE & REVENUE',
      items: [
        { key: 'invoicing', label: 'Financials & Invoicing', icon: DollarSign, badge: 'RP/USD' },
        { key: 'clients', label: 'Client Directory', icon: Users },
        { key: 'vendors', label: 'Vendor Directory', icon: Briefcase },
      ]
    },
    {
      title: 'CONTENT & PORTFOLIO',
      items: [
        { key: 'services', label: 'Service Catalog', icon: FileText },
        { key: 'cms_projects', label: 'Case Studies & Showcase', icon: FolderGit2 },
        { key: 'testimonials', label: 'Client Testimonials', icon: CheckCircle2 },
      ]
    },
    {
      title: 'ADMINISTRATION & SYSTEM',
      items: [
        { key: 'settings', label: 'System Settings', icon: Cpu },
        { key: 'rbac', label: 'Accounts & RBAC', icon: ShieldCheck, badge: 'ZERO-TRUST' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#FFFFFF] font-sans antialiased flex flex-col md:flex-row overflow-x-hidden selection:bg-[#E50914] selection:text-white">

      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR (AMS Persistent Navigation) */}
      {/* ------------------------------------------------------------- */}
      {showSidebar && (
        <aside className="w-64 lg:w-72 bg-[#111318] border-r border-white/[0.07] flex flex-col shrink-0 h-screen sticky top-0 z-30">
          {/* Brand Header */}
          <div className="h-16 border-b border-white/[0.07] px-5 flex items-center justify-between bg-[#111318]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-white font-black tracking-wider text-sm shadow-[0_0_16px_rgba(229,9,20,0.4)]">
                K
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white font-display">KAPITECH</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40">
                    AMS
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#8A94A6] -mt-0.5 tracking-tight">Unified RBAC Engine</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="System Operational" />
          </div>

          {/* Current Role Indicator in Sidebar */}
          <div className="px-5 py-3 border-b border-white/[0.07] bg-[#181B22]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94A6]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                Active Access Scope
              </span>
              <span className="text-[#E50914] font-bold uppercase">{currentRole}</span>
            </div>
            <p className="text-[11px] text-white font-semibold mt-1 truncate">
              {roleMeta.title}
            </p>
            <div className="text-[10px] font-mono text-[#8A94A6] mt-0.5 truncate">
              {roleMeta.accountProfile.displayName}
            </div>
          </div>

          {/* Quick Navigation Items (Filtered by RBAC) */}
          <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
            {STANDALONE_NAV_SECTIONS.map((section) => {
              const allowedItems = section.items.filter(item => isAllowed(item.key));
              if (allowedItems.length === 0) return null;

              return (
                <div key={section.title} className="space-y-1">
                  <div className="text-[9px] font-mono text-[#8A94A6] px-3 uppercase tracking-wider font-bold">
                    {section.title}
                  </div>
                  {allowedItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.key || (item.key === 'dashboard' && activeNav === 'executive');
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setActiveNav(item.key);
                          if (onNavigateModule && item.key !== 'dashboard') {
                            onNavigateModule(item.key);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-[#181B22] text-white border border-white/[0.07] shadow-sm font-semibold'
                            : 'text-[#8A94A6] hover:text-white hover:bg-[#181B22] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={15} className={isActive ? 'text-[#E50914]' : 'text-[#8A94A6] group-hover:text-white transition-colors'} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                            isActive 
                              ? 'bg-[#E50914]/20 text-[#E50914] border-[#E50914]/40 font-bold' 
                              : 'bg-[#111318] text-[#8A94A6] border-white/[0.07]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          {/* Footer Testing Role Selector & Security Badge */}
          <div className="p-3 border-t border-white/[0.07] bg-[#111318] space-y-2">
            {/* Testing Role Switcher */}
            <div className="p-2.5 rounded-xl bg-[#181B22] border border-white/[0.07]">
              <label className="text-[10px] font-mono text-[#8A94A6] block mb-1 font-semibold flex items-center justify-between">
                <span>ACTIVE ROLE:</span>
                <span className="text-[9px] text-[#E50914] font-bold uppercase">{currentRole}</span>
              </label>
              <select
                value={currentRole}
                onChange={(e) => {
                  const newRole = e.target.value as StakeholderRole;
                  setCurrentRole(newRole);
                  showToast(`Switched active role: ${ROLE_DEFINITIONS[newRole].title}`);
                }}
                className="w-full h-7 px-2 bg-[#111318] text-white text-[11px] font-mono rounded-lg border border-white/[0.07] focus:outline-none focus:border-[#E50914]"
              >
                <option value="executive">Stakeholder Executive</option>
                <option value="pm">Project Manager (PM)</option>
                <option value="engineer">Teknisi IT / Engineer</option>
                <option value="staff">Operational Staff</option>
              </select>
            </div>

            <div className="p-2 rounded-xl bg-[#181B22] border border-white/[0.07] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#8A94A6] flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                Zero-Trust RBAC
              </span>
              <span className="text-white font-semibold">Active</span>
            </div>
          </div>
        </aside>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CONTENT AREA (BENTO GRID WITH DYNAMIC ROLE FILTER) */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#090A0F] overflow-y-auto">

        {/* Global Alert Notification Toast */}
        {notification && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-[#181B22] text-white px-4 py-2.5 rounded-xl border border-[#E50914] shadow-[0_0_24px_rgba(229,9,20,0.35)] animate-in fade-in slide-in-from-top-3 duration-200">
            <Sparkles size={14} className="text-[#E50914]" />
            <span className="text-xs font-mono font-medium">{notification}</span>
          </div>
        )}

        {/* TOPBAR HEADER (Rendered ONLY in standalone mode; AdminLayout has its own topbar) */}
        {showSidebar && (
          <header className="h-16 border-b border-white/[0.07] px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-[#090A0F] shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A94A6]">
              <span className="text-white font-semibold">Kapitech AMS</span>
              <span>&gt;</span>
              <span className="text-[#E50914] font-medium">Dashboard Overview</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Global Search Bar */}
              <div className="relative hidden md:block w-56 lg:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={currentRole === 'engineer' ? 'Search containers, logs...' : 'Search projects, clients, tasks...'}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-[#181B22] text-white placeholder-[#8A94A6] rounded-xl border border-white/[0.07] focus:outline-none focus:border-[#E50914] transition-colors"
                />
              </div>

              {/* Currency Switcher */}
              <button
                onClick={handleCurrencyToggle}
                className="h-8 px-2.5 rounded-xl bg-[#181B22] hover:bg-[#181B22] text-white border border-white/[0.07] text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                title="Toggle Currency (IDR/USD)"
              >
                <DollarSign size={13} className="text-[#E50914]" />
                <span>{currency}</span>
              </button>
            </div>
          </header>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SLEEK MINIMALIST ROLE CONTEXT & ACTION TOOLBAR                */}
        {/* ------------------------------------------------------------- */}
        <section className="px-4 sm:px-6 lg:px-8 pt-5 pb-4 border-b border-white/[0.07] bg-[#090A0F]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold font-sans text-white tracking-tight">
                  {roleMeta.title}
                </h1>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40 font-bold uppercase tracking-wider">
                  {roleMeta.badge}
                </span>
                <span className="text-[10px] font-mono text-[#8A94A6] hidden sm:inline">
                  • Scope: {roleMeta.accountProfile.department}
                </span>
              </div>
              <p className="text-xs text-[#8A94A6] mt-1 font-sans">
                {roleMeta.scopeDescription}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Division Filter */}
              <div className="flex items-center rounded-xl bg-[#181B22] p-0.5 border border-white/[0.07] text-[11px] font-mono">
                <button
                  onClick={() => setSelectedSegment('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedSegment === 'all'
                      ? 'bg-[#E50914] text-white font-bold shadow-sm'
                      : 'text-[#8A94A6] hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedSegment('visual_experience')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedSegment === 'visual_experience'
                      ? 'bg-[#E50914] text-white font-bold shadow-sm'
                      : 'text-[#8A94A6] hover:text-white'
                  }`}
                >
                  Visual Exp
                </button>
                <button
                  onClick={() => setSelectedSegment('innovation_dev')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedSegment === 'innovation_dev'
                      ? 'bg-[#E50914] text-white font-bold shadow-sm'
                      : 'text-[#8A94A6] hover:text-white'
                  }`}
                >
                  Innovation Dev
                </button>
              </div>

              {/* Quick Actions (Strictly ONE '+' icon per button) */}
              <button
                onClick={() => setIsCreateInvoiceModalOpen(true)}
                className="h-8 px-3 rounded-xl bg-[#181B22] hover:bg-[#21252F] border border-white/[0.07] text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
                title="Create Client Invoice"
              >
                <Plus size={13} className="text-emerald-400" />
                <span>Create Invoice</span>
              </button>

              <button
                onClick={() => setIsRecordExpenseModalOpen(true)}
                className="h-8 px-3 rounded-xl bg-[#181B22] hover:bg-[#21252F] border border-white/[0.07] text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
                title="Record Agency Expense"
              >
                <Plus size={13} className="text-rose-400" />
                <span>Record Expense</span>
              </button>

              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="h-8 px-3.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 3. DYNAMIC BENTO GRID (CONDITIONAL BASED ON currentRole) */}
        {/* ------------------------------------------------------------- */}
        <div className="p-4 sm:px-6 lg:px-8 space-y-6 flex-1">

          {/* =========================================================== */}
          {/* STATS ROW (Matching Financials & Invoicing Design System)   */}
          {/* =========================================================== */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {currentRole === 'executive' && (
              <>
                {/* Metric 1: Total Revenue (YTD) */}
                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase font-semibold">Total Revenue (YTD)</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <DollarSign size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                      {formatCurrency(finMetrics.totalPaidRevenue > 0 ? finMetrics.totalPaidRevenue : 309690000, currency)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.07] text-[11px] font-mono">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <TrendingUp size={12} />
                      +24.8% YoY
                    </span>
                    <span className="text-[#8A94A6]">Outperforming Target</span>
                  </div>
                </div>

                {/* Metric 2: Corporate Net Margin */}
                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase font-semibold">Corporate Net Margin</span>
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                        <Percent size={15} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                      {finMetrics.netMarginPercent > 0 ? finMetrics.netMarginPercent : 48.2}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.07] text-[11px] font-mono">
                    <span className="text-violet-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Target &gt; 40%
                    </span>
                    <span className="text-[#8A94A6]">Optimal Profitability</span>
                  </div>
                </div>

                {/* Metric 3: Active Pipeline Value */}
                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase font-semibold">Active Pipeline Value</span>
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                        <Clock size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                      {formatCurrency(finMetrics.totalOutstanding > 0 ? finMetrics.totalOutstanding : 338550000, currency)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.07] text-[11px] font-mono">
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <Sparkles size={12} />
                      {invoices.filter(i => i.status === 'sent' || i.status === 'approved').length || 2} Active Proposals
                    </span>
                    <span className="text-[#8A94A6]">Negotiation Stage</span>
                  </div>
                </div>

                {/* Metric 4: Active Sprints Split */}
                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase font-semibold">Active Sprints Split</span>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Layers size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                      {filteredProjects.length} Projects
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.07] text-[11px] font-mono">
                    <span className="text-blue-400 font-semibold">
                      {filteredProjects.filter(p => p.segment === 'visual_experience').length} Visual • {filteredProjects.filter(p => p.segment === 'innovation_dev').length} Dev Sprints
                    </span>
                    <span className="text-[#8A94A6]">On SLA</span>
                  </div>
                </div>
              </>
            )}

            {currentRole === 'pm' && (
              <>
                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Active Sprints On Schedule</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                      {filteredProjects.length > 0 ? '87.5%' : '0.0%'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-3">
                    <CheckCircle2 size={13} />
                    <span>{filteredProjects.length > 0 ? `${filteredProjects.length} Sprints within SLA` : '0 Sprints Active'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Squad Capacity Load</span>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                        <AlertTriangle size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                      {resources.length > 0 ? '82.5%' : '0.0%'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono mt-3">
                    <AlertTriangle size={13} />
                    <span>{resources.length > 0 ? 'Capacity Monitored' : 'No Active Allocations'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Client Approvals Pending</span>
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                        <Clock size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                      {approvals.filter(a => a.status === 'pending').length} Signoffs
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono mt-3">
                    <Clock size={13} />
                    <span>{approvals.filter(a => a.status === 'pending').length > 0 ? 'Pending e-Signature' : 'All Signoffs Completed'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Managed Project Budget</span>
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                        <Layers size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                      {formatCurrency(totalRevenue, currency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8A94A6] font-mono mt-3">
                    <span>Milestone Delivery Pool</span>
                  </div>
                </div>
              </>
            )}

            {currentRole === 'engineer' && (
              <>
                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Cloud Run Uptime</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Activity size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">99.99%</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-3">
                    <Activity size={13} />
                    <span>Zero Container Cold-Starts</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Average API Latency</span>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Zap size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">0 ms</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-3">
                    <Zap size={13} />
                    <span>Edge Cache Idle</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Production Build</span>
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                        <Code2 size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">v3.4.0-main</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8A94A6] font-mono mt-3">
                    <span>Commit hash: </span>
                    <span className="text-[#E50914] font-bold">#000000</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Open Sentry / Bugs</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <ShieldCheck size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">0 Critical / 0 High</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-3">
                    <ShieldCheck size={13} />
                    <span>Zero Vulnerabilities Found</span>
                  </div>
                </div>
              </>
            )}

            {currentRole === 'staff' && (
              <>
                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">My Active Tasks</span>
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                        <Clock size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                      {staffTasks.filter(t => !t.completed).length} Pending
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono mt-3">
                    <Clock size={13} />
                    <span>{staffTasks.filter(t => !t.completed).length > 0 ? `${staffTasks.filter(t => !t.completed).length} Tasks Due` : 'All Tasks Completed'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Hours Logged (This Week)</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <TrendingUp size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">0.0 / 40.0h</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-3">
                    <TrendingUp size={13} />
                    <span>0.0% Weekly Target Met</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Live Tracker State</span>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Radio size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                      {formatTimer(timerSeconds)}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-mono mt-3 ${isTimerRunning ? 'text-emerald-400 animate-pulse' : 'text-[#8A94A6]'}`}>
                    <Radio size={13} />
                    <span>{isTimerRunning ? 'Active Recording' : 'Paused / Idle'}</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#111318] border border-white/[0.07] flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between text-[#8A94A6] mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider">Approved Deliverables</span>
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                        <CheckCircle2 size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">0 Assets</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-3">
                    <CheckCircle2 size={13} />
                    <span>Client Acceptance Ready</span>
                  </div>
                </div>
              </>
            )}
          </section>


          {/* =========================================================== */}
          {/* ROLE VIEW 1: STAKEHOLDER EXECUTIVE VIEW */}
          {/* =========================================================== */}
          {currentRole === 'executive' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Widget 1: Strategic Portfolio & Cash Flow Trend (Col 8) */}
              <div className="lg:col-span-8 bg-[#111318] rounded-xl border border-white/[0.07] p-5 sm:p-6 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={17} className="text-emerald-400" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Strategic Portfolio & Corporate Margin Analysis
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                      Cross-segment revenue analytics, monthly cash flow trajectory, and net margin yield.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold self-start sm:self-auto">
                    P&L AUTHORIZED
                  </span>
                </div>

                {/* Monthly Cash Flow Trend Chart (Inflow vs. Outflow) */}
                <div className="p-4 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span>Cash Flow Trend (Monthly Inflow vs. Outflow)</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8A94A6]">
                        6-Month Historical Trajectory (Q2 - Q3 2026)
                      </span>
                    </div>

                    {/* Legend & Net Badge */}
                    <div className="flex items-center gap-3 text-[10px] font-mono flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                        <span className="text-[#8A94A6]">Inflow</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                        <span className="text-[#8A94A6]">Outflow</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                        Net: +Rp 170.5M
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar Comparative Visualizer */}
                  <div className="h-44 pt-4 pb-1 flex items-end justify-between gap-2 sm:gap-4 px-2">
                    {cashFlowSeries.map((item) => {
                      const maxVal = 140000000;
                      const inflowPct = Math.min(100, Math.max(12, Math.round((item.inflow / maxVal) * 100)));
                      const outflowPct = Math.min(100, Math.max(10, Math.round((item.outflow / maxVal) * 100)));
                      const isHovered = hoveredCashMonth === item.month;

                      return (
                        <div
                          key={item.month}
                          onMouseEnter={() => setHoveredCashMonth(item.month)}
                          onMouseLeave={() => setHoveredCashMonth(null)}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                        >
                          {/* Hover Tooltip */}
                          {isHovered && (
                            <div className="absolute -top-14 z-30 px-2.5 py-1.5 rounded-lg bg-[#111318] border border-white/10 shadow-xl text-[10px] font-mono whitespace-nowrap pointer-events-none">
                              <div className="text-white font-bold">{item.month}</div>
                              <div className="text-emerald-400">In: {formatCurrency(item.inflow, currency)}</div>
                              <div className="text-rose-400">Out: {formatCurrency(item.outflow, currency)}</div>
                            </div>
                          )}

                          {/* Dual Bars */}
                          <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-32">
                            {/* Inflow Bar */}
                            <div
                              className="w-1/2 max-w-[20px] rounded-t-sm bg-emerald-500/80 group-hover:bg-emerald-400 transition-all relative overflow-hidden"
                              style={{ height: `${inflowPct}%` }}
                              title={`Inflow: ${formatIDR(item.inflow)}`}
                            />
                            {/* Outflow Bar */}
                            <div
                              className="w-1/2 max-w-[20px] rounded-t-sm bg-rose-500/80 group-hover:bg-rose-400 transition-all relative overflow-hidden"
                              style={{ height: `${outflowPct}%` }}
                              title={`Outflow: ${formatIDR(item.outflow)}`}
                            />
                          </div>

                          {/* Month Label */}
                          <span className={`text-[10px] font-mono mt-2 transition-colors ${isHovered ? 'text-white font-bold' : 'text-[#8A94A6]'}`}>
                            {item.month.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Strategic Deliverables & Margin Yield */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5 font-display">
                      <Briefcase size={14} className="text-emerald-400" />
                      Active Client Deliverables & Margin Yield
                    </span>
                    <span className="text-[10px] font-mono text-[#8A94A6]">
                      {filteredProjects.length} Active Sprints
                    </span>
                  </div>

                  {filteredProjects.length === 0 ? (
                    <div className="py-10 px-4 rounded-xl bg-[#181B22] border border-white/[0.07] flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#111318] border border-white/[0.07] flex items-center justify-center text-[#8A94A6] mb-2.5">
                        <Briefcase size={18} className="text-[#8A94A6]" />
                      </div>
                      <h4 className="text-xs font-semibold text-white">No active client projects in portfolio</h4>
                      <p className="text-[11px] text-[#8A94A6] max-w-sm mt-0.5 mb-3 font-sans">
                        Initialize your agency pipeline by creating your first client project or sprint.
                      </p>
                      <button
                        onClick={() => setIsAddProjectModalOpen(true)}
                        className="h-7 px-3 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Plus size={13} />
                        <span>Add Project</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredProjects.map((p) => (
                        <div key={p.id} className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.07] hover:border-white/10 transition-all space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{p.name}</span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                                  p.segment === 'visual_experience'
                                    ? 'bg-purple-950/40 text-purple-300 border-purple-800/40'
                                    : 'bg-cyan-950/40 text-cyan-300 border-cyan-800/40'
                                }`}>
                                  {p.segment === 'visual_experience' ? 'Visual Exp' : 'Innovation Dev'}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#8A94A6] mt-0.5">{p.client} • Lead: {p.teamLead}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-mono font-bold text-white">
                                {formatCurrency(p.budget, currency)}
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                Margin: {p.marginPercent}% Net
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-[#8A94A6]">
                              <span>Milestone: <span className="text-white font-medium">{p.currentMilestone}</span></span>
                              <span className="text-white font-bold">{p.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#111318] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#E50914]"
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Widget 2: Financial Sign-off & Runway Indicator (Col 4) */}
              <div className="lg:col-span-4 bg-[#111318] rounded-xl border border-white/[0.07] p-5 sm:p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <DollarSign size={14} />
                        </div>
                        <h3 className="text-sm font-bold text-white tracking-tight font-display">
                          Financial Sign-Off Desk
                        </h3>
                      </div>
                      <p className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                        Requires Managing Partner e-Signature
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold">
                      {approvals.filter(a => a.status === 'pending').length} Pending
                    </span>
                  </div>

                  {approvals.length === 0 ? (
                    <div className="py-8 px-3 rounded-xl bg-[#181B22] border border-white/[0.07] flex flex-col items-center justify-center text-center">
                      <div className="w-9 h-9 rounded-xl bg-[#111318] border border-white/[0.07] flex items-center justify-center text-[#8A94A6] mb-2">
                        <FileCheck2 size={16} className="text-[#8A94A6]" />
                      </div>
                      <div className="text-xs font-semibold text-white">No pending sign-offs</div>
                      <div className="text-[11px] text-[#8A94A6] mt-0.5 max-w-xs">All milestone disbursements and contracts are up to date.</div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {approvals.map((app) => (
                        <div key={app.id} className="p-3 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-2 hover:border-white/10 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white leading-tight">{app.title}</div>
                              <div className="text-[10px] font-mono text-[#8A94A6] mt-0.5">{app.client}</div>
                            </div>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${
                              app.status === 'signed'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                            }`}>
                              {app.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                            <span className="text-xs font-mono font-bold text-white">
                              {formatCurrency(app.value, currency)}
                            </span>
                            {app.status === 'pending' ? (
                              <button
                                onClick={() => handleSignApproval(app.id, app.client)}
                                className="h-6 px-2.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-[10px] font-mono font-bold transition-all flex items-center gap-1 shadow-sm"
                              >
                                <FileCheck size={11} />
                                <span>e-Sign & Release</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                                <Check size={12} />
                                Authorized
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cashflow Runway & OpEx Burn Indicator */}
                <div className="p-4 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8A94A6]">Company Runway:</span>
                    <span className="text-emerald-400 font-bold">18.4 Months</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8A94A6]">Monthly OpEx Burn:</span>
                    <span className="text-white font-bold">{formatCurrency(83000000, currency)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#111318] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94A6] pt-1">
                    <span>Net Margin: <strong className="text-violet-400">48.2%</strong></span>
                    <span>Audit Ready</span>
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* =========================================================== */}
          {/* ROLE VIEW 2: PROJECT MANAGER (PM) VIEW */}
          {/* =========================================================== */}
          {currentRole === 'pm' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Widget 1: Project Delivery & Sprints (Col 8) */}
              <div className="lg:col-span-8 bg-[#111318] rounded-xl border border-white/[0.07] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Project Delivery Status & Milestone Tracking
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                      Execution velocity, target deadlines, and deliverables in flight.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40 font-bold">
                    OPS CONTROL
                  </span>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="py-14 px-4 rounded-xl bg-[#181B22] border border-white/[0.07] flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#181B22] border border-white/[0.07] flex items-center justify-center text-[#8A94A6] mb-3">
                      <Layers size={22} className="text-[#8A94A6]" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">No active sprint milestones</h4>
                    <p className="text-xs text-[#8A94A6] max-w-sm mt-1 mb-4 font-sans">
                      All agency deliverables are archived or not yet initialized for this sprint cycle.
                    </p>
                    <button
                      onClick={() => setIsAddProjectModalOpen(true)}
                      className="h-8 px-3.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Add Project</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProjects.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-3 hover:border-white/10 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{p.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#181B22] text-[#8A94A6] border border-white/[0.07]">
                                {p.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8A94A6] mt-0.5">Client: {p.client} • Lead: {p.teamLead}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-[#8A94A6]">Target Delivery</span>
                            <div className="text-xs font-mono font-bold text-white">{p.deadline}</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#181B22] border border-white/[0.07] flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                            <span className="text-[#8A94A6]">Active Milestone:</span>
                            <span className="text-white font-medium">{p.currentMilestone}</span>
                          </div>
                          {p.externalLink && (
                            <a
                              href={p.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#E50914] hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <span>Open Asset</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Widget 2: Resource Allocation Matrix (Col 4) */}
              <div className="lg:col-span-4 bg-[#111318] rounded-xl border border-white/[0.07] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Resource Allocation Matrix
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                      Visual vs Dev Squad Capacity (40h Cap)
                    </p>
                  </div>
                </div>

                {resources.length === 0 ? (
                  <div className="py-10 px-3 rounded-xl bg-[#181B22] border border-white/[0.07] flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#181B22] border border-white/[0.07] flex items-center justify-center text-[#8A94A6] mb-2.5">
                      <Users size={18} className="text-[#8A94A6]" />
                    </div>
                    <div className="text-xs font-semibold text-white">No team members allocated</div>
                    <div className="text-[11px] text-[#8A94A6] mt-0.5 max-w-xs">Squad hours are currently unassigned across active sprints.</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resources.map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-2 hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={r.avatar} alt={r.name} className="w-7 h-7 rounded-full object-cover border border-white/[0.07]" />
                            <div>
                              <div className="text-xs font-bold text-white">{r.name}</div>
                              <div className="text-[10px] text-[#8A94A6] font-mono">{r.role}</div>
                            </div>
                          </div>
                          {r.isOverallocated && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800 font-bold">
                              OVERLOAD
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-[#8A94A6]">{r.activeTasks} Active Tasks</span>
                            <span className={r.isOverallocated ? 'text-red-400 font-bold' : 'text-white font-medium'}>
                              {r.allocatedHours}h / {r.maxHours}h
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#181B22] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${r.isOverallocated ? 'bg-[#E50914]' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (r.allocatedHours / r.maxHours) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => showToast('Capacity rebalance suggestion computed by PM scheduler.')}
                  className="w-full h-9 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white border border-white/[0.07] hover:border-white/10 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={13} className="text-[#E50914]" />
                  <span>Rebalance Squad Workload</span>
                </button>
              </div>

            </div>
          )}


          {/* =========================================================== */}
          {/* ROLE VIEW 3: TEKNISI IT / ENGINEER (DEVOPS & INFRA) VIEW */}
          {/* =========================================================== */}
          {currentRole === 'engineer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Widget 1: Infrastructure & Cloud Run Telemetry (Col 8) */}
              <div className="lg:col-span-8 bg-[#111318] rounded-xl border border-white/[0.07] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Server size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Infrastructure & Cloud Run Container Telemetry
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                      Live microservice health, latency gauges, and hardware utilization.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-bold">
                    ALL OPERATIONAL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INITIAL_TECH_SERVICES.map((srv) => (
                    <div key={srv.name} className="p-4 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-3 hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs font-bold font-mono text-white">{srv.name}</span>
                          </div>
                          <p className="text-[10px] text-[#8A94A6] font-mono mt-0.5">{srv.type}</p>
                        </div>
                        {srv.port && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#181B22] text-[#8A94A6] border border-white/[0.07]">
                            Port {srv.port}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#181B22] p-2 rounded-lg border border-white/[0.07]">
                        <div>
                          <span className="text-[#8A94A6]">Uptime: </span>
                          <span className="text-white font-bold">{srv.uptime}</span>
                        </div>
                        <div>
                          <span className="text-[#8A94A6]">Latency: </span>
                          <span className="text-emerald-400 font-bold">{srv.latency}</span>
                        </div>
                        <div>
                          <span className="text-[#8A94A6]">CPU: </span>
                          <span className="text-white">{srv.cpuUsage}%</span>
                        </div>
                        <div>
                          <span className="text-[#8A94A6]">RAM: </span>
                          <span className="text-white">{srv.ramUsage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Git Backlog Stream */}
                <div className="p-4 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8A94A6] flex items-center gap-2">
                      <FolderGit2 size={14} className="text-[#E50914]" />
                      Active Git PRs & Sprint Commits
                    </span>
                    <span className="text-[#E50914] font-bold">Branch: main (Clean)</span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded bg-[#181B22] border border-white/[0.07]">
                      <span className="text-white truncate">PR #142: feat(rbac): unified single dashboard multi-role controller</span>
                      <span className="text-emerald-400 font-bold shrink-0 ml-2">Merged</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-[#181B22] border border-white/[0.07]">
                      <span className="text-white truncate">PR #141: fix(kanban): eliminate horizontal scroll conflict on touch</span>
                      <span className="text-emerald-400 font-bold shrink-0 ml-2">Merged</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-[#181B22] border border-white/[0.07]">
                      <span className="text-white truncate">PR #140: chore(infra): bump Cloud Run memory threshold to 2Gi</span>
                      <span className="text-emerald-400 font-bold shrink-0 ml-2">Merged</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 2: DevOps Command & System Audit Log (Col 4) */}
              <div className="lg:col-span-4 bg-[#111318] rounded-xl border border-white/[0.07] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Terminal size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Quick DevOps Actions & Audit
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                      Terminal triggers & real-time telemetry stream
                    </p>
                  </div>
                </div>

                {/* DevOps Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDevOpsAction('Edge Cache Invalidation')}
                    className="p-2.5 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white border border-white/[0.07] hover:border-white/10 text-[11px] font-mono font-semibold transition-all flex flex-col items-center gap-1 text-center"
                  >
                    <Zap size={14} className="text-[#E50914]" />
                    <span>Purge Cache</span>
                  </button>
                  <button
                    onClick={() => handleDevOpsAction('Container Health Ping')}
                    className="p-2.5 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white border border-white/[0.07] hover:border-white/10 text-[11px] font-mono font-semibold transition-all flex flex-col items-center gap-1 text-center"
                  >
                    <Activity size={14} className="text-emerald-400" />
                    <span>Ping Mesh</span>
                  </button>
                  <button
                    onClick={() => handleDevOpsAction('Staging Canary Deploy')}
                    className="p-2.5 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white border border-white/[0.07] hover:border-white/10 text-[11px] font-mono font-semibold transition-all flex flex-col items-center gap-1 text-center"
                  >
                    <Server size={14} className="text-cyan-400" />
                    <span>Deploy Staging</span>
                  </button>
                  <button
                    onClick={() => handleDevOpsAction('Audit Trail Export')}
                    className="p-2.5 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white border border-white/[0.07] hover:border-white/10 text-[11px] font-mono font-semibold transition-all flex flex-col items-center gap-1 text-center"
                  >
                    <Download size={14} className="text-purple-400" />
                    <span>Export Audit</span>
                  </button>
                </div>

                {/* Live Console Stream */}
                <div className="p-3 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8A94A6]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Stream
                    </span>
                    <span>stdout / stderr</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px] text-[#8A94A6] max-h-48 overflow-y-auto custom-scrollbar">
                    {terminalLogs.map((log, index) => (
                      <div key={index} className="leading-relaxed text-slate-300">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}


          {/* =========================================================== */}
          {/* ROLE VIEW 4: OPERATIONAL STAFF VIEW */}
          {/* =========================================================== */}
          {currentRole === 'staff' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Widget 1: My Daily Task Execution Board (Col 8) */}
              <div className="lg:col-span-8 bg-[#111318] rounded-xl border border-white/[0.07] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        My Daily Tasks & Sprint Execution
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                      Assigned checklist for Visual Experience and Innovation Development.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40 font-bold">
                    PERSONAL SPRINT
                  </span>
                </div>

                {staffTasks.length === 0 ? (
                  <div className="py-14 px-4 rounded-xl bg-[#181B22] border border-white/[0.07] flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#181B22] border border-white/[0.07] flex items-center justify-center text-[#8A94A6] mb-3">
                      <CheckCircle2 size={22} className="text-[#8A94A6]" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">No active sprint tasks assigned</h4>
                    <p className="text-xs text-[#8A94A6] max-w-sm mt-1 mb-4 font-sans">
                      All personal deliverables are up to date. Sprints will populate when milestones are assigned.
                    </p>
                    <button
                      onClick={() => setIsAddProjectModalOpen(true)}
                      className="h-8 px-3.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Add Project</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {staffTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTask(t.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          t.completed
                            ? 'bg-[#181B22]/40 border-white/[0.07]/50 opacity-60'
                            : 'bg-[#181B22] border border-white/[0.07] hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
                            t.completed
                              ? 'bg-emerald-500 border-emerald-500 text-black'
                              : 'border-white/[0.07] bg-[#181B22]'
                          }`}>
                            {t.completed && <Check size={13} strokeWidth={3} />}
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${t.completed ? 'line-through text-[#8A94A6]' : 'text-white'}`}>
                              {t.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-[#8A94A6] mt-0.5">
                              <span>{t.project}</span>
                              <span>•</span>
                              <span>Due: {t.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase border ${
                            t.priority === 'high'
                              ? 'bg-red-950/40 text-red-400 border-red-800/40'
                              : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          }`}>
                            {t.priority}
                          </span>
                          <span className="text-[10px] font-mono text-[#8A94A6]">
                            {t.estimatedHours}h est.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Creative Asset Quick Repositories */}
                <div className="p-4 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-3">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <FolderGit2 size={14} className="text-[#E50914]" />
                    Creative Asset & Code Repository Quick Links
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <a
                      href="https://figma.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-[#181B22] hover:bg-[#21252F] border border-white/[0.07] text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Palette size={14} className="text-purple-400" />
                        <span>Figma Design System</span>
                      </div>
                      <ExternalLink size={12} className="text-[#8A94A6]" />
                    </a>

                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-[#181B22] hover:bg-[#21252F] border border-white/[0.07] text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Code2 size={14} className="text-cyan-400" />
                        <span>GitHub Repositories</span>
                      </div>
                      <ExternalLink size={12} className="text-[#8A94A6]" />
                    </a>

                    <a
                      href="https://staging.kapitech.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-[#181B22] hover:bg-[#21252F] border border-white/[0.07] text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-emerald-400" />
                        <span>Client Staging Builds</span>
                      </div>
                      <ExternalLink size={12} className="text-[#8A94A6]" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Widget 2: Interactive Live Time Tracker (Col 4) */}
              <div className="lg:col-span-4 bg-[#111318] rounded-xl border border-white/[0.07] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Timer size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Interactive Time Tracker
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] font-mono mt-0.5">
                      Log billable project sprint hours in real-time.
                    </p>
                  </div>
                </div>

                {/* Main Timer Display */}
                <div className="p-5 rounded-xl bg-[#181B22] border border-white/[0.07] text-center space-y-3 relative overflow-hidden">
                  {isTimerRunning && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#E50914] animate-pulse" />
                  )}

                  <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white">
                    {formatTimer(timerSeconds)}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#8A94A6]">
                    <span>Current: </span>
                    <span className="text-white font-semibold">
                      {staffTasks.find(t => t.id === selectedTaskForTimer)?.title || 'General Agency Sprint'}
                    </span>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setIsTimerRunning(!isTimerRunning);
                        showToast(isTimerRunning ? 'Timer paused.' : 'Timer recording started.');
                      }}
                      className={`h-9 px-4 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                        isTimerRunning
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-[#E50914] hover:bg-[#b80710] text-white'
                      }`}
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause size={14} />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          <span>Start Timer</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(0);
                        showToast('Timer logged to sprint timesheet.');
                      }}
                      className="h-9 px-3 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-white/[0.07] text-xs font-mono font-medium transition-all"
                    >
                      Log & Reset
                    </button>
                  </div>
                </div>

                {/* Task selection & Billable toggle */}
                <div className="space-y-3 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-[#8A94A6]">Assign to Task:</label>
                    <select
                      value={selectedTaskForTimer}
                      onChange={(e) => setSelectedTaskForTimer(e.target.value)}
                      className="w-full h-8 px-2 bg-[#181B22] border border-white/[0.07] rounded-lg text-white text-xs focus:outline-none focus:border-[#E50914]"
                    >
                      {staffTasks.length === 0 ? (
                        <option value="">No Active Sprint Tasks</option>
                      ) : (
                        staffTasks.map(t => (
                          <option key={t.id} value={t.id}>{t.title} ({t.project})</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#181B22] border border-white/[0.07]">
                    <span className="text-[#8A94A6]">Billable to Client:</span>
                    <button
                      onClick={() => setIsBillable(!isBillable)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        isBillable
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : 'bg-[#181B22] text-[#8A94A6] border-white/[0.07]'
                      }`}
                    >
                      {isBillable ? 'BILLABLE (100%)' : 'INTERNAL NON-BILLABLE'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODAL: ADD NEW PROJECT / SPRINT (STRICTLY ONE '+' ICON)       */}
        {/* ------------------------------------------------------------- */}
        {isAddProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-xl bg-[#111318] border border-white/[0.07] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E50914]/15 border border-[#E50914]/40 flex items-center justify-center text-[#E50914]">
                    <Plus size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Create Agency Project</h3>
                </div>
                <button
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddProjectSubmit} className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[#8A94A6] block">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Aura 3D Spatial Walkthrough"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8A94A6] block">Client / Account Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., PT Bank Mandiri (Persero) Tbk"
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8A94A6] block">Agency Operating Segment *</label>
                  <select
                    value={newProjectSegment}
                    onChange={(e) => setNewProjectSegment(e.target.value as 'visual_experience' | 'innovation_dev')}
                    className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="visual_experience">Segment 1: Visual Experience (3D, Motion, Branding)</option>
                    <option value="innovation_dev">Segment 2: Innovation Development (Web, Cloud, ERP)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8A94A6] block">Contract Budget ({currency})</label>
                  <input
                    type="text"
                    placeholder="e.g., 250000000"
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(e.target.value)}
                    className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddProjectModalOpen(false)}
                    className="h-8 px-3.5 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus size={13} />
                    <span>Create Sprint</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QUICK ACTION MODAL 1: CREATE INVOICE */}
        {isCreateInvoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#111318] border border-white/[0.07] rounded-2xl shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight font-display">Create Client Invoice</h3>
                    <p className="text-[10px] font-mono text-[#8A94A6]">Issue official milestone billable to client</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateInvoiceModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#8A94A6] block">Client Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Jane Doe"
                      value={quickInvClient}
                      onChange={(e) => setQuickInvClient(e.target.value)}
                      className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white placeholder-[#8A94A6] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#8A94A6] block">Client Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., PT Mandiri Digital"
                      value={quickInvCompany}
                      onChange={(e) => setQuickInvCompany(e.target.value)}
                      className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white placeholder-[#8A94A6] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#8A94A6] block">Billing Email</label>
                    <input
                      type="email"
                      placeholder="finance@client.id"
                      value={quickInvEmail}
                      onChange={(e) => setQuickInvEmail(e.target.value)}
                      className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white placeholder-[#8A94A6] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#8A94A6] block">Document Type</label>
                    <select
                      value={quickInvType}
                      onChange={(e) => setQuickInvType(e.target.value as 'invoice' | 'quotation')}
                      className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="invoice">Official Commercial Invoice</option>
                      <option value="quotation">Pre-Delivery Quotation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#8A94A6] block">Milestone / Scope Deliverable *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Milestone 1: UX/UI Blueprint & Technical Architecture"
                    value={quickInvDesc}
                    onChange={(e) => setQuickInvDesc(e.target.value)}
                    className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white placeholder-[#8A94A6] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 sm:col-span-1 space-y-1">
                    <label className="text-[#8A94A6] block">Subtotal (IDR) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000000}
                      value={quickInvAmount}
                      onChange={(e) => setQuickInvAmount(Number(e.target.value))}
                      className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#8A94A6] block">PPN Tax (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={quickInvTax}
                      onChange={(e) => setQuickInvTax(Number(e.target.value))}
                      className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#8A94A6] block">Discount (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={quickInvDiscount}
                      onChange={(e) => setQuickInvDiscount(Number(e.target.value))}
                      className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Live Computed Summary */}
                <div className="p-3 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-[#8A94A6]">
                    <span>Net Billable Total:</span>
                    <span className="text-emerald-400 font-bold text-xs">
                      {formatIDR(
                        computeInvoiceTotals(quickInvAmount, quickInvDiscount, quickInvTax).total
                      )}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreateInvoiceModalOpen(false)}
                    className="h-8 px-3.5 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus size={13} />
                    <span>Create Invoice</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QUICK ACTION MODAL 2: RECORD EXPENSE */}
        {isRecordExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#111318] border border-white/[0.07] rounded-2xl shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight font-display">Record Agency Expense</h3>
                    <p className="text-[10px] font-mono text-[#8A94A6]">Track OpEx/CapEx outflow and preserve runway</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRecordExpenseModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleRecordExpenseSubmit} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#8A94A6] block">Expense Classification *</label>
                    <select
                      value={quickExpType}
                      onChange={(e) => setQuickExpType(e.target.value as ExpenseType)}
                      className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="OpEx">OpEx (Operating Expense)</option>
                      <option value="CapEx">CapEx (Capital Expenditure)</option>
                      <option value="Rentals">Rentals & Space</option>
                      <option value="Recurring">Recurring SaaS / Subscriptions</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#8A94A6] block">Category *</label>
                    <select
                      value={quickExpCategory}
                      onChange={(e) => setQuickExpCategory(e.target.value as ExpenseCategory)}
                      className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Software & Cloud">Software & Cloud</option>
                      <option value="Salaries & Contractors">Salaries & Contractors</option>
                      <option value="Office & Hardware">Office & Hardware</option>
                      <option value="Office & Rentals">Office & Rentals</option>
                      <option value="Marketing & Ads">Marketing & Ads</option>
                      <option value="Legal & Admin">Legal & Admin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#8A94A6] block">Description / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Google Cloud Engine & Vercel Pro Tier"
                    value={quickExpDesc}
                    onChange={(e) => setQuickExpDesc(e.target.value)}
                    className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white placeholder-[#8A94A6] focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#8A94A6] block">Outflow Amount (IDR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100000}
                    value={quickExpAmount}
                    onChange={(e) => setQuickExpAmount(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#181B22] border border-white/[0.07] rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#181B22] border border-white/[0.07] space-y-1 text-[11px]">
                  <div className="flex justify-between text-[#8A94A6]">
                    <span>Recorded Impact:</span>
                    <span className="text-rose-400 font-bold">{formatIDR(quickExpAmount)}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRecordExpenseModalOpen(false)}
                    className="h-8 px-3.5 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus size={13} />
                    <span>Record Expense</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
