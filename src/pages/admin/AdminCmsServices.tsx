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

export const AdminCmsServices: React.FC = () => {
  const { language } = useLanguage();
  const [servicesList, setServicesList] = useState<ServiceItemData[]>(allSolutionsAndServices);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // Modals & Editing State
  const [editingService, setEditingService] = useState<ServiceItemData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<ServiceItemData | null>(null);

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
        return <Code size={14} className="text-red-400" />;
      case 'Branding':
        return <Sparkles size={14} className="text-amber-400" />;
      case 'Solutions':
      default:
        return <Cpu size={14} className="text-emerald-400" />;
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

  const handleCreateService = (e: React.FormEvent) => {
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

    setServicesList([newService, ...servicesList]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewSlug('');
    setNewHeadline('');
    setNewSubtitle('');
    setStatusMessage(language === 'id' ? `Layanan "${newTitle}" berhasil ditambahkan ke CMS!` : `Service "${newTitle}" successfully added to CMS!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteService = (slug: string) => {
    if (window.confirm(language === 'id' ? 'Apakah Anda yakin ingin menghapus layanan ini?' : 'Are you sure you want to delete this service?')) {
      setServicesList(servicesList.filter(s => s.slug !== slug));
      setSelectedServiceForDetail(null);
      setStatusMessage(language === 'id' ? 'Layanan berhasil dihapus.' : 'Service successfully deleted.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <div className="flex items-center gap-2 text-[#E50914] font-mono text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu size={14} />
            <span>Service Catalog & Execution Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight flex items-center gap-3">
            <span>Agency Services (SEO & Dev)</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8A94A6] mt-1">
            Manage live service offerings, SLA benchmarks, deliverables, and technical capabilities published on <code className="text-white bg-[#181B22] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.07)]">/services</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-[#8A94A6] bg-[#111318] px-3.5 py-2 rounded-xl border border-[rgba(255,255,255,0.07)]">
            Active Catalog: <strong className="text-white">{servicesList.length} Offerings</strong>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-sans font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-[#E50914]/25 min-h-[38px]"
          >
            <Plus size={14} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-sans flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-[#8A94A6] hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="w-full h-full bg-[#111318] border border-[rgba(255,255,255,0.07)] p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-sans text-[#8A94A6]">SEO & Growth Services</div>
            <div className="text-xl font-sans font-bold text-white mt-0.5">3 Modules</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <SearchCode size={16} />
          </div>
        </div>

        <div className="w-full h-full bg-[#111318] border border-[rgba(255,255,255,0.07)] p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-sans text-[#8A94A6]">Development & Cloud</div>
            <div className="text-xl font-sans font-bold text-white mt-0.5">5 Stacks</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
            <FileCode2 size={16} />
          </div>
        </div>

        <div className="w-full h-full bg-[#111318] border border-[rgba(255,255,255,0.07)] p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-sans text-[#8A94A6]">UI/UX Design Systems</div>
            <div className="text-xl font-sans font-bold text-white mt-0.5">4 Systems</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <PenTool size={16} />
          </div>
        </div>

        <div className="w-full h-full bg-[#111318] border border-[rgba(255,255,255,0.07)] p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-sans text-[#8A94A6]">Standard Delivery SLA</div>
            <div className="text-xl font-sans font-bold text-emerald-400 mt-0.5">7 - 14 Days</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={16} />
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111318] p-3 rounded-xl border border-[rgba(255,255,255,0.07)]">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${
                selectedCategory === cat
                  ? 'bg-[#E50914] text-white font-semibold shadow-md shadow-[#E50914]/20'
                  : 'text-[#8A94A6] hover:text-white hover:bg-[#181B22]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C626E]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'id' ? 'Cari layanan berdasarkan nama atau slug...' : 'Search service by name or slug...'}
            className="w-full pl-9 pr-3 py-2 bg-[#181B22] border border-[rgba(255,255,255,0.07)] rounded-xl text-xs text-white placeholder:text-[#5C626E] focus:outline-none focus:border-[#E50914] font-sans transition-colors min-h-[40px]"
          />
        </div>
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
        {filtered.map((item) => (
          <div
            key={item.slug}
            className="w-full h-full bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl p-5 flex flex-col justify-between hover:border-[rgba(255,255,255,0.14)] transition-all shadow-sm group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(item.category)}
                  <span className="text-[10px] font-mono text-[#8A94A6] uppercase tracking-wider font-semibold">
                    {item.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                  {item.badgeId || item.badge || 'Active'}
                </span>
              </div>

              <h3 className="text-base font-bold font-sans text-white mb-1.5 group-hover:text-[#E50914] transition-colors">
                {item.title}
              </h3>
              
              <p className="text-xs text-[#8A94A6] leading-relaxed mb-4 line-clamp-2">
                {item.heroSubtitle || item.heroSubtitleId}
              </p>

              {/* Core Capabilities Preview */}
              <div className="space-y-1.5 mb-4">
                <div className="text-[10px] font-mono text-[#5C626E] uppercase tracking-wider font-semibold">
                  Core Capabilities:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.capabilities.slice(0, 3).map((c, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#181B22] text-[#F8FAFC] border border-[rgba(255,255,255,0.07)]">
                      {c.title || c.titleId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tech Stack / Tools */}
              {item.tools && item.tools.length > 0 && (
                <div className="pt-2 border-t border-[rgba(255,255,255,0.07)] mb-3 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  <span className="text-[10px] font-mono text-[#5C626E] shrink-0">Tech:</span>
                  {item.tools.slice(0, 4).map((tool, tIdx) => (
                    <span key={tIdx} className="text-[9px] font-mono text-[#8A94A6] bg-[#181B22] px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.07)] shrink-0">
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.07)] flex items-center justify-between text-xs font-mono text-[#8A94A6]">
              <span className="truncate max-w-[120px]">/{item.slug}</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedServiceForDetail(item)}
                  className="px-2.5 py-1 rounded-lg bg-[#181B22] hover:bg-[#21252F] border border-[rgba(255,255,255,0.07)] text-white text-[11px] font-sans flex items-center gap-1 transition-colors"
                >
                  <Eye size={12} className="text-[#8A94A6]" />
                  <span>Inspect</span>
                </button>
                <a
                  href={`/services/${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-[#E50914]/10 hover:bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30 text-[11px] font-sans flex items-center gap-1 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedServiceForDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8A94A6] hover:text-white bg-[#181B22] border border-[rgba(255,255,255,0.07)]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-[#E50914] font-semibold mb-2">
              <span>{selectedServiceForDetail.category}</span>
              <span>•</span>
              <span className="text-[#8A94A6]">/{selectedServiceForDetail.slug}</span>
            </div>

            <h2 className="text-xl font-sans font-bold text-white mb-2">
              {selectedServiceForDetail.title}
            </h2>
            <p className="text-xs text-[#8A94A6] mb-5 leading-relaxed">
              {selectedServiceForDetail.heroSubtitle || selectedServiceForDetail.heroSubtitleId}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {selectedServiceForDetail.metrics?.map((m, idx) => (
                <div key={idx} className="bg-[#181B22] border border-[rgba(255,255,255,0.07)] p-3 rounded-xl text-center">
                  <div className="text-lg font-sans font-bold text-[#E50914]">{m.value}</div>
                  <div className="text-[10px] font-mono text-[#8A94A6] mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Capabilities */}
            <div className="mb-5">
              <h4 className="text-xs font-mono uppercase text-[#5C626E] font-semibold tracking-wider mb-2">
                Detailed Capabilities & SLA Scope
              </h4>
              <div className="space-y-2">
                {selectedServiceForDetail.capabilities?.map((cap, cIdx) => (
                  <div key={cIdx} className="bg-[#181B22] border border-[rgba(255,255,255,0.07)] p-3 rounded-xl">
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>{cap.title || cap.titleId}</span>
                    </div>
                    <p className="text-[11px] text-[#8A94A6] mt-1 pl-5">
                      {cap.desc || cap.descId}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Stages */}
            {selectedServiceForDetail.processStages && selectedServiceForDetail.processStages.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-mono uppercase text-[#5C626E] font-semibold tracking-wider mb-2">
                  Delivery Process & Milestones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedServiceForDetail.processStages.map((stage, sIdx) => (
                    <div key={sIdx} className="bg-[#181B22] border border-[rgba(255,255,255,0.07)] p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-[#E50914] font-mono text-xs font-bold mb-1">
                        <span>{stage.stageNumber}</span>
                        <span className="text-white font-sans font-semibold">{stage.stageName}</span>
                      </div>
                      <p className="text-[11px] text-[#8A94A6] mb-2">{stage.stageDesc}</p>
                      <div className="flex flex-wrap gap-1">
                        {stage.deliverables?.map((d, dIdx) => (
                          <span key={dIdx} className="text-[9px] font-mono bg-[#111318] text-emerald-400 px-1.5 py-0.5 rounded border border-[rgba(255,255,255,0.07)]">
                            ✓ {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.07)]">
              <button
                onClick={() => handleDeleteService(selectedServiceForDetail.slug)}
                className="px-3 py-2 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-900/40 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} />
                <span>Delete Offering</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedServiceForDetail(null)}
                  className="px-4 py-2 rounded-xl bg-[#181B22] hover:bg-[#21252F] border border-[rgba(255,255,255,0.07)] text-white text-xs font-sans transition-colors"
                >
                  Close
                </button>
                <a
                  href={`/services/${selectedServiceForDetail.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-sans font-semibold flex items-center gap-1 shadow-md shadow-[#E50914]/20 transition-all"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-[rgba(255,255,255,0.07)] rounded-xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8A94A6] hover:text-white bg-[#181B22] border border-[rgba(255,255,255,0.07)]"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-sans font-bold text-white mb-1">
              Add New Agency Service Offering
            </h3>
            <p className="text-xs text-[#8A94A6] mb-5">
              Publish a new technical capability or SEO service package into the agency catalog.
            </p>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#8A94A6] mb-1 font-medium">Service Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Enterprise SEO & Core Web Vitals"
                  className="w-full px-3 py-2 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-medium">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="e.g. enterprise-seo"
                    className="w-full px-3 py-2 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-white font-mono text-[11px] focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[#8A94A6] mb-1 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Branding">Branding</option>
                    <option value="Solutions">Solutions</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8A94A6] mb-1 font-medium">Hero Headline</label>
                <input
                  type="text"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  placeholder="e.g. High-Impact Technical SEO for Scaling Ventures"
                  className="w-full px-3 py-2 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-[#8A94A6] mb-1 font-medium">Description & Scope Overview</label>
                <textarea
                  rows={2}
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Explain client value proposition, measurable KPI improvements, and SLA guarantee..."
                  className="w-full px-3 py-2 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              {/* Capabilities Manager */}
              <div>
                <label className="block text-[#8A94A6] mb-1 font-medium">Core Deliverables & Capabilities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCapability}
                    onChange={(e) => setNewCapability(e.target.value)}
                    placeholder="Add deliverable point..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-white text-xs focus:outline-none focus:border-[#E50914]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTempCapability}
                    className="px-3 py-1.5 rounded-xl bg-[#181B22] hover:bg-[#21252F] border border-[rgba(255,255,255,0.07)] text-white text-xs font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                  {tempCapabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#181B22] border border-[rgba(255,255,255,0.07)] text-[11px]">
                      <span className="text-white truncate">{cap}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTempCapability(idx)}
                        className="text-red-400 hover:text-red-300 ml-2"
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
                  className="px-4 py-2 rounded-xl bg-[#181B22] hover:bg-[#21252F] border border-[rgba(255,255,255,0.07)] text-white text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#FF1E27] text-white text-xs font-semibold shadow-lg shadow-[#E50914]/25 transition-all"
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
