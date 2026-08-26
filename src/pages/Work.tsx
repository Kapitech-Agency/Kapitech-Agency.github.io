import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, X, Search, ChevronLeft, ChevronRight, CheckCircle2, Globe, Layers, Cpu, Code2, Palette, Box, Building2, ExternalLink } from 'lucide-react';
import Fuse from 'fuse.js';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export interface ProjectItem {
  id: string;
  title: string;
  client: string;
  category: 'Branding' | 'UI/UX Design' | 'Web Development' | 'Mobile App';
  featured: boolean;
  image: string;
  desc: string;
  challenge: string;
  solution: string;
  deliverables: string[];
  technologies: string[];
  impact: { label: string; value: string }[];
  year: string;
}

export const Work = () => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);

  const projectsEn: ProjectItem[] = [
    {
      id: 'lumina-real-estate',
      title: "Lumina Real Estate Portal",
      client: "Lumina Property Group",
      category: "Web Development",
      featured: true,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1400",
      desc: "A high-performance real estate discovery portal featuring interactive property search, multi-criteria filtering, and optimized agent lead capture pipelines.",
      challenge: "The client’s previous platform suffered from slow load times and confusing navigation, resulting in low user engagement and lost sales inquiries.",
      solution: "Engineered a modern web platform with Next.js and Tailwind CSS, featuring instantaneous search, responsive property galleries, and structured contact workflows.",
      deliverables: ["Custom Web Application", "Responsive Search UI", "Lead Capture Integration", "Property CMS Setup"],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      impact: [
        { label: "Search Speed", value: "< 0.4s" },
        { label: "Lead Inquiries", value: "+45%" },
        { label: "Mobile Engagement", value: "+60%" }
      ],
      year: "2024"
    },
    {
      id: 'aura-creative-studio',
      title: "Aura Creative Brand & Web",
      client: "Aura Creative Studio",
      category: "Branding",
      featured: true,
      image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1400",
      desc: "Complete visual identity system, brand guidelines, and a bespoke portfolio web experience for a global design agency.",
      challenge: "The agency needed to elevate its brand presence to attract premium enterprise clients and stand out in a competitive market.",
      solution: "Created a modern typographic identity, comprehensive brand book, and an interactive digital portfolio showcasing case studies with fluid animations.",
      deliverables: ["Visual Identity & Logo", "Brand Guidelines", "Custom React Portfolio", "Content Strategy"],
      technologies: ["Figma", "React", "Motion", "Tailwind CSS"],
      impact: [
        { label: "Client Inquiries", value: "+80%" },
        { label: "Brand Recall", value: "95%" },
        { label: "Average Deal Size", value: "+65%" }
      ],
      year: "2024"
    },
    {
      id: 'nexus-mobile-banking',
      title: "Nexus Mobile Banking App",
      client: "Nexus Financial Technologies",
      category: "Mobile App",
      featured: true,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1400",
      desc: "Intuitive mobile banking application designed for fast peer-to-peer transfers, real-time transaction tracking, and account management.",
      challenge: "Complex financial actions required too many steps, leading to user friction during onboarding and money transfers.",
      solution: "Designed a clean, user-centric mobile UI with clear navigation hierarchies, biometric security, and streamlined 2-tap transfer flows.",
      deliverables: ["Mobile UI/UX Design", "Design System in Figma", "React Native Architecture", "API Integration"],
      technologies: ["React Native", "TypeScript", "Node.js", "Figma"],
      impact: [
        { label: "Onboarding Completion", value: "92%" },
        { label: "Daily Active Users", value: "100k+" },
        { label: "App Store Rating", value: "4.8/5" }
      ],
      year: "2023"
    },
    {
      id: 'solaris-cleantech',
      title: "Solaris CleanTech Monitoring",
      client: "Solaris Energy Systems",
      category: "Web Development",
      featured: true,
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=1400",
      desc: "Operational monitoring dashboard for renewable energy plants, visualizing real-time power generation and grid analytics across 40+ facilities.",
      challenge: "Plant operators lacked a unified interface to track telemetry and generation metrics across multiple distributed solar farms.",
      solution: "Developed an interactive data visualization platform using Next.js and D3.js, providing automated reporting and instant anomaly alerts.",
      deliverables: ["Interactive Dashboard", "Data Visualizations", "Role-Based Access Control", "Automated Reports"],
      technologies: ["Next.js", "D3.js", "Tailwind CSS", "Google Cloud"],
      impact: [
        { label: "Response Time", value: "-70%" },
        { label: "Data Accuracy", value: "99.9%" },
        { label: "Facilities Covered", value: "40+" }
      ],
      year: "2023"
    },
    {
      id: 'vivid-commerce',
      title: "Vivid Headless E-Commerce",
      client: "Vivid Retail & Apparel",
      category: "Web Development",
      featured: false,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1400",
      desc: "High-speed headless commerce storefront optimized for international sales, instant variant selection, and rapid checkout.",
      challenge: "Slow mobile loading on standard templates was dampening ad campaign ROI and cart completion rates.",
      solution: "Migrated to a modern headless architecture with instant page transitions, optimized assets, and a clean product discovery UI.",
      deliverables: ["Headless Storefront", "Product Filter Engine", "Checkout Optimization", "Custom CMS"],
      technologies: ["React", "Shopify Plus API", "Tailwind CSS", "Node.js"],
      impact: [
        { label: "Page Load Time", value: "0.8s" },
        { label: "Mobile Conversion", value: "+38%" },
        { label: "Cart Abandonment", value: "-24%" }
      ],
      year: "2024"
    },
    {
      id: 'kross-cloud-security',
      title: "Kross Cloud Security Portal",
      client: "Kross Systems",
      category: "UI/UX Design",
      featured: false,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1400",
      desc: "Comprehensive UI/UX design system and management portal for cloud infrastructure security and access management.",
      challenge: "Security managers needed an easy way to audit complex server permissions and identify misconfigurations quickly.",
      solution: "Designed a clean, high-density interface with intuitive visual graphs, alert prioritization, and one-click remediation actions.",
      deliverables: ["Platform UX Architecture", "Figma Design System", "Interactive Prototype", "Accessibility Audit"],
      technologies: ["Figma", "React", "Tailwind CSS", "TypeScript"],
      impact: [
        { label: "Audit Time", value: "-50%" },
        { label: "User Satisfaction", value: "96%" },
        { label: "Design Adoption", value: "100%" }
      ],
      year: "2023"
    },
    {
      id: 'zenora-health-app',
      title: "Zenora Telehealth Application",
      client: "Zenora Healthcare",
      category: "Mobile App",
      featured: false,
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1400",
      desc: "Accessible patient mobile application for doctor consultations, digital prescription refills, and medical records.",
      challenge: "Elderly and non-technical patients found standard healthcare applications overwhelming and difficult to use.",
      solution: "Crafted an accessible mobile interface with high-contrast typography, large touch targets, and a guided 3-step appointment flow.",
      deliverables: ["Patient Mobile App", "Doctor Schedule Portal", "Design System", "WCAG 2.1 AA Compliance"],
      technologies: ["React Native", "Node.js", "PostgreSQL", "Figma"],
      impact: [
        { label: "Booking Ease Score", value: "4.9/5" },
        { label: "Support Tickets", value: "-65%" },
        { label: "Active Consultations", value: "25k+" }
      ],
      year: "2024"
    },
    {
      id: 'orbit-saas-platform',
      title: "Orbit SaaS Team Workspace",
      client: "Orbit Dynamics",
      category: "Web Development",
      featured: false,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1400",
      desc: "Collaborative cloud resource platform for distributed engineering teams with automated billing and team permissions.",
      challenge: "Teams struggled with scattered developer credentials and lacked centralized usage transparency.",
      solution: "Built a centralized web portal with team workspaces, usage dashboards, and automated monthly invoice generation.",
      deliverables: ["Full-Stack Web App", "Team Permissions UI", "Billing Integration", "RESTful API"],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      impact: [
        { label: "Team Productivity", value: "+30%" },
        { label: "Uptime Reliability", value: "99.95%" },
        { label: "Active Workspaces", value: "1,200+" }
      ],
      year: "2023"
    }
  ];

  const projectsId: ProjectItem[] = [
    {
      id: 'lumina-real-estate',
      title: "Portal Real Estate Lumina",
      client: "Lumina Property Group",
      category: "Web Development",
      featured: true,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1400",
      desc: "Portal pencarian properti berkinerja tinggi dengan fitur filter interaktif multi-kriteria dan pipeline penangkapan prospek agen yang optimal.",
      challenge: "Platform lama milik klien mengalami waktu muat yang lambat dan navigasi membingungkan, mengakibatkan interaksi rendah dan hilangnya calon pembeli.",
      solution: "Membangun platform web modern menggunakan Next.js dan Tailwind CSS, menghadirkan pencarian instan, galeri foto responsif, dan alur kontak terstruktur.",
      deliverables: ["Aplikasi Web Kustom", "UI Pencarian Responsif", "Integrasi Penangkapan Prospek", "Konfigurasi CMS Properti"],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      impact: [
        { label: "Kecepatan Cari", value: "< 0.4s" },
        { label: "Kenaikan Prospek", value: "+45%" },
        { label: "Engagement Mobile", value: "+60%" }
      ],
      year: "2024"
    },
    {
      id: 'aura-creative-studio',
      title: "Brand & Web Aura Creative",
      client: "Aura Creative Studio",
      category: "Branding",
      featured: true,
      image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1400",
      desc: "Sistem identitas visual lengkap, buku pedoman brand, dan pengalaman portofolio web kustom untuk agensi desain internasional.",
      challenge: "Agensi ini membutuhkan peningkatan citra brand untuk menarik klien korporat premium dan menonjol di pasar global yang kompetitif.",
      solution: "Merancang tipografi modern, buku pedoman brand komprehensif, dan portofolio digital interaktif dengan animasi yang mulus.",
      deliverables: ["Identitas Visual & Logo", "Pedoman Brandbook", "Portofolio React Kustom", "Strategi Konten"],
      technologies: ["Figma", "React", "Motion", "Tailwind CSS"],
      impact: [
        { label: "Inkuiri Klien Baru", value: "+80%" },
        { label: "Daya Ingat Brand", value: "95%" },
        { label: "Rata-rata Nilai Kontrak", value: "+65%" }
      ],
      year: "2024"
    },
    {
      id: 'nexus-mobile-banking',
      title: "Aplikasi Mobile Banking Nexus",
      client: "Nexus Financial Technologies",
      category: "Mobile App",
      featured: true,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1400",
      desc: "Aplikasi mobile banking intuitif untuk transfer peer-to-peer instan, pelacakan mutasi rekening real-time, dan manajemen saldo terintegrasi.",
      challenge: "Aktivitas finansial sebelumnya membutuhkan terlalu banyak langkah verifikasi, menimbulkan friksi saat onboarding nasabah baru.",
      solution: "Mendesain UI mobile yang berpusat pada pengguna dengan keamanan biometrik, navigasi jelas, dan alur transfer cepat 2-sentuhan.",
      deliverables: ["Desain UI/UX Mobile", "Sistem Desain di Figma", "Arsitektur React Native", "Integrasi Core Banking API"],
      technologies: ["React Native", "TypeScript", "Node.js", "Figma"],
      impact: [
        { label: "Penyelesaian Onboarding", value: "92%" },
        { label: "Pengguna Aktif Harian", value: "100rb+" },
        { label: "Rating App Store", value: "4.8/5" }
      ],
      year: "2023"
    },
    {
      id: 'solaris-cleantech',
      title: "Monitoring CleanTech Solaris",
      client: "Solaris Energy Systems",
      category: "Web Development",
      featured: true,
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=1400",
      desc: "Dashboard monitoring operasional untuk pembangkit listrik tenaga surya dengan visualisasi analitik daya dan jaringan listrik di 40+ lokasi.",
      challenge: "Operator lapangan kesulitan memantau metrik telemetri pembangkit yang tersebar tanpa antarmuka data terpadu.",
      solution: "Mengembangkan platform visualisasi data real-time dengan Next.js dan D3.js, lengkap dengan sistem peringatan anomali otomatis.",
      deliverables: ["Dashboard Interaktif", "Visualisasi Data Grafis", "Kontrol Akses Berbasis Peran", "Laporan Otomatis Berkala"],
      technologies: ["Next.js", "D3.js", "Tailwind CSS", "Google Cloud"],
      impact: [
        { label: "Waktu Tanggap Masalah", value: "-70%" },
        { label: "Akurasi Data Metrik", value: "99.9%" },
        { label: "Jumlah Fasilitas Aktif", value: "40+" }
      ],
      year: "2023"
    },
    {
      id: 'vivid-commerce',
      title: "E-Commerce Headless Vivid",
      client: "Vivid Retail & Apparel",
      category: "Web Development",
      featured: false,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1400",
      desc: "Etalase digital headless commerce berkecepatan tinggi yang dioptimalkan untuk penjualan global dan proses checkout kilat.",
      challenge: "Waktu muat lambat pada template e-commerce lama menurunkan rasio konversi iklan dan meningkatkan pengabaian keranjang belanja.",
      solution: "Migrasi ke arsitektur headless modern dengan transisi halaman seketika, kompresi aset gambar, dan alur belanja yang mulus.",
      deliverables: ["Etalase Toko Headless", "Mesin Filter Produk Instan", "Optimasi Alur Checkout", "Integrasi CMS Kustom"],
      technologies: ["React", "Shopify Plus API", "Tailwind CSS", "Node.js"],
      impact: [
        { label: "Waktu Muat Halaman", value: "0.8s" },
        { label: "Konversi Mobile", value: "+38%" },
        { label: "Pengabaian Keranjang", value: "-24%" }
      ],
      year: "2024"
    },
    {
      id: 'kross-cloud-security',
      title: "Portal Keamanan Cloud Kross",
      client: "Kross Systems",
      category: "UI/UX Design",
      featured: false,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1400",
      desc: "Sistem desain UI/UX dan portal manajemen terpadu untuk monitoring keamanan infrastruktur cloud dan hak akses pengguna.",
      challenge: "Manajer keamanan membutuhkan cara mudah untuk mengaudit hak akses server yang rumit dan mendeteksi kesalahan konfigurasi dengan cepat.",
      solution: "Mendesain antarmuka berdensitas informasi tinggi dengan grafik visual intuitif, prioritas alert bahaya, dan remediasi 1-klik.",
      deliverables: ["Arsitektur UX Platform", "Sistem Desain di Figma", "Prototipe Interaktif", "Audit Aksesibilitas WCAG"],
      technologies: ["Figma", "React", "Tailwind CSS", "TypeScript"],
      impact: [
        { label: "Waktu Audit Server", value: "-50%" },
        { label: "Kepuasan Pengguna", value: "96%" },
        { label: "Adopsi Desain Tim", value: "100%" }
      ],
      year: "2023"
    },
    {
      id: 'zenora-health-app',
      title: "Aplikasi Telehealth Zenora",
      client: "Zenora Healthcare",
      category: "Mobile App",
      featured: false,
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1400",
      desc: "Aplikasi mobile pasien yang ramah pengguna untuk konsultasi dokter, tebus resep obat digital, dan rekam medis terpadu.",
      challenge: "Pasien lanjut usia dan non-teknis merasa aplikasi kesehatan konvensional terlalu rumit dan sulit digunakan.",
      solution: "Membangun antarmuka mobile yang sangat mudah diakses dengan teks kontras tinggi, tombol besar, dan alur booking janji temu 3-langkah.",
      deliverables: ["Aplikasi Mobile Pasien", "Portal Jadwal Dokter", "Sistem Desain Inklusif", "Kepatuhan WCAG 2.1 AA"],
      technologies: ["React Native", "Node.js", "PostgreSQL", "Figma"],
      impact: [
        { label: "Skor Kemudahan Pakai", value: "4.9/5" },
        { label: "Keluhan Layanan Tiket", value: "-65%" },
        { label: "Konsultasi Berhasil", value: "25rb+" }
      ],
      year: "2024"
    },
    {
      id: 'orbit-saas-platform',
      title: "Workspace Kolaborasi SaaS Orbit",
      client: "Orbit Dynamics",
      category: "Web Development",
      featured: false,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1400",
      desc: "Platform manajemen resource cloud kolaboratif untuk tim engineer jarak jauh dengan sistem penagihan otomatis dan izin bertingkat.",
      challenge: "Tim pengembang menghadapi kendala pengelolaan kredensial akun yang tersebar dan kurangnya transparansi biaya pemakaian bulanan.",
      solution: "Membangun portal web terpusat dengan manajemen ruang kerja tim, analitik penggunaan, dan penerbitan faktur otomatis.",
      deliverables: ["Aplikasi Web Full-Stack", "UI Manajemen Izin Tim", "Integrasi Billing Otomatis", "Arsitektur RESTful API"],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      impact: [
        { label: "Produktivitas Tim", value: "+30%" },
        { label: "Keandalan Uptime", value: "99.95%" },
        { label: "Workspace Aktif", value: "1.200+" }
      ],
      year: "2023"
    }
  ];

  const projects = language === 'id' ? projectsId : projectsEn;

  const categoriesEn = ['All', 'Web Development', 'UI/UX Design', 'Branding', 'Mobile App'];
  const categoriesId = ['Semua', 'Web Development', 'UI/UX Design', 'Branding', 'Mobile App'];
  const categories = language === 'id' ? categoriesId : categoriesEn;

  const categoryMapping: Record<string, string> = {
    'Semua': 'All',
    'All': 'All',
    'Web Development': 'Web Development',
    'UI/UX Design': 'UI/UX Design',
    'Branding': 'Branding',
    'Mobile App': 'Mobile App'
  };

  const featuredProjects = useMemo(() => projects.filter(p => p.featured), [projects]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    const normalizedCategory = categoryMapping[activeCategory] || 'All';
    if (normalizedCategory !== 'All') {
      result = result.filter(p => p.category === normalizedCategory);
    }
    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: ['title', 'client', 'desc', 'category', 'technologies'],
        threshold: 0.35,
      });
      result = fuse.search(searchQuery.trim()).map(r => r.item);
    }
    return result;
  }, [projects, activeCategory, searchQuery]);

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredProjects.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length);
  };

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-brand-red selection:text-white relative" role="main">
      {/* Page Header */}
      <section className="relative pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 md:px-12 border-b border-white/10 overflow-hidden">
        <AtmosphericBackground imageUrl="/hero_background_3d.png" opacity={0.12} disableGrayscale={true} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 sm:mb-4 block">
              {language === 'id' ? 'Portofolio & Studi Kasus' : 'Portfolio & Case Studies'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold leading-[1.1] sm:leading-[1.05] tracking-tight mb-4 sm:mb-6 text-white">
              {language === 'id' ? (
                <>Karya digital teruji yang memberikan <span className="text-brand-red">dampak nyata</span>.</>
              ) : (
                <>Proven digital work that delivers <span className="text-brand-red">measurable impact</span>.</>
              )}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/70 font-light leading-relaxed">
              {language === 'id'
                ? 'Jelajahi kumpulan aplikasi web, antarmuka mobile, identitas visual, dan solusi software kami yang dirancang untuk startup, bisnis berkembang, dan perusahaan korporat.'
                : 'Explore our curated selection of web applications, mobile interfaces, visual identities, and software solutions crafted for startups, growing businesses, and enterprises.'}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Project Carousel */}
      {featuredProjects.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 border-b border-white/10 bg-zinc-950 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-10">
              <div>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-brand-red block mb-1 sm:mb-2 font-semibold">
                  {language === 'id' ? 'Sorotan Proyek Unggulan' : 'Spotlight Case Study'} ({featuredIndex + 1}/{featuredProjects.length})
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white">
                  {language === 'id' ? 'Proyek Pilihan Kami' : 'Featured Projects'}
                </h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={prevFeatured}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors active:scale-95"
                  aria-label="Previous featured project"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextFeatured}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors active:scale-95"
                  aria-label="Next featured project"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Featured Item Card */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/10 group">
              <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[460px]">
                <div className="lg:col-span-7 relative h-56 sm:h-80 lg:h-full overflow-hidden bg-zinc-900">
                  <img
                    src={featuredProjects[featuredIndex].image}
                    alt={featuredProjects[featuredIndex].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                </div>

                <div className="lg:col-span-5 p-5 sm:p-8 md:p-10 flex flex-col justify-between bg-zinc-950/95 lg:h-full">
                  <div>
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                      <span className="text-[9px] sm:text-[10px] font-mono px-2.5 sm:px-3 py-1 rounded-full bg-brand-red/20 text-brand-red border border-brand-red/30 uppercase tracking-wider font-semibold">
                        {featuredProjects[featuredIndex].category}
                      </span>
                      <span className="text-[11px] sm:text-xs text-white/50 font-mono">
                        {featuredProjects[featuredIndex].year}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-1.5 sm:mb-2 text-white">
                      {featuredProjects[featuredIndex].title}
                    </h3>
                    <p className="text-xs font-mono text-brand-red mb-2 sm:mb-3 font-medium">
                      {language === 'id' ? 'Klien:' : 'Client:'} <span className="text-white/90">{featuredProjects[featuredIndex].client}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                      {featuredProjects[featuredIndex].desc}
                    </p>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                      {featuredProjects[featuredIndex].technologies.map((t) => (
                        <span key={t} className="text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProject(featuredProjects[featuredIndex])}
                    className="w-full py-3 sm:py-3.5 px-6 rounded-xl bg-brand-red hover:bg-white text-white hover:text-black font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 mt-2 sm:mt-auto active:scale-95"
                  >
                    <span>{language === 'id' ? 'Lihat Studi Kasus' : 'View Case Study'}</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-white/10">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2" role="tablist">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors active:scale-95 ${
                    activeCategory === cat
                      ? 'bg-white text-black font-semibold'
                      : 'bg-zinc-900/80 text-white/70 hover:text-white border border-white/10 hover:border-white/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder={language === 'id' ? 'Cari proyek atau teknologi...' : 'Search projects or stack...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-brand-red transition-colors font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-20 sm:pb-28 px-4 sm:px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-zinc-950 rounded-2xl sm:rounded-3xl border border-white/10 px-4">
              <p className="text-base sm:text-lg text-white/60 mb-3">
                {language === 'id' ? 'Tidak ada proyek yang sesuai dengan kriteria pencarian.' : 'No projects found matching your search criteria.'}
              </p>
              <button
                onClick={() => { setActiveCategory(language === 'id' ? 'Semua' : 'All'); setSearchQuery(''); }}
                className="text-xs font-mono uppercase tracking-wider text-brand-red hover:underline"
              >
                {language === 'id' ? 'Reset Filter' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="rounded-2xl bg-zinc-950 border border-white/10 hover:border-brand-red/50 hover:bg-zinc-900/40 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900 shrink-0">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] sm:text-[10px] font-mono text-white border border-white/10 uppercase tracking-wider">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Footer */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono text-brand-red font-medium truncate">{project.client}</span>
                        <span className="text-xs font-mono text-white/40 shrink-0">{project.year}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-display font-bold text-white group-hover:text-brand-red transition-colors mb-1.5 sm:mb-2 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-white/60 font-light line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                        {project.desc}
                      </p>

                      {/* Tech Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-5 h-7 overflow-hidden items-center">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <span key={tech} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/5 font-mono">
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 font-mono">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom CTA with harmonious spacing */}
                    <div className="pt-3.5 sm:pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-white/70 group-hover:text-white transition-colors mt-auto">
                      <span className="group-hover:text-brand-red transition-colors">
                        {language === 'id' ? 'Lihat Studi Kasus' : 'View Case Study'}
                      </span>
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-brand-red" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROJECT DETAILS MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-white/20 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-black/80 sticky top-0 z-20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] sm:text-xs font-mono px-2.5 sm:px-3 py-0.5 sm:py-1 rounded bg-brand-red/20 text-brand-red border border-brand-red/30 uppercase tracking-wider font-medium">
                    {selectedProject.category}
                  </span>
                  <span className="text-[11px] sm:text-xs text-white/60 font-mono truncate max-w-[150px] sm:max-w-none">
                    {language === 'id' ? 'Klien:' : 'Client:'} {selectedProject.client}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-black transition-colors flex items-center justify-center shrink-0"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="overflow-y-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8">
                {/* Hero Preview */}
                <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/9] border border-white/10">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title & Overview */}
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-display font-bold mb-2 sm:mb-4">
                    {selectedProject.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-white/70 font-light leading-relaxed">
                    {selectedProject.desc}
                  </p>
                </div>

                {/* Challenge & Solution Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-black border border-white/10">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-2 font-medium">
                      {language === 'id' ? 'Tantangan Bisnis' : 'The Challenge'}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                      {selectedProject.challenge}
                    </p>
                  </div>
                  <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-black border border-white/10">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 font-medium">
                      {language === 'id' ? 'Solusi yang Kami Bangun' : 'The Solution'}
                    </h4>
                    <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                      {selectedProject.solution}
                    </p>
                  </div>
                </div>

                {/* Deliverables & Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3 font-medium">
                      {language === 'id' ? 'Deliverables Utama' : 'Key Deliverables'}
                    </h4>
                    <div className="space-y-2">
                      {selectedProject.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-white/80">
                          <CheckCircle2 size={14} className="text-brand-red shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3 font-medium">
                      {language === 'id' ? 'Dampak Terukur' : 'Measurable Impact'}
                    </h4>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {selectedProject.impact.map((imp, idx) => (
                        <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-black border border-white/10 text-center">
                          <span className="text-sm sm:text-base font-display font-bold text-brand-red block mb-0.5 sm:mb-1">
                            {imp.value}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase">
                            {imp.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Technologies Used */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2.5 sm:mb-3 font-medium">
                    {language === 'id' ? 'Teknologi & Alat' : 'Technologies & Tools'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span key={tech} className="px-2.5 sm:px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-[11px] sm:text-xs font-mono text-white/80">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Modal CTA */}
                <div className="pt-5 sm:pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <p className="text-xs text-white/60 text-center sm:text-left">
                    {language === 'id' ? 'Tertarik membangun solusi serupa untuk bisnis Anda?' : 'Interested in building a similar solution for your business?'}
                  </p>
                  <Link
                    to="/contact"
                    onClick={() => setSelectedProject(null)}
                    className="h-11 px-6 bg-brand-red hover:bg-white text-white hover:text-black rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>{language === 'id' ? 'Mulai Proyek Serupa' : 'Start Similar Project'}</span>
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
