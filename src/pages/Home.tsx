import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Globe, Cpu, Layout, Code2, Palette, Box, Shield, Layers, X, Smartphone, Sparkles, Building2, Briefcase, Users, BarChart3, ChevronRight } from 'lucide-react';
import { PerspectiveTilt } from '../components/ui/PerspectiveTilt';
import { Testimonials } from '../components/Testimonials';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';
import { cn } from '../lib/utils';

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

  const projectsEn = [
    {
      title: "Lumina Real Estate Portal",
      category: "Web Development & UI/UX",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
      description: "Interactive real estate portal featuring responsive search filters, virtual tour showcases, and an optimized lead capture pipeline.",
      stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      status: "Live Project",
      client: "Lumina Real Estate"
    },
    {
      title: "Aura Studio Brand & Web",
      category: "Visual Identity & Frontend",
      image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1200",
      description: "Comprehensive visual branding, design system guidelines, and custom high-performance web experience for a creative agency.",
      stack: ["React", "Figma", "Motion", "Tailwind CSS"],
      status: "Completed",
      client: "Aura Creative Studio"
    },
    {
      title: "Nexus Mobile Banking UI",
      category: "Mobile App & Product Design",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
      description: "Intuitive financial dashboard, real-time transaction tracking, and frictionless user flows designed for mobile finance.",
      stack: ["React Native", "TypeScript", "Node.js", "Figma"],
      status: "Production",
      client: "Nexus Fintech"
    },
    {
      title: "Solaris CleanTech Dashboard",
      category: "SaaS & Data Visualization",
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=1200",
      description: "Clean operational interface for energy monitoring, production metrics, and automated reporting systems across 40+ solar farms.",
      stack: ["Next.js", "D3.js", "Tailwind CSS", "GCP"],
      status: "Live Project",
      client: "Solaris Energy"
    }
  ];

  const projectsId = [
    {
      title: "Portal Real Estate Lumina",
      category: "Pengembangan Web & UI/UX",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
      description: "Portal real estate interaktif dengan filter pencarian responsif, pameran tur virtual, dan sistem penangkapan prospek yang teroptimasi.",
      stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      status: "Proyek Aktif",
      client: "Lumina Real Estate"
    },
    {
      title: "Brand & Web Aura Studio",
      category: "Identitas Visual & Frontend",
      image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1200",
      description: "Branding visual komprehensif, pedoman sistem desain, dan pengalaman web kustom berkecepatan tinggi untuk agensi kreatif terkemuka.",
      stack: ["React", "Figma", "Motion", "Tailwind CSS"],
      status: "Selesai",
      client: "Aura Creative Studio"
    },
    {
      title: "UI Mobile Banking Nexus",
      category: "Aplikasi Mobile & Desain Produk",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
      description: "Dashboard keuangan intuitif, pelacakan transaksi real-time, dan alur pengguna yang mulus untuk kebutuhan mobile fintech.",
      stack: ["React Native", "TypeScript", "Node.js", "Figma"],
      status: "Produksi",
      client: "Nexus Fintech"
    },
    {
      title: "Dashboard CleanTech Solaris",
      category: "SaaS & Visualisasi Data",
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=1200",
      description: "Antarmuka operasional bersih untuk pemantauan energi surya, metrik produksi real-time, dan sistem pelaporan otomatis di 40+ lokasi.",
      stack: ["Next.js", "D3.js", "Tailwind CSS", "GCP"],
      status: "Proyek Aktif",
      client: "Solaris Energy"
    }
  ];

  const projects = language === 'id' ? projectsId : projectsEn;

  const stats = [
    { 
      label: language === 'id' ? "Pengalaman Industri" : "Years in Industry", 
      value: language === 'id' ? "3+ Tahun" : "3+ Years", 
      desc: language === 'id' ? "Berdiri sejak 2021" : "Established since 2021" 
    },
    { 
      label: language === 'id' ? "Proyek Terselesaikan" : "Completed Projects", 
      value: language === 'id' ? "50+ Proyek" : "50+ Projects", 
      desc: language === 'id' ? "Web, mobile & UI/UX" : "Web, mobile & UI/UX" 
    },
    { 
      label: language === 'id' ? "Fokus Klien" : "Client Focus", 
      value: language === 'id' ? "UKM & Korporat" : "SME & Enterprise", 
      desc: language === 'id' ? "Mitra domestik & global" : "Global & domestic partners" 
    },
    { 
      label: language === 'id' ? "Pendekatan Layanan" : "Service Approach", 
      value: language === 'id' ? "End-to-End" : "End-to-End", 
      desc: language === 'id' ? "Strategi, desain & kode" : "Strategy, design & code" 
    }
  ];

  const servicesCards = [
    {
      title: language === 'id' ? "Pengembangan Web & Software" : "Web & Software Development",
      icon: <Code2 size={28} />,
      desc: language === 'id' 
        ? "Aplikasi web modern, cepat, dan aman yang dibangun di atas stack berkinerja tinggi seperti React, Next.js, Node.js, dan TypeScript."
        : "Fast, secure, and modern web applications built on scalable tech stacks like React, Next.js, Node.js, and TypeScript.",
      items: language === 'id'
        ? ["Aplikasi Web Kustom", "Website Korporat Responsif", "Solusi E-Commerce Terintegrasi", "Arsitektur Cloud & API"]
        : ["Custom Web Applications", "Responsive Corporate Websites", "E-Commerce Solutions", "API & Database Architecture"]
    },
    {
      title: language === 'id' ? "Desain UI/UX & Produk Digital" : "UI/UX & Product Design",
      icon: <Layout size={28} />,
      desc: language === 'id'
        ? "Sistem visual berorientasi pengguna dan desain interaksi intuitif. Kami memprioritaskan kemudahan pakai, alur mulus, dan konversi tinggi."
        : "User-centered visual systems and interaction design. We focus on usability, clean user journeys, and high conversions.",
      items: language === 'id'
        ? ["Desain Antarmuka Pengguna (UI)", "Riset Pengalaman Pengguna (UX)", "Sistem Desain & Prototipe Interaktif", "Desain Antarmuka Aplikasi Mobile"]
        : ["User Interface (UI) Design", "User Experience (UX) Research", "Design Systems & Prototyping", "Mobile App Interface Design"]
    },
    {
      title: language === 'id' ? "Strategi Kreatif & Identitas Brand" : "Creative & Digital Strategy",
      icon: <Palette size={28} />,
      desc: language === 'id'
        ? "Penentuan posisi brand strategis, aset visual digital, dan konsultasi teknologi untuk membangun kredibilitas bisnis yang kuat."
        : "Strategic brand positioning, graphic assets, and digital consulting to give your business an authoritative presence.",
      items: language === 'id'
        ? ["Sistem Identitas Brand & Logo", "Aset Pemasaran Digital", "Konsultasi Teknis & Arsitektur", "Pemeliharaan & Dukungan SLA"]
        : ["Brand Identity & Logo Systems", "Digital Marketing Assets", "Technical Consulting", "Maintenance & SLA Support"]
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
                ? 'Kami merancang dan mengembangkan website berkinerja tinggi, aplikasi web kustom, solusi mobile, dan identitas visual kohesif untuk perusahaan visioner.'
                : 'We design and develop high-performance websites, custom web apps, mobile solutions, and cohesive visual identities for forward-thinking companies.'}
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
                <span>{language === 'id' ? 'Jelajahi Portofolio' : 'Explore Our Work'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Agency Facts & Stats */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 bg-zinc-950 border-y border-white/10" aria-label="Key Facts">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-1.5">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-brand-red block font-medium">
                  {stat.label}
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white block">
                  {stat.value}
                </span>
                <p className="text-[11px] sm:text-xs text-white/50 font-light">
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

      {/* Core Services Section */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-zinc-950 border-b border-white/10 relative z-10" id="services">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
            <div>
              <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
                {t('services.tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                {t('services.title')}
              </h2>
            </div>
            <Link 
              to="/services" 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red hover:text-white transition-colors"
            >
              <span>{t('services.viewAll')}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {servicesCards.map((service, i) => (
              <div 
                key={i}
                className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 hover:border-brand-red/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mb-5 sm:mb-6">
                    {service.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold mb-3 sm:mb-4 text-white">{service.title}</h3>
                  <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed mb-6 sm:mb-8">{service.desc}</p>
                </div>
                <div className="pt-5 sm:pt-6 border-t border-white/10 space-y-2 sm:space-y-2.5">
                  {service.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/70 font-light">
                      <CheckCircle2 size={13} className="text-brand-red shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-black border-b border-white/10 relative z-10" id="work">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
            <div>
              <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
                {t('work.tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                {t('work.title')}
              </h2>
            </div>
            <Link 
              to="/work" 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white hover:text-brand-red transition-colors"
            >
              <span>{t('work.viewAll')}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            {projects.map((project, i) => (
              <div 
                key={i}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 hover:border-brand-red/40 transition-all duration-300 flex flex-col"
                onClick={() => setSelectedProject(project)}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/70 backdrop-blur-md text-[9px] sm:text-[10px] font-mono text-emerald-400 border border-white/10">
                    {project.status}
                  </div>
                </div>
                <div className="p-5 sm:p-8 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-[11px] sm:text-xs font-mono font-medium text-brand-red uppercase tracking-wider">
                        {project.category}
                      </span>
                      <span className="text-[11px] sm:text-xs font-light text-white/40">
                        {project.client}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold mb-2.5 text-white group-hover:text-brand-red transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed mb-5">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 sm:pt-6 border-t border-white/10">
                    <div className="flex flex-wrap gap-1.5">
                      {project.stack.map((item: string) => (
                        <span key={item} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-mono text-white/60">
                          {item}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-white group-hover:text-brand-red inline-flex items-center gap-1">
                      {language === 'id' ? 'Detail' : 'Details'} <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clear 4-Step Process Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-zinc-950 border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
              {t('process.tag')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-3 text-white">
              {t('process.title')}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
              {t('process.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {processSteps.map((phase, i) => (
              <div key={i} className="p-5 sm:p-6 rounded-2xl bg-black border border-white/10 space-y-3">
                <span className="text-xl sm:text-2xl font-mono font-bold text-brand-red">{phase.step}</span>
                <h3 className="text-base sm:text-lg font-display font-bold text-white">{phase.title}</h3>
                <p className="text-xs text-white/60 font-light leading-relaxed">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Final Action CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-black text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs block">
            {t('cta.tag')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold tracking-tight leading-tight text-white">
            {t('cta.title')}
          </h2>
          <p className="text-sm sm:text-base text-white/60 font-light max-w-xl mx-auto leading-relaxed">
            {t('cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Link 
              to="/contact" 
              className="h-12 sm:h-13 px-8 bg-brand-red hover:bg-brand-red/90 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 active:scale-95"
            >
              <span>{t('cta.button')}</span>
              <ArrowUpRight size={16} />
            </Link>
            <Link 
              to="/about" 
              className="h-12 sm:h-13 px-8 rounded-full border border-white/20 hover:bg-white/10 text-white transition-colors duration-300 text-xs font-semibold uppercase tracking-wider flex items-center justify-center active:scale-95"
            >
              <span>{language === 'id' ? 'Tentang Tim Kami' : 'Learn About Our Team'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-12 overflow-y-auto"
          >
            <div className="bg-zinc-950 border border-white/10 rounded-2xl sm:rounded-3xl max-w-4xl w-full p-5 sm:p-8 md:p-12 relative my-auto shadow-2xl max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-brand-red text-white transition-colors"
                aria-label="Close Project Details"
              >
                <X size={18} />
              </button>

              <div className="mb-4 sm:mb-6 pr-8">
                <span className="text-[11px] sm:text-xs font-mono font-medium text-brand-red uppercase tracking-wider block mb-1 sm:mb-2">
                  {selectedProject.category} • {selectedProject.client}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-4xl font-display font-bold">
                  {selectedProject.title}
                </h3>
              </div>

              <div className="aspect-[16/9] rounded-xl overflow-hidden mb-6 sm:mb-8 bg-zinc-900 border border-white/10">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 sm:space-y-6 text-white/80 font-light leading-relaxed">
                <div>
                  <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-1.5 sm:mb-2">
                    {language === 'id' ? 'Ikhtisar Proyek' : 'Project Overview'}
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70">{selectedProject.description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-1.5 sm:mb-2">
                    {language === 'id' ? 'Teknologi yang Digunakan' : 'Tech Stack'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedProject.stack.map((s: string) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono text-white/70">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10 flex justify-end">
                <Link 
                  to="/contact" 
                  onClick={() => setSelectedProject(null)}
                  className="w-full sm:w-auto px-6 py-3 bg-brand-red text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-brand-red/90 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>{language === 'id' ? 'Konsultasikan Proyek Serupa' : 'Inquire Similar Project'}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
