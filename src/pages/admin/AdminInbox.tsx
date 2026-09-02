import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Mail, 
  Phone, 
  CheckCircle2, 
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
  DollarSign
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
          language === 'id' 
            ? `Pesan Baru Masuk: ${latest?.fullName || 'Klien Baru'}` 
            : `New Message: ${latest?.fullName || 'New Client'}`,
          `${latest?.company ? latest.company + ' - ' : ''}${latest?.message?.substring(0, 80)}...`
        );
      }
      setPrevCount(items.length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [prevCount, soundEnabled, language]);

  const handleConvertToCrm = (submission: ContactSubmission) => {
    const res = convertInquiryToCrmLead(submission);
    if (res.success) {
      setConvertToast(
        language === 'id'
          ? `Berhasil! Lead "${submission.fullName}" telah dikonversi ke Agency CRM Pipeline (${formatIDR(res.lead.dealValue)}).`
          : `Success! Lead "${submission.fullName}" converted to Agency CRM Pipeline (${formatIDR(res.lead.dealValue)}).`
      );
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
    const confirmMsg = language === 'id' 
      ? 'Apakah Anda yakin ingin menghapus data pesan ini dari database?' 
      : 'Are you sure you want to permanently delete this submission?';
    if (!window.confirm(confirmMsg)) return;
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
    const confirmMsg = language === 'id' 
      ? `Tandai ${unread.length} pesan baru sebagai 'In Review'?` 
      : `Mark ${unread.length} new messages as 'In Review'?`;
    if (!window.confirm(confirmMsg)) return;

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
        message: language === 'id' 
          ? `Halo Tim Kapitech, kami dari ${company} ingin berkonsultasi mengenai perancangan produk digital baru kami. Mohon feedback dan penjadwalan discovery call. Terima kasih!`
          : `Hello Kapitech Team, we are from ${company} interested in architecting our new digital product. Looking forward to your discovery call schedule. Thanks!`,
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
      `"${s.fullName || ''}"`,
      `"${s.email || ''}"`,
      `"${s.company || ''}"`,
      `"${s.phone || ''}"`,
      `"${(s.services || []).join(', ')}"`,
      `"${s.budget || ''}"`,
      `"${(s.message || '').replace(/"/g, '""')}"`,
      `"${s.source || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kapitech_inbox_${new Date().toISOString().split('T')[0]}.csv`);
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
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold animate-pulse">New</span>;
      case 'in-review':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">In Review</span>;
      case 'contacted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">Contacted</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Closed Deal</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#111318] text-[#8A94A6] border border-[rgba(255,255,255,0.07)]">{status}</span>;
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
          <span className="px-2 py-0.5 rounded bg-[#E50914]/10 border border-[#E50914]/30 text-[#FF1E27] text-[10px] font-mono flex items-center gap-1 font-semibold">
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
            <span>{language === 'id' ? 'Buka CRM' : 'Open CRM'}</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HEADER BAR & TOOLS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#FF1E27] shrink-0">
              <Inbox size={18} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {language === 'id' ? 'Kotak Masuk Prospek & Pesan' : 'Leads & Inquiry Inbox'}
            </h1>
            <span className="text-xs font-mono py-0.5 px-2.5 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-full text-[#8A94A6]">
              {submissions.length} {language === 'id' ? 'Pesan' : 'Records'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A94A6] font-mono">
            {language === 'id'
              ? 'Pusat manajemen dan tindak lanjut seluruh pesan formulir kontak, karir, freelance, dan newsletter.'
              : 'Unified inbound hub for client briefs, career roles, freelance vendor applications, and subscriptions.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`h-10 w-10 p-2.5 rounded-xl border text-xs font-mono transition-colors flex items-center gap-1.5 min-h-[40px] min-w-[40px] justify-center ${
              soundEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-[#111318] border-[rgba(255,255,255,0.07)] text-[#8A94A6]'
            }`}
            title={soundEnabled ? (language === 'id' ? 'Notifikasi Suara: Aktif' : 'Sound Alerts: On') : (language === 'id' ? 'Notifikasi Suara: Nonaktif' : 'Sound Alerts: Off')}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Email alerts config */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#E50914]/20 min-h-[40px]"
          >
            <Mail size={14} />
            <span>{language === 'id' ? 'Notifikasi Email' : 'Email Alerts'}</span>
          </button>

          {/* Mark all read */}
          {submissions.some(s => s.status === 'new') && (
            <button
              onClick={handleMarkAllRead}
              className="h-10 px-4 rounded-xl bg-[#111318] hover:bg-[#181B22] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono transition-colors flex items-center gap-1.5 min-h-[40px]"
            >
              <Check size={14} />
              <span>{language === 'id' ? 'Tandai Dibaca' : 'Mark Read'}</span>
            </button>
          )}

          {/* Simulate Test */}
          <button
            onClick={handleCreateTestSubmission}
            disabled={testSending}
            className="h-10 px-4 rounded-xl bg-[#111318] hover:bg-[#181B22] text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono transition-colors flex items-center gap-1.5 min-h-[40px]"
          >
            {testSending ? <RefreshCw className="animate-spin text-[#FF1E27]" size={14} /> : <Plus size={14} className="text-[#FF1E27]" />}
            <span>{language === 'id' ? 'Simulasi Lead Baru' : 'Simulate Lead'}</span>
          </button>

          {/* Export CSV */}
          {submissions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="h-10 px-4 rounded-xl bg-[#111318] hover:bg-[#181B22] text-[#8A94A6] hover:text-white border border-[rgba(255,255,255,0.07)] text-xs font-mono transition-colors flex items-center gap-1.5 min-h-[40px]"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FILTER TABS & SEARCH (IN-CARD UNIFIED SEARCH) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] p-4 sm:p-5 rounded-2xl space-y-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: language === 'id' ? 'Semua Form' : 'All Messages' },
            { key: 'inquiry', label: language === 'id' ? 'Konsultasi Klien' : 'Client Inquiries' },
            { key: 'career', label: language === 'id' ? 'Lamaran Karir' : 'Career Applications' },
            { key: 'vendor', label: language === 'id' ? 'Freelance Vendor' : 'Vendor Applications' },
            { key: 'newsletter', label: language === 'id' ? 'Newsletter' : 'Newsletter' }
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

        {/* Search & Status Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A94A6]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'id' ? 'Cari nama klien, email, perusahaan, jasa, atau isi pesan...' : 'Search client name, email, company, service, or message...'}
              className="w-full pl-10 pr-4 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] placeholder:text-[#64748B] font-mono h-10 min-h-[40px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#8A94A6] shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914] font-mono h-10 min-h-[40px]"
            >
              <option value="all">{language === 'id' ? 'Semua Status' : 'All Status'}</option>
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
            <div className="flex flex-col items-center justify-center py-20 text-[#8A94A6] space-y-3">
              <RefreshCw className="animate-spin text-[#E50914]" size={24} />
              <p className="text-xs font-mono">{language === 'id' ? 'Memuat pesan masuk...' : 'Loading inbox messages...'}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl text-[#8A94A6] space-y-3">
              <Inbox size={36} className="mx-auto text-[#383C46]" />
              <p className="text-sm font-medium text-white">{language === 'id' ? 'Tidak ada pesan ditemukan' : 'No messages found'}</p>
              <p className="text-xs font-mono">{language === 'id' ? 'Sesuaikan kata kunci pencarian atau filter status Anda.' : 'Try adjusting your search query or status filter.'}</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedSubmission?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedSubmission(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer font-mono ${
                    isSelected
                      ? 'bg-[#181B22] border-[#E50914] shadow-lg shadow-[#E50914]/10'
                      : item.status === 'new'
                      ? 'bg-[#111318] border-rose-500/30 hover:border-rose-500/50'
                      : 'bg-[#111318] border-[rgba(255,255,255,0.07)] hover:border-[#383C46] hover:bg-[#181B22]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {getTypeBadge(item.type)}
                      {getStatusBadge(item.status)}
                    </div>
                    <span className="text-[10px] text-[#64748B] shrink-0">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-white truncate mb-0.5">
                    {item.fullName || 'Anonymous Client'}
                  </div>

                  <div className="text-xs text-[#8A94A6] truncate mb-2">
                    {item.company || item.positionTitle || item.email}
                  </div>

                  <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed font-sans">
                    {item.message || (language === 'id' ? 'Tidak ada isi pesan.' : 'No message body provided.')}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Message Reader Pane */}
        {selectedSubmission ? (
          <div className="col-span-12 lg:col-span-7 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-5 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Mobile Back Button */}
              <div className="lg:hidden mb-4 pb-3 border-b border-[rgba(255,255,255,0.07)]">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="flex items-center gap-2 text-xs font-mono text-[#8A94A6] hover:text-white transition-colors min-h-[44px]"
                >
                  <ArrowLeft size={16} />
                  <span>{language === 'id' ? 'Kembali ke Daftar Pesan' : 'Back to Messages List'}</span>
                </button>
              </div>

              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-[rgba(255,255,255,0.07)] mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {getTypeBadge(selectedSubmission.type)}
                    {getStatusBadge(selectedSubmission.status)}
                    <span className="text-[10px] font-mono text-[#64748B]">
                      ID: {selectedSubmission.id}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    {selectedSubmission.fullName}
                  </h2>
                  <p className="text-xs text-[#FF1E27] font-mono mt-0.5 font-semibold">
                    {selectedSubmission.company || selectedSubmission.positionTitle || selectedSubmission.specialty || 'General Inquiry'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="hidden lg:inline-flex text-xs text-[#8A94A6] hover:text-white px-3 py-1.5 rounded-lg bg-[#181B22] border border-[rgba(255,255,255,0.07)] min-h-[36px] items-center"
                >
                  ✕ {language === 'id' ? 'Tutup' : 'Close'}
                </button>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)]">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="text-[#FF1E27]" />
                      <span>Email</span>
                    </div>
                    <button
                      onClick={() => handleCopyEmail(selectedSubmission.email, selectedSubmission.id)}
                      className="text-[10px] text-[#FF1E27] hover:underline flex items-center gap-1 font-mono min-h-[28px]"
                    >
                      <Copy size={11} />
                      <span>{copiedId === selectedSubmission.id ? (language === 'id' ? 'Tersalin!' : 'Copied!') : (language === 'id' ? 'Salin' : 'Copy')}</span>
                    </button>
                  </div>
                  <a 
                    href={`mailto:${selectedSubmission.email}`}
                    className="text-xs font-mono font-medium text-white hover:text-[#FF1E27] transition-colors break-all block"
                  >
                    {selectedSubmission.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)]">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8A94A6] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="text-[#FF1E27]" />
                      <span>WhatsApp / {language === 'id' ? 'Telepon' : 'Phone'}</span>
                    </div>
                    {selectedSubmission.phone && cleanPhoneForWhatsApp(selectedSubmission.phone) && (
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(selectedSubmission.phone)}?text=Halo%20${encodeURIComponent(selectedSubmission.fullName)},%20kami%20dari%20Kapitech%20Agency...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 font-mono min-h-[28px]"
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
                <div className="p-3.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8A94A6] mb-1.5">
                    <Tag size={14} className="text-[#FF1E27]" />
                    <span>{selectedSubmission.specialty ? (language === 'id' ? 'Keahlian / Posisi' : 'Specialty / Role') : (language === 'id' ? 'Layanan Diminta' : 'Requested Services')}</span>
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

                <div className="p-3.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8A94A6] mb-1">
                    <DollarSign size={14} className="text-[#FF1E27]" />
                    <span>{selectedSubmission.rateCard ? 'Rate Card' : (language === 'id' ? 'Estimasi Anggaran' : 'Budget Estimate')}</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-white">
                    {selectedSubmission.rateCard || selectedSubmission.budget || (language === 'id' ? 'Tidak ditentukan' : 'Unspecified')}
                  </p>
                </div>
              </div>

              {/* Message Body */}
              <div className="mb-5">
                <label className="text-xs font-mono text-[#8A94A6] uppercase tracking-wider block mb-2 font-semibold">
                  {language === 'id' ? 'Detail Pesan / Brief Klien' : 'Message Body / Client Brief'}
                </label>
                <div className="p-4 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-xs text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto font-sans">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Submission Metadata */}
              <div className="text-[10px] font-mono text-[#64748B] space-y-1 mb-5">
                <div>{language === 'id' ? 'Sumber:' : 'Source:'} <span className="text-[#8A94A6]">{selectedSubmission.source || 'Website Form'}</span></div>
                <div>{language === 'id' ? 'Waktu Pengiriman:' : 'Received:'} <span className="text-[#8A94A6]">{new Date(selectedSubmission.createdAt).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-5 border-t border-[rgba(255,255,255,0.07)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8A94A6]">Status:</span>
                <select
                  disabled={isUpdating}
                  value={selectedSubmission.status}
                  onChange={(e) => handleStatusChange(selectedSubmission.id, e.target.value as ContactSubmission['status'])}
                  className="text-xs py-2 px-3 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-lg text-white focus:outline-none focus:border-[#E50914] font-mono min-h-[40px]"
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
                  className={`h-10 px-4 rounded-xl text-xs font-semibold font-mono transition-colors flex items-center gap-1.5 border min-h-[40px] ${
                    isSubmissionConverted(selectedSubmission.id)
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-[#181B22] text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                  title={language === 'id' ? 'Konversi prospek ini ke pipeline deal Agency CRM' : 'Convert this inquiry to Agency CRM pipeline'}
                >
                  <Briefcase size={14} className="text-emerald-400" />
                  <span>{isSubmissionConverted(selectedSubmission.id) ? (language === 'id' ? 'Di CRM ✓' : 'In CRM ✓') : (language === 'id' ? 'Konversi ke CRM' : 'Convert to CRM')}</span>
                </button>

                <a
                  href={`mailto:${selectedSubmission.email}?subject=Kapitech Agency - Inquiry Response&body=Hello ${encodeURIComponent(selectedSubmission.fullName)},%0D%0A%0D%0AThank you for reaching out to Kapitech Agency.%0D%0A%0D%0A`}
                  className="h-10 px-4 rounded-xl bg-[#E50914] text-white text-xs font-semibold hover:bg-[#FF1E27] transition-colors flex items-center gap-1.5 shadow-md shadow-[#E50914]/20 font-mono min-h-[40px]"
                >
                  <Mail size={14} />
                  <span>{language === 'id' ? 'Balas Email' : 'Reply Email'}</span>
                </a>

                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="h-10 w-10 p-2 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-[#8A94A6] hover:text-red-400 hover:border-red-500/40 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title={language === 'id' ? 'Hapus data pesan ini' : 'Delete this message'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty selection state on Desktop */
          <div className="hidden lg:flex lg:col-span-7 bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-2xl p-12 flex-col items-center justify-center text-center text-[#8A94A6] min-h-[400px]">
            <Inbox size={40} className="text-[#383C46] mb-3" />
            <h3 className="text-white font-medium mb-1">{language === 'id' ? 'Pilih Pesan untuk Membaca' : 'Select a Message to Read'}</h3>
            <p className="text-xs text-[#8A94A6] max-w-xs font-mono">
              {language === 'id'
                ? 'Klik salah satu pesan di sebelah kiri untuk melihat rincian brief, kontak, dan opsi konversi ke CRM.'
                : 'Click any submission on the left to inspect brief specs, contact information, and CRM deal conversion.'}
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
