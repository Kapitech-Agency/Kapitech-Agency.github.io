import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Globe, 
  Users, 
  Heart, 
  Coffee, 
  Laptop, 
  Upload, 
  FileText, 
  Phone, 
  Mail, 
  User, 
  Link as LinkIcon, 
  X, 
  Briefcase, 
  MapPin, 
  Clock,
  Sparkles,
  Building2,
  TrendingUp,
  Award,
  ShieldCheck,
  Zap,
  DollarSign,
  Layers,
  Palette,
  Code2,
  Check,
  AlertCircle,
  FolderGit2
} from 'lucide-react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  workplace: string;
  badge: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  compensation?: string;
}

export const Careers = () => {
  const { language } = useLanguage();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    portfolio: '',
    coverLetter: '',
    resume: null as File | null
  });

  // Freelance Vendor Modal & Form State
  const [isFreelanceModalOpen, setIsFreelanceModalOpen] = useState(false);
  const [isVendorSubmitted, setIsVendorSubmitted] = useState(false);
  const [vendorHoneypot, setVendorHoneypot] = useState('');
  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: 'UI/UX & Product Design',
    portfolio: '',
    rateCard: '',
    experienceYears: '3-5 Years',
    tools: '',
    notes: '',
    agreedWfa: true,
    agreedDevice: true,
    agreedNda: true,
    resume: null as File | null
  });

  const [selectedTalent, setSelectedTalent] = useState<any | null>(null);

  const twelveTalentsEn = [
    {
      id: "aditya-pratama",
      name: "Aditya Pratama",
      role: "Lead Frontend Engineer",
      specialty: "React, Next.js & Web Performance",
      department: "Innovation Development",
      experience: "6+ Years Exp",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=800",
      bio: "Specializes in sub-second DOM hydration, micro-frontend architecture, and fluid motion physics."
    },
    {
      id: "nathania-kusuma",
      name: "Nathania Kusuma",
      role: "Senior UI/UX & Design Systems Lead",
      specialty: "Figma Systems & Design Tokens",
      department: "Visual Experience",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=800",
      bio: "Crafts mathematically scaled Figma design systems, accessible WCAG color models, and interactive micro-interactions."
    },
    {
      id: "bagas-wicaksono",
      name: "Bagas Wicaksono",
      role: "Senior Motion & 2D Animator",
      specialty: "Kinetic Typography & After Effects",
      department: "Visual Experience",
      experience: "4+ Years Exp",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=85&w=800",
      bio: "Brings brand stories to life through high-frame-rate kinetic animation, 2D character explainers, and Lottie assets."
    },
    {
      id: "clarissa-angela",
      name: "Clarissa Angela",
      role: "Brand Identity & Editorial Designer",
      specialty: "Brand Guidelines & Visual Story",
      department: "Visual Experience",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=85&w=800",
      bio: "Authors bespoke typography pairings, multi-brand identity kits, and investor presentation collateral."
    },
    {
      id: "dimas-rizky",
      name: "Dimas Rizky",
      role: "3D Visualizer & Spline Technologist",
      specialty: "Blender 3D & WebGL Environments",
      department: "Visual Experience",
      experience: "4+ Years Exp",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=85&w=800",
      bio: "Builds photorealistic architectural renders, 3D product prototypes, and real-time Spline WebGL canvases."
    },
    {
      id: "evelyn-santoso",
      name: "Evelyn Santoso",
      role: "Senior Product & Mobile UI Designer",
      specialty: "iOS/Android Ergonomics & Prototypes",
      department: "Visual Experience",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=85&w=800",
      bio: "Engineers thumb-accessible mobile UX flows, haptic feedback loops, and multi-tenant mobile applications."
    },
    {
      id: "farhan-ramadhan",
      name: "Farhan Ramadhan",
      role: "Cloud Infrastructure & DevOps Specialist",
      specialty: "AWS, GCP & Automated CI/CD",
      department: "Innovation Development",
      experience: "6+ Years Exp",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=85&w=800",
      bio: "Maintains 99.99% cloud uptime, automated blue-green deployment pipelines, and zero-trust security."
    },
    {
      id: "gabriella-tan",
      name: "Gabriella Tan",
      role: "2D Character Artist & Illustrator",
      specialty: "Vector Assets & Explainer Artworks",
      department: "Visual Experience",
      experience: "4+ Years Exp",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=85&w=800",
      bio: "Draws distinctive editorial vectors, custom icon sets, and charismatic 2D character sets for brand campaigns."
    },
    {
      id: "haikal-firdaus",
      name: "Haikal Firdaus",
      role: "Senior Backend & Database Architect",
      specialty: "Node.js, PostgreSQL & Distributed Cache",
      department: "Innovation Development",
      experience: "7+ Years Exp",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=85&w=800",
      bio: "Architects scalable microservices, low-latency Redis caching layers, and high-volume relational schemas."
    },
    {
      id: "indah-permata",
      name: "Indah Permata",
      role: "Video Producer & Commercial Colorist",
      specialty: "TVC Editing, Cinematic LUTs & DaVinci",
      department: "Visual Experience",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=85&w=800",
      bio: "Directs cinematic commercial shoots, color grades in DaVinci Resolve Studio, and produces TVC broadcast masters."
    },
    {
      id: "julian-mahendra",
      name: "Julian Mahendra",
      role: "Full-Stack SaaS & Web App Engineer",
      specialty: "TypeScript, GraphQL & Realtime Sockets",
      department: "Innovation Development",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=85&w=800",
      bio: "Develops real-time collaborative SaaS platforms, custom enterprise CRM tooling, and high-security REST APIs."
    },
    {
      id: "karina-wijaya",
      name: "Karina Wijaya",
      role: "Pitch Deck & Publication Strategist",
      specialty: "Investor Decks & High-Impact Reports",
      department: "Visual Experience",
      experience: "4+ Years Exp",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=85&w=800",
      bio: "Translates complex financial data and corporate roadmaps into crisp, executive-ready presentation decks."
    }
  ];

  const twelveTalentsId = [
    {
      id: "aditya-pratama",
      name: "Aditya Pratama",
      role: "Lead Frontend Engineer",
      specialty: "React, Next.js & Web Performance",
      department: "Innovation Development",
      experience: "Pengalaman 6+ Tahun",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=800",
      bio: "Spesialis dalam hidrasi DOM sub-detik, arsitektur micro-frontend, dan fisika animasi berbasis kode modern."
    },
    {
      id: "nathania-kusuma",
      name: "Nathania Kusuma",
      role: "Senior UI/UX & Design Systems Lead",
      specialty: "Sistem Desain Figma & Token UI",
      department: "Visual Experience",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=800",
      bio: "Merancang sistem desain modular Figma, standar aksesibilitas WCAG, dan uji interaksi prototipe pengguna."
    },
    {
      id: "bagas-wicaksono",
      name: "Bagas Wicaksono",
      role: "Senior Motion & 2D Animator",
      specialty: "Tipografi Kinetik & After Effects",
      department: "Visual Experience",
      experience: "Pengalaman 4+ Tahun",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=85&w=800",
      bio: "Menghidupkan cerita brand lewat animasi frame-rate tinggi, video explainer komersial, dan aset Lottie."
    },
    {
      id: "clarissa-angela",
      name: "Clarissa Angela",
      role: "Brand Identity & Editorial Designer",
      specialty: "Pedoman Brand & Identitas Visual",
      department: "Visual Experience",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=85&w=800",
      bio: "Merancang identitas korporat, brandbook komprehensif, dan materi publikasi editorial tingkat tinggi."
    },
    {
      id: "dimas-rizky",
      name: "Dimas Rizky",
      role: "3D Visualizer & Spline Technologist",
      specialty: "Blender 3D & Lingkungan WebGL",
      department: "Visual Experience",
      experience: "Pengalaman 4+ Tahun",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=85&w=800",
      bio: "Membangun render fotorealistis 3D produk, visualisasi arsitektur, dan aset WebGL real-time interaktif."
    },
    {
      id: "evelyn-santoso",
      name: "Evelyn Santoso",
      role: "Senior Product & Mobile UI Designer",
      specialty: "Ergonomi iOS/Android & Prototipe",
      department: "Visual Experience",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=85&w=800",
      bio: "Merancang pengalaman aplikasi mobile yang ramah ibu jari, alur onboarding mulus, dan responsivitas layar."
    },
    {
      id: "farhan-ramadhan",
      name: "Farhan Ramadhan",
      role: "Cloud Infrastructure & DevOps Engineer",
      specialty: "AWS, Docker & Otomasi Pipeline CI/CD",
      department: "Innovation Development",
      experience: "Pengalaman 6+ Tahun",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=85&w=800",
      bio: "Menjaga uptime server 99.99%, otomatisasi build pipeline multi-region, dan mitigasi keamanan cloud."
    },
    {
      id: "gabriella-tan",
      name: "Gabriella Tan",
      role: "2D Character Artist & Illustrator",
      specialty: "Aset Vektor & Artwork Video Explainer",
      department: "Visual Experience",
      experience: "Pengalaman 4+ Tahun",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=85&w=800",
      bio: "Menggambar ilustrasi vektor orisinal, paket ikon kustom, dan karakter visual berkarakter kuat untuk kampanye."
    },
    {
      id: "haikal-firdaus",
      name: "Haikal Firdaus",
      role: "Senior Backend & Database Architect",
      specialty: "Node.js, PostgreSQL & Distributed Cache",
      department: "Innovation Development",
      experience: "Pengalaman 7+ Tahun",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=85&w=800",
      bio: "Membangun arsitektur microservices terukur, cache berkinerja tinggi, dan relasi database berkeamanan tinggi."
    },
    {
      id: "indah-permata",
      name: "Indah Permata",
      role: "Video Producer & Commercial Colorist",
      specialty: "Editing TVC, LUT Sinematik & DaVinci",
      department: "Visual Experience",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=85&w=800",
      bio: "Memproduksi video komersial brand, grading warna sinematik di DaVinci Studio, dan supervisi audio master."
    },
    {
      id: "julian-mahendra",
      name: "Julian Mahendra",
      role: "Full-Stack SaaS & Web App Engineer",
      specialty: "TypeScript, GraphQL & Realtime Sockets",
      department: "Innovation Development",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=85&w=800",
      bio: "Mengembangkan aplikasi SaaS kolaboratif real-time, integrasi sistem CRM bisnis, dan API terenkripsi."
    },
    {
      id: "karina-wijaya",
      name: "Karina Wijaya",
      role: "Pitch Deck & Publication Strategist",
      specialty: "Investor Pitch Deck & Laporan Finansial",
      department: "Visual Experience",
      experience: "Pengalaman 4+ Tahun",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=85&w=800",
      bio: "Mengubah data bisnis dan proyeksi keuangan yang kompleks menjadi deck presentasi investor yang meyakinkan."
    }
  ];

  const twelveTalents = language === 'id' ? twelveTalentsId : twelveTalentsEn;

  const positionsEn: Position[] = [
    {
      id: 'bdr-partnership',
      title: 'Business Development Representative (BDR)',
      department: 'Business & Partnerships',
      location: 'South Tangerang & Remote',
      workplace: 'Hybrid',
      type: 'Commission Based • Contract Freelancer Partnership',
      badge: 'High Commission + Bonus',
      summary: 'Drive high-value enterprise and mid-market client partnerships. You will identify business opportunities for our Visual Experience and Innovation Development services, conduct discovery pitches, and earn competitive uncapped commissions.',
      responsibilities: [
        'Identify and prospect prospective corporate clients, startups, and brand leaders requiring digital transformation or visual design',
        'Initiate outbound sales outreach via LinkedIn, email sequences, and high-impact discovery calls',
        'Present Kapitech Agency capabilities, pitch decks, and tailored solution proposals to key decision-makers (C-Level, VP, Directors)',
        'Negotiate scope agreements and collaborate closely with our CEO and Project Managers for seamless client onboarding',
        'Maintain accurate deal telemetry, CRM pipeline tracking, and revenue forecasting'
      ],
      requirements: [
        'Proven track record in B2B sales, agency business development, or software solutions partnership',
        'Strong network in technology, corporate, creative, or e-commerce sectors',
        'Outstanding verbal and written communication skills with persuasive pitching ability',
        'Self-motivated, goal-oriented mindset thriving in a performance-driven commission structure',
        'Fluency in Bahasa Indonesia and professional English proficiency'
      ],
      compensation: 'Uncapped Deal Commissions + Milestone Performance Bonuses'
    },
    {
      id: 'ui-ux-product-designer',
      title: 'UI/UX & Product Designer',
      department: 'Design & Visual Experience',
      location: 'Kapitech Studio, South Tangerang',
      workplace: 'WFO (Work From Office)',
      type: 'Full Time',
      badge: 'Full Time • On-site Studio',
      summary: 'Join our in-studio creative squad to author world-class digital interfaces, responsive design systems in Figma, and interactive user experiences for global and domestic client projects.',
      responsibilities: [
        'Design pixel-perfect responsive web, mobile app (iOS/Android), and SaaS software interfaces',
        'Architect and maintain scalable design systems, design tokens, and comprehensive component libraries in Figma',
        'Conduct user journey mapping, wireframing, interactive prototyping, and usability validation sprints',
        'Collaborate side-by-side with our Executive Creative Director and frontend engineers for flawless implementation',
        'Prepare presentation decks and articulate UX/UI rationale directly during client review sessions'
      ],
      requirements: [
        '2+ years of professional experience in UI/UX design for web platforms, mobile apps, or digital agencies',
        'Stunning design portfolio showcasing modern visual hierarchy, clean typography, and responsive UX systems',
        'Mastery of Figma, FigJam, auto-layout, component variants, and interactive prototyping',
        'Ability to work full-time on-site at our South Tangerang studio with strong collaborative energy',
        'High attention to visual craft, micro-interactions, and design-to-code feasibility'
      ],
      compensation: 'Competitive Monthly Salary + Health Coverage + Project Performance Bonuses'
    }
  ];

  const positionsId: Position[] = [
    {
      id: 'bdr-partnership',
      title: 'Business Development Representative (BDR)',
      department: 'Bisnis & Kemitraan',
      location: 'Tangerang Selatan & Remote',
      workplace: 'Hybrid',
      type: 'Commission Based • Contract Freelancer Partnership',
      badge: 'Komisi Tinggi + Bonus',
      summary: 'Pimpin ekspansi kemitraan klien korporat dan pasar menengah. Anda akan mengidentifikasi peluang bisnis untuk layanan Visual Experience dan Innovation Development kami, mempresentasikan solusi, dan memperoleh komisi berbasis performa tanpa batas.',
      responsibilities: [
        'Mengidentifikasi dan memprospek calon klien perusahaan, startup, dan brand yang membutuhkan transformasi digital atau desain visual',
        'Melakukan outbound sales outreach melalui LinkedIn, email bisnis, dan discovery call terarah',
        'Mempresentasikan portofolio Kapitech Agency, proposal kustom, dan lingkup kerja kepada pengambil keputusan utama (C-Level, VP, Direktur)',
        'Membantu negosiasi kontrak kerja sama dan berkoordinasi langsung dengan CEO serta Project Manager kami',
        'Memelihara catatan pipeline prospek di CRM dan pelacakan target pendapatan secara terstruktur'
      ],
      requirements: [
        'Pengalaman terbukti dalam B2B sales, kemitraan agensi digital, atau penjualan solusi perangkat lunak',
        'Memiliki jaringan luas di sektor teknologi, korporasi, retail kreatif, atau e-commerce',
        'Kemampuan komunikasi lisan dan tulisan yang persuasif serta percaya diri saat presentasi',
        'Mandiri, berorientasi pada target, dan termotivasi oleh skema komisi berbasis kinerja',
        'Fasih berbahasa Indonesia dan memiliki kemampuan bahasa Inggris bisnis yang baik'
      ],
      compensation: 'Komisi Proyek Tanpa Batas + Bonus Pencapaian Target Milestone'
    },
    {
      id: 'ui-ux-product-designer',
      title: 'UI/UX & Product Designer',
      department: 'Desain & Visual Experience',
      location: 'Studio Kapitech, Tangerang Selatan',
      workplace: 'WFO (Work From Office)',
      type: 'Full Time',
      badge: 'Full Time • Studio On-site',
      summary: 'Bergabunglah bersama tim kreatif di studio kami untuk merancang antarmuka digital kelas dunia, sistem desain responsif di Figma, dan pengalaman pengguna interaktif untuk klien global dan nasional.',
      responsibilities: [
        'Merancang antarmuka web responsif, aplikasi mobile (iOS/Android), dan sistem software SaaS berpresisi tinggi',
        'Membangun serta memelihara sistem desain modular, token desain, dan pustaka komponen di Figma',
        'Melakukan pemetaan alur pengguna, wireframing, pembuatan prototipe interaktif, dan uji usabilitas',
        'Berkolaborasi langsung di studio bersama Executive Creative Director dan frontend engineer untuk memastikan hasil koding sesuai desain',
        'Mempersiapkan deck presentasi dan menjelaskan pertimbangan desain secara objektif dalam sesi review klien'
      ],
      requirements: [
        '2+ tahun pengalaman profesional di bidang desain UI/UX untuk platform web, aplikasi mobile, atau agensi',
        'Portofolio desain yang kuat menunjukkan penguasaan tipografi, tata letak visual modern, dan sistem UX responsif',
        'Keahlian mendalam dalam Figma, FigJam, auto-layout, varian komponen, dan prototipe interaktif',
        'Bersedia bekerja full-time on-site (WFO) di studio Tangerang Selatan dengan semangat kolaborasi tinggi',
        'Ketelitian tinggi terhadap detail visual mikro, konsistensi brand, dan kelayakan teknis implementasi kode'
      ],
      compensation: 'Gaji Pokok Kompetitif + Asuransi Kesehatan + Bonus Kinerja Proyek'
    }
  ];

  const positions = language === 'id' ? positionsId : positionsEn;

  const benefitsEn = [
    {
      icon: <TrendingUp size={24} />,
      title: "Uncapped Earnings & Growth",
      desc: "Lucrative performance-driven commissions for BDRs and structured career paths with annual salary reviews."
    },
    {
      icon: <Briefcase size={24} />,
      title: "Real Enterprise Impact",
      desc: "Work on genuine client products for high-growth ventures, enterprise leaders, and disruptive global startups."
    },
    {
      icon: <Coffee size={24} />,
      title: "Inspiring Studio Culture",
      desc: "Modern collaborative workspace in South Tangerang equipped with cutting-edge hardware, ergonomic setups, and zero bureaucracy."
    },
    {
      icon: <Heart size={24} />,
      title: "Health & Professional Tools",
      desc: "Full Figma Organization licenses, AI tool subscriptions, learning stipends, and comprehensive health coverage."
    }
  ];

  const benefitsId = [
    {
      icon: <TrendingUp size={24} />,
      title: "Pendapatan & Karier Bertumbuh",
      desc: "Komisi performa tanpa batas untuk BDR dan jenjang karier terstruktur dengan tinjauan berkala."
    },
    {
      icon: <Briefcase size={24} />,
      title: "Dampak Nyata Bersama Klien",
      desc: "Berkontribusi pada proyek riil untuk startup berkembang pesat dan perusahaan korporat terkemuka."
    },
    {
      icon: <Coffee size={24} />,
      title: "Budaya Studio yang Menginspirasi",
      desc: "Ruang kerja studio kolaboratif di Tangerang Selatan dengan perangkat kerja modern dan komunikasi langsung tanpa birokrasi."
    },
    {
      icon: <Heart size={24} />,
      title: "Kesehatan & Fasilitas Alat Kerja",
      desc: "Lisensi penuh Figma, langganan tool AI, anggaran pengembangan keahlian, dan perlindungan kesehatan komprehensif."
    }
  ];

  const benefits = language === 'id' ? benefitsId : benefitsEn;
  const [honeypot, setHoneypot] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Max 5MB check
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'id' ? 'Ukuran file maksimal adalah 5MB' : 'Maximum file size is 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim().length > 0) {
      setIsSubmitted(true);
      return;
    }
    const sanitizedName = formData.name.trim();
    const sanitizedEmail = formData.email.trim();
    if (!sanitizedName || !sanitizedEmail) return;

    setIsSubmitted(true);
  };

  const handleVendorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setVendorFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setVendorFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVendorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'id' ? 'Ukuran file maksimal adalah 5MB' : 'Maximum file size is 5MB');
        return;
      }
      setVendorFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorHoneypot.trim().length > 0) {
      setIsVendorSubmitted(true);
      return;
    }
    const sanitizedName = vendorFormData.name.trim();
    const sanitizedEmail = vendorFormData.email.trim();
    if (!sanitizedName || !sanitizedEmail) return;

    setIsVendorSubmitted(true);
  };

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen selection:bg-brand-red selection:text-white relative" role="main">
      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 md:pt-40 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12 border-b border-[#2A2A2A] overflow-hidden">
        <AtmosphericBackground 
          imageUrl="/hero_background_3d.png"
          opacity={0.06}
          disableGrayscale={true}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 block">
              {language === 'id' ? 'Karier & Peluang Kemitraan' : 'Careers & Opportunities'}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white mb-6">
              {language === 'id' ? 'Berkarya Bersama Kapitech.' : 'Build the Future With Us.'}
            </h1>
            <p className="text-base sm:text-lg text-[#8E8E93] font-light leading-relaxed mb-6">
              {language === 'id'
                ? 'Kami membuka kesempatan bagi talenta on-site studio di Tangerang Selatan serta jaringan Freelance Vendor berbasis proyek (100% WFA) untuk berkolaborasi menggarap produk digital kelas dunia.'
                : 'We offer on-site studio roles in South Tangerang as well as a global Freelance Vendor network (100% WFA, Project-Based) to build exceptional digital products together.'
              }
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8E8E93] mb-6">
              <span className="px-3 py-1.5 rounded-full bg-[#161616] border border-[#2A2A2A] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>2 {language === 'id' ? 'Posisi Studio Terbuka' : 'Studio Roles Hiring'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red font-semibold flex items-center gap-2">
                <Sparkles size={12} />
                <span>{language === 'id' ? 'Freelance Vendor Network (WFA Terbuka)' : 'Freelance Vendor Network (WFA Open)'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#161616] border border-[#2A2A2A]">
                {language === 'id' ? 'Studio di Tangerang Selatan' : 'Studio in South Tangerang'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a 
                href="#open-positions"
                className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
              >
                <span>{language === 'id' ? 'Posisi Studio On-site' : 'Studio Open Roles'}</span>
                <ArrowUpRight size={14} />
              </a>
              <button 
                onClick={() => {
                  setIsFreelanceModalOpen(true);
                  setIsVendorSubmitted(false);
                }}
                className="px-5 py-2.5 rounded-full bg-brand-red hover:bg-white hover:text-black text-white text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-lg shadow-brand-red/20"
              >
                <FolderGit2 size={14} />
                <span>{language === 'id' ? 'Daftar sebagai Freelance Vendor' : 'Apply as Freelance Vendor'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Join With Our 12 Great Talents */}
      <section className="py-16 sm:py-24 border-b border-[#2A2A2A] bg-[#0A0A0A] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-red/30 bg-brand-red/10 text-brand-red text-xs font-mono mb-3">
                <Users className="w-3.5 h-3.5 text-brand-red" />
                <span>{language === 'id' ? '12 Talenta Spesialis' : '12 Specialist Talents'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                {language === 'id' ? 'Bergabung Bersama 12 Talenta Terbaik Kami' : 'Join with our 12 great talents'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8E8E93] font-light max-w-md">
              {language === 'id'
                ? 'Bekerja bahu-membahu bersama para insinyur software, desainer visual, animator 3D, dan spesialis kreatif kami.'
                : 'Collaborate shoulder-to-shoulder with our multidisciplinary squad of software engineers, visual designers, 3D animators, and creative strategists.'
              }
            </p>
          </div>
        </div>

        {/* Dynamic & Aesthetic Staggered Photo Wall (Plain Darkened Photos) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 pb-6">
            {twelveTalents.map((talent, index) => {
              // Staggered offset for dynamic editorial rhythm
              const offsetClasses = [
                'lg:translate-y-0',
                'lg:translate-y-5 sm:translate-y-3',
                'lg:-translate-y-2',
                'lg:translate-y-7 sm:translate-y-4',
                'lg:translate-y-1',
                'lg:translate-y-6 sm:translate-y-2',
                'lg:-translate-y-1',
                'lg:translate-y-6 sm:translate-y-4',
                'lg:translate-y-0',
                'lg:translate-y-5 sm:translate-y-2',
                'lg:-translate-y-2',
                'lg:translate-y-7 sm:translate-y-3',
              ][index % 12];

              return (
                <div
                  key={`talent-wrap-${talent.id}`}
                  className={`transition-transform duration-500 ${offsetClasses}`}
                >
                  <button
                    onClick={() => setSelectedTalent(talent)}
                    className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#2A2A2A] bg-[#161616] transition-all duration-500 hover:scale-[1.04] hover:-translate-y-1.5 hover:border-brand-red/60 hover:shadow-[0_16px_36px_rgba(255,26,26,0.22)] cursor-pointer aspect-[3/4] p-0 block w-full text-left focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                    title={`${talent.name} - ${talent.role}`}
                    aria-label={`View photo and profile of ${talent.name}`}
                  >
                    {/* Pure Plain Photo with Tasteful Dark Moody Grading */}
                    <img 
                      src={talent.image} 
                      alt={talent.name}
                      className="w-full h-full object-cover object-center brightness-[0.70] contrast-[1.15] saturate-[0.85] group-hover:brightness-[0.92] group-hover:saturate-[1.02] group-hover:scale-105 transition-all duration-700 ease-out"
                      loading="lazy"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Talent Detail Modal */}
        <AnimatePresence>
          {selectedTalent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
              onClick={() => setSelectedTalent(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-[#161616] border border-[#2A2A2A] rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden my-6"
              >
                <button
                  onClick={() => setSelectedTalent(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
                  aria-label="Close talent profile"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-4 mb-5 sm:mb-6 pr-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-brand-red/30 bg-[#0A0A0A] shrink-0 relative shadow-lg shadow-brand-red/10">
                    <img 
                      src={selectedTalent.image} 
                      alt={selectedTalent.name}
                      className="w-full h-full object-cover object-center brightness-95 contrast-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-mono text-brand-red font-semibold block mb-0.5 truncate">
                      {selectedTalent.department} • {selectedTalent.experience}
                    </span>
                    <h3 className="text-lg sm:text-xl font-display font-bold text-white truncate">
                      {selectedTalent.name}
                    </h3>
                    <p className="text-xs text-[#8E8E93] truncate">
                      {selectedTalent.role}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 sm:space-y-4 text-xs font-light text-white/80 border-t border-[#2A2A2A] pt-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#8E8E93] block mb-1">
                      {language === 'id' ? 'Fokus Keahlian' : 'Core Specialty'}
                    </span>
                    <p className="font-mono text-brand-red font-medium text-xs sm:text-sm">
                      {selectedTalent.specialty}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#8E8E93] block mb-1">
                      {language === 'id' ? 'Tentang Praktik Kerja' : 'About Craft & Practice'}
                    </span>
                    <p className="leading-relaxed text-[#8E8E93]">
                      {selectedTalent.bio}
                    </p>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-[#2A2A2A] flex justify-end">
                  <button
                    onClick={() => setSelectedTalent(null)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-brand-red hover:bg-white hover:text-black text-white text-xs font-mono font-medium rounded-full transition-colors"
                  >
                    {language === 'id' ? 'Tutup Profil' : 'Close Profile'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION: Current Opportunities */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-[#2A2A2A]" id="open-positions">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 block">
                {language === 'id' ? 'Peluang Terbuka' : 'Current Opportunities'}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                {language === 'id' ? 'Posisi yang Sedang Dibuka' : 'Available Roles'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8E8E93] font-light max-w-md">
              {language === 'id'
                ? 'Klik salah satu posisi di bawah ini untuk melihat detail kualifikasi, tanggung jawab, dan mengirimkan lamaran langsung.'
                : 'Click any role below to review full responsibilities, qualification benchmarks, and submit your application.'
              }
            </p>
          </div>

          <div className="space-y-6">
            {positions.map((pos) => (
              <motion.div
                key={pos.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedPosition(pos)}
                className="cursor-pointer group p-6 sm:p-8 lg:p-10 rounded-2xl border border-[#2A2A2A] bg-[#161616] hover:border-brand-red/50 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-mono font-medium">
                        {pos.workplace}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#8E8E93] text-xs font-mono">
                        {pos.department}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                        {pos.badge}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white group-hover:text-brand-red transition-colors">
                      {pos.title}
                    </h3>

                    <p className="text-sm text-[#8E8E93] font-light leading-relaxed">
                      {pos.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8E8E93] pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-brand-red" />
                        <span>{pos.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-brand-red" />
                        <span>{pos.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                    <span className="px-5 py-2.5 rounded-full bg-[#0A0A0A] group-hover:bg-brand-red text-white text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border border-[#2A2A2A] group-hover:border-brand-red">
                      <span>{language === 'id' ? 'Lihat Detail & Lamar' : 'View Role & Apply'}</span>
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Apply as Freelance Vendor / Freelance Partner Network */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-[#2A2A2A] bg-[#0A0A0A] relative overflow-hidden" id="freelance-vendor">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header & Introduction */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-red/40 bg-brand-red/10 text-brand-red text-xs font-mono mb-3 font-semibold">
                <Globe className="w-3.5 h-3.5 text-brand-red" />
                <span>{language === 'id' ? 'Kemitraan Terbuka • 100% Remote (WFA)' : 'Open Network • 100% Remote (WFA)'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                {language === 'id' ? 'Apply as a Freelance Vendor' : 'Apply as a Freelance Vendor'}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#8E8E93] font-light leading-relaxed">
                {language === 'id'
                  ? 'Kapitech secara aktif berkolaborasi dengan para freelancer bertalenta, independent designer, dan developer profesional untuk menggarap proyek-proyek inovatif skala global & nasional. Pekerjaan bersifat 100% WFA (Work From Anywhere) dengan sistem kontrak berbasis proyek (Project-Based).'
                  : 'Kapitech actively collaborates with top-tier freelancers, independent designers, and specialized developers to execute high-stakes digital products for global scaleups. All engagements are 100% remote (WFA) under a project-based contract model.'
                }
              </p>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => {
                  setIsFreelanceModalOpen(true);
                  setIsVendorSubmitted(false);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-brand-red hover:bg-white text-white hover:text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow-xl shadow-brand-red/20 flex items-center justify-center gap-2.5"
              >
                <FolderGit2 size={16} />
                <span>{language === 'id' ? 'Daftar sebagai Freelance Vendor' : 'Apply as Freelance Vendor'}</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Key Work Policy Banner (Crucial Terms Callout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 p-5 sm:p-6 rounded-2xl bg-[#161616] border border-brand-red/30">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center text-brand-red shrink-0">
                <Globe size={18} />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red font-bold mb-1">
                  {language === 'id' ? '100% WFA (Remote)' : '100% WFA (Remote)'}
                </h4>
                <p className="text-xs text-[#8E8E93] font-light">
                  {language === 'id' ? 'Bekerja fleksibel dari mana saja tanpa batasan geografi.' : 'Work from anywhere globally with complete location flexibility.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-red/15 border border-brand-red/30 flex items-center justify-center text-brand-red shrink-0">
                <Briefcase size={18} />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red font-bold mb-1">
                  {language === 'id' ? 'Project-Based' : 'Project-Based'}
                </h4>
                <p className="text-xs text-[#8E8E93] font-light">
                  {language === 'id' ? 'Kontrak penugasan per milestone proyek dengan scope terdefinisi jelas.' : 'Engagement scoped per milestone with clear deliverables and fees.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Laptop size={18} />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
                  {language === 'id' ? 'BYOD (No Device)' : 'BYOD (No Device)'}
                </h4>
                <p className="text-xs text-[#8E8E93] font-light">
                  {language === 'id' ? 'Kami TIDAK menyediakan device/laptop. Gunakan perangkat & lisensi pribadi.' : 'We do NOT provide devices/hardware. BYOD with your own workstations.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
                  {language === 'id' ? 'NDA & Ketepatan Waktu' : 'NDA & Strict Deadlines'}
                </h4>
                <p className="text-xs text-[#8E8E93] font-light">
                  {language === 'id' ? 'Kerahasiaan data klien terjamin & disiplin deadline yang tinggi.' : 'Signed client NDA protection & rigorous milestone adherence.'}
                </p>
              </div>
            </div>
          </div>

          {/* 4 In-Depth Information Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Keterangan & Deskripsi */}
            <div className="p-6 sm:p-7 rounded-2xl border border-[#2A2A2A] bg-[#161616] flex flex-col justify-between hover:border-brand-red/30 transition-all">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-white mb-5">
                  <Layers size={20} className="text-brand-red" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-3">
                  {language === 'id' ? 'Deskripsi Kemitraan' : 'Partnership Model'}
                </h3>
                <p className="text-xs text-[#8E8E93] font-light leading-relaxed mb-4">
                  {language === 'id'
                    ? 'Kami menjembatani talenta spesialis dengan proyek riil dari klien korporat, startup VC, dan scaleup internasional tanpa birokrasi berbelit.'
                    : 'We connect specialized independent contractors with real projects from venture-backed startups and enterprises with zero unnecessary friction.'
                  }
                </p>
                <ul className="space-y-2 text-xs font-light text-white/80">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Brief proyek terstruktur & jelas' : 'Structured briefs & clear design tokens'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Kolaborasi langsung via Slack / WhatsApp' : 'Direct collaboration on Slack / WhatsApp'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Continuous pipeline proyek berkala' : 'Continuous pipeline of future projects'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. Aturan & Ketentuan */}
            <div className="p-6 sm:p-7 rounded-2xl border border-[#2A2A2A] bg-[#161616] flex flex-col justify-between hover:border-brand-red/30 transition-all">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-white mb-5">
                  <ShieldCheck size={20} className="text-brand-red" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-3">
                  {language === 'id' ? 'Aturan & Ketentuan' : 'Rules & Standards'}
                </h3>
                <p className="text-xs text-[#8E8E93] font-light leading-relaxed mb-4">
                  {language === 'id'
                    ? 'Integritas, kepatuhan pada milestone yang telah disetujui, dan standar kualitas adalah nilai utama kami.'
                    : 'Integrity, adherence to committed milestone deadlines, and pristine craft quality are non-negotiables.'
                  }
                </p>
                <ul className="space-y-2 text-xs font-light text-white/80">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Wajib menandatangani NDA proyek' : 'Mandatory Non-Disclosure Agreement (NDA)'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Komitmen 100% pada deadline (Zero Ghosting)' : '100% Deadline commitment (Zero ghosting)'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Mematuhi Standar Koding / Figma Kapitech' : 'Adhere to Kapitech Design / Code standard'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. Benefit & Keuntungan */}
            <div className="p-6 sm:p-7 rounded-2xl border border-[#2A2A2A] bg-[#161616] flex flex-col justify-between hover:border-brand-red/30 transition-all">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-white mb-5">
                  <DollarSign size={20} className="text-brand-red" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-3">
                  {language === 'id' ? 'Benefit & Keuntungan' : 'Vendor Benefits'}
                </h3>
                <p className="text-xs text-[#8E8E93] font-light leading-relaxed mb-4">
                  {language === 'id'
                    ? 'Dapatkan apresiasi finansial yang pantas atas keahlian Anda dengan kepastian pembayaran yang transparan.'
                    : 'Receive fair, premium milestone compensation with prompt payouts upon approved deliverables.'
                  }
                </p>
                <ul className="space-y-2 text-xs font-light text-white/80">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Project fee transparan & dibayar tepat waktu' : 'Transparent project fee & timely payouts'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Portofolio kelas dunia (Global Scaleups)' : 'World-class portfolio for global clients'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{language === 'id' ? 'Otonomi jam kerja & kebebasan lokasi' : 'Schedule autonomy & remote freedom'}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4. Apa yang Kami Butuhkan */}
            <div className="p-6 sm:p-7 rounded-2xl border border-[#2A2A2A] bg-[#161616] flex flex-col justify-between hover:border-brand-red/30 transition-all">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-white mb-5">
                  <Code2 size={20} className="text-brand-red" />
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-3">
                  {language === 'id' ? 'Keahlian yang Dicari' : 'Roles & Skills We Need'}
                </h3>
                <p className="text-xs text-[#8E8E93] font-light leading-relaxed mb-4">
                  {language === 'id'
                    ? 'Kami secara berkelanjutan menyaring mitra vendor pada domain berikut:'
                    : 'We continuously recruit high-caliber vendor partners across these domains:'
                  }
                </p>
                <ul className="space-y-2 text-xs font-light text-white/80">
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span><strong>UI/UX & Product Design</strong> (Figma, System)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span><strong>Frontend Dev</strong> (React, Next.js, Tailwind)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span><strong>Backend / Full-Stack</strong> (Node, Supabase)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={14} className="text-brand-red shrink-0 mt-0.5" />
                    <span><strong>Brand, Motion & 3D</strong> (After Effects, Spline)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Benefits & Perks */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-[#2A2A2A] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 block">
              {language === 'id' ? 'Nilai & Keuntungan Studio' : 'Studio Culture & Core Values'}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              {language === 'id' ? 'Lingkungan Kerja Berorientasi Prestasi' : 'Craft, Autonomy, and Real Growth'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <div 
                key={i}
                className="p-6 sm:p-8 rounded-2xl border border-[#2A2A2A] bg-[#161616] hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-6">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8E8E93] font-light leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail & Application Modal */}
      <AnimatePresence>
        {selectedPosition && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl bg-[#161616] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col"
            >
              {/* Sticky Modal Header with Role Title */}
              <div className="sticky top-0 z-20 p-5 sm:p-6 bg-[#161616]/95 backdrop-blur-md border-b border-[#2A2A2A] space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-red/15 border border-brand-red/40 text-brand-red text-[11px] font-mono font-semibold">
                        {selectedPosition.workplace}
                      </span>
                      <span className="text-[11px] font-mono text-[#8E8E93]">
                        {selectedPosition.department}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white tracking-tight leading-tight">
                      {selectedPosition.title}
                    </h2>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedPosition(null);
                      setIsSubmitted(false);
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/15 border border-[#2A2A2A] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors shrink-0"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-[#8E8E93]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-brand-red shrink-0" />
                    <span>{selectedPosition.location}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-red shrink-0" />
                    <span>{selectedPosition.type}</span>
                  </span>
                  {selectedPosition.compensation && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px]">
                      <Award size={13} className="shrink-0" />
                      <span><strong>{language === 'id' ? 'Kompensasi:' : 'Compensation:'}</strong> {selectedPosition.compensation}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
                {/* Responsibilities */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-3 font-semibold">
                    {language === 'id' ? 'Tanggung Jawab Utama' : 'Key Responsibilities'}
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedPosition.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 font-light">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-brand-red mb-3 font-semibold">
                    {language === 'id' ? 'Kualifikasi & Persyaratan' : 'Requirements & Skills'}
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedPosition.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 font-light">
                        <CheckCircle2 size={15} className="text-brand-red shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Application Form */}
                <div className="pt-6 border-t border-[#2A2A2A]">
                  <h4 className="text-lg font-display font-bold text-white mb-2">
                    {language === 'id' ? 'Kirimkan Lamaran Anda' : 'Submit Your Application'}
                  </h4>
                  <p className="text-xs text-[#8E8E93] font-light mb-6">
                    {language === 'id'
                      ? 'Lengkapi formulir di bawah ini atau kirimkan CV & portofolio Anda langsung ke recruitment@kapitech.id'
                      : 'Fill in the form below or send your resume and portfolio directly to recruitment@kapitech.id'
                    }
                  </p>

                  {isSubmitted ? (
                    <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                      <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                      <h5 className="text-lg font-display font-bold text-white">
                        {language === 'id' ? 'Lamaran Berhasil Dikirimkan!' : 'Application Successfully Submitted!'}
                      </h5>
                      <p className="text-xs text-white/80 max-w-md mx-auto font-light">
                        {language === 'id'
                          ? 'Terima kasih atas minat Anda bergabung di Kapitech Agency. Tim rekrutmen kami akan meninjau profil Anda dan menghubungi Anda dalam 2-3 hari kerja.'
                          : 'Thank you for your interest in joining Kapitech Agency. Our recruitment squad will review your application and reach out within 2-3 business days.'
                        }
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Anti-spam honeypot */}
                      <div className="hidden" aria-hidden="true">
                        <label htmlFor="applicant_title_hp">Do not fill</label>
                        <input 
                          type="text" 
                          id="applicant_title_hp" 
                          name="applicant_title_hp" 
                          value={honeypot} 
                          onChange={(e) => setHoneypot(e.target.value)} 
                          tabIndex={-1} 
                          autoComplete="off" 
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase">
                            {language === 'id' ? 'Nama Lengkap *' : 'Full Name *'}
                          </label>
                          <input 
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={language === 'id' ? 'e.g. Alex Pratama' : 'e.g. Alex Morgan'}
                            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase">
                            {language === 'id' ? 'Alamat Email *' : 'Email Address *'}
                          </label>
                          <input 
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="alex@example.com"
                            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase">
                            {language === 'id' ? 'Nomor WhatsApp / HP *' : 'Phone / WhatsApp *'}
                          </label>
                          <input 
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+62 812-3456-7890"
                            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase">
                            {language === 'id' ? 'Tautan Portofolio / LinkedIn *' : 'Portfolio / LinkedIn URL *'}
                          </label>
                          <input 
                            type="url"
                            name="portfolio"
                            required
                            value={formData.portfolio}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/... or https://behance.net/..."
                            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase">
                          {language === 'id' ? 'Pesan / Pengantar Singkat' : 'Cover Note / Introduction'}
                        </label>
                        <textarea 
                          name="coverLetter"
                          rows={3}
                          value={formData.coverLetter}
                          onChange={handleInputChange}
                          placeholder={language === 'id' ? 'Ceritakan secara singkat pengalaman dan motivasi Anda...' : 'Briefly describe your relevant background and motivations...'}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase">
                          {language === 'id' ? 'Unggah CV / Resume (PDF maks 5MB)' : 'Upload Resume / CV (PDF max 5MB)'}
                        </label>
                        <div className="relative border border-dashed border-[#2A2A2A] rounded-xl p-4 text-center hover:border-brand-red/50 transition-colors bg-[#0A0A0A]/50">
                          <input 
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Upload className="w-5 h-5 text-white/40 mx-auto mb-1.5" />
                          <span className="text-xs text-[#8E8E93] font-mono block">
                            {formData.resume ? formData.resume.name : (language === 'id' ? 'Klik atau seret file CV Anda ke sini' : 'Click or drag your CV file here')}
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-brand-red hover:bg-white text-white hover:text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2"
                      >
                        <span>{language === 'id' ? 'Kirimkan Lamaran Sekarang' : 'Submit Application Now'}</span>
                        <ArrowUpRight size={16} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Freelance Vendor Application Modal */}
      <AnimatePresence>
        {isFreelanceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl bg-[#161616] border border-brand-red/40 rounded-2xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col"
            >
              {/* Sticky Modal Header */}
              <div className="sticky top-0 z-20 p-5 sm:p-6 bg-[#161616]/95 backdrop-blur-md border-b border-[#2A2A2A] space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-red/15 border border-brand-red/40 text-brand-red text-[11px] font-mono font-semibold">
                        100% WFA • Project-Based
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono">
                        BYOD (No Device Provided)
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white tracking-tight leading-tight">
                      {language === 'id' ? 'Formulir Pendaftaran Freelance Vendor' : 'Freelance Vendor Application Form'}
                    </h2>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsFreelanceModalOpen(false);
                      setIsVendorSubmitted(false);
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/15 border border-[#2A2A2A] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors shrink-0"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-[#8E8E93] font-light">
                  {language === 'id'
                    ? 'Daftarkan profil Anda untuk bergabung dalam jaringan vendor spesialis Kapitech. Kami akan menghubungi Anda ketika terdapat proyek yang cocok dengan keahlian Anda.'
                    : 'Submit your profile to join Kapitech’s vetted vendor network. We will reach out when a project matching your expertise becomes available.'
                  }
                </p>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6 sm:p-8">
                {isVendorSubmitted ? (
                  <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 my-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
                      {language === 'id' ? 'Pendaftaran Vendor Berhasil Diterima!' : 'Vendor Application Received!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8E8E93] max-w-lg mx-auto font-light leading-relaxed">
                      {language === 'id'
                        ? 'Terima kasih atas minat Anda bermitra dengan Kapitech. Tim operasional dan tech/creative lead kami akan meninjau portofolio Anda dan menghubungi Anda via WhatsApp/Email saat proyek baru dimulai.'
                        : 'Thank you for registering. Our creative and engineering leads will review your portfolio and reach out via WhatsApp/Email when matching project scopes kick off.'
                      }
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          setIsFreelanceModalOpen(false);
                          setIsVendorSubmitted(false);
                        }}
                        className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                      >
                        {language === 'id' ? 'Tutup Formulir' : 'Close Form'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleVendorSubmit} className="space-y-5">
                    {/* Anti-spam honeypot */}
                    <div className="hidden" aria-hidden="true">
                      <label htmlFor="vendor_hp">Do not fill</label>
                      <input 
                        type="text" 
                        id="vendor_hp" 
                        name="vendor_hp" 
                        value={vendorHoneypot} 
                        onChange={(e) => setVendorHoneypot(e.target.value)} 
                        tabIndex={-1} 
                        autoComplete="off" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                          {language === 'id' ? 'Nama Lengkap / Studio *' : 'Full Name / Studio Name *'}
                        </label>
                        <input 
                          type="text"
                          name="name"
                          required
                          value={vendorFormData.name}
                          onChange={handleVendorInputChange}
                          placeholder={language === 'id' ? 'e.g. Budi Santoso / Studio Koding' : 'e.g. Alex Morgan / Pixel Studio'}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                          {language === 'id' ? 'Alamat Email *' : 'Email Address *'}
                        </label>
                        <input 
                          type="email"
                          name="email"
                          required
                          value={vendorFormData.email}
                          onChange={handleVendorInputChange}
                          placeholder="freelancer@example.com"
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                          {language === 'id' ? 'Nomor WhatsApp Aktif *' : 'WhatsApp Number (Active) *'}
                        </label>
                        <input 
                          type="tel"
                          name="phone"
                          required
                          value={vendorFormData.phone}
                          onChange={handleVendorInputChange}
                          placeholder="+62 812-3456-7890"
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                          {language === 'id' ? 'Spesialisasi Utama *' : 'Primary Specialty *'}
                        </label>
                        <select
                          name="specialty"
                          required
                          value={vendorFormData.specialty}
                          onChange={handleVendorInputChange}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                        >
                          <option value="UI/UX & Product Design">UI/UX & Product Design (Figma, Systems, Prototyping)</option>
                          <option value="Frontend Web Development">Frontend Web Dev (React, Next.js, Tailwind, Motion)</option>
                          <option value="Backend & Full-Stack Development">Backend / Full-Stack (Node.js, PostgreSQL, Supabase)</option>
                          <option value="Brand Identity & Graphic Design">Brand Identity & Graphic Design (Illustrator, Guidelines)</option>
                          <option value="Motion & 3D WebGL Animation">Motion & 3D (After Effects, Lottie, Blender, Spline)</option>
                          <option value="Pitch Deck & Presentation Specialist">Pitch Deck & Presentation Specialist (Keynote, Pitch Decks)</option>
                          <option value="Other Specialist Role">Other Specialist Tech / Creative Role</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                          {language === 'id' ? 'Tautan Portofolio / GitHub / Dribbble *' : 'Portfolio / GitHub / Dribbble URL *'}
                        </label>
                        <input 
                          type="url"
                          name="portfolio"
                          required
                          value={vendorFormData.portfolio}
                          onChange={handleVendorInputChange}
                          placeholder="https://behance.net/... or https://github.com/..."
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                          {language === 'id' ? 'Ekspektasi Rate Card (per Proyek / Jam)' : 'Rate Card Expectation (per Project / Hourly)'}
                        </label>
                        <input 
                          type="text"
                          name="rateCard"
                          value={vendorFormData.rateCard}
                          onChange={handleVendorInputChange}
                          placeholder={language === 'id' ? 'e.g. Rp 5.000.000 - Rp 15.000.000 / project' : 'e.g. $25 - $45 / hour or per project range'}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                          {language === 'id' ? 'Pengalaman Profesional' : 'Years of Experience'}
                        </label>
                        <select
                          name="experienceYears"
                          value={vendorFormData.experienceYears}
                          onChange={handleVendorInputChange}
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-red font-mono"
                        >
                          <option value="1-2 Years">1 - 2 Years</option>
                          <option value="3-5 Years">3 - 5 Years (Mid-Level)</option>
                          <option value="5-8 Years">5 - 8 Years (Senior)</option>
                          <option value="8+ Years">8+ Years (Lead / Principal)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                          {language === 'id' ? 'Alat Kerja / Stack Utama' : 'Core Tools & Tech Stack'}
                        </label>
                        <input 
                          type="text"
                          name="tools"
                          value={vendorFormData.tools}
                          onChange={handleVendorInputChange}
                          placeholder="e.g. Figma, React, Next.js, After Effects, Blender"
                          className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>
                    </div>

                    {/* MANDATORY CHECKBOXES (Crucial Requirements) */}
                    <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-3">
                      <span className="text-[11px] font-mono uppercase text-brand-red font-bold block mb-1">
                        {language === 'id' ? 'Konfirmasi Aturan & Ketentuan Kerja Sama *' : 'Mandatory Terms & Policy Acknowledgment *'}
                      </span>

                      <label className="flex items-start gap-3 cursor-pointer select-none text-xs text-white/80 font-light">
                        <input 
                          type="checkbox"
                          name="agreedWfa"
                          required
                          checked={vendorFormData.agreedWfa}
                          onChange={handleVendorInputChange}
                          className="mt-0.5 rounded border-[#2A2A2A] text-brand-red focus:ring-brand-red bg-[#161616] w-4 h-4 shrink-0"
                        />
                        <span>
                          <strong>100% WFA & Project-Based:</strong> {language === 'id' 
                            ? 'Saya memahami dan setuju bahwa pekerjaan ini bersifat berbasis proyek (project-based) dan dikerjakan secara jarak jauh (Work From Anywhere).'
                            : 'I acknowledge that this engagement is strictly project-based under a 100% remote (WFA) collaboration model.'}
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer select-none text-xs text-white/80 font-light">
                        <input 
                          type="checkbox"
                          name="agreedDevice"
                          required
                          checked={vendorFormData.agreedDevice}
                          onChange={handleVendorInputChange}
                          className="mt-0.5 rounded border-[#2A2A2A] text-brand-red focus:ring-brand-red bg-[#161616] w-4 h-4 shrink-0"
                        />
                        <span>
                          <strong>BYOD (No Device Provided):</strong> {language === 'id'
                            ? 'Saya memahami bahwa Kapitech TIDAK menyediakan perangkat kerja/laptop, dan saya menggunakan perangkat workstation & lisensi software mandiri.'
                            : 'I acknowledge that Kapitech does NOT provide hardware/devices, and I will use my own capable workstation & software licenses.'}
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer select-none text-xs text-white/80 font-light">
                        <input 
                          type="checkbox"
                          name="agreedNda"
                          required
                          checked={vendorFormData.agreedNda}
                          onChange={handleVendorInputChange}
                          className="mt-0.5 rounded border-[#2A2A2A] text-brand-red focus:ring-brand-red bg-[#161616] w-4 h-4 shrink-0"
                        />
                        <span>
                          <strong>NDA & Deadline Discipline:</strong> {language === 'id'
                            ? 'Saya bersedia menandatangani NDA kerahasiaan data klien serta berkomitmen 100% pada timeline milestone dan komunikasi yang responsif.'
                            : 'I agree to execute project NDAs and maintain strict adherence to milestone deadlines and prompt communication.'}
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                        {language === 'id' ? 'Catatan Tambahan / Deskripsi Keahlian' : 'Additional Notes / Key Highlights'}
                      </label>
                      <textarea 
                        name="notes"
                        rows={2}
                        value={vendorFormData.notes}
                        onChange={handleVendorInputChange}
                        placeholder={language === 'id' ? 'Ceritakan proyek terbaik yang pernah Anda kerjakan atau keahlian spesifik Anda...' : 'Highlight your proudest past projects or unique skill sets...'}
                        className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#8E8E93] mb-1.5 uppercase font-semibold">
                        {language === 'id' ? 'Unggah CV / Portofolio PDF (Opsional, maks 5MB)' : 'Upload CV / Portfolio PDF (Optional, max 5MB)'}
                      </label>
                      <div className="relative border border-dashed border-[#2A2A2A] rounded-xl p-4 text-center hover:border-brand-red/50 transition-colors bg-[#0A0A0A]/50">
                        <input 
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleVendorFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <Upload className="w-5 h-5 text-white/40 mx-auto mb-1.5" />
                        <span className="text-xs text-[#8E8E93] font-mono block">
                          {vendorFormData.resume ? vendorFormData.resume.name : (language === 'id' ? 'Klik atau seret file dokumen Anda ke sini' : 'Click or drag your document here')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-white text-white hover:text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow-xl shadow-brand-red/20 flex items-center justify-center gap-2"
                    >
                      <span>{language === 'id' ? 'Kirimkan Pendaftaran Freelance Vendor' : 'Submit Vendor Application'}</span>
                      <ArrowUpRight size={16} />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
