import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Search, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Tag,
  DollarSign,
  Briefcase,
  Globe,
  Download,
  Copy,
  Plus,
  Send,
  Sparkles,
  Layers,
  FileSpreadsheet,
  BellRing,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { 
  ContactSubmission, 
  subscribeToInbox, 
  updateSubmissionStatus, 
  deleteSubmission, 
  submitToInbox 
} from '../../lib/submissions';
import { 
  convertInquiryToCrmLead, 
  isSubmissionConverted,
  formatIDR 
} from '../../lib/crmStore';
import { playNotificationSound, requestDesktopNotificationPermission, showDesktopNotification } from '../../lib/notifications';
import { EmailForwardingGuideModal } from '../../components/EmailForwardingGuideModal';
import { useLanguage } from '../../lib/LanguageContext';

export const AdminInbox: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevCount, setPrevCount] = useState<number | null>(null);
  const [convertToast, setConvertToast] = useState<string | null>(null);

  useEffect(() => {
    // Request desktop notification permission
    requestDesktopNotificationPermission();

    // Subscribe to unified live submissions
    const unsubscribe = subscribeToInbox((items) => {
      setSubmissions(items);

      // Trigger audio & desktop alert if new item arrived
      if (prevCount !== null && items.length > prevCount) {
        const latest = items[0];
        if (soundEnabled) {
          playNotificationSound();
        }
        showDesktopNotification(
          `Pesan Baru Masuk: ${latest?.fullName || 'Klien Baru'}`,
          `${latest?.company ? latest.company + ' - ' : ''}${latest?.message?.substring(0, 80)}...`
        );
      }
      setPrevCount(items.length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [prevCount, soundEnabled]);

  const handleConvertToCrm = (submission: ContactSubmission) => {
    const res = convertInquiryToCrmLead(submission);
    if (res.success) {
      setConvertToast(`Berhasil! Lead "${submission.fullName}" telah dikonversi ke Agency CRM Pipeline (${formatIDR(res.lead.dealValue)}).`);
      setTimeout(() => setConvertToast(null), 4000);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ContactSubmission['status']) => {
    setIsUpdating(true);
    try {
      await updateSubmissionStatus(id, newStatus);
      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pesan ini dari database?')) return;
    try {
      await deleteSubmission(id);
      if (selectedSubmission?.id === id) setSelectedSubmission(null);
    } catch (err) {
      console.error('Failed to delete submission:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = submissions.filter(s => s.status === 'new');
    if (unread.length === 0) return;
    if (!window.confirm(`Tandai ${unread.length} pesan baru sebagai 'In Review'?`)) return;

    for (const item of unread) {
      await updateSubmissionStatus(item.id, 'in-review');
    }
  };

  const handleCreateTestSubmission = async () => {
    setTestSending(true);
    try {
      const sampleNames = ['Rian Pratama', 'Jessica Chandra', 'Dimas Prasetyo', 'Siti Rahmawati', 'Marcus Vance'];
      const sampleCompanies = ['PT Nusantara Fintek', 'Aero Media Global', 'Veritas Creative Co', 'Kopi Senja Labs', 'BrightScale SaaS'];
      const sampleServices = [['UI/UX Design', 'MVP Development'], ['Pitch Deck', 'Brand Identity'], ['Web Development'], ['Corporate Websites']];
      
      const randomIdx = Math.floor(Math.random() * sampleNames.length);
      const name = sampleNames[randomIdx];
      const company = sampleCompanies[randomIdx];
      const services = sampleServices[Math.floor(Math.random() * sampleServices.length)];

      await submitToInbox({
        fullName: name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        company: company,
        phone: '+62 812-3456-' + Math.floor(1000 + Math.random() * 9000),
        services: services,
        budget: '$5,000 - $15,000',
        message: `Halo Tim Kapitech, kami dari ${company} ingin berkonsultasi mengenai perancangan produk digital baru kami. Mohon feedback dan penjadwalan discovery call. Terima kasih!`,
        source: 'Admin Live Simulation',
        type: 'inquiry'
      });
    } catch (e) {
      console.error('Error creating test submission:', e);
    } finally {
      setTestSending(false);
    }
  };

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Status', 'Full Name', 'Email', 'Company', 'Phone', 'Services', 'Budget', 'Message', 'Source'];
    const rows = submissions.map(s => [
      `"${s.id}"`,
      `"${new Date(s.createdAt).toLocaleString()}"`,
      `"${s.type || 'inquiry'}"`,
      `"${s.status}"`,
      `"${(s.fullName || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.company || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.services?.join(', ') || '').replace(/"/g, '""')}"`,
      `"${(s.budget || '').replace(/"/g, '""')}"`,
      `"${(s.message || '').replace(/"/g, '""')}"`,
      `"${(s.source || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kapitech_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = submissions.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || (item.type || 'inquiry') === filterType;
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (item.fullName || '').toLowerCase().includes(queryLower) ||
      (item.email || '').toLowerCase().includes(queryLower) ||
      (item.company || '').toLowerCase().includes(queryLower) ||
      (item.message || '').toLowerCase().includes(queryLower) ||
      (item.source || '').toLowerCase().includes(queryLower) ||
      (item.positionTitle || '').toLowerCase().includes(queryLower);
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold animate-pulse">New Lead</span>;
      case 'in-review':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">In Review</span>;
      case 'contacted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">Contacted</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Closed Deal</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#16181D] text-[#8A909D] border border-[#262930]">{status}</span>;
    }
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'career':
        return (
          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono flex items-center gap-1">
            <Briefcase size={10} />
            <span>Studio Role</span>
          </span>
        );
      case 'vendor':
        return (
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono flex items-center gap-1">
            <Globe size={10} />
            <span>Freelance Vendor</span>
          </span>
        );
      case 'newsletter':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono flex items-center gap-1">
            <Sparkles size={10} />
            <span>Newsletter</span>
          </span>
        );
      case 'inquiry':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-brand-red/10 border border-brand-red/30 text-brand-red text-[10px] font-mono flex items-center gap-1 font-semibold">
            <MessageSquare size={10} />
            <span>Client Inquiry</span>
          </span>
        );
    }
  };

  const cleanPhoneForWhatsApp = (rawPhone?: string) => {
    if (!rawPhone) return '';
    let digits = rawPhone.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '62' + digits.substring(1);
    return digits;
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {convertToast && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-400" />
            <span>{convertToast}</span>
          </div>
          <Link
            to="/admin/crm"
            className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors flex items-center gap-1 shrink-0 ml-3"
          >
            <span>Buka CRM</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HEADER BAR & TOOLS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#262930]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
              <Inbox size={18} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Leads & Inquiry Inbox
            </h1>
            <span className="text-xs font-mono py-0.5 px-2.5 bg-[#16181D] border border-[#262930] rounded-full text-[#8A909D]">
              {submissions.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A909D]">
            Pusat manajemen dan tindak lanjut seluruh pesan dari formulir /contact, /careers, vendor freelance, dan newsletter.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-mono transition-colors flex items-center gap-1.5 ${
              soundEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-[#16181D] border-[#262930] text-[#8A909D]'
            }`}
            title={soundEnabled ? 'Notifikasi Suara: Aktif' : 'Notifikasi Suara: Nonaktif'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Email alerts config */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-brand-red/20"
          >
            <Mail size={13} />
            <span>Set Email Alerts</span>
          </button>

          {/* Mark all read */}
          {submissions.some(s => s.status === 'new') && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-2 rounded-xl bg-[#16181D] hover:bg-[#20232B] text-[#8A909D] hover:text-white border border-[#262930] text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Check size={13} />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}

          {/* Simulate Test */}
          <button
            onClick={handleCreateTestSubmission}
            disabled={testSending}
            className="px-3 py-2 rounded-xl bg-[#16181D] hover:bg-[#20232B] text-white border border-[#262930] text-xs font-mono transition-colors flex items-center gap-1.5"
          >
            {testSending ? <RefreshCw className="animate-spin text-brand-red" size={13} /> : <Plus size={13} className="text-brand-red" />}
            <span>{language === 'id' ? 'Simulasi Lead Baru' : 'Simulate Lead'}</span>
          </button>

          {/* Export CSV */}
          {submissions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-[#16181D] hover:bg-[#20232B] text-[#8A909D] hover:text-white border border-[#262930] text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FILTER TABS & SEARCH */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'Semua Form' },
            { key: 'inquiry', label: 'Konsultasi Klien' },
            { key: 'career', label: 'Lamaran Karir' },
            { key: 'vendor', label: 'Freelance Vendor' },
            { key: 'newsletter', label: 'Newsletter' }
          ].map((tab) => {
            const count = tab.key === 'all' 
              ? submissions.length 
              : submissions.filter(s => (s.type || 'inquiry') === tab.key).length;

            return (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-2 border ${
                  filterType === tab.key
                    ? 'bg-brand-red text-white border-brand-red font-bold shadow-sm'
                    : 'bg-[#16181D] text-[#8A909D] border-[#262930] hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterType === tab.key ? 'bg-black/30 text-white' : 'bg-[#0B0C0E] text-[#8A909D]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A909D]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama klien, email, perusahaan, jasa, atau isi pesan..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#16181D] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red placeholder:text-[#5C626E] font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#8A909D] shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2.5 px-3 bg-[#16181D] border border-[#262930] rounded-xl text-xs text-white focus:outline-none focus:border-brand-red font-mono"
            >
              <option value="all">Semua Status</option>
              <option value="new">Status: New</option>
              <option value="in-review">Status: In Review</option>
              <option value="contacted">Status: Contacted</option>
              <option value="closed">Status: Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN INBOX TWO-PANE VIEW (Desktop) / RESPONSIVE SINGLE-PANE (Mobile) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Message List Pane (Hidden on mobile if a submission is selected) */}
        <div className={`space-y-3 ${
          selectedSubmission 
            ? 'hidden lg:block lg:col-span-5' 
            : 'col-span-12'
        }`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#8A909D] space-y-3">
              <RefreshCw className="animate-spin text-brand-red" size={24} />
              <p className="text-xs font-mono">Memuat database lead...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-[#16181D] border border-[#262930] rounded-2xl p-10 text-center text-[#8A909D]">
              <MessageSquare className="mx-auto mb-3 text-[#5C626E]" size={36} />
              <h3 className="text-white font-medium mb-1">Tidak Ada Pesan yang Sesuai</h3>
              <p className="text-xs max-w-md mx-auto text-[#8A909D] mb-4 font-mono">
                Coba ubah kata kunci pencarian atau reset filter.
              </p>
              <button
                onClick={handleCreateTestSubmission}
                className="px-4 py-2 rounded-xl bg-brand-red text-white text-xs font-mono font-bold hover:bg-brand-red/90 transition-all inline-flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Simulasi Lead Masuk</span>
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedSubmission(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedSubmission?.id === item.id 
                    ? 'bg-[#1E222A] border-brand-red shadow-lg shadow-brand-red/10' 
                    : 'bg-[#16181D] border-[#262930] hover:border-[#383C46] hover:bg-[#1A1D24]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getTypeBadge(item.type)}
                      {getStatusBadge(item.status)}
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate">
                      {item.fullName}
                    </h3>
                    <p className="text-xs text-[#8A909D] truncate font-mono">
                      {item.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-mono text-[#5C626E] flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-mono text-[#5C626E]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#8A909D] line-clamp-2 mb-3 font-light leading-relaxed">
                  {item.message}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#5C626E] pt-2.5 border-t border-[#262930]">
                  <span className="truncate max-w-[180px]">{item.company || item.specialty || item.positionTitle || 'Direct Lead'}</span>
                  <div className="flex items-center gap-1.5">
                    {isSubmissionConverted(item.id) && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        IN CRM
                      </span>
                    )}
                    <span className="text-brand-red text-[10px] font-bold">{item.budget ? `${item.budget}` : 'Review'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Message Reader Pane */}
        {selectedSubmission ? (
          <div className="col-span-12 lg:col-span-7 bg-[#16181D] border border-[#262930] rounded-2xl p-5 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Mobile Back Button */}
              <div className="lg:hidden mb-4 pb-3 border-b border-[#262930]">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex items-center gap-2 text-xs font-mono text-[#8A909D] hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali ke Daftar Pesan</span>
                </button>
              </div>

              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#262930] mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getTypeBadge(selectedSubmission.type)}
                    {getStatusBadge(selectedSubmission.status)}
                    <span className="text-[10px] font-mono text-[#5C626E]">
                      ID: {selectedSubmission.id}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    {selectedSubmission.fullName}
                  </h2>
                  <p className="text-xs text-brand-red font-mono mt-0.5 font-semibold">
                    {selectedSubmission.company || selectedSubmission.positionTitle || selectedSubmission.specialty || 'General Inquiry'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="hidden lg:inline-flex text-xs text-[#8A909D] hover:text-white px-2.5 py-1 rounded-lg bg-[#0B0C0E] border border-[#262930]"
                >
                  ✕ Tutup
                </button>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8A909D] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="text-brand-red" />
                      <span>Email</span>
                    </div>
                    <button
                      onClick={() => handleCopyEmail(selectedSubmission.email, selectedSubmission.id)}
                      className="text-[10px] text-brand-red hover:underline flex items-center gap-1 font-mono"
                    >
                      <Copy size={10} />
                      <span>{copiedId === selectedSubmission.id ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                  <a 
                    href={`mailto:${selectedSubmission.email}`}
                    className="text-xs font-mono font-medium text-white hover:text-brand-red transition-colors break-all block"
                  >
                    {selectedSubmission.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8A909D] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="text-brand-red" />
                      <span>WhatsApp / Telepon</span>
                    </div>
                    {selectedSubmission.phone && cleanPhoneForWhatsApp(selectedSubmission.phone) && (
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(selectedSubmission.phone)}?text=Halo%20${encodeURIComponent(selectedSubmission.fullName)},%20kami%20dari%20Kapitech%20Agency...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 font-mono"
                      >
                        <span>Chat WA</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs font-mono font-medium text-white">
                    {selectedSubmission.phone || '-'}
                  </p>
                </div>
              </div>

              {/* Service & Budget Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8A909D] mb-1.5">
                    <Tag size={14} className="text-brand-red" />
                    <span>{selectedSubmission.specialty ? 'Keahlian / Posisi' : 'Layanan Diminta'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubmission.services && selectedSubmission.services.length > 0 ? (
                      selectedSubmission.services.map((svc, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16181D] border border-[#262930] text-[#D0D4DC]">
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

                <div className="p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8A909D] mb-1">
                    <DollarSign size={14} className="text-brand-red" />
                    <span>{selectedSubmission.rateCard ? 'Rate Card' : 'Estimasi Anggaran'}</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-white">
                    {selectedSubmission.rateCard || selectedSubmission.budget || 'Tidak ditentukan'}
                  </p>
                </div>
              </div>

              {/* Message Body */}
              <div className="mb-5">
                <label className="text-xs font-mono text-[#8A909D] uppercase tracking-wider block mb-2 font-semibold">
                  Detail Pesan / Brief Klien
                </label>
                <div className="p-4 rounded-xl bg-[#0B0C0E] border border-[#262930] text-xs text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto font-sans">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Submission Metadata */}
              <div className="text-[10px] font-mono text-[#5C626E] space-y-1 mb-5">
                <div>Sumber: <span className="text-[#8A909D]">{selectedSubmission.source || 'Website Form'}</span></div>
                <div>Waktu Pengiriman: <span className="text-[#8A909D]">{new Date(selectedSubmission.createdAt).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-5 border-t border-[#262930] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8A909D]">Status:</span>
                <select
                  disabled={isUpdating}
                  value={selectedSubmission.status}
                  onChange={(e) => handleStatusChange(selectedSubmission.id, e.target.value as ContactSubmission['status'])}
                  className="text-xs py-1.5 px-2.5 bg-[#0B0C0E] border border-[#262930] rounded-lg text-white focus:outline-none focus:border-brand-red font-mono"
                >
                  <option value="new">New</option>
                  <option value="in-review">In Review</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed Deal</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleConvertToCrm(selectedSubmission)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors flex items-center gap-1.5 border ${
                    isSubmissionConverted(selectedSubmission.id)
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-[#16181D] text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                  title="Konversi prospek ini ke pipeline deal Agency CRM"
                >
                  <Briefcase size={13} className="text-emerald-400" />
                  <span>{isSubmissionConverted(selectedSubmission.id) ? 'Di CRM ✓' : 'Konversi ke CRM'}</span>
                </button>

                <a
                  href={`mailto:${selectedSubmission.email}?subject=Kapitech Agency - Tanggapan Pesan Konsultasi Proyek&body=Halo ${encodeURIComponent(selectedSubmission.fullName)},%0D%0A%0D%0ATerima kasih telah menghubungi tim Kapitech Agency.%0D%0A%0D%0A`}
                  className="px-3 py-1.5 rounded-lg bg-brand-red text-white text-xs font-semibold hover:bg-brand-red/90 transition-colors flex items-center gap-1.5 shadow-md shadow-brand-red/20 font-mono"
                >
                  <Mail size={13} />
                  <span>Balas Email</span>
                </a>

                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="p-1.5 rounded-lg bg-[#0B0C0E] border border-[#262930] text-[#8A909D] hover:text-red-400 hover:border-red-500/40 transition-colors"
                  title="Hapus data pesan ini"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty selection state on Desktop */
          <div className="hidden lg:flex lg:col-span-7 bg-[#16181D] border border-[#262930] rounded-2xl p-12 flex-col items-center justify-center text-center text-[#8A909D] min-h-[400px]">
            <Inbox size={40} className="text-[#383C46] mb-3" />
            <h3 className="text-white font-medium mb-1">Pilih Pesan untuk Membaca</h3>
            <p className="text-xs text-[#8A909D] max-w-xs font-mono">
              Klik salah satu pesan di sebelah kiri untuk melihat rincian brief, kontak, dan opsi konversi ke CRM.
            </p>
          </div>
        )}

      </div>

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
