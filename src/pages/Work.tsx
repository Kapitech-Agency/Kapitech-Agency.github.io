import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  X, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Globe, 
  Layers, 
  Cpu, 
  Code2, 
  Palette, 
  Box, 
  Building2, 
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';
import Fuse from 'fuse.js';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';
import { ProjectItem } from '../data/projectsData';
import { getCmsProjects, fetchServerCmsProjects } from '../lib/cmsStore';

export const Work = () => {
  const { t, language } = useLanguage();
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(() => getCmsProjects());
  const [activePillar, setActivePillar] = useState<string>('All');
  const [activeService, setActiveService] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Sync with CMS updates
  useEffect(() => {
    void fetchServerCmsProjects().then(setProjectsList);
    const handleUpdate = () => {
      setProjectsList(getCmsProjects());
    };
    window.addEventListener('kapitech_cms_updated', handleUpdate);
    return () => window.removeEventListener('kapitech_cms_updated', handleUpdate);
  }, []);

  // Drag-to-scroll refs & state for horizontal filter bars
  const serviceScrollRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingService, setIsDraggingService] = useState(false);
  const [startXService, setStartXService] = useState(0);
  const [scrollLeftService, setScrollLeftService] = useState(0);

  const handleMouseDownService = (e: React.MouseEvent) => {
    if (!serviceScrollRef.current) return;
    setIsDraggingService(true);
    setStartXService(e.pageX - serviceScrollRef.current.offsetLeft);
    setScrollLeftService(serviceScrollRef.current.scrollLeft);
  };

  const handleMouseMoveService = (e: React.MouseEvent) => {
    if (!isDraggingService || !serviceScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - serviceScrollRef.current.offsetLeft;
    const walk = (x - startXService) * 1.5;
    serviceScrollRef.current.scrollLeft = scrollLeftService - walk;
  };

  const handleMouseUpOrLeaveService = () => {
    setIsDraggingService(false);
  };

  const handleWheelService = (e: React.WheelEvent) => {
    if (!serviceScrollRef.current) return;
    // Strictly horizontal scrolling
    if (e.deltaY !== 0) {
      serviceScrollRef.current.scrollLeft += e.deltaY;
    } else if (e.deltaX !== 0) {
      serviceScrollRef.current.scrollLeft += e.deltaX;
    }
  };

  const featuredProjects = useMemo(() => {
    return projectsList.filter(p => p.featured);
  }, [projectsList]);

  useEffect(() => {
    if (featuredProjects.length === 0) return;
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredProjects.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [featuredProjects.length]);

  const serviceOptions = useMemo(() => {
    if (activePillar === 'Visual Experience') {
      return [
        'All',
        'UI/UX Design',
        'Video Production',
        '2D Animation',
        'Branding & Identity',
        'Motion & Graphic Design',
        'Creative Design',
        '3D Visualization'
      ];
    }
    if (activePillar === 'Innovation Development') {
      return [
        'All',
        'Company Profile Website',
        'E-Commerce Website',
        'Web Application',
        'ERP / CRM System',
        'IT Support & Infrastructure'
      ];
    }
    return [
      'All',
      'UI/UX Design',
      'Video Production',
      '2D Animation',
      'Branding & Identity',
      'Motion & Graphic Design',
      'Creative Design',
      '3D Visualization',
      'Company Profile Website',
      'E-Commerce Website',
      'Web Application',
      'ERP / CRM System',
      'IT Support & Infrastructure'
    ];
  }, [activePillar]);

  // Reset granular filter if pillar changes
  const handlePillarChange = (pillar: string) => {
    setActivePillar(pillar);
    setActiveService('All');
    setVisibleCount(12);
  };

  const filteredProjects = useMemo(() => {
    let list = projectsList;

    if (activePillar !== 'All') {
      list = list.filter(p => p.pillar === activePillar);
    }

    if (activeService !== 'All') {
      list = list.filter(p => p.service === activeService);
    }

    if (searchQuery.trim()) {
      const fuse = new Fuse(list, {
        keys: ['title', 'client', 'industry', 'service', 'pillar', 'desc', 'descId', 'technologies', 'deliverables'],
        threshold: 0.35,
      });
      list = fuse.search(searchQuery).map(res => res.item);
    }

    return list;
  }, [projectsList, activePillar, activeService, searchQuery]);

  const currentFeatured = featuredProjects[featuredIndex] || projectsList[0];

  return (
    <div className="kapi-page-shell bg-[var(--k-bg-deep)] text-white min-h-screen selection:bg-brand-red selection:text-white relative" role="main">
      {/* Hero Section */}
      <section className="kapi-page-hero relative pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12 border-b border-[var(--k-border)] overflow-hidden">
        <AtmosphericBackground 
          imageUrl="/hero_background_3d.png"
          opacity={0.06}
          disableGrayscale={true}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="text-brand-red font-sans font-semibold tracking-widest uppercase text-xs mb-3 block">
              {language === 'id' ? 'Koleksi Portofolio & Studi Kasus' : 'Portfolio & Case Studies'}
            </span>
            <h1 className="kapi-display-title">
              {language === 'id' ? 'Karya Nyata. Dampak Nyata.' : 'Crafted for Real Impact.'}
            </h1>
            <p className="kapi-page-description mb-6">
              {language === 'id' 
                ? 'Jelajahi 50 studi kasus dan portofolio komprehensif kami yang mencakup pilar Visual Experience dan Innovation Development untuk para pemimpin industri global.'
                : 'Explore our portfolio of 50 comprehensive case studies spanning Visual Experience and Innovation Development across global industry leaders.'
              }
            </p>
            <div className="kapi-meta-row">
              <span className="kapi-status">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span>50 {language === 'id' ? 'Studi Kasus Lengkap' : 'Case Studies Verified'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[var(--k-surface)] border border-[var(--k-border)]">
                12 {language === 'id' ? 'Layanan Spesialisasi' : 'Core Disciplines'}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[var(--k-surface)] border border-[var(--k-border)]">
                {language === 'id' ? 'Klien Global & Indonesia' : 'Global & Local Enterprise'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spotlight Carousel */}
      {currentFeatured && (
        <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 border-b border-[var(--k-border)] bg-[var(--k-bg-deep)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-red" />
                <span className="text-xs font-sans uppercase tracking-widest text-[var(--k-text-secondary)] font-semibold">
                  {language === 'id' ? 'Sorotan Proyek Terpilih' : 'Featured Case Study Spotlight'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFeaturedIndex(prev => (prev - 1 + featuredProjects.length) % featuredProjects.length)}
                  className="w-8 h-8 rounded-full border border-[var(--k-border)] bg-[var(--k-surface)] hover:bg-[var(--k-surface-raised)] flex items-center justify-center text-[var(--k-text-secondary)] hover:text-white transition-colors"
                  aria-label="Previous featured project"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-sans text-[var(--k-text-secondary)]/70">
                  {featuredIndex + 1} / {featuredProjects.length}
                </span>
                <button
                  onClick={() => setFeaturedIndex(prev => (prev + 1) % featuredProjects.length)}
                  className="w-8 h-8 rounded-full border border-[var(--k-border)] bg-[var(--k-surface)] hover:bg-[var(--k-surface-raised)] flex items-center justify-center text-[var(--k-text-secondary)] hover:text-white transition-colors"
                  aria-label="Next featured project"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div 
              onClick={() => setSelectedProject(currentFeatured)}
              className="cursor-pointer group relative rounded-2xl overflow-hidden border border-[var(--k-border)] bg-[var(--k-surface)] hover:border-brand-red/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0"
            >
              <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-auto sm:h-96 lg:h-[460px] overflow-hidden bg-[var(--k-bg-deep)]">
                <img 
                  src={currentFeatured.image} 
                  alt={currentFeatured.title}
                  className="w-full h-full object-cover sm:object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--k-bg-deep)]/90 via-[var(--k-bg-deep)]/30 to-transparent lg:hidden" />
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-sans font-medium">
                      {currentFeatured.pillar}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--k-bg-deep)] border border-[var(--k-border)] text-[var(--k-text-secondary)] text-xs font-sans">
                      {currentFeatured.service}
                    </span>
                    <span className="text-[var(--k-text-secondary)]/70 text-xs font-sans ml-auto">
                      {currentFeatured.year}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-sans font-bold text-white group-hover:text-brand-red transition-colors mb-2">
                    {currentFeatured.title}
                  </h3>
                  <p className="text-xs font-sans text-[var(--k-text-secondary)] mb-4">
                    {currentFeatured.client} • {currentFeatured.industry}
                  </p>
                  <p className="text-sm text-[var(--k-text-secondary)] leading-relaxed line-clamp-3 mb-6 font-light">
                    {language === 'id' ? currentFeatured.descId : currentFeatured.desc}
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--k-border)] mb-6">
                    {currentFeatured.impact.map((metric, i) => (
                      <div key={i}>
                        <span className="text-lg sm:text-xl font-sans font-bold text-white block">
                          {metric.value}
                        </span>
                        <span className="text-xs font-sans text-[var(--k-text-secondary)] leading-tight block">
                          {metric.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-sans text-brand-red font-semibold group-hover:translate-x-1 transition-transform">
                    <span>{language === 'id' ? 'Buka Detail Studi Kasus' : 'Inspect Full Case Study'}</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter & Search Bar Section */}
      <section className="kapi-work-filter-section py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-12 sticky top-16 sm:top-20 z-30 bg-[var(--k-bg)]/95 backdrop-blur-xl border-b border-[var(--k-border)] shadow-[var(--k-shadow-sm)]">
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 kapi-work-filter-inner">
          {/* Top Controls: Main Pillars + Instant Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            {/* Primary Pillar Tabs */}
            <div className="kapi-work-pillar-tabs flex flex-wrap items-center gap-1.5 sm:gap-2 bg-[var(--k-surface)] p-1 sm:p-1.5 rounded-xl border border-[var(--k-border)]">
              {[
                { key: 'All', labelEn: 'All Disciplines', labelId: 'Semua Bidang' },
                { key: 'Visual Experience', labelEn: 'Visual Experience', labelId: 'Visual Experience' },
                { key: 'Innovation Development', labelEn: 'Innovation Development', labelId: 'Innovation Development' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handlePillarChange(tab.key)}
                  className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs font-sans font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center ${
                    activePillar === tab.key
                      ? 'bg-brand-red text-white shadow-[var(--k-shadow-sm)] shadow-brand-red/20'
                      : 'text-[var(--k-text-secondary)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {language === 'id' ? tab.labelId : tab.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--k-text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(12);
                }}
                placeholder={language === 'id' ? 'Cari studi kasus, klien, stack...' : 'Search case study, client, tech...'}
                className="w-full bg-[var(--k-surface)] border border-[var(--k-border)] rounded-xl pl-10 pr-9 py-2.5 text-base sm:text-xs text-white placeholder:text-[var(--k-text-secondary)] focus-visible:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 transition-colors font-sans min-h-[44px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--k-text-secondary)] hover:text-white min-w-[32px] min-h-[32px] flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Granular Service Pill Filter Scroll with Drag-to-Scroll & Right Black Fade */}
          <div className="relative group/filter kapi-work-service-rail">
            {/* Right Fade Black Gradient */}
            <div className="kapi-work-filter-fade pointer-events-none absolute right-0 top-0 bottom-0 z-10" />

            <div 
              ref={serviceScrollRef}
              onMouseDown={handleMouseDownService}
              onMouseMove={handleMouseMoveService}
              onMouseUp={handleMouseUpOrLeaveService}
              onMouseLeave={handleMouseUpOrLeaveService}
              onWheel={handleWheelService}
              className={`kapi-work-service-scroll flex items-center gap-2 overflow-x-auto overflow-y-hidden py-1.5 pr-16 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                isDraggingService ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--k-text-secondary)] shrink-0 ml-1 mr-1" />
              {serviceOptions.map((srv) => (
                <button
                  key={srv}
                  onClick={() => {
                    setActiveService(srv);
                    setVisibleCount(12);
                  }}
                  className={`px-3.5 py-2 rounded-[10px] text-xs font-sans whitespace-nowrap transition-all duration-200 shrink-0 border min-h-[38px] flex items-center ${
                    activeService === srv
                      ? 'bg-brand-red text-white border-brand-red font-semibold shadow-md shadow-brand-red/20'
                      : 'bg-[var(--k-surface)] text-[var(--k-text-secondary)] border-[var(--k-border)] hover:border-brand-red/40 hover:text-white'
                  }`}
                >
                  {srv === 'All' ? (language === 'id' ? 'Semua Layanan' : 'All Services') : srv}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count Bar */}
          <div className="flex items-center justify-between text-xs font-sans text-[var(--k-text-secondary)] pt-1">
            <span>
              {language === 'id' 
                ? `Menampilkan ${Math.min(visibleCount, filteredProjects.length)} dari ${filteredProjects.length} Studi Kasus` 
                : `Showing ${Math.min(visibleCount, filteredProjects.length)} of ${filteredProjects.length} Case Studies`
              }
            </span>
            {(activePillar !== 'All' || activeService !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setActivePillar('All');
                  setActiveService('All');
                  setSearchQuery('');
                  setVisibleCount(12);
                }}
                className="text-brand-red hover:underline flex items-center gap-1 min-h-[36px]"
              >
                <X size={12} />
                <span>{language === 'id' ? 'Reset Filter' : 'Reset Filters'}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 bg-[var(--k-bg)]">
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[var(--k-border)] rounded-2xl p-8 bg-[var(--k-surface)]/50">
              <Search className="w-10 h-10 text-[var(--k-text-secondary)] mx-auto mb-4" />
              <h3 className="text-xl font-sans font-bold text-white mb-2">
                {language === 'id' ? 'Studi Kasus Tidak Ditemukan' : 'No Case Studies Found'}
              </h3>
              <p className="text-sm text-[var(--k-text-secondary)] max-w-md mx-auto mb-6 font-light">
                {language === 'id' 
                  ? 'Coba sesuaikan kata kunci pencarian Anda atau reset filter untuk melihat 50 studi kasus kami.'
                  : 'Try adjusting your search query or reset filters to browse all 50 case studies.'
                }
              </p>
              <button
                onClick={() => {
                  setActivePillar('All');
                  setActiveService('All');
                  setSearchQuery('');
                }}
                className="px-6 py-3 rounded-[14px] bg-brand-red text-white text-xs font-sans font-semibold hover:bg-[var(--k-red-hover)] transition-colors min-h-[44px]"
              >
                {language === 'id' ? 'Lihat Semua 50 Portofolio' : 'View All 50 Projects'}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProjects.slice(0, visibleCount).map((project) => (
                  <motion.article
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedProject(project)}
                    className="cursor-pointer group rounded-2xl overflow-hidden border border-[var(--k-border)] bg-[var(--k-surface)] hover:bg-[var(--k-surface-raised)] hover:border-brand-red/40 transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--k-bg)]">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--k-bg)]/80 backdrop-blur-md border border-[var(--k-border)] text-xs font-sans text-white">
                          {project.service}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--k-bg)]/80 backdrop-blur-md border border-[var(--k-border)] text-xs font-sans text-[var(--k-text-secondary)]">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-sans text-brand-red uppercase tracking-wider mb-1.5 font-medium">
                          {project.client} • {project.industry}
                        </div>
                        <h3 className="text-lg sm:text-xl font-sans font-bold text-white group-hover:text-brand-red transition-colors mb-2.5">
                          {project.title}
                        </h3>
                        <p className="text-xs text-[var(--k-text-secondary)] font-light leading-relaxed line-clamp-2 mb-4">
                          {language === 'id' ? project.descId : project.desc}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[var(--k-border)] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {project.impact[0] && (
                            <span className="text-xs font-sans font-bold text-white">
                              {project.impact[0].value} <span className="text-xs text-[var(--k-text-secondary)] font-normal">{project.impact[0].label}</span>
                            </span>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full border border-[var(--k-border)] bg-[var(--k-bg)] flex items-center justify-center text-[var(--k-text-secondary)] group-hover:text-brand-red group-hover:border-brand-red/40 group-hover:scale-[1.02] transition-all">
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < filteredProjects.length && (
                <div className="text-center pt-12">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 12)}
                    className="px-8 py-3.5 rounded-[14px] bg-[var(--k-surface)] hover:bg-brand-red text-white border border-[var(--k-border)] hover:border-brand-red text-xs font-sans font-semibold transition-all duration-300 shadow-[var(--k-shadow-sm)] min-h-[44px]"
                  >
                    {language === 'id' ? 'Muat Lebih Banyak Studi Kasus' : 'Load More Case Studies'} ({filteredProjects.length - visibleCount} {language === 'id' ? 'tersisa' : 'remaining'})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Case Study Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md kapi-modal-backdrop" data-public-modal-backdrop>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl bg-[var(--k-surface)] border border-[var(--k-border)] rounded-2xl overflow-hidden shadow-[var(--k-shadow-sm)] my-8 max-h-[90vh] flex flex-col kapi-modal-panel" data-public-modal
            >
              {/* Modal Header Bar */}
              <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-5 bg-[var(--k-surface)]/95 backdrop-blur-md border-b border-[var(--k-border)] gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-sans font-medium">
                      {selectedProject.pillar}
                    </span>
                    <span className="text-xs font-sans text-[var(--k-text-secondary)] truncate">
                      {selectedProject.service}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-sans font-bold text-white truncate">
                    {selectedProject.title} <span className="text-[var(--k-text-secondary)] font-normal">({selectedProject.client})</span>
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-9 h-9 kapi-modal-close shrink-0 min-h-[44px] min-w-[44px]"
                  aria-label="Close case study modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
                {/* Hero Banner */}
                <div className="relative aspect-[16/10] sm:aspect-auto sm:h-80 md:h-96 rounded-xl overflow-hidden bg-[var(--k-bg)] border border-[var(--k-border)]">
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--k-bg)] via-[var(--k-bg)]/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6">
                    <span className="text-xs font-sans text-[var(--k-text-secondary)] block mb-1">
                      {selectedProject.client} • {selectedProject.industry} • {selectedProject.year}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-white">
                      {selectedProject.title}
                    </h2>
                  </div>
                </div>

                {/* Measurable Impact Metrics Grid */}
                <div>
                  <h4 className="text-xs font-sans uppercase tracking-wider text-brand-red mb-3 font-semibold">
                    {language === 'id' ? 'Hasil & Dampak Terukur' : 'Key Performance & Impact Metrics'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedProject.impact.map((item, idx) => (
                      <div key={idx} className="kapi-inset-card">
                        <span className="text-2xl sm:text-3xl font-sans font-bold text-white block mb-1">
                          {item.value}
                        </span>
                        <span className="text-xs font-sans text-[var(--k-text-secondary)] block">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenge & Solution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="kapi-inset-card">
                    <h4 className="text-xs font-sans uppercase tracking-wider text-[var(--k-text-secondary)] mb-2 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--k-text-secondary)]" />
                      <span>{language === 'id' ? 'Tantangan Bisnis' : 'The Challenge'}</span>
                    </h4>
                    <p className="text-sm text-[var(--k-text-secondary)] leading-relaxed font-light">
                      {language === 'id' ? selectedProject.challengeId : selectedProject.challenge}
                    </p>
                  </div>

                  <div className="kapi-inset-card">
                    <h4 className="text-xs font-sans uppercase tracking-wider text-brand-red mb-2 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-red" />
                      <span>{language === 'id' ? 'Solusi & Rekayasa Kapitech' : 'Our Solution & Execution'}</span>
                    </h4>
                    <p className="text-sm text-[var(--k-text-secondary)] leading-relaxed font-light">
                      {language === 'id' ? selectedProject.solutionId : selectedProject.solution}
                    </p>
                  </div>
                </div>

                {/* Deliverables & Tech Stack */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--k-border)]">
                  <div>
                    <h4 className="text-xs font-sans uppercase tracking-wider text-[var(--k-text-secondary)] mb-3 font-semibold">
                      {language === 'id' ? 'Hasil Kerja & Serah Terima' : 'Core Deliverables'}
                    </h4>
                    <ul className="space-y-2">
                      {selectedProject.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs text-white font-light">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-sans uppercase tracking-wider text-[var(--k-text-secondary)] mb-3 font-semibold">
                      {language === 'id' ? 'Teknologi & Perangkat' : 'Tech Stack & Tooling'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech, idx) => (
                        <span key={idx} className="kapi-tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer CTA inside Modal */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-brand-red/20 via-[var(--k-bg)] to-[var(--k-bg)] border border-brand-red/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-sans font-bold text-white">
                      {language === 'id' ? 'Tertarik membangun proyek serupa?' : 'Looking to build a similar project?'}
                    </h4>
                    <p className="text-xs text-[var(--k-text-secondary)] font-light">
                      {language === 'id' ? 'Diskusikan kebutuhan produk Anda bersama tim arsitek dan desainer kami.' : 'Schedule a discovery session with our tech leads and creative directors.'}
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    onClick={() => setSelectedProject(null)}
                    className="px-6 py-3 rounded-[14px] bg-brand-red hover:bg-[var(--k-red-hover)] text-white text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2 shadow-[var(--k-shadow-sm)] shadow-brand-red/20 min-h-[44px]"
                  >
                    <span>{language === 'id' ? 'Mulai Konsultasi' : 'Start Project'}</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
