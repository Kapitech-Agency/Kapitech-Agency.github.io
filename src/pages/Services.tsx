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
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Terminal, 
  HelpCircle,
  Video,
  Film,
  Box,
  Globe,
  ShoppingCart,
  Cpu,
  Server,
  Wrench,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export interface ServiceDetail {
  id: string;
  title: string;
  pillar: 'Visual Experience' | 'Innovation Development';
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

export const Services = () => {
  const { language } = useLanguage();
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const [activePillar, setActivePillar] = useState<'All' | 'Visual Experience' | 'Innovation Development'>('All');

  const allServices: ServiceDetail[] = [
    // Visual Experience (7 services)
    {
      id: 'ui-ux-design',
      title: 'UI/UX Design',
      pillar: 'Visual Experience',
      icon: <Layout size={26} />,
      summary: 'Figma design systems, high-fidelity responsive wireframes, interactive prototypes, and usability testing.',
      summaryId: 'Sistem desain Figma, wireframe responsif berpresisi tinggi, prototipe interaktif, dan uji usabilitas pengguna.',
      fullDescription: 'We craft user-centric digital experiences balancing aesthetics with friction-free utility. From multi-platform SaaS applications to native mobile interfaces, our design systems ensure visual consistency and developer readiness.',
      fullDescriptionId: 'Kami merancang pengalaman digital berpusat pada pengguna yang menyeimbangkan estetika visual dengan kemudahan pakai. Mulai dari SaaS lintas platform hingga antarmuka mobile, sistem desain kami menjamin konsistensi visual dan kemudahan implementasi kode.',
      deliverables: [
        'Responsive Web & Mobile UI Design',
        'Comprehensive Figma Design Systems & Tokens',
        'Interactive Clickable Prototypes',
        'User Journey Mapping & Information Architecture',
        'Usability Audits & Conversion Optimization'
      ],
      deliverablesId: [
        'Desain UI Web Responsif & Mobile',
        'Sistem Desain & Token Desain Figma Terpusat',
        'Prototipe Interaktif Siap Uji Pengguna',
        'Pemetaan Alur Pengguna & Arsitektur Informasi',
        'Audit Usabilitas & Optimasi Konversi'
      ],
      tools: ['Figma', 'FigJam', 'Miro', 'Spline 3D', 'Lottie'],
      idealFor: 'Product companies launching new features, startups creating MVPs, and enterprises redesigning legacy software.',
      idealForId: 'Perusahaan produk yang merilis fitur baru, startup yang membangun MVP, dan korporat yang memperbarui software lama.',
      timeline: '3 - 6 Weeks',
      timelineId: '3 - 6 Minggu'
    },
    {
      id: 'video-production',
      title: 'Video Production (Event, Wedding & Commercials)',
      pillar: 'Visual Experience',
      icon: <Video size={26} />,
      summary: 'High-definition commercial films, brand documentaries, high-profile corporate events, and bespoke wedding cinematography.',
      summaryId: 'Produksi film komersial HD, dokumenter brand, liputan event korporat bergengsi, dan sinematografi pernikahan eksklusif.',
      fullDescription: 'From pre-production scripting and moodboarding to cinema-grade 4K filming, color grading, and sound mastering. We tell stories that evoke deep emotion and elevate brand perception.',
      fullDescriptionId: 'Dari naskah pra-produksi, moodboard hingga syuting 4K standar bioskop, color grading profesional, dan mastering audio. Kami merangkai cerita visual yang membangkitkan emosi dan mengangkat reputasi brand.',
      deliverables: [
        'Commercial & TVC Brand Videos',
        'Corporate Event Highlights & Keynote Coverage',
        'Cinematic Wedding Films & Teasers',
        'Professional Color Grading (DaVinci Resolve)',
        'Custom Sound Design & Multi-Format Renders'
      ],
      deliverablesId: [
        'Video Komersial Brand & Iklan TVC',
        'Liputan Highlight Event Korporat & Seminar',
        'Film & Teaser Pernikahan Sinematik',
        'Color Grading Profesional (DaVinci Resolve)',
        'Desain Tata Suara & Render Berbagai Format'
      ],
      tools: ['DaVinci Resolve', 'Adobe Premiere Pro', 'After Effects', 'Sony Cinema Line', 'DJI Ronin'],
      idealFor: 'Brands launching campaigns, corporate summits, and couples looking for timeless cinematic memories.',
      idealForId: 'Brand yang merilis kampanye iklan, konferensi bisnis, serta pasangan yang menginginkan dokumentasi sinematik abadi.',
      timeline: '2 - 5 Weeks',
      timelineId: '2 - 5 Minggu'
    },
    {
      id: '2d-animation',
      title: '2D Animation',
      pillar: 'Visual Experience',
      icon: <Film size={26} />,
      summary: 'Dynamic 2D explainer animations, character rigging, marketing motion graphics, and lightweight Lottie web animations.',
      summaryId: 'Animasi explainer 2D dinamis, rigging karakter, motion grafis promosi, dan aset animasi web Lottie super ringan.',
      fullDescription: 'Complex ideas become immediately memorable with hand-crafted 2D animation. We turn technical product features into fluid, engaging narratives suitable for web embeddings and viral campaigns.',
      fullDescriptionId: 'Konsep kompleks menjadi mudah dipahami melalui animasi 2D yang dibuat secara presisi. Kami mengubah fitur produk teknis menjadi cerita visual yang menarik untuk website dan media promosi.',
      deliverables: [
        'Product & Feature Explainer Videos',
        'Character Animation & Rigging',
        'Web-Ready Lottie JSON Animations',
        'Social Media Motion Loops',
        'Custom Voiceover & SFX Synchronization'
      ],
      deliverablesId: [
        'Video Explainer Produk & Fitur',
        'Rigging & Animasi Karakter 2D',
        'Animasi Lottie JSON Ringan untuk Website',
        'Loop Motion Grafis untuk Media Sosial',
        'Sinkronisasi Voiceover & Efek Suara'
      ],
      tools: ['Adobe After Effects', 'Adobe Animate', 'Illustrator', 'LottieFiles', 'Spine 2D'],
      idealFor: 'Fintech, SaaS, and educational platforms needing to explain complex workflows simply.',
      idealForId: 'Fintech, platform SaaS, dan edutech yang perlu menjelaskan cara kerja produk secara sederhana.',
      timeline: '2 - 4 Weeks',
      timelineId: '2 - 4 Minggu'
    },
    {
      id: 'branding-identity',
      title: 'Branding & Identity',
      pillar: 'Visual Experience',
      icon: <Palette size={26} />,
      summary: 'Complete brand systems, iconic logo marks, typography hierarchies, color theory, and comprehensive brand guideline books.',
      summaryId: 'Sistem brand menyeluruh, rancangan logo ikonik, hierarki tipografi, psikologi warna, dan buku pedoman identitas (brandbook).',
      fullDescription: 'A strong visual identity provides a distinct competitive moat. We develop timeless brand identities that articulate your business values across digital, print, and physical environments.',
      fullDescriptionId: 'Identitas visual yang kuat memberikan keunggulan kompetitif yang nyata. Kami merancang sistem identitas abadi yang mencerminkan visi bisnis Anda di media digital, cetak, dan ruang fisik.',
      deliverables: [
        'Primary & Secondary Logo Architecture',
        'Brandbook & Visual Standards Manual',
        'Curated Typography & Color System',
        'Stationery, Packaging & Merchandise Design',
        'Social Media Template Kits & Pitch Decks'
      ],
      deliverablesId: [
        'Arsitektur Logo Utama & Sekunder',
        'Buku Pedoman Identitas Brand (Brandbook)',
        'Sistem Tipografi & Palet Warna Terkurasi',
        'Desain Kemasan, Perlengkapan Kantor & Merchandise',
        'Template Media Sosial & Pitch Deck Investor'
      ],
      tools: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Figma'],
      idealFor: 'New ventures establishing market presence or existing companies undergoing strategic rebranding.',
      idealForId: 'Perusahaan baru yang membangun citra pasar atau korporat yang melakukan repositioning brand.',
      timeline: '3 - 6 Weeks',
      timelineId: '3 - 6 Minggu'
    },
    {
      id: 'motion-graphic-design',
      title: 'Motion & Graphic Design',
      pillar: 'Visual Experience',
      icon: <Sparkles size={26} />,
      summary: 'Kinetic typography, high-impact social media creatives, digital billboard animations, and promotional motion banners.',
      summaryId: 'Tipografi kinetik, materi iklan visual media sosial berdaya tarik tinggi, animasi billboard LED, dan motion banner digital.',
      fullDescription: 'Catch attention within 2 seconds. We combine bold typography, fluid physics, and high-contrast color palettes to deliver scroll-stopping promotional creatives.',
      fullDescriptionId: 'Pikat perhatian audiens dalam 2 detik pertama. Kami memadukan tipografi dinamis, efek gerak halus, dan tata visual kontras tinggi untuk menciptakan materi promosi yang memukau.',
      deliverables: [
        'Kinetic Typography & Social Ad Campaigns',
        'Digital Out-Of-Home (DOOH) & LED Displays',
        'App Feature Highlight Micro-Animations',
        'Promotional Video Trailers & Teasers',
        'High-Resolution Vector Design Assets'
      ],
      deliverablesId: [
        'Tipografi Kinetik & Materi Iklan Media Sosial',
        'Animasi Layar Digital Out-Of-Home (DOOH) & LED',
        'Mikro-Animasi Fitur Aplikasi',
        'Trailer & Teaser Peluncuran Produk',
        'Aset Grafis Vektor Resolusi Tinggi'
      ],
      tools: ['After Effects', 'Premiere Pro', 'Photoshop', 'Illustrator', 'Cinema 4D Lite'],
      idealFor: 'Marketing teams running paid ad campaigns, brand launches, and product announcements.',
      idealForId: 'Tim pemasaran yang menjalankan kampanye iklan berbayar, peluncuran produk, dan promo diskon.',
      timeline: '1 - 3 Weeks',
      timelineId: '1 - 3 Minggu'
    },
    {
      id: 'creative-design',
      title: 'Creative Design',
      pillar: 'Visual Experience',
      icon: <Box size={26} />,
      summary: 'Editorial publications, corporate annual reports, investor pitch decks, infographics, and premium marketing collateral.',
      summaryId: 'Publikasi editorial, laporan tahunan korporat, pitch deck investor, infografis data, dan materi pemasaran cetak premium.',
      fullDescription: 'Translate complex datasets and corporate narratives into pristine, readable, and prestigious publication layouts that command respect in boardrooms and industry summits.',
      fullDescriptionId: 'Ubah data kompleks dan narasi perusahaan menjadi tata letak publikasi yang rapi, mudah dibaca, dan berwibawa di hadapan dewan direksi dan calon investor.',
      deliverables: [
        'Corporate Annual & Sustainability Reports',
        'High-Stakes Investor Pitch Decks',
        'Brochures, Whitepapers & Catalogues',
        'Complex Data Visualization & Infographics',
        'Print Production Ready Pre-Press Files'
      ],
      deliverablesId: [
        'Laporan Tahunan & Laporan Keberlanjutan Korporat',
        'Pitch Deck Investor Tingkat Tinggi',
        'Brosur, Whitepaper & Katalog Produk',
        'Visualisasi Data Kompleks & Infografis',
        'File Cetak Pre-Press Siap Produksi'
      ],
      tools: ['Adobe InDesign', 'Illustrator', 'Photoshop', 'Keynote', 'Figma'],
      idealFor: 'Enterprises preparing shareholder meetings, startups pitching for Series A/B funding, and B2B firms.',
      idealForId: 'Korporat yang mempersiapkan RUPS, startup penggalangan dana modal ventura, dan perusahaan B2B.',
      timeline: '2 - 4 Weeks',
      timelineId: '2 - 4 Minggu'
    },
    {
      id: '3d-visualization',
      title: '3D Visualization',
      pillar: 'Visual Experience',
      icon: <Layers size={26} />,
      summary: 'Photorealistic architectural 3D rendering, industrial product modeling, interactive web 3D (Spline/Three.js), and packaging simulations.',
      summaryId: 'Render 3D arsitektur fotorealistis, pemodelan produk industri, aset 3D interaktif website (Spline/Three.js), dan simulasi kemasan.',
      fullDescription: 'Bring unbuilt properties and physical products to life before manufacturing. We create hyper-realistic lighting, textures, and interactive 3D web canvases.',
      fullDescriptionId: 'Wujudkan proyek properti dan produk fisik sebelum diproduksi massal. Kami menciptakan pencahayaan ultra-realistis, tekstur material nyata, dan kanvas 3D interaktif untuk web.',
      deliverables: [
        'Architectural Exterior & Interior Renders',
        'Photorealistic 3D Product Mockups',
        'Interactive Spline 3D Web Embeds',
        '3D Exploded View Diagrams',
        'High-Resolution 4K/8K Still Renders'
      ],
      deliverablesId: [
        'Render Eksterior & Interior Arsitektur',
        'Mockup Produk 3D Fotorealistis',
        'Embed Kanvas 3D Interaktif (Spline / Three.js)',
        'Diagram 3D Exploded-View Komponen',
        'Render Gambar Resolusi Tinggi 4K/8K'
      ],
      tools: ['Blender', 'Cinema 4D', 'Spline 3D', 'Unreal Engine', 'V-Ray'],
      idealFor: 'Property developers, real estate firms, industrial manufacturers, and tech hardware companies.',
      idealForId: 'Pengembang properti, agen real estate, produsen manufaktur, dan perusahaan hardware teknologi.',
      timeline: '3 - 6 Weeks',
      timelineId: '3 - 6 Minggu'
    },

    // Innovation Development (5 services)
    {
      id: 'company-profile-website',
      title: 'Brochure Site / Company Profile Website',
      pillar: 'Innovation Development',
      icon: <Globe size={26} />,
      summary: 'High-speed, SEO-optimized company profile websites built with modern frameworks to establish authoritative corporate credibility.',
      summaryId: 'Website profil perusahaan berkecepatan tinggi, ramah SEO, dan berkinerja maksimal untuk membangun kredibilitas korporat.',
      fullDescription: 'A bespoke company profile website engineered for instantaneous load speeds, flawless mobile responsiveness, structured schema SEO, and dynamic content management.',
      fullDescriptionId: 'Website profil perusahaan kustom yang dirancang untuk kecepatan akses instan, tampilan mobile sempurna, struktur data SEO rapi, dan kemudahan pengelolaan konten dinamis.',
      deliverables: [
        'Custom Jamstack / Next.js Corporate Portal',
        'Sub-1s Page Load Speeds & 95+ Core Web Vitals',
        'Headless CMS for Instant News & Career Posting',
        'Multilingual Support (ID/EN) with Dynamic Toggles',
        'Advanced Contact Forms & WhatsApp Direct Routing'
      ],
      deliverablesId: [
        'Portal Korporat Kustom Jamstack / Next.js',
        'Waktu Muat Sub-1 Detik & Skor Core Web Vitals 95+',
        'CMS Headless untuk Update Berita & Lowongan Kerja',
        'Dukungan Multi-Bahasa (ID/EN) Terintegrasi',
        'Formulir Kontak Cerdas & Integrasi WhatsApp'
      ],
      tools: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Sanity / Strapi CMS', 'Vercel / Cloudflare'],
      idealFor: 'Established businesses, consulting groups, manufacturing companies, and enterprise organizations.',
      idealForId: 'Perusahaan mapan, firma konsultan, produsen manufaktur, dan korporasi berskala menengah-besar.',
      timeline: '2 - 4 Weeks',
      timelineId: '2 - 4 Minggu'
    },
    {
      id: 'ecommerce-website',
      title: 'E-Commerce Website',
      pillar: 'Innovation Development',
      icon: <ShoppingCart size={26} />,
      summary: 'High-converting custom e-commerce stores, headless storefronts, payment gateway integrations, and automated inventory sync.',
      summaryId: 'Toko online e-commerce berkonversi tinggi, toko headless kustom, integrasi gateway pembayaran lokal/global, dan sinkronisasi stok otomatis.',
      fullDescription: 'We build commerce engines tailored for high-volume transactions, rapid checkout funnels, multi-currency pricing, and real-time integration with shipping and inventory carriers.',
      fullDescriptionId: 'Kami membangun toko online tangguh untuk volume transaksi tinggi, proses checkout cepat, multi-mata uang, dan integrasi kurir pengiriman serta gateway pembayaran resmi.',
      deliverables: [
        'Custom Headless E-Commerce Storefront',
        'Payment Gateway Integration (Midtrans, Xendit, Stripe)',
        'Shipping API Calculation (JNE, SiCepat, DHL)',
        'Cart Abandonment Recovery & Discount Engine',
        'Customer Account Portal & Order Tracking'
      ],
      deliverablesId: [
        'Storefront E-Commerce Headless Kustom',
        'Integrasi Payment Gateway (Midtrans, Xendit, Stripe)',
        'Kalkulasi Ongkos Kirim Otomatis (JNE, SiCepat, DHL)',
        'Sistem Pemulihan Keranjang Belanja & Kupon Diskon',
        'Portal Akun Pelanggan & Pelacakan Pesanan Real-Time'
      ],
      tools: ['Next.js Commerce', 'Shopify Plus API', 'MedusaJS', 'PostgreSQL', 'Tailwind CSS'],
      idealFor: 'D2C retail brands, fashion labels, electronics distributors, and wholesale merchants.',
      idealForId: 'Brand ritel D2C, label fashion, distributor elektronik, dan merchant grosir B2B/B2C.',
      timeline: '4 - 8 Weeks',
      timelineId: '4 - 8 Minggu'
    },
    {
      id: 'web-application',
      title: 'Web Application',
      pillar: 'Innovation Development',
      icon: <Code2 size={26} />,
      summary: 'Custom SaaS platforms, real-time collaboration tools, client portals, and resilient cloud-backed web applications.',
      summaryId: 'Platform SaaS kustom, alat kolaborasi real-time, portal klien interaktif, dan aplikasi web tangguh berbasis cloud.',
      fullDescription: 'From initial data modeling to real-time WebSockets and complex business logic. We develop secure, scalable, and responsive web applications built with TypeScript and modern backend architectures.',
      fullDescriptionId: 'Dari pemodelan database hingga koneksi real-time WebSockets dan logika bisnis yang rumit. Kami membangun aplikasi web yang aman, terukur, dan responsif dengan TypeScript dan cloud backend modern.',
      deliverables: [
        'Full-Stack SaaS Platform Architecture',
        'Role-Based Access Control (RBAC) & OAuth Authentication',
        'Real-Time WebSocket Sync & Notifications',
        'RESTful & GraphQL API Endpoints',
        'Comprehensive Automated Unit & Integration Tests'
      ],
      deliverablesId: [
        'Arsitektur Platform SaaS Full-Stack Lengkap',
        'Otentikasi Aman (OAuth, JWT) & Akses Berbasis Peran',
        'Sinkronisasi Data Real-Time & Notifikasi Push',
        'Pengembangan Endpoint RESTful & GraphQL API',
        'Pengujian Otomatis (Unit & Integration Testing)'
      ],
      tools: ['React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Redis', 'Docker'],
      idealFor: 'Tech startups launching SaaS products, fintech portals, and internal enterprise automation platforms.',
      idealForId: 'Startup teknologi yang meluncurkan produk SaaS, portal fintech, dan platform otomatisasi internal.',
      timeline: '6 - 12 Weeks',
      timelineId: '6 - 12 Minggu'
    },
    {
      id: 'erp-crm-system',
      title: 'ERP / CRM System',
      pillar: 'Innovation Development',
      icon: <Cpu size={26} />,
      summary: 'Bespoke enterprise ERP workflows, CRM sales pipelines, supply chain management, and automated accounting integrations.',
      summaryId: 'Sistem alur kerja ERP kustom, pipeline CRM sales B2B, manajemen rantai pasok inventaris, dan otomatisasi akuntansi keuangan.',
      fullDescription: 'Eliminate manual spreadsheets and disconnected software. We build tailored enterprise resource systems that unite sales teams, inventory tracking, financial ledgers, and executive analytics into a single dashboard.',
      fullDescriptionId: 'Hapuskan spreadsheet manual dan software terpisah. Kami membangun sistem ERP terpadu yang menyatukan tim penjualan, pelacakan gudang, buku besar akuntansi, dan analitik eksekutif dalam satu sistem terpusat.',
      deliverables: [
        'B2B Sales Pipeline & Lead CRM Engine',
        'Multi-Warehouse Inventory & Barcode Tracking',
        'Automated Invoicing & Financial Balance Sheets',
        'Employee Attendance & HR Management Modules',
        'Executive Analytics Dashboard & Exportable PDF Reports'
      ],
      deliverablesId: [
        'Pipeline Penjualan B2B & Manajemen Prospek CRM',
        'Manajemen Inventaris Multi-Gudang & Barcode',
        'Faktur Otomatis & Laporan Neraca Keuangan',
        'Modul Presensi Karyawan & Manajemen SDM',
        'Dashboard Analitik Eksekutif & Ekspor Laporan PDF'
      ],
      tools: ['Node.js', 'PostgreSQL', 'React', 'Docker', 'Redis', 'Tailwind CSS', 'Metabase'],
      idealFor: 'Manufacturing plants, distribution companies, logistics providers, and multi-branch retail operations.',
      idealForId: 'Pabrik manufaktur, perusahaan distributor, penyedia logistik, dan jaringan ritel multi-cabang.',
      timeline: '8 - 16 Weeks',
      timelineId: '8 - 16 Minggu'
    },
    {
      id: 'it-support-infrastructure',
      title: 'IT Support & Infrastructure',
      pillar: 'Innovation Development',
      icon: <Server size={26} />,
      summary: 'Cloud server management, DevOps CI/CD pipelines, database backups, security auditing, and 24/7 technical SLA maintenance.',
      summaryId: 'Pengelolaan server cloud, pipeline DevOps CI/CD, backup database berkala, audit keamanan, dan pemeliharaan SLA 24/7.',
      fullDescription: 'Ensure 99.99% uptime and zero data loss. Our infrastructure engineers configure secure cloud environments (AWS, GCP, DigitalOcean), monitor server telemetry, apply zero-day patches, and optimize network latency.',
      fullDescriptionId: 'Pastikan uptime 99.99% dan tanpa risiko kehilangan data. Tim infrastruktur kami mengonfigurasi cloud aman (AWS, GCP, DigitalOcean), memantau performa server, menerapkan patch keamanan, dan mengoptimalkan kecepatan jaringan.',
      deliverables: [
        'Cloud Server Setup & Migration (AWS / GCP / VPS)',
        'Automated CI/CD Deployment Pipelines (GitHub Actions)',
        'Automated Off-site Database Backups & Disaster Recovery',
        'OWASP Top 10 Security Audit & Firewall Hardening',
        '24/7 Emergency Technical Support & SLA Guarantee'
      ],
      deliverablesId: [
        'Setup & Migrasi Server Cloud (AWS / GCP / VPS)',
        'Pipeline Deployment CI/CD Otomatis (GitHub Actions)',
        'Backup Database Terjadwal & Rencana Pemulihan Bencana',
        'Audit Keamanan OWASP Top 10 & Konfigurasi Firewall',
        'Dukungan Teknis Darurat 24/7 & Garansi Layanan SLA'
      ],
      tools: ['Google Cloud Platform', 'AWS', 'Docker', 'Kubernetes', 'Cloudflare', 'Nginx', 'GitHub Actions', 'Datadog'],
      idealFor: 'Companies running critical customer-facing applications needing high availability, security, and dedicated maintenance.',
      idealForId: 'Perusahaan dengan aplikasi krusial yang memerlukan ketersediaan tinggi, kepatuhan keamanan, dan tim pemeliharaan siap siaga.',
      timeline: 'Ongoing SLA Retainer / 1 - 3 Weeks Setup',
      timelineId: 'Retainer SLA Berkelanjutan / 1 - 3 Minggu Setup'
    }
  ];

  const filteredServices = useMemo(() => {
    if (activePillar === 'All') return allServices;
    return allServices.filter(s => s.pillar === activePillar);
  }, [activePillar]);

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
              {language === 'id' ? 'Layanan & Keahlian Studio' : 'Services & Core Capabilities'}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white mb-6">
              {language === 'id' ? 'Dua Pilar Solusi Digital.' : 'Two Pillars of Digital Craft.'}
            </h1>
            <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed mb-6">
              {language === 'id'
                ? 'Kami menggabungkan keunggulan Visual Experience dengan kedalaman rekayasa Innovation Development untuk mempercepat pertumbuhan bisnis Anda.'
                : 'We unite high-craft Visual Experience with robust Innovation Development engineering to accelerate your digital growth.'
              }
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/60">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>12 {language === 'id' ? 'Layanan Terintegrasi' : 'Specialized Capabilities'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                Visual Experience (7)
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                Innovation Development (5)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar Filter Tabs */}
      <section className="py-8 px-4 sm:px-6 md:px-12 border-b border-white/10 bg-zinc-950/80 sticky top-16 sm:top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-xl border border-white/10">
            {[
              { key: 'All', labelEn: 'All Services (12)', labelId: 'Semua Layanan (12)' },
              { key: 'Visual Experience', labelEn: '1. Visual Experience (7)', labelId: '1. Visual Experience (7)' },
              { key: 'Innovation Development', labelEn: '2. Innovation Development (5)', labelId: '2. Innovation Development (5)' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActivePillar(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-200 ${
                  activePillar === tab.key
                    ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {language === 'id' ? tab.labelId : tab.labelEn}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-white/40">
            {language === 'id' ? `Menampilkan ${filteredServices.length} Layanan` : `Showing ${filteredServices.length} Services`}
          </span>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.map((srv) => (
              <motion.article
                key={srv.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedService(srv)}
                className="cursor-pointer group rounded-2xl p-6 sm:p-8 bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/10 hover:border-brand-red/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red group-hover:scale-105 transition-transform">
                      {srv.icon}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/50">
                      {srv.pillar === 'Visual Experience' ? 'Visual' : 'Innovation'}
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-bold text-white group-hover:text-brand-red transition-colors mb-3">
                    {srv.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6">
                    {language === 'id' ? srv.summaryId : srv.summary}
                  </p>

                  <div className="pt-4 border-t border-white/10 space-y-2 mb-6">
                    {(language === 'id' ? srv.deliverablesId : srv.deliverables).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-white/60 font-light truncate">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-white/50">
                    {language === 'id' ? srv.timelineId : srv.timeline}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-brand-red font-semibold group-hover:translate-x-1 transition-transform">
                    <span>{language === 'id' ? 'Detail' : 'Explore'}</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
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
                  <div className="w-9 h-9 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red">
                    {selectedService.icon}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-brand-red block">
                      {selectedService.pillar}
                    </span>
                    <h3 className="text-base sm:text-lg font-display font-bold text-white">
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
                    {language === 'id' ? 'Deskripsi Layanan' : 'Overview & Scope'}
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed font-light">
                    {language === 'id' ? selectedService.fullDescriptionId : selectedService.fullDescription}
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
                      {language === 'id' ? 'Sangat Cocok Untuk' : 'Ideal Client Fit'}
                    </span>
                    <span className="text-xs text-white/80 font-light block leading-snug">
                      {language === 'id' ? selectedService.idealForId : selectedService.idealFor}
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

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3 font-semibold">
                    {language === 'id' ? 'Alat & Teknologi' : 'Tools & Technologies'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.tools.map((tool, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Modal Footer CTA */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-white/60 font-light block">
                      {language === 'id' ? 'Konsultasikan kebutuhan spesifik Anda dengan tim kami.' : 'Consult your specific requirements with our engineers.'}
                    </span>
                  </div>
                  <Link
                    to="/contact"
                    onClick={() => setSelectedService(null)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-brand-red hover:bg-white text-white hover:text-black font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{language === 'id' ? 'Pesan Layanan Ini' : 'Inquire This Service'}</span>
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
