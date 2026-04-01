import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X, Layout, Code2, Palette, Box, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { MagneticButton } from '../components/ui/MagneticButton';
import Fuse from 'fuse.js';

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
      desc: "A property search website built for speed and ease of use, helping users find listings quickly.",
      challenge: "The old website was slow and difficult to navigate, making it hard for users to find the properties they were looking for.",
      solution: "We built a new website using Next.js to improve performance and redesigned the search interface to be more intuitive for users.",
      results: "Users are now spending more time on the site, and the client has seen an increase in property inquiries.",
      roi: { conversion: "+30%", uptime: "99.9%", engagement: "+45%" },
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"]
    },
    {
      title: "Aura Creative Studio",
      category: "Graphic Design / UI/UX Design",
      featured: true,
      recent: false,
      image: "https://picsum.photos/seed/aura/1200/800",
      desc: "A complete brand refresh and website design for a creative studio, focusing on a clean and professional look.",
      challenge: "Aura's previous branding was inconsistent and their website didn't accurately reflect the quality of their work.",
      solution: "We created a new visual identity and a minimalist website that highlights their portfolio and services clearly.",
      results: "The new branding has helped them attract more professional clients and improved their overall brand recognition.",
      roi: { conversion: "+150%", uptime: "99.9%", engagement: "+80%" },
      technologies: ["Figma", "Framer Motion", "Adobe Illustrator"]
    },
    {
      title: "Nexus Fintech App",
      category: "IT Development / UI/UX Design",
      featured: true,
      recent: true,
      image: "https://picsum.photos/seed/nexus/1200/800",
      desc: "A mobile app design and development project that simplifies financial management for everyday users.",
      challenge: "The original app was complex and confusing, leading to many users dropping off during the signup process.",
      solution: "We simplified the user flow and redesigned the interface to make it easier for users to understand their financial data.",
      results: "The signup completion rate has improved significantly, and user feedback on the new design has been very positive.",
      roi: { conversion: "+85%", uptime: "99.9%", engagement: "+60%" },
      technologies: ["React Native", "Node.js", "MongoDB"]
    },
    {
      title: "Vanguard Logistics",
      category: "IT Development / UI/UX Design",
      featured: false,
      recent: false,
      image: "https://picsum.photos/seed/vanguard/1200/800",
      desc: "An internal dashboard for a logistics company to track shipments and manage fleet operations in real-time.",
      challenge: "The company was using outdated systems that made it difficult to track shipments accurately and efficiently.",
      solution: "We developed a custom dashboard that integrates with their existing data to provide real-time updates on shipment status.",
      results: "The new system has improved operational efficiency and reduced the time spent on manual tracking tasks.",
      roi: { conversion: "N/A", uptime: "99.9%", engagement: "+40%" },
      technologies: ["React", "Node.js", "PostgreSQL"]
    },
    {
      title: "Zenith Marketplace",
      category: "IT Development / Graphic Design",
      featured: true,
      recent: true,
      image: "https://picsum.photos/seed/zenith/1200/800",
      desc: "An e-commerce website for a fashion brand, focusing on high-quality visuals and a smooth shopping experience.",
      challenge: "The brand needed a website that could handle high traffic during sales and provide a consistent experience across devices.",
      solution: "We built a responsive e-commerce site with a focus on performance and clean visual design to showcase their products.",
      results: "The site has seen an increase in mobile sales and can now handle peak traffic without any performance issues.",
      roi: { conversion: "+22%", uptime: "99.9%", engagement: "+35%" },
      technologies: ["React", "Shopify API", "Tailwind CSS"]
    },
    {
      title: "Titan Health",
      category: "IT Development / UI/UX Design",
      featured: false,
      recent: false,
      image: "https://picsum.photos/seed/titan/1200/800",
      desc: "A healthcare app that helps patients schedule appointments and communicate with their doctors securely.",
      challenge: "Patients found it difficult to book appointments online and were concerned about the security of their personal data.",
      solution: "We designed and developed a secure app with a simple booking system and encrypted messaging features.",
      results: "Patient satisfaction has improved, and the app has made it easier for the clinic to manage appointments.",
      roi: { conversion: "+50%", uptime: "100%", engagement: "+70%" },
      technologies: ["React", "Node.js", "PostgreSQL"]
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
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-5" 
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-brand-red/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[700px] h-[700px] bg-blue-900/10 blur-[180px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <img 
          src="https://images.unsplash.com/photo-1522542550221-31fd1971107c?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] grayscale"
          alt="Background Texture"
          referrerPolicy="no-referrer"
        />
      </div>

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
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                    className="group relative cursor-pointer focus:outline-none"
                    onClick={() => setSelectedProject(project)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedProject(project)}
                    tabIndex={0}
                    aria-label={`View project: ${project.title}`}
                  >
                    <PerspectiveTilt 
                      className="overflow-hidden rounded-[2rem] aspect-[16/10] mb-8 relative"
                    >
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                      />
                      {project.featured && (
                        <div className="absolute top-6 left-6 z-20 px-4 py-1.5 bg-brand-red text-white text-[8px] font-bold uppercase tracking-[0.3em] rounded-full">
                          Featured
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </PerspectiveTilt>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3 group-hover:text-brand-red transition-colors">{project.title}</h3>
                        <p className="text-brand-red font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{project.category}</p>
                        <p className="text-white/60 text-sm md:text-base font-light leading-relaxed max-w-sm">{project.desc}</p>
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 shrink-0">
                        <ArrowUpRight size={20} className="md:w-6 md:h-6" />
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
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-brand-red">The Challenge.</h3>
                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed mb-12 md:mb-16">
                  {selectedProject.challenge}
                </p>
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-brand-red">The Solution.</h3>
                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed mb-12 md:mb-16">
                  {selectedProject.solution}
                </p>
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8 text-brand-red">The Results.</h3>
                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed italic border-l-2 border-brand-red pl-6">
                  {selectedProject.results}
                </p>
              </div>
              <div className="space-y-12">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-4">Technologies</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech: string) => (
                      <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-white/60">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-4">Key Metrics</span>
                  <div className="space-y-6">
                    <div>
                      <span className="text-3xl md:text-4xl font-display font-bold block">{selectedProject.roi.conversion}</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">Conversion Rate</span>
                    </div>
                    <div>
                      <span className="text-3xl md:text-4xl font-display font-bold block">{selectedProject.roi.engagement}</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">User Engagement</span>
                    </div>
                  </div>
                </div>
                <MagneticButton>
                  <button className="w-full px-10 py-5 bg-white text-black rounded-full font-bold flex items-center justify-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500 uppercase tracking-widest text-[10px]">
                    View Live Project <ArrowUpRight size={18} />
                  </button>
                </MagneticButton>
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
