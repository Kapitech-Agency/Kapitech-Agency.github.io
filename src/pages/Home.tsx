import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Code2, 
  Layers, 
  X, 
  Sparkles, 
  ChevronRight,
} from 'lucide-react';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { Testimonials } from '../components/Testimonials';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';
import { getCmsProjects, fetchServerCmsProjects } from '../lib/cmsStore';

export const Home = () => {
  const { t, language } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [previewProjects, setPreviewProjects] = useState(() => getCmsProjects().slice(0, 4));

  useEffect(() => {
    void fetchServerCmsProjects().then((projects) => setPreviewProjects(projects.slice(0, 4)));
    const handleCmsUpdate = () => setPreviewProjects(getCmsProjects().slice(0, 4));
    window.addEventListener('kapitech_cms_updated', handleCmsUpdate);
    return () => window.removeEventListener('kapitech_cms_updated', handleCmsUpdate);
  }, []);
  // Redesigned Simple, High-Contrast Stats
  const stats = [
    { 
      label: language === 'id' ? "Pengalaman Industri" : "Years in Industry", 
      value: "3+ Years", 
      subValue: language === 'id' ? "Sejak 2021" : "Est. 2021",
      desc: language === 'id' ? "Dedikasi penuh dalam rekayasa produk digital" : "Dedicated digital product engineering" 
    },
    { 
      label: language === 'id' ? "Proyek Terselesaikan" : "Completed Projects", 
      value: "50+ Projects", 
      subValue: "100% On-Time",
      desc: language === 'id' ? "50 studi kasus terverifikasi di berbagai sektor" : "50 verified case studies across sectors" 
    },
    { 
      label: language === 'id' ? "Fokus Klien" : "Client Focus", 
      value: "SME & Enterprise", 
      subValue: language === 'id' ? "Kemitraan Jangka Panjang" : "Long-term Partnerships",
      desc: language === 'id' ? "Pertumbuhan startup dan korporat skala global" : "High-growth startups and global brands" 
    },
    { 
      label: language === 'id' ? "Pendekatan Layanan" : "Service Approach", 
      value: "End-to-End", 
      subValue: "Strategy • Design • Code",
      desc: language === 'id' ? "Solusi satu atap dari strategi hingga SLA" : "Full lifecycle from discovery to SLA" 
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: language === 'id' ? "Penemuan & Ruang Lingkup" : "Discovery & Scope",
      desc: language === 'id' 
        ? "Kami menganalisis target bisnis, audiens sasaran, dan kebutuhan teknis untuk merancang roadmap kerja yang terukur."
        : "We analyze your business goals, target audience, and project specifications to create an actionable roadmap."
    },
    {
      step: "02",
      title: language === 'id' ? "Desain UI/UX & Prototipe" : "UI/UX & Prototyping",
      desc: language === 'id'
        ? "Kami merancang wireframe, alur pengguna, dan prototipe interaktif di Figma untuk ditinjau dan disetujui sebelum coding."
        : "We design wireframes, user flows, and interactive mockups in Figma for your review and approval before coding."
    },
    {
      step: "03",
      title: language === 'id' ? "Pengembangan Agile" : "Agile Development",
      desc: language === 'id'
        ? "Tim engineer kami menulis kode yang bersih, teruji, dan modular dengan laporan kemajuan berkala di setiap milestone."
        : "Our engineering team writes clean, tested, and modular code with regular milestone updates and progress demos."
    },
    {
      step: "04",
      title: language === 'id' ? "Pengujian & Peluncuran" : "Testing & Launch",
      desc: language === 'id'
        ? "QA menyeluruh di berbagai peramban dan perangkat, konfigurasi domain, deployment cloud, dan garansi pemeliharaan."
        : "Comprehensive QA across browsers and devices, domain setup, deployment, and ongoing post-launch maintenance."
    }
  ];

  return (
    <div className="bg-[var(--k-bg)] text-white min-h-screen selection:bg-brand-red selection:text-white" role="main">
      {/* Hero Section */}
      <section className="kapi-home-hero relative min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center px-4 sm:px-6 md:px-12 pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-20 overflow-hidden bg-black">
        <AtmosphericBackground
          imageUrl="/hero_background_3d.png"
          opacity={0.055}
          disableGrayscale={false}
          className="kapi-hero-atmosphere"
        />
        <div className="kapi-hero-orbit kapi-hero-orbit-one" aria-hidden="true" />
        <div className="kapi-hero-orbit kapi-hero-orbit-two" aria-hidden="true" />
        <div className="kapi-hero-grid" aria-hidden="true" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            className="max-w-4xl kapi-home-content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="kapi-hero-eyebrow">Kapitech Agency <span aria-hidden="true">/</span> Digital Product Studio</div>
            <h1 className="kapi-display-title">
              {language === 'id' ? (
                <>Studio produk digital yang dirancang untuk <span className="text-brand-red">membangun & memperluas</span> bisnis Anda.</>
              ) : (
                <>Digital product studio crafted to <span className="text-brand-red">build & scale</span> your business.</>
              )}
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-[var(--k-text-secondary)] font-light leading-relaxed max-w-2xl mb-8 sm:mb-10">
              {language === 'id'
                ? 'Kami merancang dan mengembangkan website berkinerja tinggi, aplikasi web kustom, sistem visual, dan infrastruktur cloud terpercaya untuk bisnis visioner.'
                : 'We design and develop high-performance websites, custom web applications, visual systems, and resilient cloud infrastructures for visionary enterprises.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <Link
                to="/contact"
                className="kapi-button kapi-button-primary kapi-start-project kapi-hero-cta"
              >
                <span>{language === 'id' ? 'Mulai Proyek' : 'Start a Project'}</span>
                <ArrowUpRight size={16} />
              </Link>
              <Link 
                to="/work" 
                className="kapi-button kapi-button-secondary"
              >
                <span>{language === 'id' ? 'Jelajahi 50 Portofolio' : 'Explore 50 Case Studies'}</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* REDESIGNED STATS SECTION - Minimal, Simple, High-Contrast & Sleek */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 bg-[var(--k-bg)] border-y border-[var(--k-border)]" aria-label="Key Agency Statistics">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="kapi-card kapi-stat-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-sans uppercase tracking-[0.14em] text-brand-red font-semibold">
                    {stat.label}
                  </span>
                  <span className="text-xs font-sans kapi-stat-index">
                    0{i + 1}
                  </span>
                </div>

                <div className="my-2">
                  <div className="kapi-stat-value">
                    {stat.value}
                  </div>
                  <div className="kapi-stat-subvalue">
                    {stat.subValue}
                  </div>
                </div>

                <p className="kapi-stat-desc">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTS & PARTNERS SECTION - LOOPING CAROUSEL WITH SIDE SHADOWS */}
      <section className="py-14 sm:py-20 bg-[var(--k-bg)] border-b border-[var(--k-border)] overflow-hidden relative" id="clients">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-8 sm:mb-10 text-center">
          <span className="text-brand-red font-sans font-semibold tracking-widest uppercase text-xs mb-2 block">
            {language === 'id' ? 'KLIEN & MITRA TERPERCAYA' : 'TRUSTED BY INNOVATION LEADERS'}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold tracking-tight text-white">
            {language === 'id' 
              ? 'Dipercaya oleh 50+ perusahaan global & startup bervaluasi tinggi' 
              : 'Empowering 50+ global scaleups, enterprise leaders & venture-backed products'}
          </h2>
        </div>

        {/* Looping Marquee Track with Left & Right Gradient Shadows */}
        <div className="relative w-full overflow-hidden py-4">
          
          {/* Left Gradient Shadow */}
          <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[var(--k-bg)] via-[var(--k-bg)]/90 to-transparent z-20 pointer-events-none" />
          
          {/* Right Gradient Shadow */}
          <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[var(--k-bg)] via-[var(--k-bg)]/90 to-transparent z-20 pointer-events-none" />

          {/* Marquee Motion Container */}
          <div className="flex w-max">
            <motion.div
              className="flex items-center gap-12 sm:gap-20 shrink-0 pr-12 sm:pr-20"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: 28,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {[
                { name: 'interprefy', style: 'font-sans font-bold tracking-tight text-2xl sm:text-3xl lowercase' },
                { name: 'PLAYERS HEALTH', style: 'font-sans font-black tracking-widest text-lg sm:text-xl uppercase' },
                { name: 'AUTOMATTIC', style: 'font-sans font-bold tracking-wider text-xl sm:text-2xl uppercase' },
                { name: 'WordPress.com', style: 'font-sans font-bold tracking-normal text-2xl sm:text-3xl' },
                { name: 'CHALHOUB GROUP', style: 'font-sans font-extrabold tracking-widest text-lg sm:text-xl uppercase' },
                { name: 'GREIF', style: 'font-sans font-black tracking-widest text-2xl sm:text-3xl uppercase' },
                { name: 'Sinta Health', style: 'font-sans font-bold tracking-tight text-xl sm:text-2xl' },
                { name: 'BlockDB Networks', style: 'font-sans font-semibold tracking-wider text-lg sm:text-xl uppercase' },
                { name: 'Orbit Cloud', style: 'font-sans font-black tracking-tighter text-2xl sm:text-3xl uppercase' },
                { name: 'Zenora Systems', style: 'font-sans font-semibold tracking-wide text-xl sm:text-2xl' },
                { name: 'Lumina Realty', style: 'font-sans font-extrabold tracking-widest text-lg sm:text-xl uppercase' },
                { name: 'Solaris CleanTech', style: 'font-sans font-bold tracking-tight text-xl sm:text-2xl' },
                { name: 'Nexus Fintech', style: 'font-sans font-black tracking-wide text-xl sm:text-2xl uppercase' },
                { name: 'Kross Security', style: 'font-sans font-extrabold tracking-widest text-lg sm:text-xl uppercase' },
                // Duplicate set for seamless continuous loop
                { name: 'interprefy', style: 'font-sans font-bold tracking-tight text-2xl sm:text-3xl lowercase' },
                { name: 'PLAYERS HEALTH', style: 'font-sans font-black tracking-widest text-lg sm:text-xl uppercase' },
                { name: 'AUTOMATTIC', style: 'font-sans font-bold tracking-wider text-xl sm:text-2xl uppercase' },
                { name: 'WordPress.com', style: 'font-sans font-bold tracking-normal text-2xl sm:text-3xl' },
                { name: 'CHALHOUB GROUP', style: 'font-sans font-extrabold tracking-widest text-lg sm:text-xl uppercase' },
                { name: 'GREIF', style: 'font-sans font-black tracking-widest text-2xl sm:text-3xl uppercase' },
                { name: 'Sinta Health', style: 'font-sans font-bold tracking-tight text-xl sm:text-2xl' },
                { name: 'BlockDB Networks', style: 'font-sans font-semibold tracking-wider text-lg sm:text-xl uppercase' },
                { name: 'Orbit Cloud', style: 'font-sans font-black tracking-tighter text-2xl sm:text-3xl uppercase' },
                { name: 'Zenora Systems', style: 'font-sans font-semibold tracking-wide text-xl sm:text-2xl' },
                { name: 'Lumina Realty', style: 'font-sans font-extrabold tracking-widest text-lg sm:text-xl uppercase' },
                { name: 'Solaris CleanTech', style: 'font-sans font-bold tracking-tight text-xl sm:text-2xl' },
                { name: 'Nexus Fintech', style: 'font-sans font-black tracking-wide text-xl sm:text-2xl uppercase' },
                { name: 'Kross Security', style: 'font-sans font-extrabold tracking-widest text-lg sm:text-xl uppercase' }
              ].map((logo, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-center shrink-0 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default px-4"
                >
                  <span className={`${logo.style} text-[var(--k-text-secondary)] hover:text-white whitespace-nowrap`}>
                    {logo.name}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOLUTIONS & 3 CORE PILLARS SECTION */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[var(--k-bg)] border-b border-[var(--k-border)] relative z-10" id="services">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-12 sm:mb-16">
            <div>
              <span className="text-brand-red font-sans font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
                {language === 'id' ? 'Layanan & Solusi Lengkap' : 'Solutions & Core Capabilities'}
              </span>
              <h2 className="kapi-section-title">
                {language === 'id' ? 'Solusi Strategis & Keahlian Studio' : 'Strategic Solutions & Studio Craft'}
              </h2>
            </div>
            <Link 
              to="/services" 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red hover:text-white transition-colors"
            >
              <span>{language === 'id' ? 'Lihat Semua Layanan & Solusi' : 'Explore All Services & Solutions'}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Solutions 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                slug: 'mvp-design',
                title: 'MVP DESIGN',
                audience: language === 'id' ? 'Untuk ekosistem enterprise & startup' : 'For enterprise ecosystems',
                desc: language === 'id' ? 'Ciptakan produk digital berdaya saing, pikat investor, dan raih klien baru.' : 'Create a digital product, attract investors and new clients'
              },
              {
                slug: 'product-redesign',
                title: 'PRODUCT REDESIGN',
                audience: language === 'id' ? 'Untuk UKM & korporasi berkembang' : 'For SMEs & enterprises',
                desc: language === 'id' ? 'Dapatkan tampilan modern, tingkatkan UX, dan optimalkan konversi.' : 'Get a fresh look, improved user experience, or enhanced functionality'
              },
              {
                slug: 'team-extension',
                title: 'TEAM EXTENSION',
                audience: language === 'id' ? 'Untuk perusahaan dengan tim internal' : 'For existing companies',
                desc: language === 'id' ? 'Perluas kapasitas tim Anda bersama desainer & engineer berdedikasi kami.' : 'Expand your team with our dedicated and talented design experts'
              }
            ].map((sol, idx) => (
              <Link 
                key={idx} 
                to={`/solutions/${sol.slug}`}
                className="group p-6 sm:p-7 rounded-2xl bg-[var(--k-surface)] border border-[var(--k-border)] hover:border-brand-red/40 hover:bg-[var(--k-surface-raised)] transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-sans uppercase tracking-widest text-brand-red font-semibold block mb-1">
                    {sol.audience}
                  </span>
                  <h3 className="text-xl font-sans font-bold text-white group-hover:text-brand-red transition-colors mb-2">
                    {sol.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--k-text-secondary)] font-light leading-relaxed">
                    {sol.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--k-border)]">
                  <div className="text-xs font-sans text-brand-red group-hover:text-white flex items-center gap-1.5 transition-colors">
                    <span>{language === 'id' ? 'Lihat Detail Subpage' : 'Explore Subpage'}</span>
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 3 Pillars Grid (Branding, Design, Development) with kapi-card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1: Branding */}
            <div className="kapi-card" id="card-branding">
              <div className="kapi-card-header">
                <div className="kapi-card-icon-box">
                  <Sparkles className="w-5 h-5 text-current" />
                </div>
                <span className="kapi-card-pill">01. IDENTITY</span>
              </div>

              <div className="kapi-card-body">
                <h3 className="kapi-card-title">
                  BRAND IDENTITY & SYSTEM
                </h3>
                <p className="kapi-card-desc">
                  {language === 'id' 
                    ? 'Merumuskan positioning, panduan gaya visual terstruktur, dan strategi diferensiasi brand yang memperkuat reputasi pasar.' 
                    : 'Build undeniable market distinction, cohesive visual systems, and high-trust positioning.'}
                </p>
                <div className="kapi-card-tags">
                  <span className="kapi-card-tag">Pitch Deck</span>
                  <span className="kapi-card-tag">Brand Identity</span>
                  <span className="kapi-card-tag">Logo Design</span>
                  <span className="kapi-card-tag">Rebranding</span>
                </div>
              </div>

              <div className="kapi-card-footer">
                <Link to="/services" className="flex items-center justify-between w-full">
                  <span>{language === 'id' ? 'Jelajahi 5 Layanan Branding' : 'Explore 5 Branding Services'}</span>
                  <div className="kapi-card-arrow">
                    <ArrowUpRight size={14} />
                  </div>
                </Link>
              </div>
            </div>

            {/* Pillar 2: Design */}
            <div className="kapi-card" id="card-design">
              <div className="kapi-card-header">
                <div className="kapi-card-icon-box">
                  <Layers className="w-5 h-5 text-current" />
                </div>
                <span className="kapi-card-pill">02. EXPERIENCE</span>
              </div>

              <div className="kapi-card-body">
                <h3 className="kapi-card-title">
                  UI/UX & PRODUCT DESIGN
                </h3>
                <p className="kapi-card-desc">
                  {language === 'id' 
                    ? 'Pengalaman antarmuka intuitif berstandar global, prototipe interaktif, dan Design System multi-platform di Figma.' 
                    : 'Frictionless UI/UX architectures, interactive prototyping, and cross-platform design systems in Figma.'}
                </p>
                <div className="kapi-card-tags">
                  <span className="kapi-card-tag">UI/UX Design</span>
                  <span className="kapi-card-tag">Web & Mobile</span>
                  <span className="kapi-card-tag">Redesign</span>
                  <span className="kapi-card-tag">UX Audit</span>
                </div>
              </div>

              <div className="kapi-card-footer">
                <Link to="/services" className="flex items-center justify-between w-full">
                  <span>{language === 'id' ? 'Jelajahi 5 Layanan Desain' : 'Explore 5 Design Services'}</span>
                  <div className="kapi-card-arrow">
                    <ArrowUpRight size={14} />
                  </div>
                </Link>
              </div>
            </div>

            {/* Pillar 3: Development */}
            <div className="kapi-card" id="card-development">
              <div className="kapi-card-header">
                <div className="kapi-card-icon-box">
                  <Code2 className="w-5 h-5 text-current" />
                </div>
                <span className="kapi-card-pill">03. ENGINEERING</span>
              </div>

              <div className="kapi-card-body">
                <h3 className="kapi-card-title">
                  FULL-STACK ENGINEERING
                </h3>
                <p className="kapi-card-desc">
                  {language === 'id' 
                    ? 'Rekayasa web modern berperforma tinggi, skalabilitas cloud elastis, integrasi API, dan skor Lighthouse 99+.' 
                    : 'High-performance web applications, resilient cloud architecture, and ultra-fast Lighthouse 99+ loading speeds.'}
                </p>
                <div className="kapi-card-tags">
                  <span className="kapi-card-tag">Web Development</span>
                  <span className="kapi-card-tag">MVP Build</span>
                  <span className="kapi-card-tag">Landing Pages</span>
                  <span className="kapi-card-tag">Enterprise</span>
                </div>
              </div>

              <div className="kapi-card-footer">
                <Link to="/services" className="flex items-center justify-between w-full">
                  <span>{language === 'id' ? 'Jelajahi 5 Layanan Engineering' : 'Explore 5 Engineering Services'}</span>
                  <div className="kapi-card-arrow">
                    <ArrowUpRight size={14} />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS PREVIEW (Linked to 50 Case Studies) */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[var(--k-bg)] border-b border-[var(--k-border)] relative z-10" id="work">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
            <div>
              <span className="text-brand-red font-sans font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
                {language === 'id' ? 'Studi Kasus Unggulan' : 'Featured Case Studies'}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold tracking-tight text-white">
                {language === 'id' ? 'Karya Nyata & Berkelanjutan' : 'Real Work for Real Leaders'}
              </h2>
            </div>
            <Link 
              to="/work" 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white hover:text-brand-red transition-colors"
            >
              <span>{language === 'id' ? 'Buka Semua 50 Portofolio' : 'View All 50 Case Studies'}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {previewProjects.map((project) => (
              <Link 
                key={project.id}
                to="/work"
                className="group rounded-2xl overflow-hidden bg-[var(--k-surface)] border border-[var(--k-border)] hover:border-brand-red/40 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--k-bg)]">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[var(--k-bg)]/90 backdrop-blur-md text-xs font-sans text-brand-red border border-[var(--k-border)]">
                    {project.impact[0] ? `${project.impact[0].value} ${project.impact[0].label}` : project.year}
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-xs font-sans font-medium text-brand-red uppercase tracking-wider">
                        {project.service}
                      </span>
                      <span className="text-xs font-light text-[var(--k-text-secondary)]">
                        {project.client}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-sans font-bold mb-2.5 text-white group-hover:text-brand-red transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--k-text-secondary)] font-light leading-relaxed mb-5">
                      {language === 'id' ? project.descId : project.desc}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--k-border)]">
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 3).map((item) => (
                        <span key={item} className="px-2 py-0.5 rounded bg-[var(--k-bg)] border border-[var(--k-border)] text-xs font-sans text-[var(--k-text-secondary)]">
                          {item}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-brand-red inline-flex items-center gap-1">
                      {language === 'id' ? 'Buka Kasus' : 'Inspect'} <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WORKING PROCESS STEPPING */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-[var(--k-bg)] border-b border-[var(--k-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="text-brand-red font-sans font-semibold tracking-widest uppercase text-xs mb-3 block">
              {language === 'id' ? 'Alur Kerja Studio' : 'Our Working Framework'}
            </span>
            <h2 className="kapi-section-title">
              {language === 'id' ? 'Eksekusi Tangkas & Terukur' : 'Disciplined Agile Execution'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step) => (
              <div 
                key={step.step}
                className="p-6 rounded-2xl bg-[var(--k-surface)] border border-[var(--k-border)] hover:border-brand-red/30 transition-colors flex flex-col justify-between"
              >
                <div className="text-2xl font-sans font-bold text-brand-red font-sans mb-4">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-lg font-sans font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--k-text-secondary)] font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
};
