import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Code, 
  Palette, 
  Cpu, 
  SearchCode, 
  FileCode2, 
  PenTool, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  X,
  Clock,
  Eye,
  Sliders,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { allSolutionsAndServices, ServiceItemData } from '../../data/servicesData';
import { useLanguage } from '../../lib/LanguageContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { api } from '../../lib/apiClient';
import { Modal } from '../../components/ui/Modal';

export const AdminCmsServices: React.FC = () => {
  const { language } = useLanguage();
  const [servicesList, setServicesList] = useState<ServiceItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Backend is the only CMS source of truth.
  React.useEffect(() => {
    void api.cms.getServices().then((res) => {
      if (res.success && Array.isArray(res.data?.services)) setServicesList(res.data.services as ServiceItemData[]);
    });
  }, []);

  // Modals & Editing State
  const [editingService, setEditingService] = useState<ServiceItemData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<ServiceItemData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // New Service Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCategory, setNewCategory] = useState<'Solutions' | 'Branding' | 'Design' | 'Development'>('Development');
  const [newHeadline, setNewHeadline] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('Enterprise Tier');
  const [newCapability, setNewCapability] = useState('');
  const [tempCapabilities, setTempCapabilities] = useState<string[]>(['Technical Audit & Core Web Vitals', 'Modern Jamstack Architecture', 'High-speed Edge Delivery']);

  const categories = ['All', 'Development', 'Design', 'Branding', 'Solutions'];

  const filtered = servicesList.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      s.title.toLowerCase().includes(q) ||
      (s.heroHeadline && s.heroHeadline.toLowerCase().includes(q)) ||
      (s.heroSubtitle && s.heroSubtitle.toLowerCase().includes(q)) ||
      s.slug.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Design':
        return <Palette size={14} className="text-purple-400" />;
      case 'Development':
        return <Code size={14} className="text-[var(--danger)]" />;
      case 'Branding':
        return <Sparkles size={14} className="text-[var(--warning)]" />;
      case 'Solutions':
      default:
        return <Cpu size={14} className="text-[var(--success)]" />;
    }
  };

  const handleAddTempCapability = () => {
    if (newCapability.trim()) {
      setTempCapabilities([...tempCapabilities, newCapability.trim()]);
      setNewCapability('');
    }
  };

  const handleRemoveTempCapability = (index: number) => {
    setTempCapabilities(tempCapabilities.filter((_, i) => i !== index));
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSlug) return;

    const newService: ServiceItemData = {
      slug: newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      type: 'service',
      category: newCategory,
      title: newTitle,
      navSubtitle: newHeadline || 'High-performance digital craft and engineering.',
      navSubtitleId: newHeadline || 'Layanan rekayasa digital berstandar global.',
      heroHeadline: newHeadline || `${newTitle} for High-Growth Brands`,
      heroHeadlineId: newHeadline || `${newTitle} untuk Brand Berskala Global`,
      heroSubtitle: newSubtitle || 'Accelerate conversion, user engagement, and revenue through our bespoke engineering methodology.',
      heroSubtitleId: newSubtitle || 'Akselerasikan konversi dan retensi pengguna melalui arsitektur software berstandar industri.',
      badge: newBadge,
      badgeId: newBadge,
      metrics: [
        { value: '99.9%', label: 'Uptime SLA', labelId: 'Jaminan Uptime' },
        { value: '3.4x', label: 'Avg ROI', labelId: 'Rata-rata ROI' },
        { value: '<50ms', label: 'Edge Latency', labelId: 'Latensi Edge' }
      ],
      testimonial: {
        quote: 'Kapitech delivered exceptional results ahead of our quarterly launch schedule.',
        quoteId: 'Kapitech memberikan hasil luar biasa lebih cepat dari jadwal peluncuran kami.',
        highlight: 'Top 1% Engineering Execution',
        highlightId: 'Eksekusi Rekayasa Kelas Dunia',
        author: 'Arif Hidayat',
        role: 'VP of Technology',
        company: 'Nexus Supply Chain',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      caseStudySlugs: ['lumina-staging-cloud', 'aurora-ecommerce'],
      problemsSolutions: [],
      capabilities: tempCapabilities.map(cap => ({
        title: cap,
        titleId: cap,
        desc: 'Production-ready delivery adhering to modern web standards and security benchmarks.',
        descId: 'Eksekusi produksi sesuai standar arsitektur modern dan keamanan data.'
      })),
      processStages: [
        {
          stageNumber: '01',
          stageName: 'Discovery & Audit',
          stageNameId: 'Audit & Analisis Mendalam',
          stageDesc: 'Deep-dive technical assessment and strategic roadmap mapping.',
          stageDescId: 'Pemeriksaan sistem menyeluruh dan penyusunan roadmap teknis.',
          deliverables: ['Audit Report', 'Architecture Blueprint'],
          deliverablesId: ['Laporan Audit', 'Cetak Biru Arsitektur']
        },
        {
          stageNumber: '02',
          stageName: 'Agile Implementation',
          stageNameId: 'Implementasi & Development',
          stageDesc: 'Rapid deployment with weekly continuous integration and QA.',
          stageDescId: 'Pengembangan cepat dengan integrasi mingguan dan pengujian ketat.',
          deliverables: ['Staging Environment', 'API Documentation'],
          deliverablesId: ['Environment Staging', 'Dokumentasi API']
        }
      ],
      businessOutcomes: {
        heading: 'Measurable Impact for Your Digital Enterprise',
        headingId: 'Dampak Terukur untuk Ekosistem Digital Anda',
        benefits: ['Reduced infrastructure overhead', 'Sub-second page load benchmarks', 'Higher organic conversion rate'],
        benefitsId: ['Efisiensi biaya server', 'Waktu muat di bawah 1 detik', 'Peningkatan konversi organik']
      },
      tools: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Docker', 'PostgreSQL', 'Redis'],
      faqs: []
    };

    const res = await api.cms.createService(newService);
    if (!res.success) { setStatusMessage(res.error || 'Service could not be created.'); return; }
    setServicesList((current) => [newService, ...current]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewSlug('');
    setNewHeadline('');
    setNewSubtitle('');
    setStatusMessage(language === 'id' ? `Layanan "${newTitle}" berhasil ditambahkan ke CMS!` : `Service "${newTitle}" successfully added to CMS!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteService = async (slug: string) => {
    setDeleteTarget(slug);
  };

  const confirmDeleteService = async () => {
    if (!deleteTarget) return;
    const slug = deleteTarget;
    setDeleteTarget(null);
    const res = await api.cms.deleteService(slug);
    if (!res.success) { setStatusMessage(res.error || 'Service could not be deleted.'); return; }
    setServicesList(servicesList.filter(s => s.slug !== slug));
    setStatusMessage('Service deleted successfully.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
        <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm" title={language === 'id' ? 'Hapus layanan?' : 'Delete service?'} description={language === 'id' ? 'Layanan ini akan dihapus dari CMS.' : 'This service will be removed from the CMS.'}>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2"><button type="button" onClick={() => setDeleteTarget(null)} className="min-h-10 px-4 rounded-control border border-[var(--line)] bg-[var(--panel)] text-xs text-[var(--muted)]">Cancel</button><button type="button" onClick={() => void confirmDeleteService()} className="min-h-10 px-4 rounded-control bg-[var(--danger)] text-white text-xs font-semibold">Delete</button></div>
        </Modal>
      
      {/* Top Header */}
      <div className="ams-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--accent)] font-sans text-xs font-semibold normal-case tracking-normal mb-1">
            <Cpu size={14} />
            <span>Service Catalog & Execution Engine</span>
          </div>
          <h1 className="ams-page-title">
            <span>Agency Services (SEO & Dev)</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Manage live service offerings, SLA benchmarks, deliverables, and technical capabilities published on <code className="text-[var(--text)] bg-[var(--panel)] px-1.5 py-0.5 rounded border border-[var(--line)]">/services</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-sans text-[var(--muted)] bg-[var(--panel)] px-3.5 py-2 rounded-card border border-[var(--line)]">
            Active Catalog: <strong className="text-[var(--text)]">{servicesList.length} Offerings</strong>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-control bg-[var(--accent)] hover:brightness-110 text-white text-xs font-sans font-semibold transition-all flex items-center gap-1.5 shadow-none min-h-10"
          >
            <Plus size={14} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-card bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-xs font-sans flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[var(--success)]" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-[var(--muted)] hover:text-[var(--text)]">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="w-full h-full bg-[var(--panel)] border border-[var(--line)] p-4 rounded-card flex items-center justify-between shadow-none">
          <div>
            <div className="text-xs font-sans text-[var(--muted)]">SEO & Growth Services</div>
            <div className="text-xl font-sans font-semibold text-[var(--text)] mt-0.5">3 Modules</div>
          </div>
          <div className="w-8 h-8 rounded-control bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <SearchCode size={16} />
          </div>
        </div>

        <div className="w-full h-full bg-[var(--panel)] border border-[var(--line)] p-4 rounded-card flex items-center justify-between shadow-none">
          <div>
            <div className="text-xs font-sans text-[var(--muted)]">Development & Cloud</div>
            <div className="text-xl font-sans font-semibold text-[var(--text)] mt-0.5">5 Stacks</div>
          </div>
          <div className="w-8 h-8 rounded-control bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
            <FileCode2 size={16} />
          </div>
        </div>

        <div className="w-full h-full bg-[var(--panel)] border border-[var(--line)] p-4 rounded-card flex items-center justify-between shadow-none">
          <div>
            <div className="text-xs font-sans text-[var(--muted)]">UI/UX Design Systems</div>
            <div className="text-xl font-sans font-semibold text-[var(--text)] mt-0.5">4 Systems</div>
          </div>
          <div className="w-8 h-8 rounded-control bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <PenTool size={16} />
          </div>
        </div>

        <div className="w-full h-full bg-[var(--panel)] border border-[var(--line)] p-4 rounded-card flex items-center justify-between shadow-none">
          <div>
            <div className="text-xs font-sans text-[var(--muted)]">Standard Delivery SLA</div>
            <div className="text-xl font-sans font-semibold text-[var(--success)] mt-0.5">7 - 14 Days</div>
          </div>
          <div className="w-8 h-8 rounded-control bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center justify-center text-[var(--success)]">
            <ShieldCheck size={16} />
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--panel)] p-3 rounded-card border border-[var(--line)]">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-control text-xs font-sans transition-all ${
                selectedCategory === cat
                  ? 'bg-[var(--accent)] text-[var(--text)] font-semibold shadow-none'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--panel)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari layanan berdasarkan nama atau slug...' : 'Search service by name or slug...'}
            className="w-full pl-9 pr-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-card text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] font-sans transition-colors min-h-[40px]"
          />
        </div>
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
        {filtered.map((item) => (
          <div
            key={item.slug}
            className="w-full h-full bg-[var(--panel)] border border-[var(--line)] rounded-card p-5 flex flex-col justify-between hover:border-[var(--line)] transition-all shadow-none group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(item.category)}
                  <span className="text-[10px] font-sans text-[var(--muted)] normal-case tracking-normal font-semibold">
                    {item.category}
                  </span>
                </div>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] font-semibold">
                  {item.badgeId || item.badge || 'Active'}
                </span>
              </div>

              <h3 className="text-base font-semibold font-sans text-[var(--text)] mb-1.5 group-hover:text-[var(--accent)] transition-colors">
                {item.title}
              </h3>
              
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-4 line-clamp-2">
                {item.heroSubtitle || item.heroSubtitleId}
              </p>

              {/* Core Capabilities Preview */}
              <div className="space-y-1.5 mb-4">
                <div className="text-[10px] font-sans text-[var(--muted)] normal-case tracking-normal font-semibold">
                  Core Capabilities:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.capabilities.slice(0, 3).map((c, idx) => (
                    <span key={idx} className="text-[10px] font-sans px-2 py-0.5 rounded-control bg-[var(--panel)] text-[var(--text)] border border-[var(--line)]">
                      {c.title || c.titleId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tech Stack / Tools */}
              {item.tools && item.tools.length > 0 && (
                <div className="pt-2 border-t border-[var(--line)] mb-3 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  <span className="text-[10px] font-sans text-[var(--muted)] shrink-0">Tech:</span>
                  {item.tools.slice(0, 4).map((tool, tIdx) => (
                    <span key={tIdx} className="text-[9px] font-sans text-[var(--muted)] bg-[var(--panel)] px-1.5 py-0.5 rounded border border-[var(--line)] shrink-0">
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs font-sans text-[var(--muted)]">
              <span className="truncate max-w-[120px]">/{item.slug}</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedServiceForDetail(item)}
                  className="px-2.5 py-1 rounded-control bg-[var(--panel)] hover:bg-[var(--panel-hover)] border border-[var(--line)] text-[var(--text)] text-[11px] font-sans flex items-center gap-1 transition-colors"
                >
                  <Eye size={12} className="text-[var(--muted)]" />
                  <span>Inspect</span>
                </button>
                <a
                  href={`/services/${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-control bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 text-[11px] font-sans flex items-center gap-1 transition-colors"
                >
                  <span>Live</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Service Detail / Inspection Modal */}
      {selectedServiceForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80  flex items-center justify-center p-4">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card w-full max-w-2xl shadow-none p-4 sm:p-6 relative max-h-[calc(100dvh-24px)] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedServiceForDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-control text-[var(--muted)] hover:text-[var(--text)] bg-[var(--panel)] border border-[var(--line)]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 font-sans text-xs text-[var(--accent)] font-semibold mb-2">
              <span>{selectedServiceForDetail.category}</span>
              <span>•</span>
              <span className="text-[var(--muted)]">/{selectedServiceForDetail.slug}</span>
            </div>

            <h2 className="text-xl font-sans font-semibold text-[var(--text)] mb-2">
              {selectedServiceForDetail.title}
            </h2>
            <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed">
              {selectedServiceForDetail.heroSubtitle || selectedServiceForDetail.heroSubtitleId}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {selectedServiceForDetail.metrics?.map((m, idx) => (
                <div key={idx} className="bg-[var(--panel)] border border-[var(--line)] p-3 rounded-card text-center">
                  <div className="text-lg font-sans font-semibold text-[var(--accent)]">{m.value}</div>
                  <div className="text-[10px] font-sans text-[var(--muted)] mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Capabilities */}
            <div className="mb-5">
              <h4 className="text-xs font-sans normal-case text-[var(--muted)] font-semibold tracking-normal mb-2">
                Detailed Capabilities & SLA Scope
              </h4>
              <div className="space-y-2">
                {selectedServiceForDetail.capabilities?.map((cap, cIdx) => (
                  <div key={cIdx} className="bg-[var(--panel)] border border-[var(--line)] p-3 rounded-card">
                    <div className="text-xs font-semibold text-[var(--text)] flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[var(--success)]" />
                      <span>{cap.title || cap.titleId}</span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] mt-1 pl-5">
                      {cap.desc || cap.descId}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Stages */}
            {selectedServiceForDetail.processStages && selectedServiceForDetail.processStages.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-sans normal-case text-[var(--muted)] font-semibold tracking-normal mb-2">
                  Delivery Process & Milestones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedServiceForDetail.processStages.map((stage, sIdx) => (
                    <div key={sIdx} className="bg-[var(--panel)] border border-[var(--line)] p-3 rounded-card">
                      <div className="flex items-center gap-2 text-[var(--accent)] font-sans text-xs font-semibold mb-1">
                        <span>{stage.stageNumber}</span>
                        <span className="text-[var(--text)] font-sans font-semibold">{stage.stageName}</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] mb-2">{stage.stageDesc}</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.deliverables?.map((d, dIdx) => (
                          <span key={dIdx} className="text-[9px] font-sans bg-[var(--panel)] text-[var(--success)] px-1.5 py-0.5 rounded border border-[var(--line)]">
                            ✓ {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
              <button
                onClick={() => handleDeleteService(selectedServiceForDetail.slug)}
                className="px-3 py-2 rounded-card bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--danger)]/15 text-xs font-sans flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} />
                <span>Delete Offering</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedServiceForDetail(null)}
                  className="px-4 py-2 rounded-card bg-[var(--panel)] hover:bg-[var(--panel-hover)] border border-[var(--line)] text-[var(--text)] text-xs font-sans transition-colors"
                >
                  Close
                </button>
                <a
                  href={`/services/${selectedServiceForDetail.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-control bg-[var(--accent)] hover:brightness-110 text-white text-xs font-sans font-semibold flex items-center gap-1 shadow-none transition-all"
                >
                  <span>Open Public Page</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add New Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80  flex items-center justify-center p-4">
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-card w-full max-w-lg shadow-none p-4 sm:p-6 relative max-h-[calc(100dvh-24px)] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-control text-[var(--muted)] hover:text-[var(--text)] bg-[var(--panel)] border border-[var(--line)]"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-sans font-semibold text-[var(--text)] mb-1">
              Add New Agency Service Offering
            </h3>
            <p className="text-xs text-[var(--muted)] mb-5">
              Publish a new technical capability or SEO service package into the agency catalog.
            </p>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[var(--muted)] mb-1 font-medium">Service Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Enterprise SEO & Core Web Vitals"
                  className="w-full px-3 py-2 rounded-card bg-[var(--panel)] border border-[var(--line)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-medium">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="e.g. enterprise-seo"
                    className="w-full px-3 py-2 rounded-card bg-[var(--panel)] border border-[var(--line)] text-[var(--text)] font-sans text-[11px] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] mb-1 font-medium">Category</label>
                  <CustomSelect value={newCategory} onChange={(value) => setNewCategory(value as any)} options={[{value:'Development',label:'Development'},{value:'Design',label:'Design'},{value:'Branding',label:'Branding'},{value:'Solutions',label:'Solutions'}]} className="w-full" />
                </div>
              </div>

              <div>
                <label className="block text-[var(--muted)] mb-1 font-medium">Hero Headline</label>
                <input
                  type="text"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  placeholder="e.g. High-Impact Technical SEO for Scaling Ventures"
                  className="w-full px-3 py-2 rounded-card bg-[var(--panel)] border border-[var(--line)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] mb-1 font-medium">Description & Scope Overview</label>
                <textarea
                  rows={2}
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Explain client value proposition, measurable KPI improvements, and SLA guarantee..."
                  className="w-full px-3 py-2 rounded-card bg-[var(--panel)] border border-[var(--line)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Capabilities Manager */}
              <div>
                <label className="block text-[var(--muted)] mb-1 font-medium">Core Deliverables & Capabilities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCapability}
                    onChange={(e) => setNewCapability(e.target.value)}
                    placeholder="Add deliverable point..."
                    className="flex-1 px-3 py-1.5 rounded-card bg-[var(--panel)] border border-[var(--line)] text-[var(--text)] text-xs focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTempCapability}
                    className="px-3 py-1.5 rounded-card bg-[var(--panel)] hover:bg-[var(--panel-hover)] border border-[var(--line)] text-[var(--text)] text-xs font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                  {tempCapabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-control bg-[var(--panel)] border border-[var(--line)] text-[11px]">
                      <span className="text-[var(--text)] truncate">{cap}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTempCapability(idx)}
                        className="text-[var(--danger)] hover:brightness-110 ml-2"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-card bg-[var(--panel)] hover:bg-[var(--panel-hover)] border border-[var(--line)] text-[var(--text)] text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-control bg-[var(--accent)] hover:brightness-110 text-white text-xs font-semibold shadow-none transition-all"
                >
                  Publish Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCmsServices;
