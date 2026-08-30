import React, { useEffect, useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { 
  Inbox, 
  Mail, 
  Phone, 
  Building, 
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
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ContactSubmission, 
  subscribeToInbox, 
  updateSubmissionStatus, 
  deleteSubmission, 
  submitToInbox 
} from '../lib/submissions';

export const SubmissionsInbox: React.FC = () => {
  const { language } = useLanguage();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    // Realtime unified subscriber
    const unsubscribe = subscribeToInbox((items) => {
      setSubmissions(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    if (!window.confirm(language === 'id' ? 'Hapus pesan ini dari database?' : 'Delete this submission record?')) return;
    try {
      await deleteSubmission(id);
      if (selectedSubmission?.id === id) setSelectedSubmission(null);
    } catch (err) {
      console.error('Failed to delete submission:', err);
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
        source: 'Simulated Test Form (Admin Triggered)',
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
    link.setAttribute('download', `kapitech_submissions_${new Date().toISOString().split('T')[0]}.csv`);
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
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-red-950/70 text-red-400 border border-red-500/40">New</span>;
      case 'in-review':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-950/70 text-amber-400 border border-amber-500/40">In Review</span>;
      case 'contacted':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-950/70 text-blue-400 border border-blue-500/40">Contacted</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/70 text-emerald-400 border border-emerald-500/40">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-gray-800 text-gray-400">{status}</span>;
    }
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'career':
        return (
          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-mono flex items-center gap-1">
            <Briefcase size={10} />
            <span>Studio Role</span>
          </span>
        );
      case 'vendor':
        return (
          <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono flex items-center gap-1">
            <Globe size={10} />
            <span>Freelance Vendor</span>
          </span>
        );
      case 'newsletter':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] font-mono flex items-center gap-1">
            <Sparkles size={10} />
            <span>Newsletter</span>
          </span>
        );
      case 'inquiry':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-brand-red/10 border border-brand-red/30 text-brand-red text-[10px] font-mono flex items-center gap-1">
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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#262930]">
        <div>
          <div className="flex items-center gap-2 text-brand-red text-xs font-mono uppercase tracking-wider mb-2 font-semibold">
            <ShieldCheck size={16} />
            <span>Admin Live Stream & Realtime Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-3">
            <Inbox className="text-brand-red" />
            <span>{language === 'id' ? 'Inbox Database Formulir' : 'Submissions Database Inbox'}</span>
            <span className="text-xs font-mono py-1 px-3 bg-[#16181D] border border-[#262930] rounded-full text-[#8A909D]">
              {submissions.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8A909D] mt-1 max-w-2xl">
            {language === 'id' 
              ? 'Seluruh form di website (Formulir Kontak /contact, Lamaran Karir Studio, Jaringan Freelance Vendor, dan Newsletter) tersimpan otomatis dan masuk ke inbox admin ini secara real-time.' 
              : 'All forms across the website (/contact, Studio Job Applications, Freelance Vendor Network, and Newsletters) sync automatically to this live admin inbox.'}
          </p>
        </div>

        {/* Live sync badge & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCreateTestSubmission}
            disabled={testSending}
            className="px-3 py-1.5 rounded-lg bg-[#16181D] hover:bg-brand-red text-white hover:text-white border border-[#262930] hover:border-brand-red text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm"
            title="Kirim contoh data tes masuk"
          >
            {testSending ? <RefreshCw className="animate-spin" size={13} /> : <Plus size={13} />}
            <span>{language === 'id' ? '+ Kirim Pesan Tes' : '+ Send Test Entry'}</span>
          </button>

          {submissions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-[#16181D] hover:bg-[#20232B] text-[#8A909D] hover:text-white border border-[#262930] text-xs font-mono transition-colors flex items-center gap-1.5"
              title="Unduh data dalam format CSV Excel"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16181D] border border-[#262930] text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Database Live: Active</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Form Type */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-2">
        <span className="text-xs font-mono text-[#8A909D] mr-1 flex items-center gap-1">
          <Layers size={13} />
          <span>Kategori:</span>
        </span>
        {[
          { key: 'all', label: language === 'id' ? 'Semua Form' : 'All Types' },
          { key: 'inquiry', label: language === 'id' ? 'Konsultasi Klien' : 'Client Inquiries' },
          { key: 'career', label: language === 'id' ? 'Lamaran Karir' : 'Careers' },
          { key: 'vendor', label: language === 'id' ? 'Freelance Vendor' : 'Freelance Vendors' },
          { key: 'newsletter', label: 'Newsletter' }
        ].map((tab) => {
          const count = tab.key === 'all' 
            ? submissions.length 
            : submissions.filter(s => (s.type || 'inquiry') === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                filterType === tab.key
                  ? 'bg-brand-red text-white border-brand-red font-semibold'
                  : 'bg-[#16181D] text-[#8A909D] border-[#262930] hover:text-white hover:border-[#383C46]'
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

      {/* Control Bar: Search & Status Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A909D]" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari nama, email, perusahaan, keahlian, atau isi pesan...' : 'Search by name, email, company, specialty, or message...'}
            className="w-full pl-10 pr-4 py-2.5 bg-[#16181D] border border-[#262930] rounded-xl text-sm text-white focus:outline-none focus:border-brand-red placeholder:text-[#5C626E]"
          />
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#8A909D]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full py-2.5 px-3 bg-[#16181D] border border-[#262930] rounded-xl text-sm text-white focus:outline-none focus:border-brand-red"
          >
            <option value="all">{language === 'id' ? 'Semua Status' : 'All Statuses'}</option>
            <option value="new">Status: New</option>
            <option value="in-review">Status: In Review</option>
            <option value="contacted">Status: Contacted</option>
            <option value="closed">Status: Closed</option>
          </select>
        </div>
      </div>

      {/* Content Split: List & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* List Section */}
        <div className={`space-y-3 ${selectedSubmission ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#8A909D] space-y-3">
              <RefreshCw className="animate-spin text-brand-red" size={24} />
              <p className="text-sm font-mono">{language === 'id' ? 'Memuat database pesan...' : 'Loading database submissions...'}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-[#16181D] border border-[#262930] rounded-2xl p-10 text-center text-[#8A909D]">
              <MessageSquare className="mx-auto mb-3 text-[#5C626E]" size={36} />
              <h3 className="text-white font-medium mb-1">
                {language === 'id' ? 'Belum Ada Pesan yang Sesuai' : 'No Submissions Match Filters'}
              </h3>
              <p className="text-xs max-w-md mx-auto text-[#8A909D] mb-4">
                {language === 'id' 
                  ? 'Kirimkan pesan melalui formulir kontak di /contact atau klik tombol "+ Kirim Pesan Tes" di atas untuk mencoba aliran pesan masuk.' 
                  : 'Submit a form via /contact or click "+ Send Test Entry" above to test the incoming live stream.'}
              </p>
              <button
                onClick={handleCreateTestSubmission}
                className="px-4 py-2 rounded-full bg-brand-red text-white text-xs font-mono font-medium hover:bg-brand-red/90 transition-all inline-flex items-center gap-2"
              >
                <Plus size={14} />
                <span>{language === 'id' ? 'Buat Pesan Simulasi Tes Sekarang' : 'Create Sample Submission Now'}</span>
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedSubmission(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  selectedSubmission?.id === item.id 
                    ? 'bg-[#1D2027] border-brand-red/60 shadow-lg shadow-brand-red/5' 
                    : 'bg-[#16181D] border-[#262930] hover:border-[#383C46] hover:bg-[#1A1D24]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeBadge(item.type)}
                      {getStatusBadge(item.status)}
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                      {item.fullName}
                    </h3>
                    <p className="text-xs text-[#8A909D] truncate">
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

                <p className="text-xs text-[#8A909D] line-clamp-2 mb-3 font-light">
                  {item.message}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#5C626E] pt-2 border-t border-[#262930]">
                  <span className="truncate max-w-[180px]">{item.company || item.specialty || item.positionTitle || 'Direct Lead'}</span>
                  <span className="text-brand-red text-[10px] font-medium">{item.budget ? `${item.budget}` : 'Review'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Section */}
        {selectedSubmission && (
          <div className="lg:col-span-7 bg-[#16181D] border border-[#262930] rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Detail Header */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#262930] mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(selectedSubmission.type)}
                    {getStatusBadge(selectedSubmission.status)}
                    <span className="text-[10px] font-mono text-[#5C626E]">
                      ID: {selectedSubmission.id}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-white">
                    {selectedSubmission.fullName}
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-red font-mono mt-0.5">
                    {selectedSubmission.company || selectedSubmission.positionTitle || selectedSubmission.specialty || 'General Inquiry'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-xs text-[#8A909D] hover:text-white px-2.5 py-1 rounded bg-[#0B0C0E] border border-[#262930]"
                >
                  ✕ Close
                </button>
              </div>

              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8A909D] mb-1">
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} className="text-brand-red" />
                      <span>Email</span>
                    </div>
                    <button
                      onClick={() => handleCopyEmail(selectedSubmission.email, selectedSubmission.id)}
                      className="text-[10px] text-brand-red hover:underline flex items-center gap-1"
                    >
                      <Copy size={10} />
                      <span>{copiedId === selectedSubmission.id ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                  <a 
                    href={`mailto:${selectedSubmission.email}`}
                    className="text-sm font-medium text-white hover:text-brand-red transition-colors break-all block"
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
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Chat WA</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white">
                    {selectedSubmission.phone || '-'}
                  </p>
                </div>
              </div>

              {/* Additional Fields if Career / Vendor / Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8A909D] mb-1.5">
                    <Tag size={14} className="text-brand-red" />
                    <span>{selectedSubmission.specialty ? 'Keahlian / Posisi' : 'Layanan Diminta'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubmission.services && selectedSubmission.services.length > 0 ? (
                      selectedSubmission.services.map((svc, i) => (
                        <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#16181D] border border-[#262930] text-[#D0D4DC]">
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
                    <span>{selectedSubmission.rateCard ? 'Rate / Ekspektasi Biaya' : 'Estimasi Anggaran'}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {selectedSubmission.rateCard || selectedSubmission.budget || 'Tidak ditentukan'}
                  </p>
                </div>
              </div>

              {/* Portfolio Link if available */}
              {selectedSubmission.portfolioUrl && (
                <div className="p-3.5 rounded-xl bg-[#0B0C0E] border border-[#262930] mb-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8A909D] mb-1">
                    <Globe size={14} className="text-brand-red" />
                    <span>Tautan Portofolio / CV</span>
                  </div>
                  <a
                    href={selectedSubmission.portfolioUrl.startsWith('http') ? selectedSubmission.portfolioUrl : `https://${selectedSubmission.portfolioUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-red hover:underline break-all flex items-center gap-1.5 font-mono"
                  >
                    <span>{selectedSubmission.portfolioUrl}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Full Message Body */}
              <div className="mb-6">
                <label className="text-xs font-mono text-[#8A909D] uppercase tracking-wider block mb-2">
                  {language === 'id' ? 'Detail Pesan / Brief Formulir' : 'Message Body & Submission Brief'}
                </label>
                <div className="p-4 rounded-xl bg-[#0B0C0E] border border-[#262930] text-xs sm:text-sm text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-[11px] font-mono text-[#5C626E] space-y-1 mb-6">
                <div>Sumber: <span className="text-[#8A909D]">{selectedSubmission.source || 'Website Form'}</span></div>
                <div>Waktu Pengiriman: <span className="text-[#8A909D]">{new Date(selectedSubmission.createdAt).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-6 border-t border-[#262930] flex flex-wrap items-center justify-between gap-3">
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
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Kapitech Agency - Tanggapan Pesan Formulir&body=Halo ${encodeURIComponent(selectedSubmission.fullName)},%0D%0A%0D%0ATerima kasih telah menghubungi tim Kapitech Agency.%0D%0A%0D%0A`}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-red text-white text-xs font-semibold hover:bg-brand-red/90 transition-colors flex items-center gap-1.5"
                >
                  <Mail size={13} />
                  <span>Balas Email</span>
                </a>

                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="p-1.5 rounded-lg bg-[#0B0C0E] border border-[#262930] text-[#8A909D] hover:text-red-400 hover:border-red-500/40 transition-colors"
                  title="Hapus data ini"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default SubmissionsInbox;
