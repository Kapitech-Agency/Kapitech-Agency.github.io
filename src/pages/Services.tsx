import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layout, 
  Code2, 
  Palette, 
  CheckCircle2, 
  ArrowUpRight, 
  X, 
  Layers, 
  Sparkles, 
  Smartphone, 
  Globe, 
  Cpu, 
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Search,
  Rocket,
  RefreshCw,
  Users,
  Compass,
  Monitor,
  Flame,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export interface ServiceDetail {
  id: string;
  title: string;
  category: 'Branding' | 'Design' | 'Development' | 'Solutions';
  subtitle: string;
  subtitleId: string;
  icon: React.ReactNode;
  summary: string;
  summaryId: string;
  fullDescription: string;
  fullDescriptionId: string;
  deliverables: string[];
  deliverablesId: string[];
  tools: string[];
  idealFor: string;
  idealForId: string;
  timeline: string;
  timelineId: string;
}

export interface StrategicSolution {
  id: string;
  title: string;
  audience: string;
  audienceId: string;
  description: string;
  descriptionId: string;
  badge: string;
  badgeId: string;
  icon: React.ReactNode;
  deliverables: string[];
  deliverablesId: string[];
  timeline: string;
  timelineId: string;
}

export const Services = () => {
  const { language } = useLanguage();
  const [selectedService, setSelectedService] = useState<ServiceDetail | StrategicSolution | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Branding' | 'Design' | 'Development' | 'Solutions'>('All');

  const strategicSolutions: StrategicSolution[] = [
    {
      id: 'mvp-design',
      title: 'MVP DESIGN',
      audience: 'For enterprise ecosystems',
      audienceId: 'Untuk ekosistem enterprise & startup',
      description: 'Create a digital product, attract investors and new clients.',
      descriptionId: 'Ciptakan produk digital berdaya saing, pikat investor, dan raih klien baru dengan cepat.',
      badge: 'High Impact',
      badgeId: 'Dampak Tinggi',
      icon: <Rocket size={26} />,
      deliverables: [
        'Rapid Clickable Interactive Prototype',
        'Core Feature Definition & User Journeys',
        'Investor Presentation Deck Integration',
        'Scalable UI Kit & Tokenized Components',
        'Developer Hand-off Documentation'
      ],
      deliverablesId: [
        'Prototipe Interaktif Siap Uji Pengguna',
        'Definisi Fitur Utama & Alur Pengguna (User Journey)',
        'Integrasi Visual Pitch Deck Investor',
        'UI Kit & Komponen Token Desain Skalabel',
        'Dokumentasi Serah Terima Developer Siap Koding'
      ],
      timeline: '2 - 4 Weeks',
      timelineId: '2 - 4 Minggu'
    },
    {
      id: 'product-redesign',
      title: 'PRODUCT REDESIGN',
      audience: 'For SMEs & enterprises',
      audienceId: 'Untuk UKM & korporasi berkembang',
      description: 'Get a fresh look, improved user experience, or enhanced functionality.',
      descriptionId: 'Dapatkan tampilan baru yang modern, pengalaman pengguna superior, dan fungsi sistem yang ditingkatkan.',
      badge: 'Conversion Boost',
      badgeId: 'Optimasi Konversi',
      icon: <RefreshCw size={26} />,
      deliverables: [
        'Complete UX Heuristic & Friction Audit',
        'Modernized Design System & Accessibility (WCAG)',
        'Streamlined Checkout & User Conversion Funnels',
        'Component Migration to Modern Figma Standards',
        'A/B Testing & Usability Validation'
      ],
      deliverablesId: [
        'Audit Heuristik UX & Analisis Titik Hambatan Pengguna',
        'Sistem Desain Modern & Standar Aksesibilitas (WCAG)',
        'Penyederhanaan Alur Konversi & Checkout Klien',
        'Migrasi Komponen ke Standar Figma Terkini',
        'Uji Validasi A/B Testing & Kepuasan Pengguna'
      ],
      timeline: '3 - 6 Weeks',
      timelineId: '3 - 6 Minggu'
    },
    {
      id: 'team-extension',
      title: 'TEAM EXTENSION',
      audience: 'For existing companies',
      audienceId: 'Untuk perusahaan dengan tim internal',
      description: 'Expand your team with our dedicated and talented design experts.',
      descriptionId: 'Perluas kapasitas tim Anda bersama desainer dan engineer berpengalaman kami yang siap berkolaborasi penuh.',
      badge: 'Dedicated Talent',
      badgeId: 'Talenta Terdedikasi',
      icon: <Users size={26} />,
      deliverables: [
        'Full-Time Dedicated UI/UX & Motion Designers',
        'Direct Slack / Discord & Agile Daily Sync',
        'Seamless Integration into Existing Sprint Cycles',
        'Senior Tech & Creative Lead Supervision',
        'Transparent Hourly / Monthly Retainer Billing'
      ],
      deliverablesId: [
        'Desainer UI/UX & Motion Penuh Waktu Khusus Proyek Anda',
        'Komunikasi Langsung via Slack / WhatsApp & Sinkronisasi Harian',
        'Integrasi Mulus ke Alur Kerja Sprint Tim Internal Anda',
        'Supervisi dari Senior Tech Lead & Design Director',
        'Sistem Retainer Fleksibel & Transparan Tiap Bulan'
      ],
      timeline: 'Monthly Dedicated Retainer',
      timelineId: 'Retainer Bulanan Fleksibel'
    }
  ];

  const allServices: ServiceDetail[] = [
    // --- BRANDING ---
    {
      id: 'pitch-deck',
      title: 'Pitch Deck',
      category: 'Branding',
      subtitle: 'Get visuals that raise capital',
      subtitleId: 'Visual presentasi memukau untuk menggalang modal',
      icon: <FileSpreadsheet size={24} />,
      summary: 'High-stakes investor pitch decks, shareholder slide decks, and commercial fund-raising decks designed to close multi-million dollar deals.',
      summaryId: 'Desain pitch deck investor, presentasi RUPS, dan materi penggalangan dana modal ventura yang berwibawa dan meyakinkan.',
      fullDescription: 'We translate complex financial models, market size data, and vision statements into executive-grade storytelling that captures attention and inspires venture backing.',
      fullDescriptionId: 'Kami menerjemahkan proyeksi keuangan, data pasar, dan visi bisnis menjadi narasi visual tingkat eksekutif yang memikat dewan direksi dan investor.',
      deliverables: [
        'Custom 15-25 Slide Investor Storyboard',
        'Complex Financial & TAM/SAM Data Visualizations',
        'Interactive Master Deck in Figma / Keynote / PPT',
        'Executive One-Pager & PDF Teaser',
        'Editable Master Vector Assets'
      ],
      deliverablesId: [
        'Storyboard Presentasi 15-25 Slide Kustom',
        'Visualisasi Data Keuangan & Pasar (TAM/SAM)',
        'File Master Interaktif di Figma / Keynote / PPT',
        'Ringkasan Eksekutif 1 Halaman (One-Pager Teaser)',
        'Aset Vektor Master yang Dapat Diedit Kapan Saja'
      ],
      tools: ['Figma', 'Keynote', 'Adobe Illustrator', 'Photoshop'],
      idealFor: 'Founders raising Seed to Series B funding, corporate executives, and investment bankers.',
      idealForId: 'Pendiri startup penggalangan modal Seed hingga Series B, direksi korporat, dan konsultan investasi.',
      timeline: '1 - 3 Weeks',
      timelineId: '1 - 3 Minggu'
    },
    {
      id: 'brand-identity',
      title: 'Brand Identity',
      category: 'Branding',
      subtitle: 'Build trust with design',
      subtitleId: 'Bangun kepercayaan pelanggan melalui desain terpadu',
      icon: <Compass size={24} />,
      summary: 'Complete brand ecosystems including visual guidelines, color geometry, brand personality, and marketing touchpoints.',
      summaryId: 'Ekosistem identitas brand lengkap mencakup pedoman visual (brandbook), palet warna, tipografi, dan materi pemasaran.',
      fullDescription: 'A distinctive brand identity that creates instant market differentiation and commands premium positioning across digital and physical mediums.',
      fullDescriptionId: 'Identitas merek terintegrasi yang menciptakan diferensiasi kuat di pasar dan memposisikan bisnis Anda sebagai pemimpin industri yang elegan dan tepercaya.',
      deliverables: [
        'Comprehensive 50+ Page Digital Brand Guidelines',
        'Color Harmonization & High-Contrast Typography Hierarchy',
        'Stationery Kit & Corporate Business Collateral',
        'Social Media Template System (10+ Formats)',
        'Packaging & Merchandising Visual Standards'
      ],
      deliverablesId: [
        'Buku Pedoman Identitas Brand (Brandbook 50+ Halaman)',
        'Harmonisasi Palet Warna & Hierarki Tipografi Berstandar',
        'Paket Desain Alat Tulis Kantor & Kartu Nama Resmi',
        'Sistem Template Media Sosial Kustom (10+ Format)',
        'Standar Visual Desain Kemasan & Merchandise'
      ],
      tools: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Figma'],
      idealFor: 'Enterprises establishing new subsidiaries, scaling brands, and luxury lifestyle businesses.',
      idealForId: 'Perusahaan yang membuka lini bisnis baru, merek yang ingin scale-up, dan brand komersial.',
      timeline: '3 - 5 Weeks',
      timelineId: '3 - 5 Minggu'
    },
    {
      id: 'logo-design',
      title: 'Logo Design',
      category: 'Branding',
      subtitle: 'Become unforgettable',
      subtitleId: 'Tampil ikonik dan mudah diingat oleh audiens Anda',
      icon: <Palette size={24} />,
      summary: 'Timeless, memorable logo marks and custom typographic logotypes engineered for infinite scalability across all media.',
      summaryId: 'Simbol logo dan logotipe tipografi kustom yang tak lekang oleh waktu, mudah diingat, dan berpresisi tinggi untuk semua media.',
      fullDescription: 'We sculpt symbolic logomarks and bespoke typography that crystallize your company’s core purpose into an unforgettable visual icon.',
      fullDescriptionId: 'Kami merancang simbol logo orisinal yang merepresentasikan nilai inti bisnis Anda secara tajam, bersih, dan berkarakter kuat.',
      deliverables: [
        '3 Distinct Creative Direction Concept Options',
        'Primary Logomark, Secondary Lockups & Responsive Favicons',
        'Vector Master Formats (SVG, EPS, AI, PDF)',
        'Light, Dark & Monochrome Contrast Versions',
        'Full Copyright Ownership Transfer'
      ],
      deliverablesId: [
        '3 Opsi Konsep Arah Kreatif yang Berbeda',
        'Simbol Logo Utama, Variasi Sekunder & Favicon Web',
        'Format Vektor Master Resolusi Tak Terbatas (SVG, EPS, AI, PDF)',
        'Versi Kontras Terang, Gelap, dan Monokrom',
        'Surat Alih Hak Cipta Kepemilikan Penuh'
      ],
      tools: ['Adobe Illustrator', 'Figma', 'Vectorizer'],
      idealFor: 'New ventures seeking an iconic mark, or businesses needing a cleaner, modern corporate symbol.',
      idealForId: 'Bisnis baru yang membutuhkan lambang ikonik atau perusahaan yang ingin memodernisasi logonya.',
      timeline: '1 - 2 Weeks',
      timelineId: '1 - 2 Minggu'
    },
    {
      id: 'graphic-design',
      title: 'Graphic Design',
      category: 'Branding',
      subtitle: 'Illustrations, Icons, Social media',
      subtitleId: 'Ilustrasi kustom, ikonografi, dan materi media sosial',
      icon: <Layers size={24} />,
      summary: 'Custom vector illustration libraries, branded icon sets, promotional campaign visuals, and high-impact digital social graphics.',
      summaryId: 'Pustaka ilustrasi vektor kustom, set ikon bermerek, materi kampanye promosi, dan desain grafis media sosial berkonversi tinggi.',
      fullDescription: 'Elevate your marketing touchpoints with cohesive graphic assets that spark engagement, convey technical workflows simply, and enhance brand prestige.',
      fullDescriptionId: 'Tingkatkan performa pemasaran digital Anda dengan aset visual yang menarik, mudah dipahami, dan seragam di semua saluran promosi.',
      deliverables: [
        'Custom 20+ Vector Illustration Library',
        'Pixel-Perfect 40+ Branded Icon Set',
        'High-Converting Social Media Ad Assets',
        'Banner Ads & Digital Display Campaigns',
        'Print-Ready Marketing Flyers & Roll-Up Banners'
      ],
      deliverablesId: [
        'Pustaka Ilustrasi Vektor Kustom (20+ Aset)',
        'Set Ikon Khusus Brand Berpresisi Piksel (40+ Ikon)',
        'Aset Iklan Media Sosial Berkonversi Tinggi',
        'Banner Iklan Digital & Display Web',
        'Desain Brosur Cetak & Standing Banner Acara'
      ],
      tools: ['Photoshop', 'Illustrator', 'Figma'],
      idealFor: 'Marketing directors, social media managers, and digital growth campaigns.',
      idealForId: 'Manajer pemasaran, tim media sosial, dan kampanye akuisisi pengguna digital.',
      timeline: '1 - 3 Weeks',
      timelineId: '1 - 3 Minggu'
    },
    {
      id: 'rebranding',
      title: 'Rebranding',
      category: 'Branding',
      subtitle: 'Rebrand to grow and convert',
      subtitleId: 'Rebranding untuk memicu pertumbuhan dan konversi baru',
      icon: <Sparkles size={24} />,
      summary: 'End-to-end brand revitalization for established businesses shifting target markets, acquiring new verticals, or modernizing outdated visuals.',
      summaryId: 'Revitalisasi merek menyeluruh bagi perusahaan mapan yang ingin menjangkau segmen pasar baru atau memodernisasi citra usang.',
      fullDescription: 'Transform how your market perceives your business. We perform brand audits, benchmark competitors, and redesign your complete visual footprint for the next decade of growth.',
      fullDescriptionId: 'Ubah persepsi pasar terhadap perusahaan Anda. Kami melakukan audit mendalam, analisis kompetitor, dan merombak seluruh identitas visual untuk pertumbuhan 10 tahun ke depan.',
      deliverables: [
        'Brand Equity & Market Perception Analysis',
        'Total Visual Identity Overhaul & Rollout Plan',
        'Corporate Collateral & Asset Migration Checklist',
        'Internal Team Brand Launch Playbook',
        'Public Press Release & Rebrand Assets'
      ],
      deliverablesId: [
        'Analisis Ekuitas Brand & Persepsi Pasar Saat Ini',
        'Perombakan Total Identitas Visual & Rencana Peluncuran',
        'Daftar Periksa Migrasi Aset Korporat Lama ke Baru',
        'Buku Panduan Peluncuran Brand untuk Tim Internal',
        'Materi Rilis Media & Pengumuman Resmi Rebranding'
      ],
      tools: ['Adobe Creative Cloud', 'Figma', 'Miro'],
      idealFor: 'Growing enterprises outgrowing their initial brand, or companies pivoting to high-ticket enterprise clients.',
      idealForId: 'Perusahaan berkembang yang ingin naik kelas dan menargetkan klien korporat dengan nilai kontrak tinggi.',
      timeline: '4 - 8 Weeks',
      timelineId: '4 - 8 Minggu'
    },

    // --- DESIGN ---
    {
      id: 'ui-ux-design',
      title: 'UI/UX Design',
      category: 'Design',
      subtitle: 'Web & mobile app design',
      subtitleId: 'Desain antarmuka web dan aplikasi mobile terpadu',
      icon: <Layout size={24} />,
      summary: 'Figma design systems, intuitive user experience architectures, and clickable prototypes tested with real users.',
      summaryId: 'Sistem desain Figma modular, arsitektur informasi intuitif, dan prototipe interaktif siap uji untuk web serta aplikasi mobile.',
      fullDescription: 'We balance aesthetic precision with frictionless usability. From multi-tiered SaaS platforms to high-frequency mobile apps, we design interfaces people love to use daily.',
      fullDescriptionId: 'Kami menggabungkan keindahan estetika dengan kemudahan navigasi tanpa hambatan. Mulai dari platform SaaS hingga aplikasi mobile, kami ciptakan UI yang disukai pengguna.',
      deliverables: [
        'Complete Responsive Screen UI (Desktop, Tablet, Mobile)',
        'Centralized Figma Design System & Auto-Layout Tokens',
        'Interactive High-Fidelity Clickable Prototypes',
        'User Journey Maps & Information Architecture',
        'Design-to-Code Developer Specifications'
      ],
      deliverablesId: [
        'Desain UI Layar Responsif Lengkap (Desktop, Tablet, Mobile)',
        'Sistem Desain Figma Terpusat & Token Auto-Layout',
        'Prototipe Interaktif Siap Uji Pengguna (High-Fidelity)',
        'Peta Alur Pengguna (User Journey) & Arsitektur Informasi',
        'Spesifikasi Hand-off Desain Siap Implementasi Developer'
      ],
      tools: ['Figma', 'FigJam', 'Miro', 'Spline 3D', 'Lottie'],
      idealFor: 'SaaS companies, mobile app startups, and digital transformation initiatives.',
      idealForId: 'Perusahaan SaaS, startup aplikasi mobile, dan proyek transformasi digital.',
      timeline: '3 - 6 Weeks',
      timelineId: '3 - 6 Minggu'
    },
    {
      id: 'website-design',
      title: 'Website Design',
      category: 'Design',
      subtitle: 'Custom websites & landings',
      subtitleId: 'Desain website kustom dan landing page berkonversi',
      icon: <Globe size={24} />,
      summary: 'Bespoke marketing websites and high-impact landing pages crafted to captivate visitors and drive record business conversions.',
      summaryId: 'Desain website pemasaran kustom dan landing page berkelas tinggi untuk memikat pengunjung dan memaksimalkan konversi bisnis.',
      fullDescription: 'Every pixel is designed with purpose: clear typographic hierarchy, subtle atmospheric animations, and focused conversion funnels tailored to your target audience.',
      fullDescriptionId: 'Setiap elemen dirancang dengan tujuan: hierarki tipografi yang jelas, animasi halus bernuansa modern, dan alur konversi yang terbukti efektif.',
      deliverables: [
        'Custom Responsive Page Mockups (Home, About, Services, etc.)',
        'Hero Section Interactive Motion Concepts',
        'Conversion-Focused Form & CTA Layouts',
        'Optimized Web Image Assets & Favicon Package',
        'Component Layout Guide for Web Developers'
      ],
      deliverablesId: [
        'Mockup Halaman Lengkap Responsif (Beranda, Tentang, Layanan, dll)',
        'Konsep Motion Interaktif Bagian Utama (Hero Section)',
        'Tata Letak Formulir Kontak & Tombol CTA Berkonversi Tinggi',
        'Paket Optimasi Aset Gambar Web & Favicon Resolusi Tinggi',
        'Panduan Tata Letak Komponen untuk Web Developer'
      ],
      tools: ['Figma', 'Photoshop', 'Adobe Illustrator'],
      idealFor: 'Businesses launching a new online presence, agencies, and professional service firms.',
      idealForId: 'Bisnis yang meluncurkan website baru, agensi, dan firma profesional.',
      timeline: '2 - 4 Weeks',
      timelineId: '2 - 4 Minggu'
    },
    {
      id: 'mobile-app-design',
      title: 'Mobile App Design',
      category: 'Design',
      subtitle: 'Apps your users love',
      subtitleId: 'Aplikasi mobile iOS & Android yang dicintai pengguna',
      icon: <Smartphone size={24} />,
      summary: 'iOS Human Interface and Android Material 3 compliant mobile interfaces designed for natural single-handed ergonomics.',
      summaryId: 'Antarmuka aplikasi iOS & Android berstandar resmi (Apple HIG / Material 3) yang nyaman digunakan satu tangan.',
      fullDescription: 'We design thumb-friendly navigation, tactile micro-interactions, dark/light mode parity, and intuitive onboarding screens that minimize churn.',
      fullDescriptionId: 'Kami merancang navigasi ramah ibu jari, mikro-interaksi responsif, dukungan tema gelap/terang, dan alur onboarding yang mudah dipahami pengguna baru.',
      deliverables: [
        'Complete iOS & Android Flow Wireframes & Hi-Fi UI',
        'Native Component Library (Apple HIG & Material 3)',
        'Micro-Interactions & Animated Transition Prototypes',
        'App Store & Google Play Screenshot Mockup Pack',
        'Handoff Specs with Exportable 1x, 2x, 3x Assets'
      ],
      deliverablesId: [
        'Wireframe & Desain UI Resolusi Tinggi untuk iOS dan Android',
        'Pustaka Komponen Asli (Apple HIG & Material 3)',
        'Prototipe Animasi Transisi & Mikro-Interaksi',
        'Paket Tangkapan Layar Promosi App Store & Google Play',
        'Aset Ekspor Siap Pakai (1x, 2x, 3x) untuk Mobile Engineer'
      ],
      tools: ['Figma', 'Protopie', 'LottieFiles'],
      idealFor: 'Mobile-first startups, fintech wallets, healthcare apps, and on-demand services.',
      idealForId: 'Startup mobile-first, aplikasi fintech, dompet digital, dan layanan on-demand.',
      timeline: '3 - 6 Weeks',
      timelineId: '3 - 6 Minggu'
    },
    {
      id: 'website-redesign',
      title: 'Website Redesign',
      category: 'Design',
      subtitle: 'Modern look, higher impact',
      subtitleId: 'Tampilan modern berkelas dengan dampak bisnis lebih besar',
      icon: <RefreshCw size={24} />,
      summary: 'Upgrade outdated corporate websites into sleek, modern, high-speed digital flagship experiences that command authority.',
      summaryId: 'Perbarui website lama yang kaku menjadi representasi digital mutakhir, berkecepatan tinggi, dan berwibawa.',
      fullDescription: 'We audit what works and eliminate friction points, giving your existing website a modern visual aesthetic, sharper typography, and improved mobile UX.',
      fullDescriptionId: 'Kami mengevaluasi data analitik Anda, memperbaiki kelemahan struktur lama, dan memberikan tampilan visual modern yang jauh lebih prestisius.',
      deliverables: [
        'Comprehensive Existing Site UX & Visual Audit',
        'Modernized Layout & Visual Hierarchy Refresh',
        'Enhanced Mobile Touch Ergonomics',
        'SEO-Preserving URL & Navigation Architecture',
        'Interactive Figma Prototype for Direct Comparison'
      ],
      deliverablesId: [
        'Audit UX & Estetika Visual Website Lama Anda',
        'Penyegaran Tata Letak & Hierarki Visual Modern',
        'Peningkatan Ergonomi Akses Pengguna Mobile',
        'Arsitektur Navigasi yang Mempertahankan Peringkat SEO',
        'Prototipe Figma Interaktif untuk Perbandingan Langsung'
      ],
      tools: ['Figma', 'Google Lighthouse', 'Hotjar'],
      idealFor: 'Companies whose websites look dated and are not generating sufficient qualified leads.',
      idealForId: 'Perusahaan yang websitenya tampak ketinggalan zaman dan kurang optimal menghasilkan leads.',
      timeline: '2 - 4 Weeks',
      timelineId: '2 - 4 Minggu'
    },
    {
      id: 'product-ux-ui-audit',
      title: 'Product UX/UI Audit',
      category: 'Design',
      subtitle: 'Insights that drive results',
      subtitleId: 'Wawasan mendalam berbasis data untuk hasil nyata',
      icon: <Search size={24} />,
      summary: 'In-depth heuristic evaluation, accessibility audit, and conversion funnel analysis with actionable prioritization roadmap.',
      summaryId: 'Evaluasi heuristik mendalam, audit aksesibilitas, dan analisis corong konversi disertai rencana perbaikan bertahap.',
      fullDescription: 'Discover where users drop off, get confused, or abandon transactions. We deliver a comprehensive diagnostic report with wireframe recommendations to boost ROI.',
      fullDescriptionId: 'Temukan penyebab pengguna keluar atau membatalkan transaksi. Kami memberikan laporan diagnostik lengkap beserta solusi wireframe konkret untuk meningkatkan konversi.',
      deliverables: [
        '40+ Page Detailed UX Diagnostic & Heuristic Report',
        'Conversion Funnel Drop-off Analysis',
        'Accessibility (WCAG 2.1 AA) Compliance Audit',
        'Quick-Win Low-Hanging Fruit Optimization List',
        'Executive Summary & Video Walkthrough Presentation'
      ],
      deliverablesId: [
        'Laporan Diagnostik & Heuristik UX Detail (40+ Halaman)',
        'Analisis Titik Penurunan (Drop-off) Corong Konversi',
        'Audit Kepatuhan Aksesibilitas Web (WCAG 2.1 AA)',
        'Daftar Rekomendasi Cepat (Quick-Win Optimizations)',
        'Ringkasan Eksekutif & Video Presentasi Penjelasan Temuan'
      ],
      tools: ['Figma', 'Miro', 'Hotjar', 'Google Analytics'],
      idealFor: 'SaaS platforms with high churn, e-commerce stores with low conversion rates, and product managers.',
      idealForId: 'Platform SaaS dengan retensi rendah, toko e-commerce yang ingin meningkatkan omzet, dan manajer produk.',
      timeline: '1 - 2 Weeks',
      timelineId: '1 - 2 Minggu'
    },

    // --- DEVELOPMENT ---
    {
      id: 'web-development',
      title: 'Web Development',
      category: 'Development',
      subtitle: 'Front-End & Back-End Development',
      subtitleId: 'Pengembangan Front-End & Back-End berkualitas tinggi',
      icon: <Code2 size={24} />,
      summary: 'Full-stack web development using modern TypeScript, React, Next.js, Node.js, and cloud database architectures.',
      summaryId: 'Pengembangan web full-stack menggunakan TypeScript, React, Next.js, Node.js, dan arsitektur cloud database tangguh.',
      fullDescription: 'Clean, maintainable, and strictly typed codebases built to scale. We engineer lightning-fast front-ends integrated with secure, resilient back-end APIs.',
      fullDescriptionId: 'Kode terstruktur rapi, teruji, dan siap diskalakan. Kami membangun antarmuka secepat kilat yang terintegrasi dengan REST/GraphQL API yang aman.',
      deliverables: [
        'Production-Grade Next.js / React Front-End',
        'Secure Node.js / Express Back-End APIs & Database Schemas',
        'Sub-1s Page Load Speeds & 95+ Core Web Vitals',
        'Automated CI/CD Deployment Pipeline',
        'Comprehensive Technical Documentation & Source Code Ownership'
      ],
      deliverablesId: [
        'Front-End Standar Produksi Berbasis Next.js / React',
        'Back-End API & Skema Database Aman (PostgreSQL / Node.js)',
        'Kecepatan Muat Sub-1 Detik & Skor Core Web Vitals 95+',
        'Pipeline Deployment Otomatis (CI/CD GitHub Actions)',
        'Dokumentasi Teknis Lengkap & Kepemilikan Source Code 100%'
      ],
      tools: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      idealFor: 'Tech-forward companies requiring robust, bespoke web software and scalable digital infrastructure.',
      idealForId: 'Perusahaan yang membutuhkan software web kustom yang tangguh, aman, dan siap scale-up.',
      timeline: '4 - 8 Weeks',
      timelineId: '4 - 8 Minggu'
    },
    {
      id: 'mvp-development',
      title: 'MVP Development',
      category: 'Development',
      subtitle: 'MVPs that attract funding',
      subtitleId: 'MVP tangguh siap pakai untuk menarik pendanaan investor',
      icon: <Rocket size={24} />,
      summary: 'Rapid prototyping and minimum viable product engineering designed to validate market demand and impress seed investors.',
      summaryId: 'Pembangunan produk minimum (MVP) yang cepat dan fungsional untuk menguji pasar dan meyakinkan investor modal ventura.',
      fullDescription: 'Go from concept to live production in weeks, not quarters. We build the essential core features with clean architecture ready for future scaling.',
      fullDescriptionId: 'Wujudkan ide menjadi produk nyata yang dapat diakses pengguna dalam hitungan minggu. Kami fokus pada fitur inti terpenting dengan pondasi arsitektur siap berkembang.',
      deliverables: [
        'Live Production Web / Mobile MVP with User Authentication',
        'Core Business Logic & Payment / Database Integration',
        'Analytics & User Telemetry Tracking Setup',
        'Zero-Downtime Cloud Deployment (Vercel / AWS / GCP)',
        'Sprint Roadmap for Post-Funding Feature Scaling'
      ],
      deliverablesId: [
        'Aplikasi Web / Mobile MVP Aktif dengan Sistem Login & Otentikasi',
        'Logika Bisnis Inti & Integrasi Database / Pembayaran',
        'Setup Pelacakan Analitik Pengguna & Telemetri',
        'Deployment Cloud Bebas Gangguan (Vercel / AWS / GCP)',
        'Roadmap Pengembangan Lanjutan Pasca-Pendanaan'
      ],
      tools: ['Next.js', 'TypeScript', 'Firebase', 'Supabase', 'Tailwind CSS'],
      idealFor: 'Startups, corporate innovation labs, and founders preparing for pre-seed/seed rounds.',
      idealForId: 'Startup baru, inkubator inovasi korporat, dan founder yang sedang menggalang modal awal.',
      timeline: '3 - 6 Weeks',
      timelineId: '3 - 6 Minggu'
    },
    {
      id: 'landing-page',
      title: 'Landing page',
      category: 'Development',
      subtitle: 'High-converting website',
      subtitleId: 'Landing page berkonversi tinggi dan berkecepatan instan',
      icon: <Monitor size={24} />,
      summary: 'Ultra-fast, conversion-optimized landing pages with dynamic animations, CRM integrations, and seamless lead capture.',
      summaryId: 'Landing page berkecepatan ultra-tinggi yang dioptimalkan untuk konversi, dilengkapi animasi elegan dan integrasi CRM.',
      fullDescription: 'Engineered for ad campaigns and product launches. We ensure sub-second mobile load times, strict typography, and persuasive layout structure.',
      fullDescriptionId: 'Dirancang khusus untuk kampanye iklan digital dan peluncuran produk. Kami menjamin waktu muat instan di perangkat mobile serta alur CTA yang persuasif.',
      deliverables: [
        'Single-Page Ultra-Responsive Landing Page',
        'Direct WhatsApp & Email Lead Capture Routing',
        'Meta Pixel, Google Analytics 4 & Tag Manager Setup',
        'Speed Optimization for 98+ Google Lighthouse Score',
        'Custom Micro-Animations & Scroll Effects'
      ],
      deliverablesId: [
        'Landing Page Responsif Berkecepatan Tinggi',
        'Routing Otomatis Formulir ke WhatsApp & Email Bisnis',
        'Integrasi Meta Pixel, Google Analytics 4 & Tag Manager',
        'Optimasi Kecepatan Maksimal (Skor 98+ Google Lighthouse)',
        'Animasi Mikro Halus & Efek Scroll Interaktif'
      ],
      tools: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'Vercel'],
      idealFor: 'Marketing campaigns, product drops, digital courses, and lead generation funnels.',
      idealForId: 'Kampanye iklan, peluncuran produk, agensi, dan bisnis yang ingin mengumpulkan prospek pelanggan.',
      timeline: '1 - 2 Weeks',
      timelineId: '1 - 2 Minggu'
    },
    {
      id: 'corporate-websites',
      title: 'Corporate Websites',
      category: 'Development',
      subtitle: 'Built for scale and trust',
      subtitleId: 'Dibangun untuk skala besar dan kredibilitas korporat',
      icon: <Briefcase size={24} />,
      summary: 'Secure, multilingual, and SEO-dominant enterprise websites equipped with headless CMS for seamless marketing team updates.',
      summaryId: 'Website korporat multi-bahasa yang aman, berperingkat SEO tinggi, dan dilengkapi CMS headless untuk kemudahan tim internal.',
      fullDescription: 'Establish undisputed market authority. We build enterprise websites featuring structured schema markup, carrier-grade uptime, and modular content management.',
      fullDescriptionId: 'Bangun kredibilitas perusahaan yang tak tertandingi. Kami menciptakan portal korporat dengan arsitektur SEO rapi, keamanan maksimal, dan manajemen konten mandiri.',
      deliverables: [
        'Custom Multi-Page Corporate Portal Architecture',
        'Headless Content Management System (Sanity / Strapi)',
        'Multilingual Switcher (ID & EN) with Dynamic Localization',
        'Advanced Career & Investor Relations Post Modules',
        'Enterprise Security Hardening & SSL Configuration'
      ],
      deliverablesId: [
        'Arsitektur Website Korporat Multi-Halaman Kustom',
        'Sistem Manajemen Konten (CMS Headless Sanity / Strapi)',
        'Fitur Ganti Bahasa Dinamis (Indonesia & Inggris)',
        'Modul Informasi Karir & Hubungan Investor Terintegrasi',
        'Penguatan Keamanan Korporat & Konfigurasi SSL Resmi'
      ],
      tools: ['Next.js', 'TypeScript', 'Sanity CMS', 'Tailwind CSS', 'Cloudflare'],
      idealFor: 'Enterprises, conglomerates, consulting firms, financial institutions, and manufacturers.',
      idealForId: 'Korporasi, konglomerasi bisnis, firma konsultan, institusi finansial, dan perusahaan manufaktur.',
      timeline: '3 - 6 Weeks',
      timelineId: '3 - 6 Minggu'
    },
    {
      id: 'wow-websites',
      title: 'WOW Websites',
      category: 'Development',
      subtitle: 'Professional, scalable, fast website',
      subtitleId: 'Website profesional, terukur, sangat cepat, dan memukau',
      icon: <Flame size={24} />,
      summary: 'Award-winning experiential websites featuring 3D canvases, fluid WebGL physics, and kinetic typography that leave audiences in awe.',
      summaryId: 'Website interaktif berstandar internasional dengan kanvas 3D, efek fisika WebGL, dan tipografi kinetik yang sangat memukau.',
      fullDescription: 'When standard templates won’t do. We engineer cutting-edge web experiences that combine Awwwards-caliber art direction with blistering fast performance.',
      fullDescriptionId: 'Ketika website standar tidak cukup. Kami merancang pengalaman web mutakhir berstandar kelas dunia yang memukau pengunjung tanpa mengorbankan kecepatan.',
      deliverables: [
        'Interactive WebGL & Spline 3D Scene Integrations',
        'Kinetic Scroll-Triggered Physics & Micro-Interactions',
        'Custom Sound FX & Audio-Visual Synchronization',
        'Sub-second Global Asset Delivery via Cloudflare CDN',
        'Mobile-Optimized Touch Gestures & Fallbacks'
      ],
      deliverablesId: [
        'Integrasi Kanvas 3D Interaktif (Spline / WebGL / Three.js)',
        'Animasi Scroll Kinetik & Mikro-Interaksi Halus',
        'Sinkronisasi Audio-Visual & Efek Interaksi Modern',
        'Distribusi Aset Global Super Cepat via CDN Cloudflare',
        'Optimasi Khusus Perangkat Mobile & Navigasi Sentuh'
      ],
      tools: ['Three.js', 'Spline 3D', 'Next.js', 'GSAP', 'Tailwind CSS'],
      idealFor: 'Luxury brands, creative agencies, game studios, and visionary product showcases.',
      idealForId: 'Brand mewah, studio kreatif, pengembang teknologi, dan produk yang ingin tampil paling menonjol.',
      timeline: '4 - 8 Weeks',
      timelineId: '4 - 8 Minggu'
    }
  ];

  const filteredServices = useMemo(() => {
    if (activeCategory === 'All') return allServices;
    if (activeCategory === 'Solutions') return [];
    return allServices.filter(s => s.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-brand-red selection:text-white relative" role="main">
      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12 border-b border-white/10 overflow-hidden">
        <AtmosphericBackground 
          imageUrl="/hero_background_3d.png"
          opacity={0.06}
          disableGrayscale={true}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 block">
              {language === 'id' ? 'Layanan & Solusi Lengkap' : 'Solutions & Specialized Services'}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white mb-6">
              {language === 'id' ? 'Layanan & Solusi Digital.' : 'Services & Strategic Solutions.'}
            </h1>
            <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed mb-6">
              {language === 'id'
                ? 'Pilihan solusi strategis dan keahlian spesialis terlengkap untuk mentransformasi identitas brand, desain produk digital, dan rekayasa web skala modern.'
                : 'Complete strategic solutions and specialized capabilities to transform brand identity, digital product design, and high-performance web engineering.'
              }
            </p>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs font-mono text-white/60">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>3 {language === 'id' ? 'Solusi Strategis' : 'Strategic Solutions'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                15 {language === 'id' ? 'Layanan Spesialis' : 'Specialized Services'}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-red font-semibold">
                Branding • Design • Development
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: STRATEGIC SOLUTIONS (Always visible or filtered) */}
      {(activeCategory === 'All' || activeCategory === 'Solutions') && (
        <section className="py-14 sm:py-20 px-4 sm:px-6 md:px-12 border-b border-white/10 bg-zinc-950/70 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-brand-red mb-2 block font-semibold">
                  {language === 'id' ? 'Kategori Solusi' : 'Solutions Overview'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">
                  SOLUTIONS
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-white/60 font-light max-w-md">
                {language === 'id'
                  ? 'Format kemitraan strategis yang dirancang fleksibel untuk akselerasi ekosistem enterprise, UKM berkembang, maupun ekspansi tim internal.'
                  : 'Tailored strategic engagement models engineered for enterprise ecosystems, scaling SMEs, and dedicated team expansion.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {strategicSolutions.map((sol) => (
                <Link
                  key={sol.id}
                  to={`/solutions/${sol.id}`}
                  className="group relative rounded-2xl p-6 sm:p-8 bg-zinc-900/50 hover:bg-zinc-900/90 border border-white/10 hover:border-brand-red/60 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                        {sol.icon}
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-[10px] sm:text-[11px] font-mono text-brand-red font-semibold">
                        {language === 'id' ? sol.badgeId : sol.badge}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-display font-bold text-white group-hover:text-brand-red transition-colors mb-1.5">
                      {sol.title}
                    </h3>

                    <span className="text-xs font-mono text-white/50 block mb-4">
                      {language === 'id' ? sol.audienceId : sol.audience}
                    </span>

                    <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed mb-6">
                      {language === 'id' ? sol.descriptionId : sol.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-white/50">
                      {language === 'id' ? sol.timelineId : sol.timeline}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-brand-red font-semibold group-hover:translate-x-1 transition-transform">
                      <span>{language === 'id' ? 'Detail Solusi' : 'Explore Solution'}</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pillar Filter Tabs */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 md:px-12 border-b border-white/10 bg-zinc-950/90 sticky top-16 sm:top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 bg-zinc-900/90 p-1.5 rounded-xl border border-white/10 w-full sm:w-auto">
            {[
              { key: 'All', labelEn: 'All Services (18)', labelId: 'Semua (18)' },
              { key: 'Solutions', labelEn: 'Solutions (3)', labelId: 'Solusi (3)' },
              { key: 'Branding', labelEn: '1. Branding (5)', labelId: '1. Branding (5)' },
              { key: 'Design', labelEn: '2. Design (5)', labelId: '2. Design (5)' },
              { key: 'Development', labelEn: '3. Development (5)', labelId: '3. Development (5)' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key as any)}
                className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-200 text-center ${
                  activeCategory === tab.key
                    ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20 font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {language === 'id' ? tab.labelId : tab.labelEn}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-white/40 hidden sm:block">
            {activeCategory === 'Solutions'
              ? (language === 'id' ? 'Menampilkan 3 Solusi Strategis' : 'Showing 3 Strategic Solutions')
              : (language === 'id' ? `Menampilkan ${filteredServices.length} Layanan Spesialis` : `Showing ${filteredServices.length} Specialized Services`)}
          </span>
        </div>
      </section>

      {/* SECTION 2: SERVICES GRID (Categorized into Branding, Design, Development) */}
      {activeCategory !== 'Solutions' && (
        <section className="py-14 sm:py-20 px-4 sm:px-6 md:px-12">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Show Group Headers when 'All' is selected, or direct grid when filtered */}
            {['Branding', 'Design', 'Development'].map(cat => {
              if (activeCategory !== 'All' && activeCategory !== cat) return null;
              const catServices = allServices.filter(s => s.category === cat);

              return (
                <div key={cat} className="space-y-6">
                  {/* Category Pillar Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono tracking-widest text-brand-red font-semibold uppercase">
                        {cat === 'Branding' ? '01. ' : cat === 'Design' ? '02. ' : '03. '}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-white">
                        {cat}
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-white/40">
                      5 {language === 'id' ? 'Layanan Terintegrasi' : 'Capabilities'}
                    </span>
                  </div>

                  {/* 5-Column / Responsive Grid for This Pillar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {catServices.map((srv) => (
                      <Link
                        key={srv.id}
                        to={`/services/${srv.id}`}
                        className="group rounded-2xl p-6 sm:p-7 bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/10 hover:border-brand-red/50 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-5">
                            <div className="w-11 h-11 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                              {srv.icon}
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-mono text-white/50">
                              {srv.category}
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-display font-bold text-white group-hover:text-brand-red transition-colors mb-1">
                            {srv.title}
                          </h3>

                          <p className="text-xs font-mono text-brand-red/90 mb-3.5">
                            {language === 'id' ? srv.subtitleId : srv.subtitle}
                          </p>

                          <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-5 line-clamp-3">
                            {language === 'id' ? srv.summaryId : srv.summary}
                          </p>

                          <div className="pt-3.5 border-t border-white/10 space-y-1.5 mb-5">
                            {(language === 'id' ? srv.deliverablesId : srv.deliverables).slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-white/60 font-light truncate">
                                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                <span className="truncate">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs font-mono text-white/50">
                            {language === 'id' ? srv.timelineId : srv.timeline}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-mono text-brand-red font-semibold group-hover:translate-x-1 transition-transform">
                            <span>{language === 'id' ? 'Detail' : 'Explore'}</span>
                            <ArrowUpRight size={14} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Service / Solution Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl bg-zinc-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-zinc-950/95 backdrop-blur border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                    {selectedService.icon}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-brand-red block">
                      {'category' in selectedService ? selectedService.category : 'Strategic Solution'}
                    </span>
                    <h3 className="text-base sm:text-xl font-display font-bold text-white">
                      {selectedService.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2 font-semibold">
                    {language === 'id' ? 'Deskripsi & Ruang Lingkup' : 'Overview & Scope'}
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed font-light">
                    {'fullDescription' in selectedService 
                      ? (language === 'id' ? selectedService.fullDescriptionId : selectedService.fullDescription)
                      : (language === 'id' ? selectedService.descriptionId : selectedService.description)
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div>
                    <span className="text-[11px] font-mono text-white/50 uppercase block mb-1">
                      {language === 'id' ? 'Estimasi Pengerjaan' : 'Estimated Timeline'}
                    </span>
                    <span className="text-sm font-display font-semibold text-white">
                      {language === 'id' ? selectedService.timelineId : selectedService.timeline}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-white/50 uppercase block mb-1">
                      {language === 'id' ? 'Target Kebutuhan' : 'Target Audience'}
                    </span>
                    <span className="text-xs text-white/80 font-light block leading-snug">
                      {'idealFor' in selectedService 
                        ? (language === 'id' ? selectedService.idealForId : selectedService.idealFor)
                        : (language === 'id' ? selectedService.audienceId : selectedService.audience)
                      }
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-3 font-semibold">
                    {language === 'id' ? 'Deliverable & Serah Terima' : 'Key Deliverables'}
                  </h4>
                  <ul className="space-y-2">
                    {(language === 'id' ? selectedService.deliverablesId : selectedService.deliverables).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 font-light">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {'tools' in selectedService && selectedService.tools && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3 font-semibold">
                      {language === 'id' ? 'Alat & Standar Teknologi' : 'Tools & Technologies'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.tools.map((tool, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Footer CTA */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-white/60 font-light block">
                      {language === 'id' ? 'Konsultasikan kebutuhan spesifik Anda dengan tim kami.' : 'Consult your specific requirements with our team.'}
                    </span>
                  </div>
                  <Link
                    to="/contact"
                    onClick={() => setSelectedService(null)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-brand-red hover:bg-white text-white hover:text-black font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{language === 'id' ? 'Mulai Proyek Ini' : 'Start This Project'}</span>
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
