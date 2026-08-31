import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Activity, 
  Calendar, 
  ChevronRight, 
  ChevronDown,
  Layers, 
  Users, 
  Check, 
  X, 
  Sparkles,
  ShieldCheck,
  Trash2,
  SearchCode,
  PenTool,
  FileCode2,
  ArrowRight
} from 'lucide-react';
import { getAdminSession, getAuditLogs, SecurityAuditLog } from '../../lib/adminAuth';
import { subscribeToInbox, ContactSubmission, submitToInbox } from '../../lib/submissions';
import { 
  getServiceRequests, 
  updateServiceRequestStatus, 
  deleteServiceRequest, 
  addServiceRequest,
  ServiceRequest, 
  ServiceCategory, 
  ServiceStatus, 
  ServicePriority,
  weeklyVolumeDataset,
  SERVICE_REQUEST_EVENT
} from '../../lib/serviceRequestStore';
import { getActiveProjects, AgencyProject, PROJECT_EVENT_NAME } from '../../lib/projectStore';
import { getCmsLeads, CrmLead, CRM_EVENT_NAME } from '../../lib/crmStore';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, CurrencyCode, CURRENCY_EVENT } from '../../lib/currency';

export const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const session = getAdminSession();

  // Core Data States
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [activeProjects, setActiveProjects] = useState<AgencyProject[]>([]);
  const [inboxSubmissions, setInboxSubmissions] = useState<ContactSubmission[]>([]);
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());

  // Interactive UI Filters & Modals
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('all');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [chartHoveredDay, setChartHoveredDay] = useState<string | null>(null);

  // Right Activity Feed Controls
  const [activityTab, setActivityTab] = useState<'today' | 'yesterday' | 'week'>('today');
  const [activitySearch, setActivitySearch] = useState<string>('');

  // Modals
  const [activeModalRequest, setActiveModalRequest] = useState<ServiceRequest | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // New Request Form State
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newServiceType, setNewServiceType] = useState<ServiceCategory>('Web Dev');
  const [newPriority, setNewPriority] = useState<ServicePriority>('high');
  const [newHours, setNewHours] = useState('20');
  const [newDesc, setNewDesc] = useState('');

  // Load initial data and subscribe to live store events
  useEffect(() => {
    // 1. Service Requests
    const loadRequests = () => setServiceRequests(getServiceRequests());
    loadRequests();
    window.addEventListener(SERVICE_REQUEST_EVENT, loadRequests);

    // 2. Active Projects
    const loadProjects = () => setActiveProjects(getActiveProjects());
    loadProjects();
    window.addEventListener(PROJECT_EVENT_NAME, loadProjects);

    // 3. CRM Leads
    const loadCrm = () => setCrmLeads(getCmsLeads());
    loadCrm();
    window.addEventListener(CRM_EVENT_NAME, loadCrm);

    // 4. Submissions Inbox
    const unsubInbox = subscribeToInbox((items) => {
      setInboxSubmissions(items);
    });

    // 5. Audit Logs
    setAuditLogs(getAuditLogs());

    // 6. Currency
    const handleCurr = (e: Event) => {
      const custom = e as CustomEvent<{ currency: CurrencyCode }>;
      if (custom.detail?.currency) {
        setCurrency(custom.detail.currency);
      }
    };
    window.addEventListener(CURRENCY_EVENT, handleCurr);

    return () => {
      window.removeEventListener(SERVICE_REQUEST_EVENT, loadRequests);
      window.removeEventListener(PROJECT_EVENT_NAME, loadProjects);
      window.removeEventListener(CRM_EVENT_NAME, loadCrm);
      window.removeEventListener(CURRENCY_EVENT, handleCurr);
      unsubInbox();
    };
  }, []);

  // Filtered Service Requests
  const filteredRequests = useMemo(() => {
    return serviceRequests.filter(req => {
      const matchesStatus = tableStatusFilter === 'all' || req.status === tableStatusFilter;
      const matchesSearch = 
        req.requestId.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        req.title.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        req.clientName.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        req.serviceType.toLowerCase().includes(tableSearchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [serviceRequests, tableStatusFilter, tableSearchQuery]);

  // Handle Bulk Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRequestIds(filteredRequests.map(r => r.id));
    } else {
      setSelectedRequestIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedRequestIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Quick Status Update
  const handleStatusChange = (id: string, newStatus: ServiceStatus) => {
    updateServiceRequestStatus(id, newStatus);
    setStatusNotification(language === 'id' ? `Status diperbarui menjadi ${newStatus}` : `Status updated to ${newStatus}`);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Create New Request
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClient) return;

    addServiceRequest({
      title: newTitle,
      clientName: newClient,
      clientCompany: newCompany || newClient,
      serviceType: newServiceType,
      priority: newPriority,
      assignedMember: {
        name: 'Pratama Wijaya',
        role: 'Senior Tech Lead',
        initials: 'PW',
        colorBg: 'bg-red-600'
      },
      status: 'in_progress',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estimatedHours: parseInt(newHours) || 20,
      completedHours: 0,
      description: newDesc || 'Standard agency service execution agreement and SLA.',
      slaDaysRemaining: 7
    });

    setIsNewRequestModalOpen(false);
    setNewTitle('');
    setNewClient('');
    setNewCompany('');
    setNewDesc('');
    setStatusNotification(language === 'id' ? 'Service Request baru berhasil dibuat.' : 'New Service Request created successfully.');
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Simulate Inbound Lead
  const handleSimulateLead = async () => {
    setTestSending(true);
    try {
      const sampleNames = ['Marcus Thorne', 'Aura Luxury Estates', 'Nexus Supply Logistics', 'Vanguard Studio'];
      const sampleServices = [['UI/UX Design', 'MVP Development'], ['Enterprise Technical SEO'], ['Next.js Web Platform'], ['Cloud Migration']];
      const rand = Math.floor(Math.random() * sampleNames.length);

      await submitToInbox({
        fullName: sampleNames[rand],
        email: `${sampleNames[rand].toLowerCase().replace(/\s+/g, '.')}@client.com`,
        company: sampleNames[rand] + ' Corp',
        phone: '+62 812-9876-' + Math.floor(1000 + Math.random() * 9000),
        services: sampleServices[rand],
        budget: '$10,000 - $25,000',
        message: language === 'id' 
          ? 'Halo Kapitech, kami membutuhkan delivery cepat untuk pipeline digital Q3 kami.' 
          : 'Hello Kapitech, we require rapid delivery for our Q3 digital product pipeline.',
        source: 'Admin Live Simulation',
        type: 'inquiry'
      });

      setStatusNotification(language === 'id' ? 'Lead baru berhasil disimulasikan & masuk ke feed.' : 'Live lead simulated & added to activity feed.');
      setTimeout(() => setStatusNotification(null), 3500);
    } finally {
      setTestSending(false);
    }
  };

  // Activity Feed Events matching Image 2
  const activityEvents = useMemo(() => {
    const events = [
      {
        id: 'act_1',
        title: 'SEO Report Sent to Client A',
        desc: 'Ticket #2217 3LA Client A',
        time: '12:30 AM',
        category: 'seo',
        timeframe: 'today',
        icon: SearchCode,
        badgeBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
      },
      {
        id: 'act_2',
        title: 'New Content Request from Client B',
        desc: 'New Content Request from Client B',
        time: '10 AM',
        category: 'content',
        timeframe: 'today',
        icon: PenTool,
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
      },
      {
        id: 'act_3',
        title: 'Website Bug Fixed for Client C',
        desc: 'Ticket #2322 Login Issue',
        time: '10:40 AM',
        category: 'dev',
        timeframe: 'today',
        icon: FileCode2,
        badgeBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
      },
      {
        id: 'act_4',
        title: 'Monthly Analytics Review',
        desc: 'New article reviewed: Troubleshooting',
        time: '10:30 AM',
        category: 'analytics',
        timeframe: 'today',
        icon: Activity,
        badgeBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
      },
      {
        id: 'act_5',
        title: 'Customer feedback',
        desc: 'Great support supports, Thanks Sarah!',
        time: '10:30 AM',
        category: 'feedback',
        timeframe: 'today',
        icon: Users,
        badgeBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
      },
      {
        id: 'act_6',
        title: 'Sprint #14 Scope Deployed',
        desc: 'Updated client directory & audit logger',
        time: 'Yesterday 17:30',
        category: 'system',
        timeframe: 'yesterday',
        icon: Layers,
        badgeBg: 'bg-red-500/15 text-red-400 border border-red-500/30'
      },
      {
        id: 'act_7',
        title: 'Cloud Run Edge Cache Sync Verified',
        desc: 'Zero latency response verified at 24ms',
        time: 'Yesterday 14:15',
        category: 'system',
        timeframe: 'yesterday',
        icon: ShieldCheck,
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
      },
      {
        id: 'act_8',
        title: 'Service Agreement Renewed',
        desc: 'Enterprise SLA extended for Q4 2026',
        time: '3 days ago',
        category: 'contract',
        timeframe: 'week',
        icon: CheckCircle2,
        badgeBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
      }
    ];

    return events.filter(e => {
      const matchTime = activityTab === 'week' ? true : e.timeframe === activityTab;
      const matchSearch = e.title.toLowerCase().includes(activitySearch.toLowerCase()) || 
                          e.desc.toLowerCase().includes(activitySearch.toLowerCase());
      return matchTime && matchSearch;
    });
  }, [activityTab, activitySearch]);

  return (
    <div className="space-y-6">
      
      {/* ----------------------------------------------------------------- */}
      {/* 1. TOP HEADER & GREETING (MATCHING IMAGE 2) */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight flex items-center gap-2">
            <span>Hello, {session?.user.username ? (session.user.username.charAt(0).toUpperCase() + session.user.username.slice(1)) : 'Alex Chen'}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Here are the latest insights from your customer interactions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="relative">
            <button
              onClick={() => {}}
              className="px-3.5 py-2 rounded-xl bg-[#111827] hover:bg-[#161F30] border border-[#1E293B] text-xs text-[#94A3B8] hover:text-white flex items-center gap-2 transition-colors shadow-sm"
            >
              <Calendar size={13} className="text-red-400" />
              <span>Last week</span>
              <ChevronDown size={12} className="text-[#64748B]" />
            </button>
          </div>

          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-sans font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/25 min-h-[38px]"
          >
            <Plus size={14} />
            <span>Add Request</span>
          </button>

          <button
            onClick={handleSimulateLead}
            disabled={testSending}
            title="Simulate Inbound Activity"
            className="p-2.5 rounded-xl bg-[#111827] hover:bg-[#161F30] text-[#94A3B8] hover:text-white border border-[#1E293B] text-xs transition-all flex items-center justify-center min-h-[38px]"
          >
            <Sparkles size={14} className={testSending ? 'animate-spin text-red-400' : 'text-red-400'} />
          </button>
        </div>
      </div>

      {statusNotification && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-sans flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-red-400" />
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-[#94A3B8] hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. TOP METRIC CARDS (3-GRID SPANNING FULL WIDTH - MATCHING IMAGE 2) */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Active Client Projects */}
        <div className="bg-[#111827] border border-[#1E293B] p-5 rounded-2xl flex flex-col justify-between group hover:border-red-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-sans font-semibold text-[#94A3B8]">Active Client Projects</span>
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check size={12} />
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-3xl font-sans font-bold text-white tracking-tight">
                1,250
              </div>
              <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <span className="font-semibold">+15%</span>
                <span className="text-[#64748B]">vs last week</span>
              </div>
            </div>

            {/* Smooth SVG Sparkline */}
            <div className="w-28 h-9">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                <path
                  d="M 0,24 Q 25,28 45,18 T 75,12 T 100,5"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Daily Task Resolution */}
        <div className="bg-[#111827] border border-[#1E293B] p-5 rounded-2xl flex flex-col justify-between group hover:border-red-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-sans font-semibold text-[#94A3B8]">Daily Task Resolution</span>
            <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Activity size={12} />
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-3xl font-sans font-bold text-white tracking-tight">
                320
              </div>
              <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <span className="font-semibold">+5%</span>
                <span className="text-[#64748B]">vs last week</span>
              </div>
            </div>

            {/* Smooth SVG Sparkline */}
            <div className="w-28 h-9">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                <path
                  d="M 0,22 Q 20,26 40,15 T 70,16 T 100,6"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Client Satisfaction Score */}
        <div className="bg-[#111827] border border-[#1E293B] p-5 rounded-2xl flex flex-col justify-between group hover:border-red-500/40 transition-all shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-sans font-semibold text-[#94A3B8]">Client Satisfaction Score</span>
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={12} />
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-1">
            <div>
              <div className="text-3xl font-sans font-bold text-white tracking-tight">
                4.8<span className="text-lg font-normal text-[#64748B]">/5</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                <span className="font-semibold">+2%</span>
                <span className="text-[#64748B]">vs last week</span>
              </div>
            </div>

            {/* Smooth SVG Sparkline */}
            <div className="w-28 h-9">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                <path
                  d="M 0,20 Q 30,22 55,14 T 80,10 T 100,5"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. MIDDLE SECTION: 2 COLUMNS (CHART ON LEFT, LATEST UPDATES ON RIGHT) */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Left Column: Weekly Service Request Volume (8 Cols) */}
        <div className="xl:col-span-8 bg-[#111827] border border-[#1E293B] p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-red-400" />
                <h2 className="text-sm sm:text-base font-sans font-bold text-white">
                  Weekly Service Request Volume
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-xl bg-[#080C14] border border-[#1E293B] text-xs text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors">
                  <span>Last week</span>
                  <ChevronDown size={11} className="text-[#64748B]" />
                </button>
                <button className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#080C14] transition-colors">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>

            {/* Big Stat + Trend Badge */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
                4,790
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
                +8% vs last week
              </span>
            </div>
          </div>

          {/* Grouped Bar Chart Area (Matching Image 2 with 4 pillars: SEO, Content, Development, Design) */}
          <div className="mt-6 pt-2">
            <div className="relative h-60 w-full flex">
              
              {/* Y-Axis scale ticks */}
              <div className="flex flex-col justify-between text-[11px] font-mono text-[#64748B] pr-3 h-48 select-none">
                <span>800</span>
                <span>600</span>
                <span>400</span>
                <span>200</span>
                <span>0</span>
              </div>

              {/* Chart Grid Lines & Bars Container */}
              <div className="flex-1 relative flex flex-col justify-between h-48 border-b border-[#1E293B]">
                
                {/* Horizontal Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-dashed border-[#1E293B] w-full" />
                  <div className="border-b border-dashed border-[#1E293B] w-full" />
                  <div className="border-b border-dashed border-[#1E293B] w-full" />
                  <div className="border-b border-dashed border-[#1E293B] w-full" />
                  <div className="w-full" />
                </div>

                {/* Benchmark Target Line at 800 */}
                <div className="absolute top-0 left-0 right-0 border-b border-dashed border-red-500/30 z-0 pointer-events-none" />

                {/* 4 Grouped Pillars on X-Axis */}
                <div className="relative z-10 h-full flex items-end justify-around px-2 sm:px-6">
                  
                  {/* Pillar 1: SEO */}
                  <div 
                    className="flex items-end gap-1 sm:gap-1.5 h-full relative group cursor-pointer"
                    onMouseEnter={() => setChartHoveredDay('SEO')}
                    onMouseLeave={() => setChartHoveredDay(null)}
                  >
                    <div className="w-3.5 sm:w-5 bg-red-600/70 group-hover:bg-red-500 rounded-t-sm transition-all" style={{ height: '48%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-600 group-hover:bg-red-400 rounded-t-sm transition-all" style={{ height: '62%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-800/60 group-hover:bg-red-700 rounded-t-sm transition-all" style={{ height: '30%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-600/80 group-hover:bg-red-500 rounded-t-sm transition-all" style={{ height: '54%' }} />

                    {chartHoveredDay === 'SEO' && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#080C14] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-red-400 font-bold">SEO Total:</span> 580 reqs
                      </div>
                    )}
                  </div>

                  {/* Pillar 2: Content (with highlighted Tue: 450 card) */}
                  <div 
                    className="flex items-end gap-1 sm:gap-1.5 h-full relative group cursor-pointer"
                    onMouseEnter={() => setChartHoveredDay('Content')}
                    onMouseLeave={() => setChartHoveredDay(null)}
                  >
                    {/* Tooltip on active bar matching Image 2 */}
                    <div className="absolute -top-7 left-1/4 -translate-x-1/2 bg-black border border-white/20 px-2 py-0.5 rounded text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-20">
                      Tue: 450
                    </div>

                    <div className="w-3.5 sm:w-5 bg-red-950 group-hover:bg-red-900 rounded-t-sm transition-all" style={{ height: '88%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-600/70 group-hover:bg-red-500 rounded-t-sm transition-all" style={{ height: '42%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-600 group-hover:bg-red-400 rounded-t-sm transition-all" style={{ height: '68%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-600/60 group-hover:bg-red-500 rounded-t-sm transition-all" style={{ height: '50%' }} />

                    {chartHoveredDay === 'Content' && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#080C14] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-red-400 font-bold">Content:</span> 1,240 reqs
                      </div>
                    )}
                  </div>

                  {/* Pillar 3: Development */}
                  <div 
                    className="flex items-end gap-1 sm:gap-1.5 h-full relative group cursor-pointer"
                    onMouseEnter={() => setChartHoveredDay('Development')}
                    onMouseLeave={() => setChartHoveredDay(null)}
                  >
                    <div className="w-3.5 sm:w-5 bg-red-600/80 group-hover:bg-red-500 rounded-t-sm transition-all" style={{ height: '58%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-600 group-hover:bg-red-400 rounded-t-sm transition-all" style={{ height: '78%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-600/70 group-hover:bg-red-500 rounded-t-sm transition-all" style={{ height: '56%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-800/60 group-hover:bg-red-700 rounded-t-sm transition-all" style={{ height: '36%' }} />

                    {chartHoveredDay === 'Development' && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#080C14] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-red-400 font-bold">Dev Total:</span> 1,890 reqs
                      </div>
                    )}
                  </div>

                  {/* Pillar 4: Design */}
                  <div 
                    className="flex items-end gap-1 sm:gap-1.5 h-full relative group cursor-pointer"
                    onMouseEnter={() => setChartHoveredDay('Design')}
                    onMouseLeave={() => setChartHoveredDay(null)}
                  >
                    <div className="w-3.5 sm:w-5 bg-red-600 group-hover:bg-red-400 rounded-t-sm transition-all" style={{ height: '66%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-600/70 group-hover:bg-red-500 rounded-t-sm transition-all" style={{ height: '44%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-600/90 group-hover:bg-red-500 rounded-t-sm transition-all" style={{ height: '52%' }} />
                    <div className="w-3.5 sm:w-5 bg-red-800/50 group-hover:bg-red-700 rounded-t-sm transition-all" style={{ height: '28%' }} />

                    {chartHoveredDay === 'Design' && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#080C14] border border-[#1E293B] px-2.5 py-1 rounded-lg text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-red-400 font-bold">Design Total:</span> 1,080 reqs
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* X-Axis Labels (SEO, Content, Development, Design) */}
            <div className="flex justify-around pl-8 pt-3 text-xs font-sans font-medium text-[#94A3B8]">
              <span>SEO</span>
              <span>Content</span>
              <span>Development</span>
              <span>Design</span>
            </div>
          </div>

        </div>

        {/* Right Column: Latest Updates Feed (4 Cols - MATCHING IMAGE 2) */}
        <div className="xl:col-span-4 bg-[#111827] border border-[#1E293B] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h2 className="text-sm sm:text-base font-sans font-bold text-white">
                Latest Updates
              </h2>
              <button className="p-1 text-[#64748B] hover:text-white transition-colors">
                <MoreVertical size={14} />
              </button>
            </div>

            {/* Timeframe Tab Buttons (Today, Yesterday, This week) */}
            <div className="grid grid-cols-3 gap-1 bg-[#080C14] border border-[#1E293B] rounded-xl p-1 mt-3 text-xs font-sans">
              <button
                onClick={() => setActivityTab('today')}
                className={`py-1 rounded-lg text-center transition-all ${
                  activityTab === 'today' ? 'bg-red-600 text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setActivityTab('yesterday')}
                className={`py-1 rounded-lg text-center transition-all ${
                  activityTab === 'yesterday' ? 'bg-red-600 text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => setActivityTab('week')}
                className={`py-1 rounded-lg text-center transition-all ${
                  activityTab === 'week' ? 'bg-red-600 text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                This week
              </button>
            </div>

            {/* Search Activities Input */}
            <div className="relative mt-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search activities"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#080C14] border border-[#1E293B] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Subheading Activity Count */}
            <div className="text-xs font-sans font-semibold text-white mt-4 mb-2">
              8 new activities today
            </div>

            {/* Activity List Items (Exact Content from Image 2) */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              
              {/* Item 1: SEO Report */}
              <div className="flex items-start justify-between gap-2.5 group">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    @
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                      SEO Report Sent to Client A
                    </div>
                    <div className="text-[10px] text-[#64748B] truncate">
                      Ticket #2217 3LA Client A
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] shrink-0">12:30 AM</span>
              </div>

              {/* Item 2: Content Request */}
              <div className="flex items-start justify-between gap-2.5 group">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <PenTool size={11} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                      New Content Request from Client B
                    </div>
                    <div className="text-[10px] text-[#64748B] truncate">
                      New Content Request from Client B
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] shrink-0">10 AM</span>
              </div>

              {/* Item 3: Bug Fixed */}
              <div className="flex items-start justify-between gap-2.5 group">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <FileCode2 size={11} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                      Website Bug Fixed for Client C
                    </div>
                    <div className="text-[10px] text-[#64748B] truncate">
                      Ticket #2322 Login Issue
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] shrink-0">10:40 AM</span>
              </div>

              {/* Item 4: Monthly Analytics */}
              <div className="flex items-start justify-between gap-2.5 group">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Activity size={11} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                      Monthly Analytics Review
                    </div>
                    <div className="text-[10px] text-[#64748B] truncate">
                      New article reviewed: Troubleshooting
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] shrink-0">10:30 AM</span>
              </div>

              {/* Item 5: Customer Feedback */}
              <div className="flex items-start justify-between gap-2.5 group">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Users size={11} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                      Customer feedback
                    </div>
                    <div className="text-[10px] text-[#64748B] truncate">
                      Great support supports, Thanks Sarah!
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#64748B] shrink-0">10:30 AM</span>
              </div>

            </div>

          </div>

          <div className="pt-3 border-t border-[#1E293B] mt-4 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <span>System SLA: 99.98%</span>
            <span className="text-red-400 hover:underline cursor-pointer">View audit logs</span>
          </div>
        </div>

      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. BOTTOM SECTION: SERVICE REQUEST MONITORING TABLE (FULL WIDTH) */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
        
        {/* Table Controls Header */}
        <div className="p-5 border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-red-400" />
            <h2 className="text-base font-sans font-bold text-white">
              Service Request Monitoring
            </h2>
          </div>

          {/* Search Ticket + Filter Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder="Ticket"
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#080C14] border border-[#1E293B] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-red-500 w-36 sm:w-44 transition-colors"
              />
            </div>

            {/* Status Filter Dropdown / Pills */}
            <div className="flex items-center bg-[#080C14] border border-[#1E293B] rounded-xl p-1 text-xs font-sans">
              <button
                onClick={() => setTableStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  tableStatusFilter === 'all' ? 'bg-red-600 text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTableStatusFilter('in_progress')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  tableStatusFilter === 'in_progress' ? 'bg-red-600 text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setTableStatusFilter('review')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  tableStatusFilter === 'review' ? 'bg-red-600 text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Review
              </button>
              <button
                onClick={() => setTableStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  tableStatusFilter === 'completed' ? 'bg-red-600 text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Completed
              </button>
            </div>

            <button className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#080C14] transition-colors">
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#080C14]/60 text-[#64748B] font-mono text-[11px] uppercase">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRequestIds.length > 0 && selectedRequestIds.length === filteredRequests.length}
                    className="rounded bg-[#080C14] border-[#1E293B] text-red-600 focus:ring-0 focus:ring-offset-0"
                  />
                </th>
                <th className="p-4">Request ID ⇅</th>
                <th className="p-4">Service Type ⇅</th>
                <th className="p-4">Priority ⇅</th>
                <th className="p-4">Assigned To ⇅</th>
                <th className="p-4">Status ⇅</th>
                <th className="p-4">Created Date ⇅</th>
                <th className="p-4">Due Date ⇅</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-xs font-mono text-[#94A3B8]">
                    No service requests found matching the active filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedRequestIds.includes(req.id);
                  return (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-[#161F30] transition-colors group cursor-pointer ${
                        isSelected ? 'bg-red-950/20' : ''
                      }`}
                      onClick={() => setActiveModalRequest(req)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(req.id)}
                          className="rounded bg-[#080C14] border-[#1E293B] text-red-600 focus:ring-0 focus:ring-offset-0"
                        />
                      </td>
                      <td className="p-4 font-mono font-semibold text-red-400">
                        {req.requestId}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                          {req.title}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                          {req.clientCompany} • {req.serviceType}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          req.priority === 'urgent' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                          req.priority === 'high' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                          req.priority === 'medium' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                          'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {req.assignedMember.initials || 'A'}
                          </div>
                          <span className="text-[#F8FAFC] font-medium truncate">{req.assignedMember.name}</span>
                        </div>
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value as ServiceStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border bg-[#080C14] focus:outline-none transition-colors cursor-pointer ${
                            req.status === 'completed' ? 'text-emerald-400 border-emerald-500/30' :
                            req.status === 'review' ? 'text-purple-400 border-purple-500/30' :
                            req.status === 'in_progress' ? 'text-red-400 border-red-500/30' :
                            'text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[#94A3B8]">
                        2025-08-19
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[#94A3B8]">
                        {req.dueDate}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveModalRequest(req)}
                          className="p-1.5 text-[#64748B] hover:text-white hover:bg-[#1E293B] rounded-lg transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-[#1E293B] bg-[#080C14]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#64748B]">
          <div>
            Showing {filteredRequests.length} of {serviceRequests.length} total entries
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/projects" className="text-red-400 hover:underline flex items-center gap-1">
              <span>Open Project Execution Board</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 5. SERVICE REQUEST DETAIL MODAL */}
      {/* ----------------------------------------------------------------- */}
      {activeModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModalRequest(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 font-mono text-red-400 text-xs font-semibold mb-2">
              <span>{activeModalRequest.requestId}</span>
              <span>•</span>
              <span className="text-[#94A3B8]">{activeModalRequest.serviceType}</span>
            </div>

            <h3 className="text-lg font-sans font-bold text-white mb-1">
              {activeModalRequest.title}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Client: {activeModalRequest.clientCompany} ({activeModalRequest.clientName})
            </p>

            <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3 mb-5 text-xs">
              <p className="text-[#F8FAFC] leading-relaxed">
                {activeModalRequest.description}
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1E293B] text-[11px] font-mono">
                <div>
                  <span className="text-[#64748B] block">Assigned Specialist:</span>
                  <span className="text-white font-semibold">{activeModalRequest.assignedMember.name}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Due Date:</span>
                  <span className="text-white font-semibold">{activeModalRequest.dueDate}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Estimated Work:</span>
                  <span className="text-red-400 font-semibold">{activeModalRequest.estimatedHours} Hours</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">SLA Remaining:</span>
                  <span className="text-emerald-400 font-semibold">{activeModalRequest.slaDaysRemaining} Days</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  deleteServiceRequest(activeModalRequest.id);
                  setActiveModalRequest(null);
                  setStatusNotification('Service request deleted.');
                }}
                className="px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 text-xs font-mono flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalRequest(null)}
                  className="px-4 py-2 rounded-xl bg-[#161F30] hover:bg-[#1E293B] text-white text-xs font-sans"
                >
                  Close
                </button>
                <Link
                  to="/admin/projects"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-sans font-semibold flex items-center gap-1 shadow-md shadow-red-600/20"
                >
                  <span>Execute in Projects</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 6. + NEW SERVICE REQUEST MODAL */}
      {/* ----------------------------------------------------------------- */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1E293B] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsNewRequestModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-sans font-bold text-white mb-1">
              Create New Service Request
            </h3>
            <p className="text-xs text-[#94A3B8] mb-5">
              Add a client service delivery request into the agency queue.
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Request Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Next.js Headless Web Platform Migration"
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Client Contact *</label>
                  <input
                    type="text"
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="e.g. Marcus Thorne"
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Company Name</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Lumina Real Estate"
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Service Type</label>
                  <select
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Web Dev">Web Dev</option>
                    <option value="SEO">SEO</option>
                    <option value="Content">Content</option>
                    <option value="Design">Design</option>
                    <option value="Cloud">Cloud</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ServicePriority)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">Est. Hours</label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">Description / SLA Deliverables</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide scope overview, SLA timeline, and key requirements..."
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#161F30] hover:bg-[#1E293B] text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/25"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
