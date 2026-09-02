import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ArrowRight,
  Download,
  Filter,
  BarChart3,
  Receipt,
  Clock,
  AlertTriangle,
  FileSpreadsheet
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
  SERVICE_REQUEST_EVENT
} from '../../lib/serviceRequestStore';
import { getActiveProjects, AgencyProject, PROJECT_EVENT_NAME } from '../../lib/projectStore';
import { getCmsLeads, CrmLead, CRM_EVENT_NAME } from '../../lib/crmStore';
import { useLanguage } from '../../lib/LanguageContext';
import { getActiveCurrency, CurrencyCode, CURRENCY_EVENT, formatCurrency } from '../../lib/currency';
import { DropdownMenu, DropdownMenuItem } from '../../components/ui/DropdownMenu';
import { CustomSelect, SelectOption } from '../../components/ui/CustomSelect';
import { DataMigrationModal } from '../../components/admin/DataMigrationModal';

export const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const session = getAdminSession();

  // Core Data States
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [activeProjects, setActiveProjects] = useState<AgencyProject[]>([]);
  const [inboxSubmissions, setInboxSubmissions] = useState<ContactSubmission[]>([]);
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());

  // Interactive UI Filters & Controls
  const [timeRange, setTimeRange] = useState<'lastWeek' | 'thisMonth' | 'last30Days' | 'thisYear'>('lastWeek');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('all');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [slaOnlyFilter, setSlaOnlyFilter] = useState<boolean>(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [chartHoveredPillar, setChartHoveredPillar] = useState<string | null>(null);

  // Right Activity Feed Controls
  const [activityTab, setActivityTab] = useState<'today' | 'yesterday' | 'week'>('today');
  const [activitySearch, setActivitySearch] = useState<string>('');

  // Modals & Notifications
  const [activeModalRequest, setActiveModalRequest] = useState<ServiceRequest | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
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
        req.clientCompany.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
        req.serviceType.toLowerCase().includes(tableSearchQuery.toLowerCase());
      const matchesSla = !slaOnlyFilter || (req.slaDaysRemaining !== undefined && req.slaDaysRemaining <= 2);
      return matchesStatus && matchesSearch && matchesSla;
    });
  }, [serviceRequests, tableStatusFilter, tableSearchQuery, slaOnlyFilter]);

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
    const statusLabel = language === 'id' 
      ? (newStatus === 'completed' ? 'Selesai' : newStatus === 'in_progress' ? 'Sedang Dikerjakan' : newStatus === 'review' ? 'Review' : 'Tertunda')
      : (newStatus === 'completed' ? 'Completed' : newStatus === 'in_progress' ? 'In Progress' : newStatus === 'review' ? 'Review' : 'Pending');
    setStatusNotification(language === 'id' ? `Status tiket diperbarui menjadi: ${statusLabel}` : `Ticket status updated to: ${statusLabel}`);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Bulk Actions
  const handleBulkStatus = (newStatus: ServiceStatus) => {
    selectedRequestIds.forEach(id => updateServiceRequestStatus(id, newStatus));
    setSelectedRequestIds([]);
    setStatusNotification(language === 'id' ? `${selectedRequestIds.length} tiket berhasil diperbarui.` : `${selectedRequestIds.length} tickets updated successfully.`);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  const handleBulkDelete = () => {
    if (window.confirm(language === 'id' ? `Hapus ${selectedRequestIds.length} tiket terpilih?` : `Delete ${selectedRequestIds.length} selected tickets?`)) {
      selectedRequestIds.forEach(id => deleteServiceRequest(id));
      setSelectedRequestIds([]);
      setStatusNotification(language === 'id' ? 'Tiket terpilih berhasil dihapus.' : 'Selected tickets deleted.');
      setTimeout(() => setStatusNotification(null), 3000);
    }
  };

  // Export Table to CSV
  const handleExportCSV = () => {
    const headers = ['Request ID', 'Title', 'Client', 'Company', 'Service Type', 'Priority', 'Status', 'Due Date', 'Est Hours', 'SLA Days'];
    const rows = filteredRequests.map(r => [
      r.requestId,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.clientName.replace(/"/g, '""')}"`,
      `"${r.clientCompany.replace(/"/g, '""')}"`,
      r.serviceType,
      r.priority,
      r.status,
      r.dueDate,
      r.estimatedHours,
      r.slaDaysRemaining || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kapitech_service_requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setStatusNotification(language === 'id' ? 'Laporan CSV berhasil diunduh.' : 'CSV Report exported successfully.');
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
        colorBg: 'bg-[#E60023]'
      },
      status: 'in_progress',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estimatedHours: parseInt(newHours) || 20,
      completedHours: 0,
      description: newDesc || (language === 'id' ? 'Perjanjian eksekusi layanan agensi dan SLA standar.' : 'Standard agency service execution agreement and SLA.'),
      slaDaysRemaining: 7
    });

    setIsNewRequestModalOpen(false);
    setNewTitle('');
    setNewClient('');
    setNewCompany('');
    setNewDesc('');
    setStatusNotification(language === 'id' ? 'Permintaan layanan baru berhasil dibuat.' : 'New service request created successfully.');
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

  // Activity Feed Events
  const activityEvents = useMemo(() => {
    const events = [
      {
        id: 'act_1',
        title: language === 'id' ? 'Laporan SEO Dikirim ke Klien A' : 'SEO Report Sent to Client A',
        desc: 'Ticket #2217 SLA Client A',
        time: '12:30 AM',
        category: 'seo',
        timeframe: 'today',
        icon: SearchCode,
        badgeBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
      },
      {
        id: 'act_2',
        title: language === 'id' ? 'Permintaan Konten Baru dari Klien B' : 'New Content Request from Client B',
        desc: language === 'id' ? 'Strategi artikel & copy landing' : 'Copywriting & landing page brief',
        time: '10:00 AM',
        category: 'content',
        timeframe: 'today',
        icon: PenTool,
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
      },
      {
        id: 'act_3',
        title: language === 'id' ? 'Bug Website Selesai Diperbaiki' : 'Website Bug Fixed for Client C',
        desc: 'Ticket #2322 Auth Token Fix',
        time: '10:40 AM',
        category: 'dev',
        timeframe: 'today',
        icon: FileCode2,
        badgeBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
      },
      {
        id: 'act_4',
        title: language === 'id' ? 'Review Analitik Bulanan' : 'Monthly Analytics Review',
        desc: language === 'id' ? 'Audit metrik Core Web Vitals' : 'Core Web Vitals & conversion metrics',
        time: '10:30 AM',
        category: 'analytics',
        timeframe: 'today',
        icon: Activity,
        badgeBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
      },
      {
        id: 'act_5',
        title: language === 'id' ? 'Umpan Balik Klien' : 'Customer feedback',
        desc: language === 'id' ? 'Dukungan sangat cepat, terima kasih tim!' : 'Great support responsiveness, thanks team!',
        time: '10:30 AM',
        category: 'feedback',
        timeframe: 'today',
        icon: Users,
        badgeBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
      },
      {
        id: 'act_6',
        title: language === 'id' ? 'Scope Sprint #14 Diluncurkan' : 'Sprint #14 Scope Deployed',
        desc: language === 'id' ? 'Update direktori klien & audit logger' : 'Updated client directory & audit logger',
        time: language === 'id' ? 'Kemarin 17:30' : 'Yesterday 17:30',
        category: 'system',
        timeframe: 'yesterday',
        icon: Layers,
        badgeBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
      },
      {
        id: 'act_7',
        title: language === 'id' ? 'Sinkronisasi Edge Cache Cloud Run' : 'Cloud Run Edge Cache Sync Verified',
        desc: language === 'id' ? 'Latensi terverifikasi pada 24ms' : 'Zero latency verified at 24ms',
        time: language === 'id' ? 'Kemarin 14:15' : 'Yesterday 14:15',
        category: 'system',
        timeframe: 'yesterday',
        icon: ShieldCheck,
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
      },
      {
        id: 'act_8',
        title: language === 'id' ? 'Perpanjangan Kontrak Layanan' : 'Service Agreement Renewed',
        desc: language === 'id' ? 'SLA Enterprise diperpanjang untuk Q4 2026' : 'Enterprise SLA extended for Q4 2026',
        time: language === 'id' ? '3 hari lalu' : '3 days ago',
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
  }, [activityTab, activitySearch, language]);

  // Time Range Options for Dropdown
  const timeRangeOptions: SelectOption[] = [
    { value: 'lastWeek', label: t('admin.dash.lastWeek') },
    { value: 'thisMonth', label: t('admin.dash.thisMonth') },
    { value: 'last30Days', label: t('admin.dash.last30Days') },
    { value: 'thisYear', label: t('admin.dash.thisYear') }
  ];

  // Table More Action Dropdown Items
  const tableActionItems: DropdownMenuItem[] = [
    {
      id: 'export',
      label: t('admin.dash.exportReport'),
      icon: <Download size={13} />,
      onClick: handleExportCSV
    },
    {
      id: 'bulk_progress',
      label: t('admin.dash.markInProgress'),
      icon: <Activity size={13} />,
      onClick: () => handleBulkStatus('in_progress')
    },
    {
      id: 'bulk_complete',
      label: t('admin.dash.markCompleted'),
      icon: <CheckCircle2 size={13} />,
      onClick: () => handleBulkStatus('completed')
    },
    {
      id: 'bulk_del',
      label: t('admin.dash.deleteSelected'),
      icon: <Trash2 size={13} />,
      variant: 'danger',
      divider: true,
      onClick: handleBulkDelete
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* ----------------------------------------------------------------- */}
      {/* 1. TOP HEADER & QUICK ACTION BAR (KAPITECH DARK AESTHETIC) */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <span>{t('admin.dash.greeting')}, {session?.user.username ? (session.user.username.charAt(0).toUpperCase() + session.user.username.slice(1)) : 'Alex Chen'}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            {t('admin.dash.greetingSub')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Sleek Floating Glassmorphic Time Range Dropdown */}
          <CustomSelect
            options={timeRangeOptions}
            value={timeRange}
            onChange={(val) => setTimeRange(val as any)}
            size="sm"
            prefixIcon={<Calendar size={13} className="text-[#FF1E27]" />}
          />

          {/* Quick CRM Lead button */}
          <button
            onClick={() => navigate('/admin/crm')}
            className="h-10 px-3.5 py-2 rounded-xl bg-[#161922] hover:bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] text-xs font-sans font-semibold text-[#F8FAFC] transition-all flex items-center gap-1.5 shadow-sm min-h-[40px]"
          >
            <BarChart3 size={14} className="text-emerald-400" />
            <span>{t('admin.dash.newCrmLead')}</span>
          </button>

          {/* Quick Invoice button */}
          <button
            onClick={() => navigate('/admin/invoicing')}
            className="h-10 px-3.5 py-2 rounded-xl bg-[#161922] hover:bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] text-xs font-sans font-semibold text-[#F8FAFC] transition-all flex items-center gap-1.5 shadow-sm min-h-[40px]"
          >
            <Receipt size={14} className="text-purple-400" />
            <span>{t('admin.dash.newInvoice')}</span>
          </button>

          {/* Import / Migration Button */}
          <button
            onClick={() => setIsMigrationModalOpen(true)}
            className="h-10 px-3.5 py-2 rounded-xl bg-[#161922] hover:bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] text-xs font-sans font-semibold text-[#F8FAFC] transition-all flex items-center gap-1.5 shadow-sm min-h-[40px]"
          >
            <FileSpreadsheet size={14} className="text-cyan-400" />
            <span>{language === 'id' ? 'Impor CSV' : 'Data Import'}</span>
          </button>

          {/* Strictly ONE '+' icon on Add Request */}
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="h-10 px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-sans font-semibold transition-all flex items-center gap-1.5 shadow-[0_0_16px_rgba(229,9,20,0.25)] min-h-[40px]"
          >
            <Plus size={14} />
            <span>{t('admin.dash.addRequest')}</span>
          </button>

          {/* Simulate Inbound Activity */}
          <button
            onClick={handleSimulateLead}
            disabled={testSending}
            title={t('admin.dash.simulateLead')}
            className="h-10 w-10 p-2.5 rounded-xl bg-[#161922] hover:bg-[#1B1E2B] text-[#94A3B8] hover:text-white border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] text-xs transition-all flex items-center justify-center min-h-[40px] min-w-[40px]"
          >
            <Sparkles size={14} className={testSending ? 'animate-spin text-[#FF1E27]' : 'text-[#FF1E27]'} />
          </button>
        </div>
      </div>

      {/* Floating Status Notification Banner */}
      {statusNotification && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-[rgba(229,9,20,0.3)] text-red-200 text-xs font-sans flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#FF1E27]" />
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-[#94A3B8] hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. TOP METRIC CARDS (3-GRID SPANNING FULL WIDTH) */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Active Client Projects */}
        <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.06)] p-5 rounded-[12px] flex flex-col justify-between group hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-200">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-sans font-semibold text-[#94A3B8]">{t('admin.dash.cardActiveProjects')}</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Check size={12} />
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="text-[28px] font-sans font-bold text-[#F8FAFC] tracking-tight leading-none">
                1,250
              </div>
              <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold text-[10px]">+15%</span>
                <span className="text-[#64748B]">{t('admin.dash.vsLastWeek')}</span>
              </div>
            </div>

            {/* Smooth Curved SVG Sparkline with Gradient Area */}
            <div className="w-28 h-10">
              <svg viewBox="0 0 100 36" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gradProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,28 Q 25,32 45,20 T 75,14 T 100,6 L 100,36 L 0,36 Z"
                  fill="url(#gradProjects)"
                />
                <path
                  d="M 0,28 Q 25,32 45,20 T 75,14 T 100,6"
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Daily Task Resolution */}
        <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.06)] p-5 rounded-[12px] flex flex-col justify-between group hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-200">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-sans font-semibold text-[#94A3B8]">{t('admin.dash.cardDailyResolution')}</span>
            <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Activity size={12} />
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="text-[28px] font-sans font-bold text-[#F8FAFC] tracking-tight leading-none">
                320
              </div>
              <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold text-[10px]">+5%</span>
                <span className="text-[#64748B]">{t('admin.dash.vsLastWeek')}</span>
              </div>
            </div>

            {/* Smooth Curved SVG Sparkline */}
            <div className="w-28 h-10">
              <svg viewBox="0 0 100 36" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gradTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,26 Q 20,30 40,18 T 70,18 T 100,8 L 100,36 L 0,36 Z"
                  fill="url(#gradTasks)"
                />
                <path
                  d="M 0,26 Q 20,30 40,18 T 70,18 T 100,8"
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Client Satisfaction Score */}
        <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.06)] p-5 rounded-[12px] flex flex-col justify-between group hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-200">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-sans font-semibold text-[#94A3B8]">{t('admin.dash.cardSatisfaction')}</span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={12} />
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="text-[28px] font-sans font-bold text-[#F8FAFC] tracking-tight leading-none">
                4.8<span className="text-lg font-normal text-[#64748B]">/5</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold text-[10px]">+2%</span>
                <span className="text-[#64748B]">{t('admin.dash.vsLastWeek')}</span>
              </div>
            </div>

            {/* Smooth Curved SVG Sparkline */}
            <div className="w-28 h-10">
              <svg viewBox="0 0 100 36" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gradSat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,24 Q 30,26 55,16 T 80,12 T 100,6 L 100,36 L 0,36 Z"
                  fill="url(#gradSat)"
                />
                <path
                  d="M 0,24 Q 30,26 55,16 T 80,12 T 100,6"
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth="2"
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
        <div className="xl:col-span-8 bg-[#0F1117] border border-[rgba(255,255,255,0.06)] p-5 sm:p-6 rounded-[12px] shadow-sm flex flex-col justify-between">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-[#FF1E27]" />
                <h2 className="text-sm sm:text-base font-sans font-bold text-[#F8FAFC]">
                  {t('admin.dash.weeklyVolume')}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <CustomSelect
                  options={timeRangeOptions}
                  value={timeRange}
                  onChange={(val) => setTimeRange(val as any)}
                  size="xs"
                />
                
                <DropdownMenu
                  trigger={
                    <button className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#161922] transition-colors border border-transparent hover:border-[rgba(255,255,255,0.06)]">
                      <MoreVertical size={14} />
                    </button>
                  }
                  items={[
                    {
                      id: 'export_chart',
                      label: t('admin.dash.exportReport'),
                      icon: <Download size={13} />,
                      onClick: handleExportCSV
                    },
                    {
                      id: 'open_proj',
                      label: t('admin.dash.openProjects'),
                      icon: <ArrowRight size={13} />,
                      onClick: () => navigate('/admin/projects')
                    }
                  ]}
                />
              </div>
            </div>

            {/* Big Stat + Trend Badge */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-2xl sm:text-3xl font-sans font-bold text-[#F8FAFC] tracking-tight">
                4,790
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                +8% {t('admin.dash.vsLastWeek')}
              </span>
            </div>
          </div>

          {/* Grouped Bar Chart Area (4 pillars: SEO, Content, Development, Design) */}
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
              <div className="flex-1 relative flex flex-col justify-between h-48 border-b border-[rgba(255,255,255,0.06)]">
                
                {/* Horizontal Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-dashed border-[rgba(255,255,255,0.04)] w-full" />
                  <div className="border-b border-dashed border-[rgba(255,255,255,0.04)] w-full" />
                  <div className="border-b border-dashed border-[rgba(255,255,255,0.04)] w-full" />
                  <div className="border-b border-dashed border-[rgba(255,255,255,0.04)] w-full" />
                  <div className="w-full" />
                </div>

                {/* Benchmark Target Line at 800 */}
                <div className="absolute top-0 left-0 right-0 border-b border-dashed border-[rgba(229,9,20,0.3)] z-0 pointer-events-none" />

                {/* 4 Grouped Pillars on X-Axis */}
                <div className="relative z-10 h-full flex items-end justify-around px-2 sm:px-6">
                  
                  {/* Pillar 1: SEO */}
                  <div 
                    className="flex items-end gap-1 sm:gap-1.5 h-full relative group cursor-pointer"
                    onMouseEnter={() => setChartHoveredPillar('SEO')}
                    onMouseLeave={() => setChartHoveredPillar(null)}
                  >
                    <div className="w-3.5 sm:w-5 bg-[#E50914]/70 group-hover:bg-[#E50914] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '48%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#FF1E27] group-hover:bg-red-400 rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '62%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#8A0014]/60 group-hover:bg-[#A50019] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '30%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#E50914]/80 group-hover:bg-[#FF1E27] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '54%' }} />

                    {chartHoveredPillar === 'SEO' && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#161922] border border-[rgba(255,255,255,0.12)] px-2.5 py-1 rounded-md text-[11px] font-mono text-white whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-30 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-[#FF1E27] font-bold">SEO Total:</span> 580 {language === 'id' ? 'permintaan' : 'reqs'}
                      </div>
                    )}
                  </div>

                  {/* Pillar 2: Content */}
                  <div 
                    className="flex items-end gap-1 sm:gap-1.5 h-full relative group cursor-pointer"
                    onMouseEnter={() => setChartHoveredPillar('Content')}
                    onMouseLeave={() => setChartHoveredPillar(null)}
                  >
                    {/* Tooltip on active bar */}
                    <div className="absolute -top-7 left-1/4 -translate-x-1/2 bg-[#161922] border border-[rgba(255,255,255,0.12)] px-2 py-0.5 rounded text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-20">
                      {language === 'id' ? 'Sel: 450' : 'Tue: 450'}
                    </div>

                    <div className="w-3.5 sm:w-5 bg-[#380008] group-hover:bg-[#5C000E] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '88%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#E50914]/70 group-hover:bg-[#FF1E27] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '42%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#E50914] group-hover:bg-red-400 rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '68%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#E50914]/60 group-hover:bg-[#FF1E27] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '50%' }} />

                    {chartHoveredPillar === 'Content' && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#161922] border border-[rgba(255,255,255,0.12)] px-2.5 py-1 rounded-md text-[11px] font-mono text-white whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-30 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-[#FF1E27] font-bold">{language === 'id' ? 'Konten:' : 'Content:'}</span> 1,240 {language === 'id' ? 'permintaan' : 'reqs'}
                      </div>
                    )}
                  </div>

                  {/* Pillar 3: Development */}
                  <div 
                    className="flex items-end gap-1 sm:gap-1.5 h-full relative group cursor-pointer"
                    onMouseEnter={() => setChartHoveredPillar('Development')}
                    onMouseLeave={() => setChartHoveredPillar(null)}
                  >
                    <div className="w-3.5 sm:w-5 bg-[#E50914]/80 group-hover:bg-[#FF1E27] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '58%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#E50914] group-hover:bg-red-400 rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '78%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#E50914]/70 group-hover:bg-[#FF1E27] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '56%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#8A0014]/60 group-hover:bg-[#A50019] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '36%' }} />

                    {chartHoveredPillar === 'Development' && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#161922] border border-[rgba(255,255,255,0.12)] px-2.5 py-1 rounded-md text-[11px] font-mono text-white whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-30 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-[#FF1E27] font-bold">Dev Total:</span> 1,890 {language === 'id' ? 'permintaan' : 'reqs'}
                      </div>
                    )}
                  </div>

                  {/* Pillar 4: Design */}
                  <div 
                    className="flex items-end gap-1 sm:gap-1.5 h-full relative group cursor-pointer"
                    onMouseEnter={() => setChartHoveredPillar('Design')}
                    onMouseLeave={() => setChartHoveredPillar(null)}
                  >
                    <div className="w-3.5 sm:w-5 bg-[#E50914] group-hover:bg-red-400 rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '66%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#E50914]/70 group-hover:bg-[#FF1E27] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '44%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#E50914]/90 group-hover:bg-[#FF1E27] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '52%' }} />
                    <div className="w-3.5 sm:w-5 bg-[#8A0014]/50 group-hover:bg-[#A50019] rounded-t-[4px] transition-all chart-bar-glow" style={{ height: '28%' }} />

                    {chartHoveredPillar === 'Design' && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#161922] border border-[rgba(255,255,255,0.12)] px-2.5 py-1 rounded-md text-[11px] font-mono text-white whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-30 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-[#FF1E27] font-bold">Design Total:</span> 1,080 {language === 'id' ? 'permintaan' : 'reqs'}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-around pl-8 pt-3 text-xs font-sans font-medium text-[#94A3B8]">
              <span>SEO</span>
              <span>{language === 'id' ? 'Konten' : 'Content'}</span>
              <span>Development</span>
              <span>{language === 'id' ? 'Desain' : 'Design'}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Latest Updates Feed (4 Cols) */}
        <div className="xl:col-span-4 bg-[#0F1117] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="text-sm sm:text-base font-sans font-bold text-[#F8FAFC]">
                {t('admin.dash.latestUpdates')}
              </h2>
              <DropdownMenu
                trigger={
                  <button className="p-1 text-[#64748B] hover:text-white transition-colors">
                    <MoreVertical size={14} />
                  </button>
                }
                items={[
                  {
                    id: 'logs',
                    label: t('admin.dash.viewAuditLogs'),
                    icon: <ShieldCheck size={13} />,
                    onClick: () => navigate('/admin/settings')
                  }
                ]}
              />
            </div>

            {/* Timeframe Tab Buttons (Today, Yesterday, This week) - Inset Segmented Control */}
            <div className="grid grid-cols-3 gap-1 bg-[#0B0C10] border border-[rgba(255,255,255,0.06)] rounded-lg p-1 mt-3 text-xs font-sans">
              <button
                onClick={() => setActivityTab('today')}
                className={`py-1 rounded-md text-center transition-all ${
                  activityTab === 'today' ? 'bg-[#1C1F2B] text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('admin.dash.today')}
              </button>
              <button
                onClick={() => setActivityTab('yesterday')}
                className={`py-1 rounded-md text-center transition-all ${
                  activityTab === 'yesterday' ? 'bg-[#1C1F2B] text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('admin.dash.yesterday')}
              </button>
              <button
                onClick={() => setActivityTab('week')}
                className={`py-1 rounded-md text-center transition-all ${
                  activityTab === 'week' ? 'bg-[#1C1F2B] text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('admin.dash.thisWeek')}
              </button>
            </div>

            {/* Search Activities Input */}
            <div className="relative mt-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder={t('admin.dash.searchActivities')}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914] transition-colors"
              />
            </div>

            {/* Subheading Activity Count */}
            <div className="text-xs font-sans font-semibold text-[#F8FAFC] mt-4 mb-2">
              8 {t('admin.dash.newActivitiesCount')}
            </div>

            {/* Activity List Items with 32px icon containers & border-b separators */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {activityEvents.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-start justify-between gap-2.5 pb-3 border-b border-[rgba(255,255,255,0.04)] last:border-0 group">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${item.badgeBg} flex items-center justify-center text-xs shrink-0 mt-0.5`}>
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#F8FAFC] truncate group-hover:text-[#FF1E27] transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#64748B] truncate mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#64748B] shrink-0 tabular-nums">{item.time}</span>
                  </div>
                );
              })}
            </div>

          </div>

          <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] mt-4 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <span>{t('admin.dash.systemSla')}: 99.98%</span>
            <button 
              onClick={() => navigate('/admin/settings')} 
              className="text-[#FF1E27] hover:underline cursor-pointer"
            >
              {t('admin.dash.viewAuditLogs')}
            </button>
          </div>
        </div>

      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 4. BOTTOM SECTION: SERVICE REQUEST MONITORING TABLE (FULL WIDTH) */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.06)] rounded-[12px] overflow-hidden shadow-sm">
        
        {/* Table Controls Header */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.06)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#161922] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#FF1E27]">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-base font-sans font-bold text-[#F8FAFC]">
                {t('admin.dash.serviceReqMonitoring')}
              </h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">
                {filteredRequests.length} {language === 'id' ? 'antrean deliverable aktif' : 'active queue deliverables'}
              </p>
            </div>
          </div>

          {/* Search Ticket + Filter Pills + Dropdown Action */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder={t('admin.dash.ticketSearch') + '...'}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914] w-36 sm:w-44 transition-colors"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center bg-[#0B0C10] border border-[rgba(255,255,255,0.06)] rounded-lg p-1 text-xs font-sans">
              <button
                onClick={() => setTableStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  tableStatusFilter === 'all' ? 'bg-[#1C1F2B] text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('admin.dash.filterAll')}
              </button>
              <button
                onClick={() => setTableStatusFilter('in_progress')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  tableStatusFilter === 'in_progress' ? 'bg-[#1C1F2B] text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('admin.dash.filterInProgress')}
              </button>
              <button
                onClick={() => setTableStatusFilter('review')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  tableStatusFilter === 'review' ? 'bg-[#1C1F2B] text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('admin.dash.filterReview')}
              </button>
              <button
                onClick={() => setTableStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  tableStatusFilter === 'completed' ? 'bg-[#1C1F2B] text-white font-semibold shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {t('admin.dash.filterCompleted')}
              </button>
            </div>

            {/* SLA Alert Filter Pill */}
            <button
              onClick={() => setSlaOnlyFilter(!slaOnlyFilter)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all border ${
                slaOnlyFilter 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-sm' 
                  : 'bg-[#161922] text-[#94A3B8] border-[rgba(255,255,255,0.06)] hover:text-white'
              }`}
            >
              <AlertTriangle size={12} className={slaOnlyFilter ? 'text-amber-400' : 'text-[#64748B]'} />
              <span>{t('admin.dash.slaWarning')}</span>
            </button>

            {/* Bulk Action / More Dropdown */}
            <DropdownMenu
              trigger={
                <button className="p-2 rounded-lg bg-[#161922] text-[#94A3B8] hover:text-white border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-colors">
                  <MoreVertical size={14} />
                </button>
              }
              items={tableActionItems}
            />

          </div>
        </div>

        {/* Mobile View: Zero Horizontal Scrolling Card Stream */}
        <div className="md:hidden divide-y divide-[rgba(255,255,255,0.06)]">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#94A3B8]">
              {language === 'id' ? 'Tidak ada permintaan layanan yang cocok dengan filter.' : 'No service requests found matching the active filter.'}
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isSelected = selectedRequestIds.includes(req.id);
              return (
                <div
                  key={req.id}
                  onClick={() => setActiveModalRequest(req)}
                  className={`p-4 space-y-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[rgba(229,9,20,0.08)]' : 'hover:bg-[#161922]'
                  }`}
                >
                  {/* Top Bar: Checkbox + ID + Priority + Due Date */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(req.id)}
                        className="rounded bg-[#1B1E2B] border-[rgba(255,255,255,0.12)] text-[#E50914] focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="font-mono font-semibold text-[#FF1E27] text-xs">
                        {req.requestId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                        req.priority === 'urgent' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                        req.priority === 'high' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        req.priority === 'medium' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                      }`}>
                        {req.priority === 'urgent' ? t('admin.dash.priority.urgent') :
                         req.priority === 'high' ? t('admin.dash.priority.high') :
                         req.priority === 'medium' ? t('admin.dash.priority.medium') :
                         t('admin.dash.priority.low')}
                      </span>
                      <span className={`text-[10px] font-mono ${req.slaDaysRemaining !== undefined && req.slaDaysRemaining <= 2 ? 'text-amber-400 font-bold' : 'text-[#94A3B8]'}`}>
                        {req.dueDate}
                      </span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {req.title}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-0.5 font-mono">
                      {req.clientCompany} • {req.serviceType}
                    </div>
                  </div>

                  {/* Assigned Member & Status Selector Footer */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[rgba(255,255,255,0.04)]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#E50914] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {req.assignedMember.initials || 'A'}
                      </div>
                      <span className="text-[#F8FAFC] text-xs truncate">{req.assignedMember.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value as ServiceStatus)}
                        className={`h-9 px-2.5 rounded-lg text-xs font-mono font-semibold border bg-[#1B1E2B] focus:outline-none transition-colors cursor-pointer min-h-[36px] ${
                          req.status === 'completed' ? 'text-emerald-400 border-emerald-500/30' :
                          req.status === 'review' ? 'text-purple-400 border-purple-500/30' :
                          req.status === 'in_progress' ? 'text-[#FF1E27] border-[rgba(229,9,20,0.4)]' :
                          'text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <option value="pending">{t('admin.dash.status.pending')}</option>
                        <option value="in_progress">{t('admin.dash.status.in_progress')}</option>
                        <option value="review">{t('admin.dash.status.review')}</option>
                        <option value="completed">{t('admin.dash.status.completed')}</option>
                      </select>

                      <button
                        onClick={() => setActiveModalRequest(req)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#161922] text-[#94A3B8] hover:text-white border border-[rgba(255,255,255,0.06)] min-h-[36px] min-w-[36px]"
                        title="View details"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Data Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead className="sticky top-0 z-10 bg-[#111318]">
              <tr className="border-b border-[rgba(255,255,255,0.07)] bg-[#181B22] text-[#8A94A6] font-mono text-[11px] uppercase">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRequestIds.length > 0 && selectedRequestIds.length === filteredRequests.length}
                    className="rounded bg-[#111318] border-[rgba(255,255,255,0.12)] text-[#E50914] focus:ring-0 focus:ring-offset-0"
                  />
                </th>
                <th className="p-4">{t('admin.dash.thReqId')} ⇅</th>
                <th className="p-4">{t('admin.dash.thServiceType')} ⇅</th>
                <th className="p-4">{t('admin.dash.thPriority')} ⇅</th>
                <th className="p-4">{t('admin.dash.thAssignedTo')} ⇅</th>
                <th className="p-4">{t('admin.dash.thStatus')} ⇅</th>
                <th className="p-4">{t('admin.dash.thCreatedDate')} ⇅</th>
                <th className="p-4">{t('admin.dash.thDueDate')} ⇅</th>
                <th className="p-4 text-right">{t('admin.dash.thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-xs font-mono text-[#94A3B8]">
                    {language === 'id' ? 'Tidak ada permintaan layanan yang cocok dengan filter.' : 'No service requests found matching the active filter.'}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedRequestIds.includes(req.id);
                  return (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-[#161922] transition-colors group cursor-pointer ${
                        isSelected ? 'bg-[rgba(229,9,20,0.08)]' : ''
                      }`}
                      onClick={() => setActiveModalRequest(req)}
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(req.id)}
                          className="rounded bg-[#1B1E2B] border-[rgba(255,255,255,0.12)] text-[#E50914] focus:ring-0 focus:ring-offset-0"
                        />
                      </td>
                      <td className="p-4 font-mono font-semibold text-[#FF1E27]">
                        {req.requestId}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-white truncate group-hover:text-[#FF1E27] transition-colors">
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
                          {req.priority === 'urgent' ? t('admin.dash.priority.urgent') :
                           req.priority === 'high' ? t('admin.dash.priority.high') :
                           req.priority === 'medium' ? t('admin.dash.priority.medium') :
                           t('admin.dash.priority.low')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#E50914] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            {req.assignedMember.initials || 'A'}
                          </div>
                          <span className="text-[#F8FAFC] font-medium truncate">{req.assignedMember.name}</span>
                        </div>
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value as ServiceStatus)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border bg-[#1B1E2B] focus:outline-none transition-colors cursor-pointer ${
                            req.status === 'completed' ? 'text-emerald-400 border-emerald-500/30' :
                            req.status === 'review' ? 'text-purple-400 border-purple-500/30' :
                            req.status === 'in_progress' ? 'text-[#FF1E27] border-[rgba(229,9,20,0.4)]' :
                            'text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <option value="pending">{t('admin.dash.status.pending')}</option>
                          <option value="in_progress">{t('admin.dash.status.in_progress')}</option>
                          <option value="review">{t('admin.dash.status.review')}</option>
                          <option value="completed">{t('admin.dash.status.completed')}</option>
                        </select>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[#94A3B8]">
                        2025-08-19
                      </td>
                      <td className="p-4 font-mono text-[11px] text-[#94A3B8]">
                        <span className={req.slaDaysRemaining !== undefined && req.slaDaysRemaining <= 2 ? 'text-amber-400 font-bold' : ''}>
                          {req.dueDate}
                        </span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveModalRequest(req)}
                          className="w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-white hover:bg-[#1B1E2B] rounded-lg transition-colors ml-auto"
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
        <div className="p-4 border-t border-[rgba(255,255,255,0.06)] bg-[#0B0C10]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#64748B]">
          <div>
            {t('admin.dash.showingRequests')} {filteredRequests.length} {t('admin.dash.ofTotal')} ({serviceRequests.length})
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/projects" className="text-[#FF1E27] hover:underline flex items-center gap-1">
              <span>{t('admin.dash.openProjects')}</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 5. SERVICE REQUEST DETAIL MODAL (KAPITECH GLASSMORPHIC PANEL) */}
      {/* ----------------------------------------------------------------- */}
      {activeModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModalRequest(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161922]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 font-mono text-[#FF1E27] text-xs font-semibold mb-2">
              <span>{activeModalRequest.requestId}</span>
              <span>•</span>
              <span className="text-[#94A3B8]">{activeModalRequest.serviceType}</span>
            </div>

            <h3 className="text-lg font-sans font-bold text-white mb-1">
              {activeModalRequest.title}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              {language === 'id' ? 'Klien' : 'Client'}: {activeModalRequest.clientCompany} ({activeModalRequest.clientName})
            </p>

            <div className="p-4 rounded-xl bg-[#161922] border border-[rgba(255,255,255,0.06)] space-y-3 mb-5 text-xs">
              <p className="text-[#F8FAFC] leading-relaxed">
                {activeModalRequest.description}
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgba(255,255,255,0.06)] text-[11px] font-mono">
                <div>
                  <span className="text-[#64748B] block">{language === 'id' ? 'Spesialis Ditugaskan:' : 'Assigned Specialist:'}</span>
                  <span className="text-white font-semibold">{activeModalRequest.assignedMember.name}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">{language === 'id' ? 'Batas Waktu:' : 'Due Date:'}</span>
                  <span className="text-white font-semibold">{activeModalRequest.dueDate}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">{language === 'id' ? 'Estimasi Pengerjaan:' : 'Estimated Work:'}</span>
                  <span className="text-[#FF1E27] font-semibold">{activeModalRequest.estimatedHours} {language === 'id' ? 'Jam' : 'Hours'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">{language === 'id' ? 'Sisa SLA:' : 'SLA Remaining:'}</span>
                  <span className="text-emerald-400 font-semibold">{activeModalRequest.slaDaysRemaining} {language === 'id' ? 'Hari' : 'Days'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  deleteServiceRequest(activeModalRequest.id);
                  setActiveModalRequest(null);
                  setStatusNotification(language === 'id' ? 'Permintaan layanan dihapus.' : 'Service request deleted.');
                }}
                className="px-3 py-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 text-xs font-mono flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>{t('admin.action.delete')}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalRequest(null)}
                  className="px-4 py-2 rounded-lg bg-[#161922] hover:bg-[#1B1E2B] text-white text-xs font-sans border border-[rgba(255,255,255,0.06)]"
                >
                  {t('admin.action.close')}
                </button>
                <Link
                  to="/admin/projects"
                  className="px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-sans font-semibold flex items-center gap-1 shadow-[0_0_16px_rgba(229,9,20,0.25)]"
                >
                  <span>{t('admin.dash.executeProjects')}</span>
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
          <div className="bg-[#0F1117] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsNewRequestModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161922]"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-sans font-bold text-white mb-1">
              {t('admin.dash.createReqTitle')}
            </h3>
            <p className="text-xs text-[#94A3B8] mb-5">
              {t('admin.dash.createReqSub')}
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">{t('admin.dash.reqTitleLabel')} *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={language === 'id' ? 'contoh: Migrasi Web Platform Headless Next.js' : 'e.g. Next.js Headless Web Platform Migration'}
                  className="w-full px-3 py-2 rounded-lg bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">{t('admin.dash.clientContactLabel')} *</label>
                  <input
                    type="text"
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="e.g. Marcus Thorne"
                    className="w-full px-3 py-2 rounded-lg bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">{t('admin.dash.companyNameLabel')}</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Lumina Real Estate"
                    className="w-full px-3 py-2 rounded-lg bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">{t('admin.dash.thServiceType')}</label>
                  <select
                    value={newServiceType}
                    onChange={(e) => setNewServiceType(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="Web Dev">Web Dev</option>
                    <option value="SEO">SEO</option>
                    <option value="Content">Content</option>
                    <option value="Design">Design</option>
                    <option value="Cloud">Cloud</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">{t('admin.dash.thPriority')}</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ServicePriority)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="urgent">{t('admin.dash.priority.urgent')}</option>
                    <option value="high">{t('admin.dash.priority.high')}</option>
                    <option value="medium">{t('admin.dash.priority.medium')}</option>
                    <option value="low">{t('admin.dash.priority.low')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94A3B8] mb-1 font-medium">{t('admin.dash.estHoursLabel')}</label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1 font-medium">{t('admin.dash.descDeliverablesLabel')}</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={language === 'id' ? 'Berikan ikhtisar scope, batas waktu SLA, dan deliverable utama...' : 'Provide scope overview, SLA timeline, and key requirements...'}
                  className="w-full px-3 py-2 rounded-lg bg-[#1B1E2B] border border-[rgba(255,255,255,0.06)] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-[#161922] hover:bg-[#1B1E2B] text-white text-xs font-mono font-medium border border-[rgba(255,255,255,0.06)] transition-colors min-h-[40px]"
                >
                  {t('admin.action.cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-bold shadow-[0_0_16px_rgba(229,9,20,0.25)] transition-all min-h-[40px]"
                >
                  {t('admin.dash.addRequest')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Data Migration / CSV Ingestion Modal */}
      <DataMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        defaultTarget="clients"
      />

    </div>
  );
};

export default AdminDashboard;
