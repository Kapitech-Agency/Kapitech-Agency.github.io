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
  CalendarCheck
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, setActiveCurrency, CurrencyCode, formatCurrency } from '../../lib/currency';
import { useRbacRole, StakeholderRole, ROLE_DEFINITIONS } from '../../lib/rbacEngine';

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
// INITIAL ZERO-DATA SETS (ENFORCING CLEAN STATE)
// ============================================================================
const INITIAL_PROJECTS: ProjectItem[] = [];

const INITIAL_RESOURCES: ResourceItem[] = [];

const INITIAL_APPROVALS: ApprovalItem[] = [];

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
  
  // Modal state for adding project
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectClient, setNewProjectClient] = useState<string>('');
  const [newProjectSegment, setNewProjectSegment] = useState<'visual_experience' | 'innovation_dev'>('visual_experience');
  const [newProjectBudget, setNewProjectBudget] = useState<string>('');

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

  // Sign approval action
  const handleSignApproval = (id: string, client: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'signed' } : a));
    showToast(`Executive e-Signature executed for: ${client}`);
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
    <div className="min-h-screen bg-[#0D0D0F] text-[#FFFFFF] font-sans antialiased flex flex-col md:flex-row overflow-x-hidden selection:bg-[#E50914] selection:text-white">

      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR (AMS Persistent Navigation) */}
      {/* ------------------------------------------------------------- */}
      {showSidebar && (
        <aside className="w-64 lg:w-72 bg-[#0D0D0F] border-r border-[#242429] flex flex-col shrink-0 h-screen sticky top-0 z-30">
          {/* Brand Header */}
          <div className="h-16 border-b border-[#242429] px-5 flex items-center justify-between bg-[#0D0D0F]">
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
                <p className="text-[10px] font-mono text-[#8E8E93] -mt-0.5 tracking-tight">Unified RBAC Engine</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" title="System Operational" />
          </div>

          {/* Current Role Indicator in Sidebar */}
          <div className="px-5 py-3 border-b border-[#242429] bg-[#151518]/60">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8E93]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                Active Access Scope
              </span>
              <span className="text-[#E50914] font-bold uppercase">{currentRole}</span>
            </div>
            <p className="text-[11px] text-white font-semibold mt-1 truncate">
              {roleMeta.title}
            </p>
            <div className="text-[10px] font-mono text-[#8E8E93] mt-0.5 truncate">
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
                  <div className="text-[9px] font-mono text-[#8E8E93] px-3 uppercase tracking-wider font-bold">
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
                            ? 'bg-[#1A1A1E] text-white border border-[#242429] shadow-sm font-semibold'
                            : 'text-[#8E8E93] hover:text-white hover:bg-[#151518] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={15} className={isActive ? 'text-[#E50914]' : 'text-[#8E8E93] group-hover:text-white transition-colors'} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                            isActive 
                              ? 'bg-[#E50914]/20 text-[#E50914] border-[#E50914]/40 font-bold' 
                              : 'bg-[#0D0D0F] text-[#8E8E93] border-[#242429]'
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
          <div className="p-3 border-t border-[#242429] bg-[#0D0D0F] space-y-2">
            {/* Testing Role Switcher */}
            <div className="p-2.5 rounded-xl bg-[#151518] border border-[#242429]">
              <label className="text-[10px] font-mono text-[#8E8E93] block mb-1 font-semibold flex items-center justify-between">
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
                className="w-full h-7 px-2 bg-[#0D0D0F] text-white text-[11px] font-mono rounded border border-[#242429] focus:outline-none focus:border-[#E50914]"
              >
                <option value="executive">Stakeholder Executive</option>
                <option value="pm">Project Manager (PM)</option>
                <option value="engineer">Teknisi IT / Engineer</option>
                <option value="staff">Operational Staff</option>
              </select>
            </div>

            <div className="p-2 rounded-xl bg-[#151518]/60 border border-[#242429] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#8E8E93] flex items-center gap-1.5">
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
      <main className="flex-1 flex flex-col min-w-0 bg-[#0D0D0F] overflow-y-auto">

        {/* Global Alert Notification Toast */}
        {notification && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-[#151518] text-white px-4 py-2.5 rounded-xl border border-[#E50914] shadow-[0_0_24px_rgba(229,9,20,0.35)] animate-in fade-in slide-in-from-top-3 duration-200">
            <Sparkles size={14} className="text-[#E50914]" />
            <span className="text-xs font-mono font-medium">{notification}</span>
          </div>
        )}

        {/* TOPBAR HEADER (Rendered ONLY in standalone mode; AdminLayout has its own topbar) */}
        {showSidebar && (
          <header className="h-16 border-b border-[#242429] px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-[#0D0D0F] shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
              <span className="text-white font-semibold">Kapitech AMS</span>
              <span>&gt;</span>
              <span className="text-[#E50914] font-medium">Dashboard Overview</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Global Search Bar */}
              <div className="relative hidden md:block w-56 lg:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={currentRole === 'engineer' ? 'Search containers, logs...' : 'Search projects, clients, tasks...'}
                  className="w-full h-8 pl-8 pr-3 text-xs bg-[#151518] text-white placeholder-[#8E8E93] rounded-lg border border-[#242429] focus:outline-none focus:border-[#E50914] transition-colors"
                />
              </div>

              {/* Currency Switcher */}
              <button
                onClick={handleCurrencyToggle}
                className="h-8 px-2.5 rounded-lg bg-[#151518] hover:bg-[#1A1A1E] text-white border border-[#242429] text-xs font-mono font-bold transition-all flex items-center gap-1.5"
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
        <section className="px-4 sm:px-6 lg:px-8 pt-5 pb-4 border-b border-[#242429] bg-[#0D0D0F]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold font-sans text-white tracking-tight">
                  {roleMeta.title}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40 font-bold uppercase">
                  {roleMeta.category}
                </span>
                <span className="text-[10px] font-mono text-[#8E8E93] hidden sm:inline">
                  • Scope: {roleMeta.department}
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] mt-1 font-sans">
                {roleMeta.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Division Filter */}
              <div className="flex items-center rounded-lg bg-[#151518] p-0.5 border border-[#242429] text-[11px] font-mono">
                <button
                  onClick={() => setSelectedSegment('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedSegment === 'all'
                      ? 'bg-[#E50914] text-white font-bold shadow-sm'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedSegment('visual_experience')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    selectedSegment === 'visual_experience'
                      ? 'bg-[#E50914] text-white font-bold shadow-sm'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  Visual Exp
                </button>
                <button
                  onClick={() => setSelectedSegment('innovation_dev')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    selectedSegment === 'innovation_dev'
                      ? 'bg-[#E50914] text-white font-bold shadow-sm'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  Innovation Dev
                </button>
              </div>

              {/* Primary Action Button (Strictly ONE '+' icon) */}
              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="h-8 px-3.5 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
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
          {/* STATS ROW (Tailored Per Role) */}
          {/* =========================================================== */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRole === 'executive' && (
              <>
                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429] relative overflow-hidden">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Total Revenue (YTD)</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {formatCurrency(totalRevenue, currency)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                    <TrendingUp size={13} />
                    <span>{totalRevenue > 0 ? '+24.8% YoY' : '0.0% YoY'}</span>
                    <span className="text-[#8E8E93] ml-1">{totalRevenue > 0 ? 'vs target' : 'baseline'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429] relative overflow-hidden">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Corporate Net Margin</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {avgMargin}%
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                    <CheckCircle2 size={13} />
                    <span>{avgMargin > 0 ? 'Healthy (Target > 40%)' : 'Target > 40%'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429] relative overflow-hidden">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Active Pipeline Value</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {formatCurrency(totalRevenue, currency)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#E50914] font-mono mt-1">
                    <Sparkles size={13} />
                    <span>{filteredProjects.length > 0 ? `${filteredProjects.length} Active Proposals` : '0 Active Proposals'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429] relative overflow-hidden">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Active Sprints Split</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {filteredProjects.length} Projects
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#8E8E93] font-mono mt-1">
                    <span className="text-white font-bold">{filteredProjects.filter(p => p.segment === 'visual_experience').length} Visual</span>
                    <span>•</span>
                    <span className="text-white font-bold">{filteredProjects.filter(p => p.segment === 'innovation_dev').length} Dev Sprints</span>
                  </div>
                </div>
              </>
            )}

            {currentRole === 'pm' && (
              <>
                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Active Sprints On Schedule</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {filteredProjects.length > 0 ? '87.5%' : '0.0%'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                    <CheckCircle2 size={13} />
                    <span>{filteredProjects.length > 0 ? `${filteredProjects.length} Sprints within SLA` : '0 Sprints Active'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Squad Capacity Load</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {resources.length > 0 ? '82.5%' : '0.0%'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono mt-1">
                    <AlertTriangle size={13} />
                    <span>{resources.length > 0 ? 'Capacity Monitored' : 'No Active Allocations'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Client Approvals Pending</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {approvals.filter(a => a.status === 'pending').length} Signoffs
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#E50914] font-mono mt-1">
                    <Clock size={13} />
                    <span>{approvals.filter(a => a.status === 'pending').length > 0 ? 'Pending e-Signature' : 'All Signoffs Completed'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Managed Project Budget</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {formatCurrency(totalRevenue, currency)}
                  </div>
                  <div className="text-xs text-[#8E8E93] font-mono mt-1">
                    Milestone Delivery Pool
                  </div>
                </div>
              </>
            )}

            {currentRole === 'engineer' && (
              <>
                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Cloud Run Uptime</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">99.99%</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                    <Activity size={13} />
                    <span>Zero Container Cold-Starts</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Average API Latency</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">0 ms</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                    <Zap size={13} />
                    <span>Edge Cache Idle</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Production Build</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">v3.4.0-main</div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] font-mono mt-1">
                    <span>Commit hash: </span>
                    <span className="text-[#E50914] font-bold">#000000</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Open Sentry / Bugs</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">0 Critical / 0 High</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                    <ShieldCheck size={13} />
                    <span>Zero Vulnerabilities Found</span>
                  </div>
                </div>
              </>
            )}

            {currentRole === 'staff' && (
              <>
                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">My Active Tasks</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {staffTasks.filter(t => !t.completed).length} Pending
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#E50914] font-mono mt-1">
                    <Clock size={13} />
                    <span>{staffTasks.filter(t => !t.completed).length > 0 ? `${staffTasks.filter(t => !t.completed).length} Tasks Due` : 'All Tasks Completed'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Hours Logged (This Week)</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">0.0 / 40.0h</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                    <TrendingUp size={13} />
                    <span>0.0% Weekly Target Met</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Live Tracker State</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                    {formatTimer(timerSeconds)}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-mono mt-1 ${isTimerRunning ? 'text-emerald-400 animate-pulse' : 'text-[#8E8E93]'}`}>
                    <Radio size={13} />
                    <span>{isTimerRunning ? 'Active Recording' : 'Paused / Idle'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#151518] border border-[#242429]">
                  <div className="text-[11px] font-mono text-[#8E8E93] uppercase">Approved Deliverables</div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">0 Assets</div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
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
              
              {/* Widget 1: Strategic Project Portfolio (Col 8) */}
              <div className="lg:col-span-8 bg-[#151518] rounded-2xl border border-[#242429] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242429]">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Strategic Portfolio & Corporate Margin Analysis
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                      Cross-segment tracking with net margin yield, budget, and delivery milestones.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40 font-bold self-start sm:self-auto">
                    P&L AUTHORIZED
                  </span>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="py-14 px-4 rounded-xl bg-[#0D0D0F] border border-[#242429] flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#151518] border border-[#242429] flex items-center justify-center text-[#8E8E93] mb-3">
                      <Briefcase size={22} className="text-[#8E8E93]" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">No active client projects in portfolio</h4>
                    <p className="text-xs text-[#8E8E93] max-w-sm mt-1 mb-4 font-sans">
                      Initialize your agency pipeline by creating your first client project or sprint.
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
                      <div key={p.id} className="p-4 rounded-xl bg-[#0D0D0F] border border-[#242429] hover:border-[#8E8E93]/50 transition-all space-y-2.5">
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
                            <p className="text-[11px] text-[#8E8E93] mt-0.5">{p.client} • Lead: {p.teamLead}</p>
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
                          <div className="flex justify-between text-[10px] font-mono text-[#8E8E93]">
                            <span>Milestone: <span className="text-white font-medium">{p.currentMilestone}</span></span>
                            <span className="text-white font-bold">{p.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#151518] overflow-hidden">
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

              {/* Widget 2: Financial Sign-off & Commissions (Col 4) */}
              <div className="lg:col-span-4 bg-[#151518] rounded-2xl border border-[#242429] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242429]">
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={17} className="text-emerald-400" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Financial & Invoice Sign-Off Desk
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                      Requires Managing Partner e-Signature
                    </p>
                  </div>
                </div>

                {approvals.length === 0 ? (
                  <div className="py-10 px-3 rounded-xl bg-[#0D0D0F] border border-[#242429] flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#151518] border border-[#242429] flex items-center justify-center text-[#8E8E93] mb-2.5">
                      <FileCheck2 size={18} className="text-[#8E8E93]" />
                    </div>
                    <div className="text-xs font-semibold text-white">No pending sign-offs</div>
                    <div className="text-[11px] text-[#8E8E93] mt-0.5 max-w-xs">All milestone disbursements and contracts are up to date.</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvals.map((app) => (
                      <div key={app.id} className="p-3 rounded-xl bg-[#0D0D0F] border border-[#242429] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">{app.title}</div>
                            <div className="text-[10px] font-mono text-[#8E8E93] mt-1">{app.client}</div>
                          </div>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                            app.status === 'signed'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                              : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#242429]/60">
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
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <Check size={12} />
                              Approved
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cashflow Runway Indicator */}
                <div className="p-3.5 rounded-xl bg-[#0D0D0F] border border-[#242429] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8E8E93]">Company Runway:</span>
                    <span className="text-emerald-400 font-bold">{totalRevenue > 0 ? '18.4 Months' : 'Active Runway'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8E8E93]">Monthly OpEx Burn:</span>
                    <span className="text-white font-bold">{formatCurrency(totalRevenue > 0 ? 145000000 : 0, currency)}</span>
                  </div>
                  <div className="w-full h-1 bg-[#151518] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: totalRevenue > 0 ? '80%' : '0%' }} />
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
              <div className="lg:col-span-8 bg-[#151518] rounded-2xl border border-[#242429] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242429]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Project Delivery Status & Milestone Tracking
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                      Execution velocity, target deadlines, and deliverables in flight.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40 font-bold">
                    OPS CONTROL
                  </span>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="py-14 px-4 rounded-xl bg-[#0D0D0F] border border-[#242429] flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#151518] border border-[#242429] flex items-center justify-center text-[#8E8E93] mb-3">
                      <Layers size={22} className="text-[#8E8E93]" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">No active sprint milestones</h4>
                    <p className="text-xs text-[#8E8E93] max-w-sm mt-1 mb-4 font-sans">
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
                      <div key={p.id} className="p-4 rounded-xl bg-[#0D0D0F] border border-[#242429] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{p.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151518] text-[#8E8E93] border border-[#242429]">
                                {p.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8E8E93] mt-0.5">Client: {p.client} • Lead: {p.teamLead}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-[#8E8E93]">Target Delivery</span>
                            <div className="text-xs font-mono font-bold text-white">{p.deadline}</div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#151518] border border-[#242429] flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                            <span className="text-[#8E8E93]">Active Milestone:</span>
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
              <div className="lg:col-span-4 bg-[#151518] rounded-2xl border border-[#242429] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242429]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Resource Allocation Matrix
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                      Visual vs Dev Squad Capacity (40h Cap)
                    </p>
                  </div>
                </div>

                {resources.length === 0 ? (
                  <div className="py-10 px-3 rounded-xl bg-[#0D0D0F] border border-[#242429] flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#151518] border border-[#242429] flex items-center justify-center text-[#8E8E93] mb-2.5">
                      <Users size={18} className="text-[#8E8E93]" />
                    </div>
                    <div className="text-xs font-semibold text-white">No team members allocated</div>
                    <div className="text-[11px] text-[#8E8E93] mt-0.5 max-w-xs">Squad hours are currently unassigned across active sprints.</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resources.map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-[#0D0D0F] border border-[#242429] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={r.avatar} alt={r.name} className="w-7 h-7 rounded-full object-cover border border-[#242429]" />
                            <div>
                              <div className="text-xs font-bold text-white">{r.name}</div>
                              <div className="text-[10px] text-[#8E8E93] font-mono">{r.role}</div>
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
                            <span className="text-[#8E8E93]">{r.activeTasks} Active Tasks</span>
                            <span className={r.isOverallocated ? 'text-red-400 font-bold' : 'text-white font-medium'}>
                              {r.allocatedHours}h / {r.maxHours}h
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#151518] overflow-hidden">
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
                  className="w-full h-9 rounded-xl bg-[#0D0D0F] hover:bg-[#242429] text-white border border-[#242429] text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2"
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
              <div className="lg:col-span-8 bg-[#151518] rounded-2xl border border-[#242429] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242429]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Server size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Infrastructure & Cloud Run Container Telemetry
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                      Live microservice health, latency gauges, and hardware utilization.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-bold">
                    ALL OPERATIONAL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INITIAL_TECH_SERVICES.map((srv) => (
                    <div key={srv.name} className="p-4 rounded-xl bg-[#0D0D0F] border border-[#242429] space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs font-bold font-mono text-white">{srv.name}</span>
                          </div>
                          <p className="text-[10px] text-[#8E8E93] font-mono mt-0.5">{srv.type}</p>
                        </div>
                        {srv.port && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#151518] text-[#8E8E93] border border-[#242429]">
                            Port {srv.port}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-[#151518] p-2 rounded-lg border border-[#242429]">
                        <div>
                          <span className="text-[#8E8E93]">Uptime: </span>
                          <span className="text-white font-bold">{srv.uptime}</span>
                        </div>
                        <div>
                          <span className="text-[#8E8E93]">Latency: </span>
                          <span className="text-emerald-400 font-bold">{srv.latency}</span>
                        </div>
                        <div>
                          <span className="text-[#8E8E93]">CPU: </span>
                          <span className="text-white">{srv.cpuUsage}%</span>
                        </div>
                        <div>
                          <span className="text-[#8E8E93]">RAM: </span>
                          <span className="text-white">{srv.ramUsage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Git Backlog Stream */}
                <div className="p-4 rounded-xl bg-[#0D0D0F] border border-[#242429] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8E8E93] flex items-center gap-2">
                      <FolderGit2 size={14} className="text-[#E50914]" />
                      Active Git PRs & Sprint Commits
                    </span>
                    <span className="text-[#E50914] font-bold">Branch: main (Clean)</span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded bg-[#151518] border border-[#242429]">
                      <span className="text-white truncate">PR #142: feat(rbac): unified single dashboard multi-role controller</span>
                      <span className="text-emerald-400 font-bold shrink-0 ml-2">Merged</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-[#151518] border border-[#242429]">
                      <span className="text-white truncate">PR #141: fix(kanban): eliminate horizontal scroll conflict on touch</span>
                      <span className="text-emerald-400 font-bold shrink-0 ml-2">Merged</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-[#151518] border border-[#242429]">
                      <span className="text-white truncate">PR #140: chore(infra): bump Cloud Run memory threshold to 2Gi</span>
                      <span className="text-emerald-400 font-bold shrink-0 ml-2">Merged</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 2: DevOps Command & System Audit Log (Col 4) */}
              <div className="lg:col-span-4 bg-[#151518] rounded-2xl border border-[#242429] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242429]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Terminal size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Quick DevOps Actions & Audit
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                      Terminal triggers & real-time telemetry stream
                    </p>
                  </div>
                </div>

                {/* DevOps Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDevOpsAction('Edge Cache Invalidation')}
                    className="p-2.5 rounded-xl bg-[#0D0D0F] hover:bg-[#1A1A1E] text-white border border-[#242429] text-[11px] font-mono font-semibold transition-all flex flex-col items-center gap-1 text-center"
                  >
                    <Zap size={14} className="text-[#E50914]" />
                    <span>Purge Cache</span>
                  </button>
                  <button
                    onClick={() => handleDevOpsAction('Container Health Ping')}
                    className="p-2.5 rounded-xl bg-[#0D0D0F] hover:bg-[#1A1A1E] text-white border border-[#242429] text-[11px] font-mono font-semibold transition-all flex flex-col items-center gap-1 text-center"
                  >
                    <Activity size={14} className="text-emerald-400" />
                    <span>Ping Mesh</span>
                  </button>
                  <button
                    onClick={() => handleDevOpsAction('Staging Canary Deploy')}
                    className="p-2.5 rounded-xl bg-[#0D0D0F] hover:bg-[#1A1A1E] text-white border border-[#242429] text-[11px] font-mono font-semibold transition-all flex flex-col items-center gap-1 text-center"
                  >
                    <Server size={14} className="text-cyan-400" />
                    <span>Deploy Staging</span>
                  </button>
                  <button
                    onClick={() => handleDevOpsAction('Audit Trail Export')}
                    className="p-2.5 rounded-xl bg-[#0D0D0F] hover:bg-[#1A1A1E] text-white border border-[#242429] text-[11px] font-mono font-semibold transition-all flex flex-col items-center gap-1 text-center"
                  >
                    <Download size={14} className="text-purple-400" />
                    <span>Export Audit</span>
                  </button>
                </div>

                {/* Live Console Stream */}
                <div className="p-3 rounded-xl bg-[#0D0D0F] border border-[#242429] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8E93]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Stream
                    </span>
                    <span>stdout / stderr</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px] text-[#8E8E93] max-h-48 overflow-y-auto custom-scrollbar">
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
              <div className="lg:col-span-8 bg-[#151518] rounded-2xl border border-[#242429] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242429]">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        My Daily Tasks & Sprint Execution
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                      Assigned checklist for Visual Experience and Innovation Development.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40 font-bold">
                    PERSONAL SPRINT
                  </span>
                </div>

                {staffTasks.length === 0 ? (
                  <div className="py-14 px-4 rounded-xl bg-[#0D0D0F] border border-[#242429] flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#151518] border border-[#242429] flex items-center justify-center text-[#8E8E93] mb-3">
                      <CheckCircle2 size={22} className="text-[#8E8E93]" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">No active sprint tasks assigned</h4>
                    <p className="text-xs text-[#8E8E93] max-w-sm mt-1 mb-4 font-sans">
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
                            ? 'bg-[#0D0D0F]/40 border-[#242429]/50 opacity-60'
                            : 'bg-[#0D0D0F] border-[#242429] hover:border-[#8E8E93]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
                            t.completed
                              ? 'bg-emerald-500 border-emerald-500 text-black'
                              : 'border-[#242429] bg-[#151518]'
                          }`}>
                            {t.completed && <Check size={13} strokeWidth={3} />}
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${t.completed ? 'line-through text-[#8E8E93]' : 'text-white'}`}>
                              {t.title}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-[#8E8E93] mt-0.5">
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
                          <span className="text-[10px] font-mono text-[#8E8E93]">
                            {t.estimatedHours}h est.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Creative Asset Quick Repositories */}
                <div className="p-4 rounded-xl bg-[#0D0D0F] border border-[#242429] space-y-3">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <FolderGit2 size={14} className="text-[#E50914]" />
                    Creative Asset & Code Repository Quick Links
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <a
                      href="https://figma.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-[#151518] hover:bg-[#1A1A1E] border border-[#242429] text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Palette size={14} className="text-purple-400" />
                        <span>Figma Design System</span>
                      </div>
                      <ExternalLink size={12} className="text-[#8E8E93]" />
                    </a>

                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-[#151518] hover:bg-[#1A1A1E] border border-[#242429] text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Code2 size={14} className="text-cyan-400" />
                        <span>GitHub Repositories</span>
                      </div>
                      <ExternalLink size={12} className="text-[#8E8E93]" />
                    </a>

                    <a
                      href="https://staging.kapitech.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-[#151518] hover:bg-[#1A1A1E] border border-[#242429] text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-emerald-400" />
                        <span>Client Staging Builds</span>
                      </div>
                      <ExternalLink size={12} className="text-[#8E8E93]" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Widget 2: Interactive Live Time Tracker (Col 4) */}
              <div className="lg:col-span-4 bg-[#151518] rounded-2xl border border-[#242429] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242429]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Timer size={17} className="text-[#E50914]" />
                      <h3 className="text-sm font-bold text-white tracking-tight font-display">
                        Interactive Time Tracker
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                      Log billable project sprint hours in real-time.
                    </p>
                  </div>
                </div>

                {/* Main Timer Display */}
                <div className="p-5 rounded-2xl bg-[#0D0D0F] border border-[#242429] text-center space-y-3 relative overflow-hidden">
                  {isTimerRunning && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#E50914] animate-pulse" />
                  )}

                  <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white">
                    {formatTimer(timerSeconds)}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#8E8E93]">
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
                      className="h-9 px-3 rounded-xl bg-[#151518] hover:bg-[#1A1A1E] text-[#8E8E93] hover:text-white border border-[#242429] text-xs font-mono font-medium transition-all"
                    >
                      Log & Reset
                    </button>
                  </div>
                </div>

                {/* Task selection & Billable toggle */}
                <div className="space-y-3 text-xs font-mono">
                  <div className="space-y-1">
                    <label className="text-[#8E8E93]">Assign to Task:</label>
                    <select
                      value={selectedTaskForTimer}
                      onChange={(e) => setSelectedTaskForTimer(e.target.value)}
                      className="w-full h-8 px-2 bg-[#0D0D0F] border border-[#242429] rounded-lg text-white text-xs focus:outline-none focus:border-[#E50914]"
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

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D0D0F] border border-[#242429]">
                    <span className="text-[#8E8E93]">Billable to Client:</span>
                    <button
                      onClick={() => setIsBillable(!isBillable)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        isBillable
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : 'bg-[#151518] text-[#8E8E93] border-[#242429]'
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
            <div className="w-full max-w-md rounded-2xl bg-[#151518] border border-[#242429] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#242429]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E50914]/15 border border-[#E50914]/40 flex items-center justify-center text-[#E50914]">
                    <Plus size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Create Agency Project</h3>
                </div>
                <button
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-[#0D0D0F] hover:bg-[#242429] text-[#8E8E93] hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddProjectSubmit} className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[#8E8E93] block">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Aura 3D Spatial Walkthrough"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full h-9 px-3 bg-[#0D0D0F] border border-[#242429] rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8E8E93] block">Client / Account Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., PT Bank Mandiri (Persero) Tbk"
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full h-9 px-3 bg-[#0D0D0F] border border-[#242429] rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8E8E93] block">Agency Operating Segment *</label>
                  <select
                    value={newProjectSegment}
                    onChange={(e) => setNewProjectSegment(e.target.value as 'visual_experience' | 'innovation_dev')}
                    className="w-full h-9 px-3 bg-[#0D0D0F] border border-[#242429] rounded-xl text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="visual_experience">Segment 1: Visual Experience (3D, Motion, Branding)</option>
                    <option value="innovation_dev">Segment 2: Innovation Development (Web, Cloud, ERP)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8E8E93] block">Contract Budget ({currency})</label>
                  <input
                    type="text"
                    placeholder="e.g., 250000000"
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(e.target.value)}
                    className="w-full h-9 px-3 bg-[#0D0D0F] border border-[#242429] rounded-xl text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddProjectModalOpen(false)}
                    className="h-8 px-3.5 rounded-xl bg-[#0D0D0F] hover:bg-[#242429] text-[#8E8E93] hover:text-white transition-colors"
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

      </main>

    </div>
  );
};
