import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Globe, 
  Cpu, 
  Layout, 
  Code2, 
  Palette, 
  Box, 
  Shield, 
  Layers, 
  X, 
  Smartphone, 
  Sparkles, 
  Building2, 
  Briefcase, 
  Users, 
  BarChart3, 
  ChevronRight,
  Video,
  Film,
  ShoppingCart,
  Server,
  Wrench,
  TrendingUp,
  Target
} from 'lucide-react';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { Testimonials } from '../components/Testimonials';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';
import { allProjects } from '../data/projectsData';

export const Home = () => {
  const { t, language } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const clientPartners = [
    { name: "Lumina Property", industry: language === 'id' ? "Teknologi Properti" : "Real Estate Tech", logoText: "LUMINA", desc: language === 'id' ? "Pencarian Properti & Web Interaktif 3D" : "Property Search & 3D Interactive Web" },
    { name: "Nexus Fintech", industry: language === 'id' ? "Layanan Finansial" : "Financial Services", logoText: "NEXUS", desc: language === 'id' ? "UI Mobile Banking & Dashboard Finansial" : "Mobile Banking & Dashboard UI" },
    { name: "Aura Creative", industry: language === 'id' ? "Media Digital" : "Digital Media", logoText: "AURA", desc: language === 'id' ? "Identitas Brand & Sistem Web" : "Brand Identity & Web Systems" },
    { name: "Solaris CleanTech", industry: language === 'id' ? "Energi Terbarukan" : "Renewable Energy", logoText: "SOLARIS", desc: language === 'id' ? "Portal Monitoring Real-Time" : "Real-time Monitoring Portal" },
    { name: "Vivid Commerce", industry: language === 'id' ? "Ritel & E-Commerce" : "Retail & E-commerce", logoText: "VIVID", desc: language === 'id' ? "Platform E-Commerce Headless" : "Headless E-commerce Platform" },
    { name: "Kross Cloud", industry: language === 'id' ? "Keamanan Siber" : "Cybersecurity", logoText: "KROSS", desc: language === 'id' ? "Arsitektur Keamanan Enterprise" : "Enterprise Security Architecture" },
    { name: "Zenora Health", industry: language === 'id' ? "Teknologi Kesehatan" : "HealthTech", logoText: "ZENORA", desc: language === 'id' ? "Aplikasi Manajemen Pasien" : "Patient Management Application" },
    { name: "Orbit Dynamics", industry: "B2B SaaS", logoText: "ORBIT", desc: language === 'id' ? "Sistem UI/UX Platform Cloud" : "Cloud Platform UI/UX System" },
  ];

  const techStack = [
    { name: "React", category: "Frontend", icon: <Layout size={18} /> },
    { name: "Next.js", category: "Full-Stack", icon: <Globe size={18} /> },
    { name: "TypeScript", category: "Core", icon: <Code2 size={18} /> },
    { name: "Tailwind CSS", category: "Styling", icon: <Palette size={18} /> },
    { name: "Node.js", category: "Backend", icon: <Cpu size={18} /> },
    { name: "Figma", category: "Design", icon: <Box size={18} /> },
    { name: "PostgreSQL", category: "Database", icon: <Layers size={18} /> },
    { name: "AWS & GCP", category: "Cloud", icon: <Shield size={18} /> },
  ];

  const previewProjects = allProjects.slice(0, 4);

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
    <div className="bg-black text-white min-h-screen selection:bg-brand-red selection:text-white" role="main">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center px-4 sm:px-6 md:px-12 pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <AtmosphericBackground 
          imageUrl="/hero_background_3d.png"
          opacity={0.12}
          disableGrayscale={true}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="max-w-4xl">
            {/* Status Chip */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6 sm:mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-white/80">
                PT Kapitech Digital Indonesia • {language === 'id' ? 'Agensi Produk Digital' : 'Digital Product Agency'}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] sm:leading-[1.05] tracking-tight mb-5 sm:mb-8 text-white">
              {language === 'id' ? (
                <>Studio produk digital yang dirancang untuk <span className="text-brand-red">membangun & memperluas</span> bisnis Anda.</>
              ) : (
                <>Digital product studio crafted to <span className="text-brand-red">build & scale</span> your business.</>
              )}
            </h1>
            
            <p className="text-sm sm:text-base md:text-xl text-white/70 font-light leading-relaxed max-w-2xl mb-8 sm:mb-12">
              {language === 'id'
                ? 'Kami merancang dan mengembangkan website berkinerja tinggi, aplikasi web kustom, sistem visual, dan infrastruktur cloud terpercaya untuk bisnis visioner.'
                : 'We design and develop high-performance websites, custom web applications, visual systems, and resilient cloud infrastructures for visionary enterprises.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <Link 
                to="/contact" 
                className="h-12 sm:h-13 px-7 sm:px-8 bg-white hover:bg-brand-red text-black hover:text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <span>{language === 'id' ? 'Mulai Proyek' : 'Start a Project'}</span>
                <ArrowUpRight size={16} />
              </Link>
              <Link 
                to="/work" 
                className="h-12 sm:h-13 px-7 sm:px-8 rounded-full border border-white/20 hover:bg-white/10 text-white transition-colors duration-300 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{language === 'id' ? 'Jelajahi 50 Portofolio' : 'Explore 50 Case Studies'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* REDESIGNED STATS SECTION - Minimal, Simple, High-Contrast & Sleek */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 bg-black border-y border-white/10" aria-label="Key Agency Statistics">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="relative p-6 rounded-2xl bg-zinc-950 border border-white/10 hover:border-brand-red/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-brand-red font-semibold">
                    {stat.label}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">
                    0{i + 1}
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight group-hover:text-brand-red transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs font-mono text-emerald-400 font-medium mt-1">
                    {stat.subValue}
                  </div>
                </div>

                <p className="text-xs text-white/50 font-light leading-relaxed pt-3 border-t border-white/10 mt-2">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTS & PARTNERS SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-black border-b border-white/10" id="clients">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
            <div>
              <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
                {t('clients.tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                {t('clients.title')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/60 font-light max-w-md">
              {t('clients.desc')}
            </p>
          </div>

          {/* Client Logos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {clientPartners.map((client, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 md:p-8 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-brand-red/40 hover:bg-zinc-900/80 transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-white/40 group-hover:text-brand-red transition-colors" />
                    <span className="text-base md:text-lg font-display font-black tracking-wider text-white group-hover:text-brand-red transition-colors">
                      {client.logoText}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/10">
                    {client.industry}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white/90 mb-1">{client.name}</h4>
                  <p className="text-xs text-white/50 font-light leading-relaxed">{client.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tech Ecosystem Strip */}
          <div className="mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-8">
              <span className="text-xs font-mono text-white/50 uppercase tracking-wider shrink-0">
                {language === 'id' ? 'Teknologi & Alat Utama:' : 'Core Technologies & Tools:'}
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {techStack.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:border-brand-red/40 transition-colors"
                  >
                    <span className="text-brand-red">{tech.icon}</span>
                    <span>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TWO CORE PILLARS / SERVICES SECTION */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-zinc-950 border-b border-white/10 relative z-10" id="services">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-12 sm:mb-16">
            <div>
              <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
                {language === 'id' ? 'Dua Pilar Solusi' : 'Two Core Service Pillars'}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold tracking-tight text-white">
                {language === 'id' ? 'Layanan Unggulan Kapitech' : 'Full-Spectrum Capabilities'}
              </h2>
            </div>
            <Link 
              to="/services" 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red hover:text-white transition-colors"
            >
              <span>{language === 'id' ? 'Lihat Semua 12 Layanan' : 'Explore All 12 Services'}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pillar 1: Visual Experience */}
            <div className="p-8 sm:p-10 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-brand-red/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                    <Palette size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-mono font-medium">
                    7 Disciplines
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
                  1. Visual Experience
                </h3>
                <p className="text-sm text-white/70 font-light leading-relaxed mb-6">
                  {language === 'id' 
                    ? 'Menciptakan daya tarik visual, identitas berkarakter kuat, dan interaksi yang memukau audiens dari detik pertama.'
                    : 'Crafting mesmerizing visual design, iconic branding, and multi-format media that immediately captivates audiences.'
                  }
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  {[
                    { name: 'UI/UX Design', desc: language === 'id' ? 'Sistem desain Figma & antarmuka responsif' : 'Figma design systems & responsive interfaces' },
                    { name: 'Video Production', desc: language === 'id' ? 'Event, pernikahan sinematik & iklan TVC' : 'Events, wedding films & brand commercials' },
                    { name: '2D Animation', desc: language === 'id' ? 'Video explainer produk & animasi web Lottie' : 'Explainer videos & lightweight Lottie motion' },
                    { name: 'Branding & Identity', desc: language === 'id' ? 'Arsitektur logo & buku pedoman brandbook' : 'Logo architecture & complete brand manuals' },
                    { name: 'Motion & Graphic Design', desc: language === 'id' ? 'Tipografi kinetik & iklan digital billboard' : 'Kinetic typography & DOOH motion displays' },
                    { name: 'Creative Design', desc: language === 'id' ? 'Laporan tahunan & investor pitch decks' : 'Annual corporate reports & pitch decks' },
                    { name: '3D Visualization', desc: language === 'id' ? 'Render 3D arsitektur & produk fotorealistis' : 'Architectural & photorealistic product renders' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-white/80 font-light">
                      <CheckCircle2 size={15} className="text-brand-red shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white font-medium">{item.name}</strong> — <span className="text-white/60">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-white/10">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-brand-red hover:text-white transition-colors"
                >
                  <span>{language === 'id' ? 'Jelajahi Visual Experience' : 'Explore Visual Experience'}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Pillar 2: Innovation Development */}
            <div className="p-8 sm:p-10 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-brand-red/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                    <Code2 size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-mono font-medium">
                    5 Disciplines
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
                  2. Innovation Development
                </h3>
                <p className="text-sm text-white/70 font-light leading-relaxed mb-6">
                  {language === 'id'
                    ? 'Rekayasa perangkat lunak berskala tinggi, platform e-commerce, arsitektur ERP/CRM, dan infrastruktur cloud stabil 24/7.'
                    : 'Engineering resilient enterprise software, e-commerce engines, custom ERP/CRM workflows, and high-availability cloud systems.'
                  }
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  {[
                    { name: 'Brochure Site / Company Profile Website', desc: language === 'id' ? 'Website korporat sub-1 detik & SEO terstruktur' : 'Sub-1s corporate portals & headless CMS' },
                    { name: 'E-Commerce Website', desc: language === 'id' ? 'Toko online headless, payment gateway & kurir' : 'Headless commerce, payment gateways & cart sync' },
                    { name: 'Web Application', desc: language === 'id' ? 'Platform SaaS kustom & kolaborasi real-time' : 'Custom SaaS platforms & WebSockets architecture' },
                    { name: 'ERP / CRM System', desc: language === 'id' ? 'Manajemen inventaris, sales pipeline & keuangan' : 'Inventory tracking, sales CRM & balance sheets' },
                    { name: 'IT Support & Infrastructure', desc: language === 'id' ? 'Migrasi cloud AWS/GCP, DevOps & SLA 24/7' : 'Cloud setup, CI/CD pipelines & SLA retainer' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-white/80 font-light">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white font-medium">{item.name}</strong> — <span className="text-white/60">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-white/10">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-brand-red hover:text-white transition-colors"
                >
                  <span>{language === 'id' ? 'Jelajahi Innovation Development' : 'Explore Innovation Development'}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS PREVIEW (Linked to 50 Case Studies) */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-black border-b border-white/10 relative z-10" id="work">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
            <div>
              <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
                {language === 'id' ? 'Studi Kasus Unggulan' : 'Featured Case Studies'}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
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
                className="group rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-brand-red/40 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-white/10">
                    {project.impact[0] ? `${project.impact[0].value} ${project.impact[0].label}` : project.year}
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-[11px] font-mono font-medium text-brand-red uppercase tracking-wider">
                        {project.service}
                      </span>
                      <span className="text-[11px] font-light text-white/50">
                        {project.client}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold mb-2.5 text-white group-hover:text-brand-red transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed mb-5">
                      {language === 'id' ? project.descId : project.desc}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 3).map((item) => (
                        <span key={item} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-zinc-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 block">
              {language === 'id' ? 'Alur Kerja Studio' : 'Our Working Framework'}
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white">
              {language === 'id' ? 'Eksekusi Tangkas & Terukur' : 'Disciplined Agile Execution'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step) => (
              <div 
                key={step.step}
                className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-brand-red/30 transition-colors flex flex-col justify-between"
              >
                <div className="text-2xl font-display font-bold text-brand-red font-mono mb-4">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
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
