import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X, Layout, Code2, Palette, Box, Search, Filter, ChevronLeft, ChevronRight, Loader2, Activity, Layers } from 'lucide-react';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { MagneticButton } from '../components/ui/MagneticButton';
import Fuse from 'fuse.js';

import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { TelemetryOverlay } from '../components/ui/TelemetryOverlay';

export const Work = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  React.useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-modal-open', 'true');
    } else {
      document.body.style.overflow = 'unset';
      document.body.removeAttribute('data-modal-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.removeAttribute('data-modal-open');
    };
  }, [selectedProject]);

  const projects = [
    {
      title: "Lumina Real Estate",
      category: "System Engineering / Interface Production",
      featured: true,
      recent: true,
      image: "https://picsum.photos/seed/lumina/1200/800",
      desc: "High-performance property ecosystem architected for sub-second search latency and enterprise scalability.",
      challenge: "Legacy infrastructure exhibited high latency and low mobile conversion rates, obstructing market expansion.",
      solution: "Implemented headless architecture using Next.js and a custom search engine optimized for real-time data synchronization.",
      results: "Lead generation increased by 30%. System availability maintained at 99.99% during peak traffic cycles.",
      roi: { conversion: "+30%", uptime: "99.99%", engagement: "+45%" },
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      stats: { complexity: "High", performance: 98, security: "Enterprise" },
      region: "Global",
      status: "Operational"
    },
    {
      title: "Aura Creative Studio",
      category: "Visual Architecture / Interface Production",
      featured: true,
      recent: false,
      image: "https://picsum.photos/seed/aura/1200/800",
      desc: "Comprehensive brand identity and digital presence engineered for high-precision creative output.",
      challenge: "Inconsistent visual language across platforms reduced brand equity and client trust.",
      solution: "Developed unified design system and minimalist digital portfolio prioritizing high-resolution asset delivery.",
      results: "Brand recognition increased by 150%. Client acquisition shifted toward premium-tier segments.",
      roi: { conversion: "+150%", uptime: "99.9%", engagement: "+80%" },
      technologies: ["Figma", "Framer Motion", "Adobe Illustrator"],
      stats: { complexity: "Medium", performance: 99, security: "Standard" },
      region: "EMEA",
      status: "Operational"
    },
    {
      title: "Nexus Fintech App",
      category: "System Engineering / Interface Production",
      featured: true,
      recent: true,
      image: "https://picsum.photos/seed/nexus/1200/800",
      desc: "Secure, low-latency financial management platform designed for high-frequency user interactions.",
      challenge: "Complex user flows and high friction during onboarding caused significant user drop-off.",
      solution: "Streamlined UX architecture and implemented robust backend with real-time data synchronization.",
      results: "Onboarding completion improved by 85%. Daily active users increased by 60%.",
      roi: { conversion: "+85%", uptime: "99.9%", engagement: "+60%" },
      technologies: ["React Native", "Node.js", "MongoDB"],
      stats: { complexity: "Critical", performance: 96, security: "Military-Grade" },
      region: "APAC",
      status: "Operational"
    },
    {
      title: "Vanguard Logistics",
      category: "System Engineering / Interface Production",
      featured: false,
      recent: false,
      image: "https://picsum.photos/seed/vanguard/1200/800",
      desc: "Operational dashboard providing real-time fleet telemetry and automated shipment tracking.",
      challenge: "Manual tracking processes caused operational bottlenecks and data inaccuracies.",
      solution: "Engineered custom telemetry dashboard integrating directly with fleet hardware for live data visualization.",
      results: "Operational efficiency increased by 40%. Manual reporting errors significantly reduced.",
      roi: { conversion: "N/A", uptime: "99.9%", engagement: "+40%" },
      technologies: ["React", "Node.js", "PostgreSQL"],
      stats: { complexity: "High", performance: 94, security: "Enterprise" },
      region: "Global",
      status: "Operational"
    },
    {
      title: "Zenith Marketplace",
      category: "System Engineering / Visual Architecture",
      featured: true,
      recent: true,
      image: "https://picsum.photos/seed/zenith/1200/800",
      desc: "Scalable e-commerce engine optimized for high-volume transactions and seamless cross-device experiences.",
      challenge: "Platform instability during traffic spikes caused revenue loss.",
      solution: "Architected cloud-native commerce solution with auto-scaling capabilities and high-fidelity visual interface.",
      results: "Handled 400% traffic surge with zero downtime. Sales increased by 22%.",
      roi: { conversion: "+22%", uptime: "100%", engagement: "+35%" },
      technologies: ["React", "Shopify API", "Tailwind CSS"],
      stats: { complexity: "High", performance: 97, security: "PCI-DSS" },
      region: "Global",
      status: "Operational"
    },
    {
      title: "Titan Health",
      category: "System Engineering / Interface Production",
      featured: false,
      recent: false,
      image: "https://picsum.photos/seed/titan/1200/800",
      desc: "HIPAA-compliant patient management system focused on data security and intuitive scheduling.",
      challenge: "High friction in appointment booking and data privacy concerns.",
      solution: "Developed secure, encrypted patient portal with simplified scheduling engine and real-time notifications.",
      results: "Patient satisfaction increased by 50%. Scheduling-related support calls reduced by 70%.",
      roi: { conversion: "+50%", uptime: "100%", engagement: "+70%" },
      technologies: ["React", "Node.js", "PostgreSQL"],
      stats: { complexity: "Critical", performance: 95, security: "HIPAA" },
      region: "North America",
      status: "Operational"
    }
  ];

  const categories = ['All', 'Featured', 'Recent', 'System Engineering', 'Interface Production', 'Visual Architecture'];

  const featuredProjects = useMemo(() => projects.filter(p => p.featured), [projects]);

  const filteredProjects = useMemo(() => {
    // First, filter by category
    const categoryFiltered = projects.filter(project => {
      return activeFilter === 'All' || 
             (activeFilter === 'Featured' ? project.featured : 
              activeFilter === 'Recent' ? project.recent :
              project.category.includes(activeFilter));
    });

    // Then, apply fuzzy search if there's a query
    if (!searchQuery) return categoryFiltered;

    const fuse = new Fuse(categoryFiltered, {
      keys: ['title', 'desc', 'technologies'],
      threshold: 0.35, 
      distance: 100,
      ignoreLocation: true
    });

    return fuse.search(searchQuery).map(result => result.item);
  }, [activeFilter, searchQuery]);

  const displayedProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // Simulate network delay for "engineered" feel
    setTimeout(() => {
      setVisibleCount(prev => prev + 6);
      setIsLoadingMore(false);
    }, 1000);
  };

  const nextFeatured = () => {
    setCurrentFeaturedIndex((prev) => (prev + 1) % featuredProjects.length);
  };

  const prevFeatured = () => {
    setCurrentFeaturedIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length);
  };

  // Reset visible count when filter or search changes
  React.useEffect(() => {
    setVisibleCount(6);
  }, [activeFilter, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-black overflow-hidden"
    >
      {/* Atmospheric Background */}
      <AtmosphericBackground 
        imageUrl="https://images.unsplash.com/photo-1522542550221-31fd1971107c?auto=format&fit=crop&q=80&w=2070"
        accentColor="red"
        statusText="OPERATIONAL_SYNC"
        scanMode="ACTIVE_TELEMETRY"
        sysRef="KPTCH_WRK_ARCH_00"
      />

      {/* Telemetry Overlay */}
      <TelemetryOverlay label="KPTCH_WORK_TELEMETRY" accentColor="red" />

      <div className="relative z-10 pt-24 md:pt-48 pb-24 md:pb-48 px-6 md:px-12" role="main" aria-label="Our Portfolio">
        <div className="max-w-7xl mx-auto">
          <header className="mb-24 md:mb-40 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Kapitech Operations // Archive</span>
              <h1 className="text-[clamp(2rem,6vw,6rem)] font-display font-bold leading-[0.85] tracking-tighter mb-12 uppercase">
                Operational Index.
              </h1>
              <p className="text-sm md:text-base text-white/40 max-w-2xl font-light leading-relaxed tracking-tight">
                Archive of technical deployments and system architectures. We deliver functional results for client operational requirements.
              </p>
            </motion.div>

            {/* Project Archive Visual */}
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-brand-red/50 via-brand-red/10 to-transparent hidden lg:block">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute left-0 w-12 h-px bg-brand-red/20 origin-left"
                  style={{ top: `${i * 12.5}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-brand-red rounded-full" />
                </motion.div>
              ))}
            </div>
          </header>

          {/* Featured Projects Section */}
          <section className="mb-32 md:mb-48 relative" aria-label="Featured Projects">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 md:mb-32">
              <div className="max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-px bg-brand-red/40" />
                  <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">Selected Deployments</span>
                </div>
                <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-display font-bold tracking-tighter leading-none uppercase">
                  Featured<br />
                  <span className="text-brand-red">Case Studies.</span>
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-1 mr-4 hidden sm:flex">
                  <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Active_Index</span>
                  <span className="text-xs font-mono text-white font-bold">0{currentFeaturedIndex + 1} / 0{featuredProjects.length}</span>
                </div>
                <div className="flex gap-4" role="group" aria-label="Carousel navigation">
                  <button 
                    onClick={prevFeatured}
                    className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-red hover:border-brand-red transition-all group/btn backdrop-blur-xl"
                    aria-label="Previous featured project"
                  >
                    <ChevronLeft size={20} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={nextFeatured}
                    className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-red hover:border-brand-red transition-all group/btn backdrop-blur-xl"
                    aria-label="Next featured project"
                  >
                    <ChevronRight size={20} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative aspect-[16/10] md:aspect-[21/8] rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 group shadow-2xl shadow-black/50">
              {/* Technical Frame */}
              <div className="absolute top-8 left-8 z-20 flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                <span className="text-[8px] font-mono font-bold text-white/60 uppercase tracking-widest">Live_Telemetry</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeaturedIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red"
                  onClick={() => setSelectedProject(featuredProjects[currentFeaturedIndex])}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(featuredProjects[currentFeaturedIndex])}
                  tabIndex={0}
                  role="button"
                  aria-label={`View featured deployment: ${featuredProjects[currentFeaturedIndex].title}`}
                  aria-live="polite"
                >
                  <img 
                    src={featuredProjects[currentFeaturedIndex].image} 
                    alt={featuredProjects[currentFeaturedIndex].title}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s] grayscale group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-3xl">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Selected Case Study</span>
                      <h2 className="text-3xl md:text-5xl lg:text-7xl font-display font-bold tracking-tighter mb-6 leading-[0.9] uppercase">
                        {featuredProjects[currentFeaturedIndex].title}
                      </h2>
                      <p className="text-sm md:text-lg text-white/60 font-light leading-relaxed mb-10 line-clamp-2 max-w-xl">
                        {featuredProjects[currentFeaturedIndex].desc}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 md:gap-6">
                        <div className="flex gap-2">
                          {featuredProjects[currentFeaturedIndex].technologies.slice(0, 3).map((tech: string) => (
                            <span key={tech} className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-[8px] font-mono font-bold uppercase tracking-widest text-white/40">
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-white group-hover:text-brand-red transition-colors cursor-pointer">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">View Deployment</span>
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Indicators */}
              <div className="absolute bottom-8 right-8 flex gap-2 z-20" role="tablist" aria-label="Carousel indicators">
                {featuredProjects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentFeaturedIndex(i)}
                    role="tab"
                    aria-selected={currentFeaturedIndex === i}
                    aria-label={`Go to featured project ${i + 1}`}
                    className={`h-1 transition-all duration-500 rounded-full ${
                      currentFeaturedIndex === i ? 'w-8 bg-brand-red' : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-20">
                <motion.div 
                  key={currentFeaturedIndex}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 8, ease: "linear" }}
                  onAnimationComplete={nextFeatured}
                  className="h-full bg-brand-red"
                />
              </div>
            </div>
          </section>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24 md:mb-40">
            <div className="flex flex-wrap gap-3" role="tablist" aria-label="Operational categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  role="tab"
                  aria-selected={activeFilter === cat}
                  className={`px-6 md:px-8 py-2 md:py-3 rounded-2xl border text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-500 ${
                    activeFilter === cat
                      ? 'bg-white border-white text-black'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-red transition-colors" size={16} />
              <input 
                type="text"
                placeholder="SEARCH ARCHIVE..."
                aria-label="Search deployments or technologies"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 md:py-4 pl-14 pr-6 text-xs md:text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-brand-red transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24" role="list" aria-label="Project grid">
            <AnimatePresence mode="popLayout">
              {displayedProjects.length > 0 ? (
                displayedProjects.map((project, i) => (
                  <motion.div 
                    key={project.title}
                    layout
                    role="listitem"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                    className="group relative cursor-pointer focus:outline-none"
                    onClick={() => setSelectedProject(project)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(project)}
                    tabIndex={0}
                    aria-label={`View project: ${project.title}`}
                  >
                    <PerspectiveTilt 
                      className="overflow-hidden rounded-3xl aspect-[16/10] mb-8 relative border border-white/5 group-hover:border-brand-red/30 transition-all duration-700 shadow-2xl"
                    >
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                      />
                      
                      {/* Project Metadata Overlay */}
                      <div className="absolute top-8 left-8 z-20 flex flex-col gap-2">
                        <AnimatePresence>
                          {project.featured && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="px-4 py-1.5 bg-brand-red text-white text-[8px] font-bold uppercase tracking-[0.3em] rounded-xl shadow-[0_0_20px_rgba(255,59,59,0.6)] border border-white/10"
                            >
                              Featured
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-white/60 text-[8px] font-mono font-bold uppercase tracking-[0.3em] rounded-xl">
                          Node: {String(i + 1).padStart(2, '0')}
                        </div>
                      </div>

                      <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                        <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-emerald-400 text-[8px] font-mono font-bold uppercase tracking-[0.3em] rounded-xl flex items-center gap-2">
                          <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                          PERF: {project.stats.performance}%
                        </div>
                      </div>

                      {/* Technical Specs Overlay (On Hover) */}
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center p-12 z-30">
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-px bg-brand-red" />
                            <span className="text-brand-red font-mono text-[10px] font-bold uppercase tracking-[0.4em]">Technical Specs</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <p className="text-white/20 font-mono text-[8px] uppercase tracking-widest mb-2">Architecture</p>
                              <p className="text-white/80 font-mono text-[10px] font-bold uppercase">{project.stats.complexity}</p>
                            </div>
                            <div>
                              <p className="text-white/20 font-mono text-[8px] uppercase tracking-widest mb-2">Security Level</p>
                              <p className="text-white/80 font-mono text-[10px] font-bold uppercase">{project.stats.security}</p>
                            </div>
                            <div>
                              <p className="text-white/20 font-mono text-[8px] uppercase tracking-widest mb-2">Region</p>
                              <p className="text-white/80 font-mono text-[10px] font-bold uppercase">{project.region}</p>
                            </div>
                            <div>
                              <p className="text-white/20 font-mono text-[8px] uppercase tracking-widest mb-2">Status</p>
                              <p className="text-emerald-400 font-mono text-[10px] font-bold uppercase">{project.status}</p>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-white/10">
                            <p className="text-white/20 font-mono text-[8px] uppercase tracking-widest mb-3">Core Technologies</p>
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech: string) => (
                                <span key={tech} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-mono text-white/40 uppercase">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </PerspectiveTilt>
                    <div className="flex justify-between items-start group-hover:translate-x-2 transition-transform duration-500">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-6 h-px bg-brand-red/40 group-hover:w-12 group-hover:bg-brand-red transition-all duration-500" />
                          <p className="text-brand-red font-mono text-[10px] font-bold uppercase tracking-[0.3em]">{project.category}</p>
                        </div>
                        <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-bold mb-4 group-hover:text-brand-red transition-colors tracking-tighter leading-tight uppercase">{project.title}</h3>
                        <p className="text-sm text-white/40 font-light leading-relaxed max-w-md line-clamp-2 group-hover:text-white/80 transition-colors">{project.desc}</p>
                      </div>
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl border border-white/10 flex items-center justify-center group-hover:bg-brand-red group-hover:border-brand-red group-hover:text-white transition-all duration-500 shrink-0 mt-2 shadow-lg">
                        <ArrowUpRight size={24} className="md:w-8 md:h-8 group-hover:rotate-45 transition-transform duration-500" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center"
                >
                  <Filter className="mx-auto text-white/10 mb-6" size={64} />
                  <h3 className="text-2xl font-display font-bold mb-2">No projects found</h3>
                  <p className="text-white/60">Try adjusting your filters or search query</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          {filteredProjects.length > visibleCount && (
            <div className="mt-24 flex justify-center">
              <MagneticButton>
                <button 
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-12 py-5 bg-white text-black rounded-2xl font-bold flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      LOAD MORE DEPLOYMENTS
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>
              </MagneticButton>
            </div>
          )}
        </div>
      </div>

      {/* Kinetic Typography */}
      <div className="absolute bottom-10 left-0 w-full kinetic-text opacity-5 select-none pointer-events-none">
        <div className="kinetic-track text-[8vh] md:text-[15vh] font-display font-black uppercase tracking-tighter">
          <span>Kapitech Agency • UI/UX Design • IT Development • Graphic Design • </span>
          <span>Kapitech Agency • UI/UX Design • IT Development • Graphic Design • </span>
        </div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col overflow-y-auto case-study-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed top-6 right-6 md:top-12 md:right-12 z-[10000] p-3 md:p-4 rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all"
              aria-label="Close case study"
            >
              <X size={24} className="md:w-8 md:h-8" />
            </motion.button>

            <div className="w-full h-[50vh] md:h-[70vh] relative">
              <motion.img 
                layoutId={`img-${selectedProject.title}`}
                src={selectedProject.image} 
                alt={selectedProject.title} 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-12 left-6 md:bottom-20 md:left-12">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4 block"
                >
                  {selectedProject.category}
                </motion.span>
                <motion.h2 
                  id="modal-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl sm:text-6xl md:text-[8vw] lg:text-[10vw] font-display font-bold tracking-tighter leading-[0.85]"
                >
                  {selectedProject.title}
                </motion.h2>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-32 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-12">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-red/10 border border-brand-red/20">
                    <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Operational Audit</span>
                  </div>
                  <div className="h-px flex-grow bg-white/5" />
                </div>

                <h3 className="text-xl md:text-2xl font-display font-bold mb-6 md:mb-8 text-brand-red tracking-tight uppercase">The Challenge.</h3>
                <p className="text-sm md:text-base text-white/60 font-light leading-relaxed mb-12 md:mb-16">
                  {selectedProject.challenge}
                </p>
                
                <h3 className="text-xl md:text-2xl font-display font-bold mb-6 md:mb-8 text-brand-red tracking-tight uppercase">The Solution.</h3>
                <p className="text-sm md:text-base text-white/60 font-light leading-relaxed mb-12 md:mb-16">
                  {selectedProject.solution}
                </p>
                
                <h3 className="text-xl md:text-2xl font-display font-bold mb-6 md:mb-8 text-brand-red tracking-tight uppercase">The Results.</h3>
                <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity size={80} className="text-brand-red" />
                  </div>
                  <p className="text-sm md:text-base text-white font-light leading-relaxed italic relative z-10">
                    "{selectedProject.results}"
                  </p>
                </div>
              </div>
              
              <div className="space-y-12">
                <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-10">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-6">Technical Stack</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech: string) => (
                        <span key={tech} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-white/60 hover:border-brand-red/40 transition-colors">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-6">Performance Metrics</span>
                    <div className="space-y-8">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-3xl md:text-4xl font-display font-bold block text-white tracking-tighter">{selectedProject.roi.conversion}</span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Conversion Lift</span>
                        </div>
                        <ArrowUpRight className="text-emerald-400 mb-2" size={24} />
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-3xl md:text-4xl font-display font-bold block text-white tracking-tighter">{selectedProject.roi.engagement}</span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">User Engagement</span>
                        </div>
                        <Activity className="text-blue-400 mb-2" size={24} />
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-3xl md:text-4xl font-display font-bold block text-white tracking-tighter">{selectedProject.roi.uptime}</span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">System Uptime</span>
                        </div>
                        <Code2 className="text-purple-400 mb-2" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-mono text-white/20 block uppercase tracking-widest mb-1">Complexity</span>
                        <span className="text-xs font-mono text-white font-bold">{selectedProject.stats.complexity}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-white/20 block uppercase tracking-widest mb-1">Security</span>
                        <span className="text-xs font-mono text-white font-bold">{selectedProject.stats.security}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link to="/contact" className="w-full">
                  <MagneticButton>
                    <button className="w-full px-10 py-6 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-[10px] shadow-xl font-mono">
                      Initialize Live Project <ArrowUpRight size={20} />
                    </button>
                  </MagneticButton>
                </Link>
              </div>
            </div>

            {/* Related Projects Section */}
            <div className="bg-zinc-950/50 border-t border-white/5 py-24 md:py-32 px-6 md:px-12">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                  <div>
                    <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Further Exploration</span>
                    <h3 className="text-3xl md:text-5xl font-display font-bold tracking-tighter uppercase">Related Deployments.</h3>
                  </div>
                  <p className="text-white/40 max-w-md text-xs md:text-sm font-light leading-relaxed">
                    Archive of high-impact solutions engineered with similar technologies and creative strategies.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {projects
                    .filter(p => p.title !== selectedProject.title)
                    .map(p => {
                      let score = 0;
                      const pCats = p.category.split(' / ');
                      const sCats = selectedProject.category.split(' / ');
                      const sharedCats = pCats.filter(c => sCats.includes(c));
                      score += sharedCats.length * 10;
                      const sharedTech = p.technologies.filter(t => selectedProject.technologies.includes(t));
                      score += sharedTech.length;
                      return { ...p, score };
                    })
                    .filter(p => p.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3)
                    .map((related, i) => (
                      <motion.div
                        key={related.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => {
                          setSelectedProject(related);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          // Also scroll the modal to top if it's the scroll container
                          const modal = document.querySelector('.case-study-modal');
                          if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-[16/10] rounded-3xl overflow-hidden mb-6 relative border border-white/5">
                          <img 
                            src={related.image} 
                            alt={related.title} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                          <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl">
                            <span className="text-[8px] font-mono font-bold text-white uppercase tracking-widest">
                              Match: {Math.min(99, 70 + related.score)}%
                            </span>
                          </div>
                        </div>
                        <h4 className="text-xl font-display font-bold mb-2 group-hover:text-brand-red transition-colors uppercase tracking-tight">{related.title}</h4>
                        <p className="text-brand-red font-mono text-[8px] font-bold uppercase tracking-[0.3em] mb-3">{related.category}</p>
                        <p className="text-white/40 text-[10px] font-light leading-relaxed line-clamp-2">{related.desc}</p>
                      </motion.div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
