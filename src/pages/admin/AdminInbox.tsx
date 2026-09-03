import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Mail, 
  Phone, 
  Filter, 
  Search, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  MessageSquare, 
  Briefcase, 
  Globe, 
  Download, 
  Copy, 
  Plus, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Check, 
  Tag, 
  DollarSign,
  Star,
  Layers,
  Calendar,
  Send,
  User,
  Clock,
  Building2,
  FileText,
  HelpCircle,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { 
  ContactSubmission, 
  subscribeToInbox, 
  updateSubmission,
  deleteSubmission, 
  submitToInbox 
} from '../../lib/submissions';
import { 
  isSubmissionConverted,
  getCmsLeads,
  formatIDR 
} from '../../lib/crmStore';
import { 
  formatAmount, 
  getActiveCurrency, 
  CurrencyCode, 
  CURRENCY_EVENT 
} from '../../lib/currency';
import { 
  playNotificationSound, 
  requestDesktopNotificationPermission, 
  showDesktopNotification 
} from '../../lib/notifications';
import { EmailForwardingGuideModal } from '../../components/EmailForwardingGuideModal';
import { CannedResponsesModal } from '../../components/admin/inbox/CannedResponsesModal';
import { ConvertToCrmModal } from '../../components/admin/inbox/ConvertToCrmModal';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminInbox: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Core Data & Currency
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<CurrencyCode>(getActiveCurrency());

  // Filters & Views
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [onlyStarred, setOnlyStarred] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'split' | 'table'>('split');

  // Selection & Panels
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [detailTab, setDetailTab] = useState<'brief' | 'notes' | 'specs'>('brief');
  const [internalNoteDraft, setInternalNoteDraft] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Modals & Feedback
  const [isCannedModalOpen, setIsCannedModalOpen] = useState(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('kapitech_inbox_sound') !== 'false';
  });
  const [prevCount, setPrevCount] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; link?: string; linkText?: string } | null>(null);

  // Sync Currency
  useEffect(() => {
    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail?.currency || getActiveCurrency());
    };
    window.addEventListener(CURRENCY_EVENT, handleCurrencyChange);
    return () => window.removeEventListener(CURRENCY_EVENT, handleCurrencyChange);
  }, []);

  // Sync Sound Preference
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('kapitech_inbox_sound', String(next));
  };

  // Subscribe to real-time incoming briefs
  useEffect(() => {
    requestDesktopNotificationPermission();

    const unsubscribe = subscribeToInbox((items) => {
      setSubmissions(items);

      // Sound and Desktop notification on newly arrived submission
      if (prevCount !== null && items.length > prevCount) {
        const latest = items[0];
        if (soundEnabled) {
          playNotificationSound();
        }
        showDesktopNotification(
          language === 'id' 
            ? `Pesan Baru: ${latest?.fullName || 'Klien Baru'}` 
            : `New Inbound: ${latest?.fullName || 'New Client'}`,
          `${latest?.company ? latest.company + ' • ' : ''}${latest?.message?.substring(0, 75)}...`
        );
      }

      setPrevCount(items.length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [prevCount, soundEnabled, language]);

  // Keep selected submission in sync with store
  useEffect(() => {
    if (selectedSubmission) {
      const updated = submissions.find(s => s.id === selectedSubmission.id);
      if (updated) {
        setSelectedSubmission(updated);
        setInternalNoteDraft(updated.internalNotes || '');
      }
    }
  }, [submissions]);

  // When clicking a submission
  const handleSelectSubmission = (sub: ContactSubmission) => {
    setSelectedSubmission(sub);
    setInternalNoteDraft(sub.internalNotes || '');
    setDetailTab('brief');
  };

  // Status update
  const handleStatusChange = async (id: string, newStatus: ContactSubmission['status']) => {
    setIsUpdating(true);
    try {
      await updateSubmission(id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Priority update
  const handlePriorityChange = async (id: string, newPriority: ContactSubmission['priority']) => {
    try {
      await updateSubmission(id, { priority: newPriority });
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  // Assignee update
  const handleAssigneeChange = async (id: string, assignee: string) => {
    try {
      await updateSubmission(id, { assignedTo: assignee });
    } catch (err) {
      console.error('Failed to update assignee:', err);
    }
  };

  // Star toggle
  const handleToggleStar = async (e: React.MouseEvent, id: string, currentStarred?: boolean) => {
    e.stopPropagation();
    try {
      await updateSubmission(id, { starred: !currentStarred });
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  // Save internal notes
  const handleSaveInternalNote = async () => {
    if (!selectedSubmission) return;
    setIsSavingNote(true);
    try {
      await updateSubmission(selectedSubmission.id, { internalNotes: internalNoteDraft });
      setToastMessage({
        text: language === 'id' ? 'Catatan internal agensi berhasil disimpan.' : 'Internal team notes saved successfully.'
      });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Delete submission
  const handleDelete = async (id: string) => {
    const confirmMsg = language === 'id' 
      ? 'Hapus data pesan ini secara permanen dari database Kapitech?' 
      : 'Permanently delete this brief from the Kapitech database?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteSubmission(id);
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
      setToastMessage({
        text: language === 'id' ? 'Pesan telah dihapus.' : 'Record deleted successfully.'
      });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete submission:', err);
    }
  };

  // Mark all new as In-Review
  const handleMarkAllRead = async () => {
    const unread = submissions.filter(s => s.status === 'new');
    if (unread.length === 0) return;
    const confirmMsg = language === 'id' 
      ? `Tandai ${unread.length} pesan baru sebagai 'In Review'?` 
      : `Mark ${unread.length} new messages as 'In Review'?`;
    if (!window.confirm(confirmMsg)) return;

    for (const item of unread) {
      await updateSubmission(item.id, { status: 'in-review' });
    }
    setToastMessage({
      text: language === 'id' ? `${unread.length} pesan ditandai telah ditinjau.` : `${unread.length} messages marked as In Review.`
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulate rich enterprise brief
  const handleCreateTestSubmission = async () => {
    setTestSending(true);
    try {
      const mockClients = [
        {
          name: 'Adrian Wibowo',
          company: 'PT Fintek Nusantara Global',
          phone: '+62 811-9872-4321',
          services: ['Web Development', 'AI & Cloud Solutions', 'UI/UX Design'],
          budget: '$25,000 - $50,000',
          message: 'Kami memerlukan redesain dan pembangunan full-stack platform core banking API & dashboard investor institusional dengan standar ISO 27001 dan latensi sub-100ms.',
          source: 'Kapitech Website Form (Production)'
        },
        {
          name: 'Sarah Jenkins',
          company: 'AeroCloud Analytics Inc.',
          phone: '+1 (415) 890-3412',
          services: ['UI/UX Design', 'Digital Product MVP'],
          budget: '$10,000 - $25,000',
          message: 'Seeking a top-tier design & engineering studio to architect our Series-A B2B SaaS analytics portal in Next.js/Tailwind with interactive D3 charts.',
          source: 'Direct Client Inquiry'
        },
        {
          name: 'Budi Hartono',
          company: 'Veritas Retail Ecosystem',
          phone: '+62 812-4455-8899',
          services: ['Mobile App', 'Web Development'],
          budget: '$5,000 - $15,000',
          message: 'Halo tim Kapitech, kami ingin berkonsultasi mengenai migrasi e-commerce omnichannel kami ke modern headless architecture dengan sistem manajemen stok real-time.',
          source: 'Website Brief Dispatcher'
        }
      ];

      const sample = mockClients[Math.floor(Math.random() * mockClients.length)];

      await submitToInbox({
        fullName: sample.name,
        email: `${sample.name.toLowerCase().replace(/[^a-z]/g, '.')}@example.com`,
        company: sample.company,
        phone: sample.phone,
        services: sample.services,
        budget: sample.budget,
        message: sample.message,
        source: sample.source,
        type: 'inquiry',
        priority: 'urgent'
      });

      setToastMessage({
        text: language === 'id' ? `Simulasi lead "${sample.name}" berhasil ditambahkan.` : `Simulated inbound lead "${sample.name}" received!`
      });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error('Error creating test submission:', e);
    } finally {
      setTestSending(false);
    }
  };

  // Copy helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clean WhatsApp number
  const cleanPhoneForWhatsApp = (rawPhone?: string) => {
    if (!rawPhone) return '';
    let digits = rawPhone.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '62' + digits.substring(1);
    return digits;
  };

  // Relative timestamp calculation
  const formatRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (diffSec < 60) return language === 'id' ? 'Baru saja' : 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ${language === 'id' ? 'lalu' : 'ago'}`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ${language === 'id' ? 'lalu' : 'ago'}`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ${language === 'id' ? 'lalu' : 'ago'}`;
      return d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Estimated deal value parser from string
  const estimateDealValue = (sub: ContactSubmission): number => {
    if (sub.budget) {
      const b = sub.budget.toLowerCase();
      if (b.includes('25,000') || b.includes('50,000') || b.includes('100jt') || b.includes('100m')) return 120000000;
      if (b.includes('10,000') || b.includes('25,000') || b.includes('50jt')) return 75000000;
      if (b.includes('5,000') || b.includes('15,000') || b.includes('25jt')) return 45000000;
    }
    return 35000000;
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = submissions.length;
    const newCount = submissions.filter(s => s.status === 'new').length;
    const convertedCount = submissions.filter(s => isSubmissionConverted(s.id)).length;
    const conversionRate = total > 0 ? Math.round((convertedCount / total) * 100) : 0;
    
    // Sum estimated deal volume
    const totalPipelineValue = submissions.reduce((acc, sub) => acc + estimateDealValue(sub), 0);

    return {
      total,
      newCount,
      convertedCount,
      conversionRate,
      totalPipelineValue
    };
  }, [submissions]);

  // Filtering
  const filteredItems = useMemo(() => {
    return submissions.filter(item => {
      const matchesType = filterType === 'all' || (item.type || 'inquiry') === filterType;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || (item.priority || 'normal') === filterPriority;
      const matchesStarred = !onlyStarred || !!item.starred;

      const queryLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !queryLower || (
        (item.fullName || '').toLowerCase().includes(queryLower) ||
        (item.email || '').toLowerCase().includes(queryLower) ||
        (item.company || '').toLowerCase().includes(queryLower) ||
        (item.message || '').toLowerCase().includes(queryLower) ||
        (item.positionTitle || '').toLowerCase().includes(queryLower) ||
        (item.services || []).some(s => s.toLowerCase().includes(queryLower)) ||
        (item.source || '').toLowerCase().includes(queryLower)
      );

      return matchesType && matchesStatus && matchesPriority && matchesStarred && matchesSearch;
    });
  }, [submissions, filterType, filterStatus, filterPriority, onlyStarred, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Status', 'Priority', 'Full Name', 'Email', 'Company', 'Phone', 'Services', 'Budget', 'Converted To CRM', 'Message', 'Source'];
    const rows = submissions.map(s => [
      `"${s.id}"`,
      `"${new Date(s.createdAt).toLocaleString()}"`,
      `"${s.type || 'inquiry'}"`,
      `"${s.status}"`,
      `"${s.priority || 'normal'}"`,
      `"${(s.fullName || '').replace(/"/g, '""')}"`,
      `"${s.email || ''}"`,
      `"${(s.company || '').replace(/"/g, '""')}"`,
      `"${s.phone || ''}"`,
      `"${(s.services || []).join(', ')}"`,
      `"${s.budget || ''}"`,
      `"${isSubmissionConverted(s.id) ? 'YES' : 'NO'}"`,
      `"${(s.message || '').replace(/"/g, '""')}"`,
      `"${s.source || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kapitech_leads_inbox_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for channel badges
  const renderChannelBadge = (type?: string) => {
    switch (type) {
      case 'career':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono flex items-center gap-1">
            <Briefcase size={10} />
            <span>Studio Role</span>
          </span>
        );
      case 'vendor':
        return (
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono flex items-center gap-1">
            <Globe size={10} />
            <span>Freelance Vendor</span>
          </span>
        );
      case 'newsletter':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono flex items-center gap-1">
            <Sparkles size={10} />
            <span>Newsletter</span>
          </span>
        );
      case 'inquiry':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-[#E50914]/10 border border-[#E50914]/30 text-[#FF1E27] text-[10px] font-mono flex items-center gap-1 font-semibold">
            <MessageSquare size={10} />
            <span>Client Brief</span>
          </span>
        );
    }
  };

  // Status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>New</span>
          </span>
        );
      case 'in-review':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
            In Review
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
            Contacted
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
            Closed Deal
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#181B22] text-[#8A94A6] border border-white/5">
            {status}
          </span>
        );
    }
  };

  // Priority indicator
  const renderPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-950/80 text-red-400 border border-red-500/40 font-bold">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40">
            High
          </span>
        );
      case 'low':
        return (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-700/50">
            Low
          </span>
        );
      case 'normal':
      default:
        return null;
    }
  };

  // Find linked lead if converted
  const linkedLead = useMemo(() => {
    if (!selectedSubmission) return null;
    return getCmsLeads().find(l => l.inquiryId === selectedSubmission.id) || null;
  }, [selectedSubmission]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <Check size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
          {toastMessage.link && (
            <Link
              to={toastMessage.link}
              className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors flex items-center gap-1 shrink-0 ml-3"
            >
              <span>{toastMessage.linkText || 'Open'}</span>
              <ExternalLink size={11} />
            </Link>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. EXECUTIVE HEADER & ACTIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#FF1E27] shrink-0">
              <Inbox size={18} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {language === 'id' ? 'Kotak Masuk Prospek & Pesan' : 'Leads & Inquiry Inbox'}
            </h1>
            <span className="text-xs font-mono py-0.5 px-2.5 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-full text-[#8A94A6]">
              {submissions.length} {language === 'id' ? 'Pesan Aktif' : 'Inbound Briefs'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A94A6] font-mono">
            {language === 'id'
              ? 'Pusat kualifikasi prospek masuk, triage brief klien, respon cepat, dan sinkronisasi instan ke CRM Pipeline.'
              : 'Unified intake console for qualifying client briefs, dispatching fast responses, and converting deals into CRM.'}
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound alert toggle */}
          <button
            onClick={handleToggleSound}
            className={`h-10 w-10 rounded-xl border text-xs font-mono transition-colors flex items-center justify-center min-h-[40px] min-w-[40px] ${
              soundEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-[#111318] border-[rgba(255,255,255,0.07)] text-[#8A94A6]'
            }`}
            title={soundEnabled ? (language === 'id' ? 'Suara Notifikasi: Aktif' : 'Sound Alerts: Active') : (language === 'id' ? 'Suara Notifikasi: Nonaktif' : 'Sound Alerts: Off')}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Email alerts guide modal button */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="h-10 px-3.5 rounded-xl bg-[#111318] hover:bg-[#181B22] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono transition-colors flex items-center gap-1.5 min-h-[40px]"
            title="Configure forwarding rules"
          >
            <Mail size={14} className="text-[#FF1E27]" />
            <span>{language === 'id' ? 'Rules Email' : 'Email Alerts'}</span>
          </button>

          {/* Mark all read if new available */}
          {metrics.newCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="h-10 px-3.5 rounded-xl bg-[#111318] hover:bg-[#181B22] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono transition-colors flex items-center gap-1.5 min-h-[40px]"
            >
              <Check size={14} />
              <span>{language === 'id' ? 'Tandai Dibaca' : 'Mark Read'}</span>
            </button>
          )}

          {/* Simulate new lead (Strictly single icon rule) */}
          <button
            onClick={handleCreateTestSubmission}
            disabled={testSending}
            className="h-10 px-4 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white border border-[rgba(255,255,255,0.08)] text-xs font-mono transition-colors flex items-center gap-1.5 min-h-[40px]"
          >
            {testSending ? <RefreshCw className="animate-spin text-[#FF1E27]" size={14} /> : <Plus size={14} className="text-[#FF1E27]" />}
            <span>{language === 'id' ? 'Simulasi Lead' : 'Simulate Lead'}</span>
          </button>

          {/* Export CSV */}
          {submissions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="h-10 px-3.5 rounded-xl bg-[#111318] hover:bg-[#181B22] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono transition-colors flex items-center gap-1.5 min-h-[40px]"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. EXECUTIVE KPI SUMMARY RIBBON */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Inbound */}
        <div className="p-4 rounded-2xl bg-[#111318] border border-[rgba(255,255,255,0.07)] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6]">
            <span>{language === 'id' ? 'Total Masuk' : 'Total Inbound'}</span>
            <Inbox size={14} className="text-[#8A94A6]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.total}
          </div>
          <p className="text-[11px] font-mono text-[#64748B]">
            {language === 'id' ? 'Seluruh kanal formulir' : 'All intake touchpoints'}
          </p>
        </div>

        {/* Metric 2: Action Needed / New */}
        <div className="p-4 rounded-2xl bg-[#111318] border border-[rgba(255,255,255,0.07)] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6]">
            <span>{language === 'id' ? 'Perlu Ditinjau' : 'Action Needed'}</span>
            <AlertCircle size={14} className="text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 flex items-center gap-2">
            <span>{metrics.newCount}</span>
            {metrics.newCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <p className="text-[11px] font-mono text-[#64748B]">
            {language === 'id' ? 'Belum dikualifikasi' : 'Pending initial triage'}
          </p>
        </div>

        {/* Metric 3: Converted to CRM */}
        <div className="p-4 rounded-2xl bg-[#111318] border border-[rgba(255,255,255,0.07)] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6]">
            <span>{language === 'id' ? 'Dikonversi ke CRM' : 'Converted to CRM'}</span>
            <Briefcase size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.convertedCount} <span className="text-xs text-[#8A94A6]">({metrics.conversionRate}%)</span>
          </div>
          <p className="text-[11px] font-mono text-[#64748B]">
            {language === 'id' ? 'Aktif dalam pipeline agensi' : 'Active deal opportunities'}
          </p>
        </div>

        {/* Metric 4: Estimated Pipeline Volume */}
        <div className="p-4 rounded-2xl bg-[#111318] border border-[rgba(255,255,255,0.07)] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6]">
            <span>{language === 'id' ? 'Volume Peluang' : 'Intake Valuation'}</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white truncate">
            {formatAmount(metrics.totalPipelineValue, currency)}
          </div>
          <p className="text-[11px] font-mono text-[#64748B]">
            {language === 'id' ? 'Estimasi nilai brief masuk' : 'Cumulative brief budget estimate'}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. UNIFIED FILTER TABS & TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] p-4 sm:p-5 rounded-2xl space-y-3">
        
        {/* Top Channel Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: language === 'id' ? 'Semua Form' : 'All Briefs' },
              { key: 'inquiry', label: language === 'id' ? 'Konsultasi Klien' : 'Client Briefs' },
              { key: 'career', label: language === 'id' ? 'Lamaran Karir' : 'Career Roles' },
              { key: 'vendor', label: language === 'id' ? 'Freelance Vendor' : 'Vendor Partners' },
              { key: 'newsletter', label: language === 'id' ? 'Newsletter' : 'Subscriptions' }
            ].map((tab) => {
              const count = tab.key === 'all' 
                ? submissions.length 
                : submissions.filter(s => (s.type || 'inquiry') === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterType(tab.key)}
                  className={`h-9 px-3 rounded-xl text-xs font-mono transition-all flex items-center gap-2 border min-h-[36px] ${
                    filterType === tab.key
                      ? 'bg-[#E50914] text-white border-[#E50914] font-bold shadow-sm'
                      : 'bg-[#181B22] text-[#8A94A6] border-[rgba(255,255,255,0.07)] hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    filterType === tab.key ? 'bg-black/30 text-white' : 'bg-[#111318] text-[#8A94A6]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Switcher: Split View vs Data Table View */}
          <div className="flex items-center bg-[#181B22] border border-[rgba(255,255,255,0.08)] rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-[#111318] text-white font-bold border border-white/10 shadow-sm'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
              title="Split Master-Detail View"
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-[#111318] text-white font-bold border border-white/10 shadow-sm'
                  : 'text-[#8A94A6] hover:text-white'
              }`}
              title="Spreadsheet Table View"
            >
              <TableIcon size={13} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Search & Secondary Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Universal Search */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A94A6]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'id' ? 'Cari nama, email, perusahaan, jasa, atau isi brief...' : 'Search name, email, company, requested stack, or message...'}
              className="w-full pl-10 pr-8 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] placeholder:text-[#64748B] font-mono h-10 min-h-[40px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono h-10 min-h-[40px]"
            >
              <option value="all">{language === 'id' ? 'Semua Status' : 'All Status'}</option>
              <option value="new">Status: New</option>
              <option value="in-review">Status: In Review</option>
              <option value="contacted">Status: Contacted</option>
              <option value="closed">Status: Closed Deal</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="md:col-span-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full py-2 px-3 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono h-10 min-h-[40px]"
            >
              <option value="all">{language === 'id' ? 'Semua Prioritas' : 'All Priorities'}</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Starred Only Toggle */}
          <div className="md:col-span-2 flex items-center">
            <button
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`w-full h-10 px-3 rounded-xl border text-xs font-mono transition-colors flex items-center justify-center gap-2 ${
                onlyStarred
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                  : 'bg-[#181B22] border-[rgba(255,255,255,0.07)] text-[#8A94A6] hover:text-white'
              }`}
            >
              <Star size={14} className={onlyStarred ? 'fill-amber-400 text-amber-400' : ''} />
              <span>{language === 'id' ? 'Ditandai' : 'Starred'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN CONTENT VIEW: SPLIT VIEW vs TABLE VIEW */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'table' ? (
        /* DENSE SPREADSHEET TABLE VIEW */
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#181B22] border-b border-[rgba(255,255,255,0.07)] text-[#8A94A6]">
                  <th className="p-3.5 w-10 text-center">★</th>
                  <th className="p-3.5">{language === 'id' ? 'Klien & Perusahaan' : 'Client & Company'}</th>
                  <th className="p-3.5">{language === 'id' ? 'Kanal' : 'Channel'}</th>
                  <th className="p-3.5">{language === 'id' ? 'Layanan Diminta' : 'Requested Stack'}</th>
                  <th className="p-3.5">{language === 'id' ? 'Estimasi Nilai' : 'Valuation'}</th>
                  <th className="p-3.5">{language === 'id' ? 'Status' : 'Status'}</th>
                  <th className="p-3.5">{language === 'id' ? 'Waktu' : 'Date'}</th>
                  <th className="p-3.5 text-right">{language === 'id' ? 'Aksi' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-[#8A94A6]">
                      <Inbox size={32} className="mx-auto text-[#383C46] mb-2" />
                      <p>{language === 'id' ? 'Tidak ada data pesan yang sesuai kriteria.' : 'No records match your filters.'}</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isConverted = isSubmissionConverted(item.id);
                    return (
                      <tr 
                        key={item.id}
                        onClick={() => {
                          handleSelectSubmission(item);
                          setViewMode('split');
                        }}
                        className="hover:bg-[#181B22] cursor-pointer transition-colors group"
                      >
                        {/* Star */}
                        <td className="p-3.5 text-center" onClick={(e) => handleToggleStar(e, item.id, item.starred)}>
                          <Star 
                            size={14} 
                            className={`mx-auto transition-colors ${
                              item.starred ? 'fill-amber-400 text-amber-400' : 'text-[#475569] hover:text-amber-400'
                            }`} 
                          />
                        </td>

                        {/* Name & Company */}
                        <td className="p-3.5">
                          <div className="font-bold text-white font-sans text-sm flex items-center gap-1.5">
                            <span>{item.fullName}</span>
                            {isConverted && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                CRM ✓
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8A94A6] truncate max-w-[200px]">
                            {item.company || item.email}
                          </div>
                        </td>

                        {/* Channel */}
                        <td className="p-3.5">
                          {renderChannelBadge(item.type)}
                        </td>

                        {/* Services */}
                        <td className="p-3.5 max-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {item.services && item.services.length > 0 ? (
                              item.services.slice(0, 2).map((svc, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-[#111318] border border-white/5 text-[10px] text-[#A0AEC0]">
                                  {svc}
                                </span>
                              ))
                            ) : (
                              <span className="text-[#64748B] text-[10px]">{item.specialty || '-'}</span>
                            )}
                            {item.services && item.services.length > 2 && (
                              <span className="text-[10px] text-[#64748B]">+{item.services.length - 2}</span>
                            )}
                          </div>
                        </td>

                        {/* Valuation */}
                        <td className="p-3.5 font-bold text-white">
                          {formatAmount(estimateDealValue(item), currency)}
                        </td>

                        {/* Status & Priority */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {renderStatusBadge(item.status)}
                            {renderPriorityBadge(item.priority)}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-3.5 text-[11px] text-[#64748B] whitespace-nowrap">
                          {formatRelativeTime(item.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {item.phone && cleanPhoneForWhatsApp(item.phone) && (
                              <a
                                href={`https://wa.me/${cleanPhoneForWhatsApp(item.phone)}?text=Halo%20${encodeURIComponent(item.fullName)},%20terima%20kasih%20telah%20menghubungi%20Kapitech%20Agency...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/20"
                                title="Chat on WhatsApp"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                            <button
                              onClick={() => {
                                handleSelectSubmission(item);
                                setViewMode('split');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#181B22] hover:bg-[#21252F] text-[#8A94A6] hover:text-white border border-white/5 text-[11px]"
                            >
                              {language === 'id' ? 'Buka' : 'Inspect'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : loading ? (
        /* LOADING STATE */
        <div className="flex flex-col items-center justify-center py-20 text-[#8A94A6] space-y-3 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl">
          <RefreshCw className="animate-spin text-[#E50914]" size={24} />
          <p className="text-xs font-mono">{language === 'id' ? 'Memuat pesan masuk...' : 'Syncing inbox records...'}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* SINGLE UNIFIED EMPTY STATE - PREVENTS DUPLICATE BOXES */
        <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-12 sm:p-16 text-center text-[#8A94A6] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#181B22] border border-white/5 flex items-center justify-center text-[#383C46] mx-auto">
            <Inbox size={32} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-white font-bold font-display text-base sm:text-lg">
              {submissions.length === 0
                ? (language === 'id' ? 'Kotak Masuk Masih Kosong' : 'No Inbound Records Found')
                : (language === 'id' ? 'Tidak Ada Pesan yang Sesuai Kriteria' : 'No Inbound Records Match Your Filters')}
            </h3>
            <p className="text-xs sm:text-sm text-[#8A94A6] max-w-md mx-auto font-mono leading-relaxed">
              {submissions.length === 0
                ? (language === 'id'
                    ? 'Belum ada brief proyek klien, lamaran karir, atau pesan masuk dari formulir website.'
                    : 'All client project briefs, career applications, and inquiries from the public website will appear here in real time.')
                : (language === 'id'
                    ? 'Sesuaikan kata kunci pencarian, status filter, atau ganti kategori kanal di atas.'
                    : 'Try adjusting your search query, status filters, or switching channel tabs.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {(searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterType !== 'all' || onlyStarred) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setFilterType('all');
                  setOnlyStarred(false);
                }}
                className="h-9 px-4 rounded-xl bg-[#181B22] hover:bg-[#21252F] text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono font-medium transition-colors"
              >
                {language === 'id' ? 'Reset Semua Filter' : 'Reset All Filters'}
              </button>
            )}

            {submissions.length === 0 && (
              <button
                onClick={handleCreateTestSubmission}
                disabled={testSending}
                className="h-9 px-4 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg shadow-[#E50914]/20 disabled:opacity-50"
              >
                <Plus size={14} />
                <span>{testSending ? (language === 'id' ? 'Membuat...' : 'Generating...') : (language === 'id' ? 'Buat Contoh Brief Masuk' : 'Generate Sample Brief')}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* SPLIT MASTER-DETAIL VIEW (when items exist) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Master Briefs List Pane */}
          <div className={`space-y-3 ${
            selectedSubmission 
              ? 'hidden lg:block lg:col-span-5' 
              : 'col-span-12 lg:col-span-5'
          }`}>
            {filteredItems.map((item) => {
              const isSelected = selectedSubmission?.id === item.id;
              const isConverted = isSubmissionConverted(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectSubmission(item)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer font-mono group ${
                    isSelected
                      ? 'bg-[#181B22] border-[#E50914] shadow-lg shadow-[#E50914]/10'
                      : item.status === 'new'
                      ? 'bg-[#111318] border-rose-500/30 hover:border-rose-500/50'
                      : 'bg-[#111318] border-[rgba(255,255,255,0.07)] hover:border-[#383C46] hover:bg-[#181B22]'
                  }`}
                >
                    {/* Linear-style Left Accent Strip */}
                    {isSelected && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-[#E50914] rounded-r-full" />
                    )}

                    {/* Top Row: Channel, Status, Star, Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        {renderChannelBadge(item.type)}
                        {renderStatusBadge(item.status)}
                        {renderPriorityBadge(item.priority)}
                        {isConverted && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                            CRM ✓
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => handleToggleStar(e, item.id, item.starred)}
                          className="p-1 text-[#64748B] hover:text-amber-400 transition-colors"
                        >
                          <Star size={13} className={item.starred ? 'fill-amber-400 text-amber-400' : ''} />
                        </button>
                        <span className="text-[10px] text-[#64748B]">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Client Name & Company */}
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm text-white font-sans truncate">
                        {item.fullName || 'Anonymous Client'}
                      </h3>
                      <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                        {formatAmount(estimateDealValue(item), currency)}
                      </span>
                    </div>

                    <div className="text-xs text-[#8A94A6] truncate mb-2">
                      {item.company || item.positionTitle || item.email}
                    </div>

                    {/* Service Tags */}
                    {item.services && item.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {item.services.slice(0, 3).map((svc, i) => (
                          <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#111318] border border-white/5 text-[#94A3B8]">
                            {svc}
                          </span>
                        ))}
                        {item.services.length > 3 && (
                          <span className="text-[9px] font-mono text-[#64748B] self-center">
                            +{item.services.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message Preview */}
                    <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed font-sans">
                      {item.message || (language === 'id' ? 'Tidak ada isi brief.' : 'No brief body provided.')}
                    </p>

                    {/* Bottom notes indicator if present */}
                    {item.internalNotes && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-amber-400/80">
                        <FileText size={11} />
                        <span className="truncate">{item.internalNotes}</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Right: Message Reader & Command Hub Pane */}
          {selectedSubmission ? (
            <div className="col-span-12 lg:col-span-7 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-7 flex flex-col justify-between shadow-2xl">
              <div>
                
                {/* Mobile Back Button */}
                <div className="lg:hidden mb-4 pb-3 border-b border-[rgba(255,255,255,0.07)]">
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="flex items-center gap-2 text-xs font-mono text-[#8A94A6] hover:text-white transition-colors min-h-[44px]"
                  >
                    <ArrowLeft size={16} />
                    <span>{language === 'id' ? 'Kembali ke Daftar Pesan' : 'Back to Briefs List'}</span>
                  </button>
                </div>

                {/* Reader Header */}
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-[rgba(255,255,255,0.07)] mb-5">
                  <div className="flex items-start gap-3.5">
                    {/* Client Avatar Initials */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#181B22] to-[#21252F] border border-white/10 flex items-center justify-center text-white font-display font-bold text-lg shrink-0 shadow-inner">
                      {selectedSubmission.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {renderChannelBadge(selectedSubmission.type)}
                        {renderStatusBadge(selectedSubmission.status)}
                        <span className="text-[10px] font-mono text-[#64748B]">
                          ID: {selectedSubmission.id}
                        </span>
                      </div>
                      
                      <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                        {selectedSubmission.fullName}
                      </h2>

                      <p className="text-xs text-emerald-400 font-mono mt-0.5 font-semibold flex items-center gap-1.5">
                        <Building2 size={12} />
                        <span>{selectedSubmission.company || selectedSubmission.positionTitle || 'Individual Client'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Star toggle */}
                    <button
                      onClick={(e) => handleToggleStar(e, selectedSubmission.id, selectedSubmission.starred)}
                      className="p-2 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-[#8A94A6] hover:text-amber-400 transition-colors"
                      title="Star this brief"
                    >
                      <Star size={15} className={selectedSubmission.starred ? 'fill-amber-400 text-amber-400' : ''} />
                    </button>

                    {/* Close button on desktop */}
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="hidden lg:inline-flex text-xs text-[#8A94A6] hover:text-white px-3 py-2 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] min-h-[36px] items-center"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Primary Action Ribbon (Quick Canned Replies, WA, Email, Convert to CRM) */}
                <div className="p-3 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] flex flex-wrap items-center justify-between gap-2.5 mb-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 1-Click Convert to CRM Lead */}
                    {isSubmissionConverted(selectedSubmission.id) ? (
                      <Link
                        to="/admin/crm"
                        className="h-9 px-3.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                      >
                        <ShieldCheck size={14} />
                        <span>{language === 'id' ? 'Buka Deal di CRM' : 'View CRM Deal'}</span>
                        <ExternalLink size={11} />
                      </Link>
                    ) : (
                      <button
                        onClick={() => setIsCrmModalOpen(true)}
                        className="h-9 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <Briefcase size={14} />
                        <span>{language === 'id' ? 'Konversi ke CRM' : 'Convert to CRM'}</span>
                      </button>
                    )}

                    {/* Quick Canned Response Template Picker */}
                    <button
                      onClick={() => setIsCannedModalOpen(true)}
                      className="h-9 px-3.5 rounded-lg bg-[#111318] hover:bg-[#21252F] text-white border border-[rgba(255,255,255,0.08)] text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles size={13} className="text-[#FF1E27]" />
                      <span>{language === 'id' ? 'Respon Cepat' : 'Canned Response'}</span>
                    </button>
                  </div>

                  {/* Direct Contact Dispatchers */}
                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp */}
                    {selectedSubmission.phone && cleanPhoneForWhatsApp(selectedSubmission.phone) && (
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(selectedSubmission.phone)}?text=Halo%20${encodeURIComponent(selectedSubmission.fullName)},%20kami%20dari%20Kapitech%20Agency.%20Menindaklanjuti%20formulir%20konsultasi%20proyek%20Anda...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-mono transition-colors flex items-center gap-1"
                        title="Chat via WhatsApp"
                      >
                        <span>WhatsApp</span>
                        <ExternalLink size={11} />
                      </a>
                    )}

                    {/* Mailto */}
                    <a
                      href={`mailto:${selectedSubmission.email}?subject=Kapitech Agency - Project Brief Follow-up&body=Dear ${encodeURIComponent(selectedSubmission.fullName)},%0D%0A%0D%0AThank you for reaching out to Kapitech Agency regarding your project brief.`}
                      className="h-9 px-3 rounded-lg bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-semibold transition-colors flex items-center gap-1 shadow-sm"
                      title="Compose Email"
                    >
                      <Mail size={13} />
                      <span>Email</span>
                    </a>
                  </div>
                </div>

                {/* Reader Sub-Tabs */}
                <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.07)] pb-3 mb-5">
                  <button
                    onClick={() => setDetailTab('brief')}
                    className={`pb-1 text-xs font-mono font-semibold transition-colors border-b-2 ${
                      detailTab === 'brief'
                        ? 'text-white border-[#E50914]'
                        : 'text-[#8A94A6] border-transparent hover:text-white'
                    }`}
                  >
                    {language === 'id' ? 'Detail Brief & Kontak' : 'Brief & Contact Specs'}
                  </button>

                  <button
                    onClick={() => setDetailTab('notes')}
                    className={`pb-1 text-xs font-mono font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
                      detailTab === 'notes'
                        ? 'text-white border-[#E50914]'
                        : 'text-[#8A94A6] border-transparent hover:text-white'
                    }`}
                  >
                    <span>{language === 'id' ? 'Catatan Tim Agensi' : 'Internal Team Notes'}</span>
                    {selectedSubmission.internalNotes && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                </div>

                {/* TAB 1: BRIEF & CONTACT SPECS */}
                {detailTab === 'brief' && (
                  <div className="space-y-5">
                    {/* Contact Specs Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Email Card */}
                      <div className="p-3.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)]">
                        <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6] mb-1">
                          <div className="flex items-center gap-1.5">
                            <Mail size={13} className="text-[#FF1E27]" />
                            <span>Email</span>
                          </div>
                          <button
                            onClick={() => handleCopyText(selectedSubmission.email, 'email')}
                            className="text-[10px] text-[#FF1E27] hover:underline flex items-center gap-1 font-mono"
                          >
                            <Copy size={11} />
                            <span>{copiedId === 'email' ? (language === 'id' ? 'Tersalin!' : 'Copied!') : (language === 'id' ? 'Salin' : 'Copy')}</span>
                          </button>
                        </div>
                        <a 
                          href={`mailto:${selectedSubmission.email}`}
                          className="text-xs font-mono font-medium text-white hover:text-[#FF1E27] transition-colors break-all block"
                        >
                          {selectedSubmission.email}
                        </a>
                      </div>

                      {/* Phone Card */}
                      <div className="p-3.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)]">
                        <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6] mb-1">
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-[#FF1E27]" />
                            <span>WhatsApp / {language === 'id' ? 'Telepon' : 'Phone'}</span>
                          </div>
                          {selectedSubmission.phone && (
                            <button
                              onClick={() => handleCopyText(selectedSubmission.phone || '', 'phone')}
                              className="text-[10px] text-[#FF1E27] hover:underline flex items-center gap-1 font-mono"
                            >
                              <Copy size={11} />
                              <span>{copiedId === 'phone' ? (language === 'id' ? 'Tersalin!' : 'Copied!') : (language === 'id' ? 'Salin' : 'Copy')}</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs font-mono font-medium text-white">
                          {selectedSubmission.phone || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Scope & Budget Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Services */}
                      <div className="p-3.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)]">
                        <div className="flex items-center gap-2 text-xs font-mono text-[#8A94A6] mb-1.5">
                          <Tag size={13} className="text-[#FF1E27]" />
                          <span>{language === 'id' ? 'Layanan / Spesialisasi' : 'Requested Services'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSubmission.services && selectedSubmission.services.length > 0 ? (
                            selectedSubmission.services.map((svc, i) => (
                              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111318] border border-[rgba(255,255,255,0.07)] text-[#D0D4DC]">
                                {svc}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#D0D4DC] font-mono">
                              {selectedSubmission.specialty || selectedSubmission.positionTitle || 'General Consultation'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="p-3.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)]">
                        <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6] mb-1">
                          <div className="flex items-center gap-1.5">
                            <DollarSign size={13} className="text-[#FF1E27]" />
                            <span>{language === 'id' ? 'Estimasi Anggaran' : 'Budget Bracket'}</span>
                          </div>
                          <span className="text-emerald-400 font-bold">
                            {formatAmount(estimateDealValue(selectedSubmission), currency)}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-bold text-white">
                          {selectedSubmission.budget || selectedSubmission.rateCard || (language === 'id' ? 'Tidak ditentukan' : 'Unspecified')}
                        </p>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-mono text-[#8A94A6] uppercase tracking-wider block font-semibold">
                          {language === 'id' ? 'Detail Pesan / Brief Klien' : 'Client Brief Statement'}
                        </label>
                        <button
                          onClick={() => handleCopyText(selectedSubmission.message, 'msg')}
                          className="text-[10px] text-[#8A94A6] hover:text-white flex items-center gap-1 font-mono"
                        >
                          <Copy size={11} />
                          <span>{copiedId === 'msg' ? (language === 'id' ? 'Tersalin' : 'Copied') : (language === 'id' ? 'Salin Brief' : 'Copy Brief')}</span>
                        </button>
                      </div>
                      <div className="p-4 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-xs text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto font-sans shadow-inner">
                        {selectedSubmission.message}
                      </div>
                    </div>

                    {/* Metadata Specs */}
                    <div className="p-3 rounded-xl bg-[#181B22]/50 border border-white/5 text-[11px] font-mono text-[#64748B] grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>{language === 'id' ? 'Kanal Sumber:' : 'Intake Source:'} <span className="text-[#A0AEC0]">{selectedSubmission.source || 'Website Form'}</span></div>
                      <div>{language === 'id' ? 'Waktu Diterima:' : 'Timestamp:'} <span className="text-[#A0AEC0]">{new Date(selectedSubmission.createdAt).toLocaleString()}</span></div>
                      {selectedSubmission.userAgent && (
                        <div className="sm:col-span-2 truncate">{language === 'id' ? 'Klien Browser:' : 'User Agent:'} <span className="text-[#A0AEC0]">{selectedSubmission.userAgent}</span></div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: INTERNAL TEAM NOTES & COLLABORATION */}
                {detailTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono text-white font-semibold flex items-center gap-1.5">
                          <FileText size={14} className="text-[#FF1E27]" />
                          <span>{language === 'id' ? 'Catatan Rahasia Agensi' : 'Private Agency Team Notes'}</span>
                        </label>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {language === 'id' ? 'Hanya terlihat oleh staf AMS' : 'Visible only to AMS staff'}
                        </span>
                      </div>

                      <textarea
                        rows={6}
                        value={internalNoteDraft}
                        onChange={(e) => setInternalNoteDraft(e.target.value)}
                        placeholder={language === 'id' 
                          ? 'Tulis catatan teknis, rangkuman discovery call, kesepakatan timeline, atau petunjuk khusus untuk tim...' 
                          : 'Enter technical scoping notes, discovery call summary, milestone commitments, or specific client instructions...'}
                        className="w-full p-3.5 bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs text-white placeholder:text-[#64748B] font-mono focus:outline-none focus:border-[#E50914] leading-relaxed"
                      />

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          disabled={isSavingNote}
                          onClick={handleSaveInternalNote}
                          className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#E50914]/20"
                        >
                          <Check size={14} />
                          <span>{isSavingNote ? (language === 'id' ? 'Menyimpan...' : 'Saving...') : (language === 'id' ? 'Simpan Catatan' : 'Save Notes')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Assigned Owner Setting */}
                    <div className="p-4 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] space-y-2">
                      <label className="text-xs font-mono text-[#8A94A6] flex items-center gap-1.5">
                        <User size={13} className="text-emerald-400" />
                        <span>{language === 'id' ? 'Penanggung Jawab Kualifikasi' : 'Assigned Triage Lead'}</span>
                      </label>
                      <select
                        value={selectedSubmission.assignedTo || 'Lead Full-Stack Tech'}
                        onChange={(e) => handleAssigneeChange(selectedSubmission.id, e.target.value)}
                        className="w-full px-3 py-2 bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Lead Full-Stack Tech">Lead Full-Stack Tech (Engineering)</option>
                        <option value="Senior UI/UX Designer">Senior UI/UX Designer (Design)</option>
                        <option value="Technical Project Manager">Technical Project Manager (Scoping)</option>
                        <option value="Business Director">Business Director (Accounts)</option>
                      </select>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Status & Priority Controls Bar */}
              <div className="pt-5 mt-6 border-t border-[rgba(255,255,255,0.07)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Status Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-[#8A94A6]">Status:</span>
                    <select
                      disabled={isUpdating}
                      value={selectedSubmission.status}
                      onChange={(e) => handleStatusChange(selectedSubmission.id, e.target.value as ContactSubmission['status'])}
                      className="text-xs py-2 px-3 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[38px]"
                    >
                      <option value="new">New</option>
                      <option value="in-review">In Review</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed Deal</option>
                    </select>
                  </div>

                  {/* Priority Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-[#8A94A6]">Priority:</span>
                    <select
                      value={selectedSubmission.priority || 'normal'}
                      onChange={(e) => handlePriorityChange(selectedSubmission.id, e.target.value as ContactSubmission['priority'])}
                      className="text-xs py-2 px-3 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[38px]"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="h-10 w-10 p-2 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-[#8A94A6] hover:text-red-400 hover:border-red-500/40 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title={language === 'id' ? 'Hapus pesan ini secara permanen' : 'Delete this brief permanently'}
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ) : (
            /* Empty State on Desktop when no submission is selected */
            <div className="hidden lg:flex lg:col-span-7 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-12 flex-col items-center justify-center text-center text-[#8A94A6] min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-[#181B22] border border-white/5 flex items-center justify-center text-[#383C46] mb-4">
                <Inbox size={32} />
              </div>
              <h3 className="text-white font-medium mb-1 font-display text-base">
                {language === 'id' ? 'Pilih Pesan untuk Membaca Brief' : 'Select a Brief to Inspect'}
              </h3>
              <p className="text-xs text-[#8A94A6] max-w-sm font-mono leading-relaxed">
                {language === 'id'
                  ? 'Klik salah satu pesan di sebelah kiri untuk melihat rincian brief, template respon cepat, kontak WhatsApp/Email, dan konversi ke pipeline CRM.'
                  : 'Click any submission on the left to examine technical brief specs, dispatch executive canned responses, and convert into active CRM deals.'}
              </p>
            </div>
          )}

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODALS & DIALOGS */}
      {/* ------------------------------------------------------------- */}
      
      {/* Canned Responses Template Modal */}
      {selectedSubmission && (
        <CannedResponsesModal
          isOpen={isCannedModalOpen}
          onClose={() => setIsCannedModalOpen(false)}
          submission={selectedSubmission}
        />
      )}

      {/* Convert to CRM Lead Modal */}
      {selectedSubmission && (
        <ConvertToCrmModal
          isOpen={isCrmModalOpen}
          onClose={() => setIsCrmModalOpen(false)}
          submission={selectedSubmission}
          onConverted={(leadId, dealVal) => {
            setToastMessage({
              text: language === 'id'
                ? `Lead "${selectedSubmission.fullName}" berhasil dikonversi ke CRM Pipeline (${formatAmount(dealVal, currency)})!`
                : `Lead "${selectedSubmission.fullName}" converted to CRM Pipeline (${formatAmount(dealVal, currency)})!`,
              link: '/admin/crm',
              linkText: language === 'id' ? 'Buka CRM' : 'Open CRM'
            });
            setTimeout(() => setToastMessage(null), 5000);
          }}
        />
      )}

      {/* Email Forwarding Guide Modal */}
      <EmailForwardingGuideModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        adminEmail="kapitechagency@gmail.com"
      />

    </div>
  );
};

export default AdminInbox;
