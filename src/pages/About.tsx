import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Globe, Cpu, Layout, Code2, Palette, Shield, Zap, Sparkles, Building2, MapPin, Users, Award, Terminal, Cloud, Layers, Check, Database, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export const About = () => {
  const { t, language } = useLanguage();

  const valuesEn = [
    {
      title: "Functional & Purposeful Design",
      icon: <Palette size={24} />,
      desc: "We prioritize usability, intuitive information hierarchy, and clean aesthetics. Every screen element is designed to serve a concrete user need rather than superficial decoration."
    },
    {
      title: "Modern & Scalable Engineering",
      icon: <Code2 size={24} />,
      desc: "Built on modern frameworks like React, Next.js, and TypeScript, our web and mobile architectures emphasize high speed, robust security, and maintainability."
    },
    {
      title: "Direct & Transparent Partnership",
      icon: <Globe size={24} />,
      desc: "We work directly with founders and product teams. No bureaucratic layers or hidden overhead—just clear communication and accountable milestones."
    }
  ];

  const valuesId = [
    {
      title: "Desain Fungsional & Bertujuan",
      icon: <Palette size={24} />,
      desc: "Kami memprioritaskan kemudahan penggunaan, hierarki informasi yang intuitif, dan estetika bersih. Setiap elemen antarmuka dirancang untuk menjawab kebutuhan nyata pengguna."
    },
    {
      title: "Rekayasa Modern & Skalabel",
      icon: <Code2 size={24} />,
      desc: "Dibangun di atas framework terdepan seperti React, Next.js, dan TypeScript, arsitektur web dan mobile kami menekankan kecepatan tinggi, keamanan teruji, dan kemudahan pemeliharaan."
    },
    {
      title: "Kemitraan Langsung & Transparan",
      icon: <Globe size={24} />,
      desc: "Kami berkolaborasi langsung dengan founder dan tim produk. Tanpa birokrasi berbelit atau biaya tersembunyi—hanya komunikasi terbuka dan pencapaian milestone yang bertanggung jawab."
    }
  ];

  const values = language === 'id' ? valuesId : valuesEn;

  const journeyEn = [
    { 
      year: "2021", 
      title: "Agency Inception", 
      desc: "Founded as a specialized digital studio by Fikri Nurlete and Reynaldo Frasiskus Anakotta, delivering custom web products and brand identities." 
    },
    { 
      year: "2022", 
      title: "Engineering Expansion", 
      desc: "Expanded into full-stack web application development, SaaS platform engineering, and custom mobile application interfaces." 
    },
    { 
      year: "2023", 
      title: "Diverse Client Ecosystem", 
      desc: "Delivered 40+ digital platforms for growing startups, real estate firms, and e-commerce companies across Southeast Asia and global markets." 
    },
    { 
      year: "2024", 
      title: "Official Corporate Entity", 
      desc: "Officially registered as PT Kapitech Digital Indonesia in South Tangerang, standardizing enterprise delivery and continuous client SLA support." 
    }
  ];

  const journeyId = [
    { 
      year: "2021", 
      title: "Awal Berdirinya Agensi", 
      desc: "Didirikan sebagai studio digital khusus oleh Fikri Nurlete dan Reynaldo Frasiskus Anakotta, menghadirkan produk web kustom dan identitas brand modern." 
    },
    { 
      year: "2022", 
      title: "Ekspansi Rekayasa Software", 
      desc: "Memperluas kapabilitas ke pengembangan aplikasi web full-stack, rekayasa platform SaaS, dan antarmuka aplikasi mobile kustom." 
    },
    { 
      year: "2023", 
      title: "Ekosistem Klien Beragam", 
      desc: "Menyelesaikan 40+ platform digital untuk startup berkembang, perusahaan properti, dan bisnis e-commerce di Asia Tenggara dan pasar global." 
    },
    { 
      year: "2024", 
      title: "Entitas Badan Hukum Resmi", 
      desc: "Resmi terdaftar sebagai PT Kapitech Digital Indonesia di Tangerang Selatan, menstandarisasi delivery kelas korporat dan garansi SLA berkesinambungan." 
    }
  ];

  const journey = language === 'id' ? journeyId : journeyEn;

  const techStackEn = [
    { 
      category: "Frontend Engineering", 
      subtitle: "Fast, accessible, and reactive interfaces",
      badge: "Modern Web",
      icon: <Code2 size={22} className="text-brand-red" />,
      tools: [
        { name: "React 18+", level: "Primary UI" },
        { name: "Next.js (App Router)", level: "SSR / SSG" },
        { name: "TypeScript", level: "Type-Safety" },
        { name: "Tailwind CSS", level: "Design Tokens" },
        { name: "Motion", level: "Micro-Interactions" },
        { name: "Vite", level: "Build Tooling" }
      ]
    },
    { 
      category: "Backend & Cloud Services", 
      subtitle: "Scalable APIs and robust databases",
      badge: "Full-Stack Core",
      icon: <Server size={22} className="text-brand-red" />,
      tools: [
        { name: "Node.js / Express", level: "API Runtime" },
        { name: "PostgreSQL", level: "Relational DB" },
        { name: "Firebase / Firestore", level: "Realtime & Auth" },
        { name: "RESTful & GraphQL", level: "Contract Design" },
        { name: "Prisma & Drizzle", level: "Type-Safe ORM" },
        { name: "Redis", level: "In-Memory Cache" }
      ]
    },
    { 
      category: "Design & Product Systems", 
      subtitle: "User-centric research & Figma systems",
      badge: "Creative Suite",
      icon: <Palette size={22} className="text-brand-red" />,
      tools: [
        { name: "Figma & FigJam", level: "Prototypes & UI" },
        { name: "Design Tokens", level: "Cross-Platform" },
        { name: "Adobe Illustrator", level: "Vector Systems" },
        { name: "Adobe Photoshop", level: "Asset Retouching" },
        { name: "Spline 3D", level: "3D Interaction" },
        { name: "Miro", level: "Flow Mapping" }
      ]
    },
    { 
      category: "DevOps & Infrastructure", 
      subtitle: "Automated CI/CD and secure deployments",
      badge: "Cloud Scalability",
      icon: <Cloud size={22} className="text-brand-red" />,
      tools: [
        { name: "Google Cloud Platform", level: "Managed Cloud" },
        { name: "Amazon Web Services", level: "S3 & Compute" },
        { name: "Vercel & Netlify", level: "Edge Hosting" },
        { name: "Docker", level: "Containerization" },
        { name: "GitHub Actions", level: "CI/CD Pipeline" },
        { name: "Cloudflare", level: "DNS & Security" }
      ]
    }
  ];

  const techStackId = [
    { 
      category: "Rekayasa Frontend", 
      subtitle: "Antarmuka cepat, aksesibel, dan reaktif",
      badge: "Web Modern",
      icon: <Code2 size={22} className="text-brand-red" />,
      tools: [
        { name: "React 18+", level: "UI Utama" },
        { name: "Next.js (App Router)", level: "SSR / SSG" },
        { name: "TypeScript", level: "Keamanan Tipe" },
        { name: "Tailwind CSS", level: "Token Desain" },
        { name: "Motion", level: "Mikro-Interaksi" },
        { name: "Vite", level: "Build Tool" }
      ]
    },
    { 
      category: "Backend & Layanan Cloud", 
      subtitle: "API skalabel dan database tangguh",
      badge: "Inti Full-Stack",
      icon: <Server size={22} className="text-brand-red" />,
      tools: [
        { name: "Node.js / Express", level: "Runtime API" },
        { name: "PostgreSQL", level: "Database Relasional" },
        { name: "Firebase / Firestore", level: "Realtime & Otentikasi" },
        { name: "RESTful & GraphQL", level: "Desain Kontrak API" },
        { name: "Prisma & Drizzle", level: "ORM Bertipe Aman" },
        { name: "Redis", level: "Cache Memori Cepat" }
      ]
    },
    { 
      category: "Sistem Desain & Produk", 
      subtitle: "Riset pengguna & sistem desain Figma",
      badge: "Suite Kreatif",
      icon: <Palette size={22} className="text-brand-red" />,
      tools: [
        { name: "Figma & FigJam", level: "Prototipe & UI" },
        { name: "Design Tokens", level: "Lintas Platform" },
        { name: "Adobe Illustrator", level: "Sistem Vektor" },
        { name: "Adobe Photoshop", level: "Retouching Visual" },
        { name: "Spline 3D", level: "Interaksi 3D" },
        { name: "Miro", level: "Pemetaan Alur" }
      ]
    },
    { 
      category: "DevOps & Infrastruktur Cloud", 
      subtitle: "CI/CD otomatis dan deployment aman",
      badge: "Skalabilitas Cloud",
      icon: <Cloud size={22} className="text-brand-red" />,
      tools: [
        { name: "Google Cloud Platform", level: "Cloud Terkelola" },
        { name: "Amazon Web Services", level: "S3 & Komputasi" },
        { name: "Vercel & Netlify", level: "Hosting Edge" },
        { name: "Docker", level: "Kontainerisasi" },
        { name: "GitHub Actions", level: "Pipeline CI/CD" },
        { name: "Cloudflare", level: "DNS & Keamanan" }
      ]
    }
  ];

  const techStack = language === 'id' ? techStackId : techStackEn;

  const teamEn = [
    {
      name: "Fikri Nurlete",
      role: "Founder & Chief Executive Officer",
      image: "/1.png",
      bio: "Leads agency vision, technical architecture, and client partnerships to deliver scalable digital products."
    },
    {
      name: "Reynaldo Frasiskus Anakotta",
      role: "Co-Founder & Project Manager",
      image: "/3.png",
      bio: "Directs agile project management, sprint delivery, and operational workflows ensuring on-time release."
    },
    {
      name: "Hendri Hassan",
      role: "Executive Creative Director",
      image: "/2.png",
      bio: "Directs visual design systems, brand identity, and intuitive user experience standards."
    },
    {
      name: "Ibrahim M.I",
      role: "Chief Marketing Officer",
      image: "/src/assets/images/ibrahim_cmo_1787755628692.jpg",
      bio: "Spearheads marketing strategy, client acquisition, brand storytelling, and strategic partnerships."
    },
    {
      name: "Akell Ahmed",
      role: "Associate Project Manager",
      image: "/4.png",
      bio: "Coordinates project communications, milestone checklists, and cross-functional team execution."
    }
  ];

  const teamId = [
    {
      name: "Fikri Nurlete",
      role: "Pendiri & Chief Executive Officer",
      image: "/1.png",
      bio: "Memimpin visi agensi, arsitektur teknis, dan kemitraan klien untuk produk digital berskala tinggi."
    },
    {
      name: "Reynaldo Frasiskus Anakotta",
      role: "Co-Founder & Project Manager",
      image: "/3.png",
      bio: "Mengawasi manajemen proyek agile, eksekusi sprint, dan ketepatan jadwal rilis produk."
    },
    {
      name: "Hendri Hassan",
      role: "Executive Creative Director",
      image: "/2.png",
      bio: "Memimpin arahan visual, sistem identitas brand, dan standar pengalaman pengguna modern."
    },
    {
      name: "Ibrahim M.I",
      role: "Chief Marketing Officer",
      image: "/src/assets/images/ibrahim_cmo_1787755628692.jpg",
      bio: "Memimpin strategi pemasaran, akuisisi klien, narasi brand, dan kemitraan strategis global."
    },
    {
      name: "Akell Ahmed",
      role: "Associate Project Manager",
      image: "/4.png",
      bio: "Mengoordinasikan komunikasi proyek, checklist milestone, dan kolaborasi eksekusi tim."
    }
  ];

  const team = language === 'id' ? teamId : teamEn;

  return (
    <div className="bg-black text-white min-h-screen selection:bg-brand-red selection:text-white relative" role="main">
      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 md:px-12 border-b border-white/10 overflow-hidden">
        <AtmosphericBackground imageUrl="/hero_background_3d.png" opacity={0.12} disableGrayscale={true} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 sm:mb-4 block">
              {t('about.tag')}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold leading-[1.1] sm:leading-[1.05] tracking-tight mb-4 sm:mb-6 text-white">
              {language === 'id' ? (
                <>Agensi digital yang dirancang untuk <span className="text-brand-red">kejelasan dan pertumbuhan</span>.</>
              ) : (
                <>A digital agency engineered for <span className="text-brand-red">clarity and growth</span>.</>
              )}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/70 font-light leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Company Story / Mission */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-white/10 bg-zinc-950 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-red block font-semibold">
              {language === 'id' ? 'Identitas & Fondasi Kami' : 'Our Identity & Foundations'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
              {language === 'id'
                ? 'Menjembatani desain strategis dengan rekayasa software yang andal.'
                : 'Bridging strategic design with dependable software engineering.'}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-white/70 font-light leading-relaxed">
              {language === 'id'
                ? 'Kapitech Agency beroperasi di bawah badan hukum resmi PT Kapitech Digital Indonesia, berkantor pusat di Tangerang Selatan dengan tim kolaboratif yang terdistribusi.'
                : 'Kapitech Agency operates under the formal legal entity of PT Kapitech Digital Indonesia, headquartered in South Tangerang with a collaborative, remote-friendly team.'}
            </p>
            <p className="text-xs sm:text-sm md:text-base text-white/70 font-light leading-relaxed">
              {language === 'id'
                ? 'Kami menolak template yang lambat dan jargon berlebihan. Kami berfokus pada hasil nyata: kode yang bersih, kecepatan muat tinggi, alur pengguna intuitif, dan arsitektur kokoh yang mendukung perkembangan bisnis Anda.'
                : 'We reject bloated, slow templates and overcomplicated jargon. Instead, we focus on what really moves the needle: clean code, fast loading speeds, intuitive user journeys, and robust architectures that support your business as it grows.'}
            </p>

            {/* Address callout in English */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black border border-white/10 flex items-start gap-3">
              <MapPin size={18} className="text-brand-red shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-mono text-white/50 uppercase block mb-1">
                  {language === 'id' ? 'Kantor Pusat Perusahaan' : 'Corporate Headquarters'}
                </span>
                <p className="text-white/90 leading-relaxed font-light">
                  Linea Residence, Block G No. 5, Melati Loka Street, Paku Jaya, North Serpong, South Tangerang City, Banten 15220, Indonesia
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-5 sm:pt-6 border-t border-white/10">
              <div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white block">50+</span>
                <span className="text-[10px] sm:text-xs font-mono text-white/50 uppercase">{t('about.stats.projects')}</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white block">3+</span>
                <span className="text-[10px] sm:text-xs font-mono text-white/50 uppercase">{t('about.stats.experience')}</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-brand-red block">100%</span>
                <span className="text-[10px] sm:text-xs font-mono text-white/50 uppercase">{t('about.stats.craft')}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative aspect-[4/3] bg-zinc-900">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
                alt="Kapitech Agency Team Collaboration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 sm:p-8">
                <div>
                  <span className="text-[10px] sm:text-xs font-mono text-brand-red uppercase tracking-wider block mb-1 font-semibold">
                    {language === 'id' ? 'Komitmen Kami' : 'Our Commitment'}
                  </span>
                  <p className="text-sm sm:text-base font-display font-semibold text-white">
                    {language === 'id' ? 'Kualitas, transparansi, dan eksekusi yang dapat diandalkan.' : 'Quality, transparency, and dependable delivery.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Core Team */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-white/10 relative z-10" id="team">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
              {t('about.leadership.tag')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-3 text-white">
              {t('about.leadership.title')}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
              {t('about.leadership.subtitle')}
            </p>
          </div>

          {/* Standardized Team Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-brand-red/40 transition-colors"
              >
                <div>
                  <div className="h-52 sm:h-56 overflow-hidden bg-zinc-900 relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base font-display font-bold text-white mb-0.5 sm:mb-1">
                      {member.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-mono text-brand-red uppercase tracking-wider mb-2.5 sm:mb-3 font-medium">
                      {member.role}
                    </p>
                    <p className="text-xs text-white/60 font-light leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Principles / Values */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-white/10 bg-zinc-950 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
              {language === 'id' ? 'Prinsip Kerja Kami' : 'Our Principles'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-3 text-white">
              {language === 'id' ? 'Bagaimana kami menangani setiap proyek.' : 'How we approach every project.'}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
              {language === 'id'
                ? 'Kami memegang standar ketat untuk kegunaan, kecepatan, dan dampak bisnis nyata.'
                : 'We hold our work to strict standards of usability, speed, and business impact.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {values.map((v, i) => (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 flex flex-col justify-between min-h-[200px] sm:min-h-[240px] hover:border-brand-red/40 transition-colors"
              >
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mb-5 sm:mb-6">
                    {v.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold mb-2.5 sm:mb-3 text-white">{v.title}</h3>
                  <p className="text-xs text-white/60 font-light leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Journey */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
              {language === 'id' ? 'Sejarah Agensi' : 'Agency History'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-3 text-white">
              {language === 'id' ? 'Perjalanan pertumbuhan kami yang berkelanjutan.' : 'Our journey of continuous growth.'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {journey.map((item) => (
              <div
                key={item.year}
                className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between min-h-[180px] sm:min-h-[220px] hover:border-brand-red/40 transition-colors"
              >
                <div>
                  <span className="text-xl sm:text-2xl font-display font-bold text-brand-red font-mono block mb-3 sm:mb-4">
                    {item.year}
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-xs text-white/60 font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redesigned Technology Stack Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-zinc-950 border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
              {t('about.tools.tag')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-3 text-white">
              {t('about.tools.title')}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
              {t('about.tools.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {techStack.map((stack) => (
              <div 
                key={stack.category} 
                className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-black border border-white/10 hover:border-brand-red/50 hover:bg-zinc-950 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {stack.icon}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
                      {stack.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-display font-bold text-white mb-1 group-hover:text-brand-red transition-colors">
                    {stack.category}
                  </h3>
                  <p className="text-xs text-white/50 font-light mb-5 sm:mb-6">
                    {stack.subtitle}
                  </p>

                  <div className="space-y-2 sm:space-y-2.5 pt-4 border-t border-white/10">
                    {stack.tools.map((tool) => (
                      <div 
                        key={tool.name} 
                        className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/20 transition-colors"
                      >
                        <span className="text-xs font-medium text-white/90">{tool.name}</span>
                        <span className="text-[9px] sm:text-[10px] font-mono text-white/40 uppercase">{tool.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mb-4 sm:mb-6 text-white">
            {language === 'id' ? 'Siap berkolaborasi membangun produk digital Anda berikutnya?' : 'Ready to collaborate on your next digital product?'}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-white/70 font-light leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto">
            {language === 'id'
              ? 'Hubungi tim Kapitech Agency di Tangerang Selatan untuk mendiskusikan kebutuhan proyek, estimasi waktu, dan rincian biaya.'
              : 'Get in touch with Kapitech Agency in South Tangerang to discuss your project requirements, timeline, and estimation.'}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-brand-red hover:bg-white text-white hover:text-black font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-brand-red/20 active:scale-95"
          >
            <span>{language === 'id' ? 'Mulai Diskusi' : 'Start a Conversation'}</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};
