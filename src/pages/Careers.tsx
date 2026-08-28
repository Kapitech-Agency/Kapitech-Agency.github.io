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
  Award
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

  const [selectedTalent, setSelectedTalent] = useState<any | null>(null);

  const twelveTalentsEn = [
    {
      id: "aditya-pratama",
      name: "Aditya Pratama",
      role: "Lead Frontend Engineer",
      specialty: "React, Next.js & Web Performance",
      department: "Innovation Development",
      experience: "6+ Years Exp",
      image: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600",
      bio: "Specializes in sub-second DOM hydration, micro-frontend architecture, and fluid motion physics."
    },
    {
      id: "nathania-kusuma",
      name: "Nathania Kusuma",
      role: "Senior UI/UX & Design Systems Lead",
      specialty: "Figma Systems & Design Tokens",
      department: "Visual Experience",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      bio: "Crafts mathematically scaled Figma design systems, accessible WCAG color models, and interactive micro-interactions."
    },
    {
      id: "bagas-wicaksono",
      name: "Bagas Wicaksono",
      role: "Senior Motion & 2D Animator",
      specialty: "Kinetic Typography & After Effects",
      department: "Visual Experience",
      experience: "4+ Years Exp",
      image: "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&q=80&w=600",
      bio: "Brings brand stories to life through high-frame-rate kinetic animation, 2D character explainers, and Lottie assets."
    },
    {
      id: "clarissa-angela",
      name: "Clarissa Angela",
      role: "Brand Identity & Editorial Designer",
      specialty: "Brand Guidelines & Visual Story",
      department: "Visual Experience",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600",
      bio: "Authors bespoke typography pairings, multi-brand identity kits, and investor presentation collateral."
    },
    {
      id: "dimas-rizky",
      name: "Dimas Rizky",
      role: "3D Visualizer & Spline Technologist",
      specialty: "Blender 3D & WebGL Environments",
      department: "Visual Experience",
      experience: "4+ Years Exp",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
      bio: "Builds photorealistic architectural renders, 3D product prototypes, and real-time Spline WebGL canvases."
    },
    {
      id: "evelyn-santoso",
      name: "Evelyn Santoso",
      role: "Senior Product & Mobile UI Designer",
      specialty: "iOS/Android Ergonomics & Prototypes",
      department: "Visual Experience",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=600",
      bio: "Engineers thumb-accessible mobile UX flows, haptic feedback loops, and multi-tenant mobile applications."
    },
    {
      id: "farhan-ramadhan",
      name: "Farhan Ramadhan",
      role: "Cloud Infrastructure & DevOps Specialist",
      specialty: "AWS, GCP & Automated CI/CD",
      department: "Innovation Development",
      experience: "6+ Years Exp",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600",
      bio: "Maintains 99.99% cloud uptime, automated blue-green deployment pipelines, and zero-trust security."
    },
    {
      id: "gabriella-tan",
      name: "Gabriella Tan",
      role: "2D Character Artist & Illustrator",
      specialty: "Vector Assets & Explainer Artworks",
      department: "Visual Experience",
      experience: "4+ Years Exp",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
      bio: "Draws distinctive editorial vectors, custom icon sets, and charismatic 2D character sets for brand campaigns."
    },
    {
      id: "haikal-firdaus",
      name: "Haikal Firdaus",
      role: "Senior Backend & Database Architect",
      specialty: "Node.js, PostgreSQL & Distributed Cache",
      department: "Innovation Development",
      experience: "7+ Years Exp",
      image: "https://images.unsplash.com/photo-1531891437562-4301cf092a93?auto=format&fit=crop&q=80&w=600",
      bio: "Architects scalable microservices, low-latency Redis caching layers, and high-volume relational schemas."
    },
    {
      id: "indah-permata",
      name: "Indah Permata",
      role: "Video Producer & Commercial Colorist",
      specialty: "TVC Editing, Cinematic LUTs & DaVinci",
      department: "Visual Experience",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1514315384763-ba401779410f?auto=format&fit=crop&q=80&w=600",
      bio: "Directs cinematic commercial shoots, color grades in DaVinci Resolve Studio, and produces TVC broadcast masters."
    },
    {
      id: "julian-mahendra",
      name: "Julian Mahendra",
      role: "Full-Stack SaaS & Web App Engineer",
      specialty: "TypeScript, GraphQL & Realtime Sockets",
      department: "Innovation Development",
      experience: "5+ Years Exp",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
      bio: "Develops real-time collaborative SaaS platforms, custom enterprise CRM tooling, and high-security REST APIs."
    },
    {
      id: "karina-wijaya",
      name: "Karina Wijaya",
      role: "Pitch Deck & Publication Strategist",
      specialty: "Investor Decks & High-Impact Reports",
      department: "Visual Experience",
      experience: "4+ Years Exp",
      image: "https://images.unsplash.com/photo-1527736947477-2790e28f3443?auto=format&fit=crop&q=80&w=600",
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
      image: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=600",
      bio: "Spesialis dalam hidrasi DOM sub-detik, arsitektur micro-frontend, dan fisika animasi berbasis kode modern."
    },
    {
      id: "nathania-kusuma",
      name: "Nathania Kusuma",
      role: "Senior UI/UX & Design Systems Lead",
      specialty: "Sistem Desain Figma & Token UI",
      department: "Visual Experience",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      bio: "Merancang sistem desain modular Figma, standar aksesibilitas WCAG, dan uji interaksi prototipe pengguna."
    },
    {
      id: "bagas-wicaksono",
      name: "Bagas Wicaksono",
      role: "Senior Motion & 2D Animator",
      specialty: "Tipografi Kinetik & After Effects",
      department: "Visual Experience",
      experience: "Pengalaman 4+ Tahun",
      image: "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&q=80&w=600",
      bio: "Menghidupkan cerita brand lewat animasi frame-rate tinggi, video explainer komersial, dan aset Lottie."
    },
    {
      id: "clarissa-angela",
      name: "Clarissa Angela",
      role: "Brand Identity & Editorial Designer",
      specialty: "Pedoman Brand & Identitas Visual",
      department: "Visual Experience",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600",
      bio: "Merancang identitas korporat, brandbook komprehensif, dan materi publikasi editorial tingkat tinggi."
    },
    {
      id: "dimas-rizky",
      name: "Dimas Rizky",
      role: "3D Visualizer & Spline Technologist",
      specialty: "Blender 3D & Lingkungan WebGL",
      department: "Visual Experience",
      experience: "Pengalaman 4+ Tahun",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
      bio: "Membangun render fotorealistis 3D produk, visualisasi arsitektur, dan aset WebGL real-time interaktif."
    },
    {
      id: "evelyn-santoso",
      name: "Evelyn Santoso",
      role: "Senior Product & Mobile UI Designer",
      specialty: "Ergonomi iOS/Android & Prototipe",
      department: "Visual Experience",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=600",
      bio: "Merancang pengalaman aplikasi mobile yang ramah ibu jari, alur onboarding mulus, dan responsivitas layar."
    },
    {
      id: "farhan-ramadhan",
      name: "Farhan Ramadhan",
      role: "Cloud Infrastructure & DevOps Engineer",
      specialty: "AWS, Docker & Otomasi Pipeline CI/CD",
      department: "Innovation Development",
      experience: "Pengalaman 6+ Tahun",
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600",
      bio: "Menjaga uptime server 99.99%, otomatisasi build pipeline multi-region, dan mitigasi keamanan cloud."
    },
    {
      id: "gabriella-tan",
      name: "Gabriella Tan",
      role: "2D Character Artist & Illustrator",
      specialty: "Aset Vektor & Artwork Video Explainer",
      department: "Visual Experience",
      experience: "Pengalaman 4+ Tahun",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
      bio: "Menggambar ilustrasi vektor orisinal, paket ikon kustom, dan karakter visual berkarakter kuat untuk kampanye."
    },
    {
      id: "haikal-firdaus",
      name: "Haikal Firdaus",
      role: "Senior Backend & Database Architect",
      specialty: "Node.js, PostgreSQL & Distributed Cache",
      department: "Innovation Development",
      experience: "Pengalaman 7+ Tahun",
      image: "https://images.unsplash.com/photo-1531891437562-4301cf092a93?auto=format&fit=crop&q=80&w=600",
      bio: "Membangun arsitektur microservices terukur, cache berkinerja tinggi, dan relasi database berkeamanan tinggi."
    },
    {
      id: "indah-permata",
      name: "Indah Permata",
      role: "Video Producer & Commercial Colorist",
      specialty: "Editing TVC, LUT Sinematik & DaVinci",
      department: "Visual Experience",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1514315384763-ba401779410f?auto=format&fit=crop&q=80&w=600",
      bio: "Memproduksi video komersial brand, grading warna sinematik di DaVinci Studio, dan supervisi audio master."
    },
    {
      id: "julian-mahendra",
      name: "Julian Mahendra",
      role: "Full-Stack SaaS & Web App Engineer",
      specialty: "TypeScript, GraphQL & Realtime Sockets",
      department: "Innovation Development",
      experience: "Pengalaman 5+ Tahun",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
      bio: "Mengembangkan aplikasi SaaS kolaboratif real-time, integrasi sistem CRM bisnis, dan API terenkripsi."
    },
    {
      id: "karina-wijaya",
      name: "Karina Wijaya",
      role: "Pitch Deck & Publication Strategist",
      specialty: "Investor Pitch Deck & Laporan Finansial",
      department: "Visual Experience",
      experience: "Pengalaman 4+ Tahun",
      image: "https://images.unsplash.com/photo-1527736947477-2790e28f3443?auto=format&fit=crop&q=80&w=600",
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
              {language === 'id' ? 'Karier & Peluang Kemitraan' : 'Careers & Opportunities'}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white mb-6">
              {language === 'id' ? 'Berkarya Bersama Kapitech.' : 'Build the Future With Us.'}
            </h1>
            <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed mb-6">
              {language === 'id'
                ? 'Kami membuka kesempatan bagi talenta luar biasa yang berorientasi pada hasil nyata, keunggulan visual, dan kemitraan bisnis strategis untuk tumbuh bersama studio kami.'
                : 'We are seeking exceptional individuals focused on tangible impact, visual craftsmanship, and strategic client growth to shape the future of digital products.'
              }
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/60">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>2 {language === 'id' ? 'Posisi Terbuka Saat Ini' : 'Open Positions Now Hiring'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                {language === 'id' ? 'Studio di Tangerang Selatan' : 'Studio in South Tangerang'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Join With Our 12 Great Talents */}
      <section className="py-16 sm:py-24 border-b border-white/10 bg-zinc-950/80 relative overflow-hidden">
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
            <p className="text-xs sm:text-sm text-white/60 font-light max-w-md">
              {language === 'id'
                ? 'Bekerja bahu-membahu bersama para insinyur software, desainer visual, animator 3D, dan spesialis kreatif kami.'
                : 'Collaborate shoulder-to-shoulder with our multidisciplinary squad of software engineers, visual designers, 3D animators, and creative strategists.'
              }
            </p>
          </div>
        </div>

        {/* Curated Static Photo Wall (Only Photos Displayed) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {twelveTalents.map((talent) => (
              <button
                key={`talent-${talent.id}`}
                onClick={() => setSelectedTalent(talent)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 transition-all duration-300 hover:scale-[1.03] hover:border-brand-red/60 hover:shadow-[0_0_30px_rgba(255,26,26,0.18)] cursor-pointer aspect-[3/4] p-0 block w-full"
                title={`${talent.name} - ${talent.role}`}
                aria-label={`View photo of ${talent.name}`}
              >
                {/* Clean Photo without overlays */}
                <img 
                  src={talent.image} 
                  alt={talent.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
              </button>
            ))}
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
                className="relative w-full max-w-lg bg-zinc-950 border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden my-6"
              >
                <button
                  onClick={() => setSelectedTalent(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
                  aria-label="Close talent profile"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-3.5 sm:gap-4 mb-5 sm:mb-6 pr-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/15 bg-zinc-900 shrink-0 relative">
                    <img 
                      src={selectedTalent.image} 
                      alt={selectedTalent.name}
                      className="w-full h-full object-cover object-center brightness-85 contrast-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] sm:text-xs font-mono text-brand-red font-semibold block mb-0.5 truncate">
                      {selectedTalent.department} • {selectedTalent.experience}
                    </span>
                    <h3 className="text-lg sm:text-xl font-display font-bold text-white truncate">
                      {selectedTalent.name}
                    </h3>
                    <p className="text-xs text-white/60 truncate">
                      {selectedTalent.role}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 sm:space-y-4 text-xs font-light text-white/80 border-t border-white/10 pt-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-white/40 block mb-1">
                      {language === 'id' ? 'Fokus Keahlian' : 'Core Specialty'}
                    </span>
                    <p className="font-mono text-brand-red font-medium text-xs sm:text-sm">
                      {selectedTalent.specialty}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-white/40 block mb-1">
                      {language === 'id' ? 'Tentang Praktik Kerja' : 'About Craft & Practice'}
                    </span>
                    <p className="leading-relaxed">
                      {selectedTalent.bio}
                    </p>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 pt-4 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setSelectedTalent(null)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-brand-red hover:bg-white hover:text-black text-white text-xs font-mono font-medium rounded-full transition-colors"
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-white/10" id="open-positions">
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
            <p className="text-xs sm:text-sm text-white/60 font-light max-w-md">
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
                className="cursor-pointer group p-6 sm:p-8 lg:p-10 rounded-2xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-brand-red/50 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-mono font-medium">
                        {pos.workplace}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-mono">
                        {pos.department}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                        {pos.badge}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white group-hover:text-brand-red transition-colors">
                      {pos.title}
                    </h3>

                    <p className="text-sm text-white/70 font-light leading-relaxed">
                      {pos.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/50 pt-1">
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
                    <span className="px-5 py-2.5 rounded-full bg-white/5 group-hover:bg-brand-red text-white text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border border-white/10 group-hover:border-brand-red">
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

      {/* SECTION: Benefits & Perks */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-white/10 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 block">
              {language === 'id' ? 'Nilai & Keuntungan' : 'Why Work With Us'}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              {language === 'id' ? 'Lingkungan Kerja Berorientasi Prestasi' : 'Craft, Autonomy, and Real Growth'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <div 
                key={i}
                className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-zinc-900/40 hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-6">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
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
              className="relative w-full max-w-3xl bg-zinc-950 border border-white/15 rounded-2xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col"
            >
              {/* Sticky Modal Header with Role Title */}
              <div className="sticky top-0 z-20 p-5 sm:p-6 bg-zinc-950/95 backdrop-blur-md border-b border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-red/15 border border-brand-red/40 text-brand-red text-[11px] font-mono font-semibold">
                        {selectedPosition.workplace}
                      </span>
                      <span className="text-[11px] font-mono text-white/60">
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
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors shrink-0"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-white/60">
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
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-lg font-display font-bold text-white mb-2">
                    {language === 'id' ? 'Kirimkan Lamaran Anda' : 'Submit Your Application'}
                  </h4>
                  <p className="text-xs text-white/60 font-light mb-6">
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
                          <label className="block text-[11px] font-mono text-white/60 mb-1.5 uppercase">
                            {language === 'id' ? 'Nama Lengkap *' : 'Full Name *'}
                          </label>
                          <input 
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={language === 'id' ? 'e.g. Alex Pratama' : 'e.g. Alex Morgan'}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-white/60 mb-1.5 uppercase">
                            {language === 'id' ? 'Alamat Email *' : 'Email Address *'}
                          </label>
                          <input 
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="alex@example.com"
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-mono text-white/60 mb-1.5 uppercase">
                            {language === 'id' ? 'Nomor WhatsApp / HP *' : 'Phone / WhatsApp *'}
                          </label>
                          <input 
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+62 812-3456-7890"
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-white/60 mb-1.5 uppercase">
                            {language === 'id' ? 'Tautan Portofolio / LinkedIn *' : 'Portfolio / LinkedIn URL *'}
                          </label>
                          <input 
                            type="url"
                            name="portfolio"
                            required
                            value={formData.portfolio}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/... or https://behance.net/..."
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-white/60 mb-1.5 uppercase">
                          {language === 'id' ? 'Pesan / Pengantar Singkat' : 'Cover Note / Introduction'}
                        </label>
                        <textarea 
                          name="coverLetter"
                          rows={3}
                          value={formData.coverLetter}
                          onChange={handleInputChange}
                          placeholder={language === 'id' ? 'Ceritakan secara singkat pengalaman dan motivasi Anda...' : 'Briefly describe your relevant background and motivations...'}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-white/60 mb-1.5 uppercase">
                          {language === 'id' ? 'Unggah CV / Resume (PDF maks 5MB)' : 'Upload Resume / CV (PDF max 5MB)'}
                        </label>
                        <div className="relative border border-dashed border-white/20 rounded-xl p-4 text-center hover:border-brand-red/50 transition-colors bg-zinc-900/50">
                          <input 
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Upload className="w-5 h-5 text-white/40 mx-auto mb-1.5" />
                          <span className="text-xs text-white/70 font-mono block">
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
    </div>
  );
};
