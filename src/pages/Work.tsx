import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X, Layout, Code2, Palette, Box, Search, Filter, ChevronLeft, ChevronRight, Loader2, Activity, Layers } from 'lucide-react';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { MagneticButton } from '../components/ui/MagneticButton';
import Fuse from 'fuse.js';

import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';

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
      category: "IT Development / UI/UX Design",
      featured: true,
      recent: true,
      image: "https://picsum.photos/seed/lumina/1200/800",
      desc: "A high-performance property ecosystem architected for sub-second search latency and enterprise scalability.",
      challenge: "The legacy infrastructure suffered from high latency and poor mobile conversion rates, hindering market growth.",
      solution: "We implemented a headless architecture using Next.js and a custom-built search engine optimized for real-time listing updates.",
      results: "Achieved a 30% increase in lead generation and 99.99% system availability during peak traffic cycles.",
      roi: { conversion: "+30%", uptime: "99.99%", engagement: "+45%" },
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      stats: { complexity: "High", performance: 98, security: "Enterprise" }
    },
    {
      title: "Aura Creative Studio",
      category: "Graphic Design / UI/UX Design",
      featured: true,
      recent: false,
      image: "https://picsum.photos/seed/aura/1200/800",
      desc: "A comprehensive brand identity and digital presence engineered to reflect high-end creative precision.",
      challenge: "Inconsistent visual language across platforms was diluting brand equity and client trust.",
      solution: "Developed a unified design system and a minimalist digital portfolio that prioritizes high-resolution asset delivery.",
      results: "Brand recognition increased by 150%, leading to a significant shift towards premium-tier client acquisitions.",
      roi: { conversion: "+150%", uptime: "99.9%", engagement: "+80%" },
      technologies: ["Figma", "Framer Motion", "Adobe Illustrator"],
      stats: { complexity: "Medium", performance: 99, security: "Standard" }
    },
    {
      title: "Nexus Fintech App",
      category: "IT Development / UI/UX Design",
      featured: true,
      recent: true,
      image: "https://picsum.photos/seed/nexus/1200/800",
      desc: "A secure, low-latency financial management platform designed for high-frequency user interactions.",
      challenge: "Complex user flows and high friction during onboarding were causing significant user drop-off.",
      solution: "Streamlined the UX architecture and implemented a robust backend with real-time data synchronization.",
      results: "Onboarding completion rate improved by 85%, with a 60% increase in daily active users.",
      roi: { conversion: "+85%", uptime: "99.9%", engagement: "+60%" },
      technologies: ["React Native", "Node.js", "MongoDB"],
      stats: { complexity: "Critical", performance: 96, security: "Military-Grade" }
    },
    {
      title: "Vanguard Logistics",
      category: "IT Development / UI/UX Design",
      featured: false,
      recent: false,
      image: "https://picsum.photos/seed/vanguard/1200/800",
      desc: "An operational dashboard providing real-time fleet telemetry and automated shipment tracking.",
      challenge: "Manual tracking processes were causing operational bottlenecks and data inaccuracies.",
      solution: "Engineered a custom telemetry dashboard that integrates directly with fleet hardware for live data visualization.",
      results: "Operational efficiency increased by 40%, with a significant reduction in manual reporting errors.",
      roi: { conversion: "N/A", uptime: "99.9%", engagement: "+40%" },
      technologies: ["React", "Node.js", "PostgreSQL"],
      stats: { complexity: "High", performance: 94, security: "Enterprise" }
    },
    {
      title: "Zenith Marketplace",
      category: "IT Development / Graphic Design",
      featured: true,
      recent: true,
      image: "https://picsum.photos/seed/zenith/1200/800",
      desc: "A scalable e-commerce engine optimized for high-volume transactions and seamless cross-device experiences.",
      challenge: "The existing platform was unable to handle traffic spikes during seasonal sales, leading to revenue loss.",
      solution: "Architected a cloud-native commerce solution with auto-scaling capabilities and a high-fidelity visual interface.",
      results: "Successfully handled a 400% traffic surge with zero downtime, resulting in a 22% increase in overall sales.",
      roi: { conversion: "+22%", uptime: "100%", engagement: "+35%" },
      technologies: ["React", "Shopify API", "Tailwind CSS"],
      stats: { complexity: "High", performance: 97, security: "PCI-DSS" }
    },
    {
      title: "Titan Health",
      category: "IT Development / UI/UX Design",
      featured: false,
      recent: false,
      image: "https://picsum.photos/seed/titan/1200/800",
      desc: "A HIPAA-compliant patient management system focused on data security and intuitive scheduling.",
      challenge: "Patients faced significant friction in booking appointments, and data privacy was a primary concern.",
      solution: "Developed a secure, encrypted patient portal with a simplified scheduling engine and real-time notifications.",
      results: "Patient satisfaction scores increased by 50%, with a 70% reduction in scheduling-related support calls.",
      roi: { conversion: "+50%", uptime: "100%", engagement: "+70%" },
      technologies: ["React", "Node.js", "PostgreSQL"],
      stats: { complexity: "Critical", performance: 95, security: "HIPAA" }
    }
  ];

  const categories = ['All', 'Featured', 'Recent', 'IT Development', 'UI/UX Design', 'Graphic Design'];

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

      <div className="relative z-10 pt-24 md:pt-32 pb-20 px-6 md:px-12" role="main" aria-label="Our Portfolio">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Kapitech Agency // Portfolio</span>
              <h1 className="text-5xl sm:text-7xl md:text-[10vw] font-display font-bold leading-[0.85] tracking-tighter mb-12 text-gradient">
                Our Work.
              </h1>
              <p className="text-lg md:text-2xl text-white/60 max-w-3xl font-light leading-tight tracking-tight">
                A collection of digital solutions built for our clients. We focus on delivering practical results that help businesses grow.
              </p>
            </motion.div>
          </header>

          {/* Featured Carousel */}
          <section className="mb-32" aria-label="Featured Projects">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-brand-red" />
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">Selected Projects</span>
              </div>
              <div className="flex gap-2" role="group" aria-label="Carousel navigation">
                <button 
                  onClick={prevFeatured}
                  className="p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-500 group/btn"
                  aria-label="Previous featured project"
                >
                  <ChevronLeft size={18} className="group-hover/btn:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={nextFeatured}
                  className="p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all duration-500 group/btn"
                  aria-label="Next featured project"
                >
                  <ChevronRight size={18} className="group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="relative aspect-[16/10] md:aspect-[21/8] rounded-3xl md:rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 group">
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
                  aria-label={`View featured project: ${featuredProjects[currentFeaturedIndex].title}`}
                  aria-live="polite"
                >
                  <img 
                    src={featuredProjects[currentFeaturedIndex].image} 
                    alt={featuredProjects[currentFeaturedIndex].title}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-6 md:p-16 flex flex-col justify-center max-w-3xl">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Selected Case Study</span>
                      <h2 className="text-3xl md:text-6xl lg:text-7xl font-display font-bold tracking-tighter mb-6 leading-none">
                        {featuredProjects[currentFeaturedIndex].title}
                      </h2>
                      <p className="text-base md:text-xl text-white/60 font-light leading-relaxed mb-8 line-clamp-2">
                        {featuredProjects[currentFeaturedIndex].desc}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 md:gap-6">
                        <div className="flex gap-2">
                          {featuredProjects[currentFeaturedIndex].technologies.slice(0, 3).map((tech: string) => (
                            <span key={tech} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[8px] font-mono font-bold uppercase tracking-widest text-white/40">
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-white group-hover:text-brand-red transition-colors cursor-pointer">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">View Project</span>
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
            </div>
          </section>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24">
            <div className="flex flex-wrap gap-3" role="tablist" aria-label="Project categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  role="tab"
                  aria-selected={activeFilter === cat}
                  className={`px-6 md:px-8 py-2 md:py-3 rounded-full border text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-500 ${
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
                placeholder="Search projects..."
                aria-label="Search projects or technologies"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 md:py-4 pl-14 pr-6 text-xs md:text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-brand-red transition-all"
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
                      className="overflow-hidden rounded-[2.5rem] aspect-[16/10] mb-8 relative border border-white/5 group-hover:border-brand-red/30 transition-all duration-700 shadow-2xl"
                    >
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                      />
                      
                      {/* Project Metadata Overlay */}
                      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                        <AnimatePresence>
                          {project.featured && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="px-4 py-1.5 bg-brand-red text-white text-[8px] font-bold uppercase tracking-[0.3em] rounded-full shadow-[0_0_20px_rgba(255,59,59,0.6)] border border-white/10"
                            >
                              Featured
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-white/60 text-[8px] font-mono font-bold uppercase tracking-[0.3em] rounded-full">
                          Node: {String(i + 1).padStart(2, '0')}
                        </div>
                      </div>

                      <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                        <div className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-emerald-400 text-[8px] font-mono font-bold uppercase tracking-[0.3em] rounded-full flex items-center gap-2">
                          <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                          Perf: {project.stats.performance}%
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
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4 group-hover:text-brand-red transition-colors tracking-tighter leading-tight">{project.title}</h3>
                        <p className="text-white/40 text-sm md:text-base font-light leading-relaxed max-w-md line-clamp-2 group-hover:text-white/80 transition-colors">{project.desc}</p>
                      </div>
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-brand-red group-hover:border-brand-red group-hover:text-white transition-all duration-500 shrink-0 mt-2 shadow-lg">
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
                  className="px-12 py-5 bg-white text-black rounded-full font-bold flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Load More Projects
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

                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-brand-red tracking-tight">The Challenge.</h3>
                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed mb-12 md:mb-16">
                  {selectedProject.challenge}
                </p>
                
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-brand-red tracking-tight">The Solution.</h3>
                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed mb-12 md:mb-16">
                  {selectedProject.solution}
                </p>
                
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-brand-red tracking-tight">The Results.</h3>
                <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity size={80} className="text-brand-red" />
                  </div>
                  <p className="text-xl md:text-2xl text-white font-light leading-relaxed italic relative z-10">
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
                          <span className="text-4xl md:text-5xl font-display font-bold block text-white tracking-tighter">{selectedProject.roi.conversion}</span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Conversion Lift</span>
                        </div>
                        <ArrowUpRight className="text-emerald-400 mb-2" size={24} />
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-4xl md:text-5xl font-display font-bold block text-white tracking-tighter">{selectedProject.roi.engagement}</span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">User Engagement</span>
                        </div>
                        <Activity className="text-blue-400 mb-2" size={24} />
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-4xl md:text-5xl font-display font-bold block text-white tracking-tighter">{selectedProject.roi.uptime}</span>
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
                    <button className="w-full px-10 py-6 bg-white text-black rounded-full font-bold flex items-center justify-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-[10px] shadow-xl">
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
                    <h3 className="text-4xl md:text-6xl font-display font-bold tracking-tighter">Related Projects.</h3>
                  </div>
                  <p className="text-white/40 max-w-md text-sm md:text-base font-light leading-relaxed">
                    Explore more high-impact solutions engineered with similar technologies and creative strategies.
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
                        <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 relative">
                          <img 
                            src={related.image} 
                            alt={related.title} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                          <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full">
                            <span className="text-[8px] font-mono font-bold text-white uppercase tracking-widest">
                              Match: {Math.min(99, 70 + related.score)}%
                            </span>
                          </div>
                        </div>
                        <h4 className="text-xl font-display font-bold mb-2 group-hover:text-brand-red transition-colors">{related.title}</h4>
                        <p className="text-brand-red font-mono text-[8px] font-bold uppercase tracking-[0.3em] mb-3">{related.category}</p>
                        <p className="text-white/40 text-xs font-light leading-relaxed line-clamp-2">{related.desc}</p>
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
