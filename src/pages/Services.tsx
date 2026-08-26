import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Code2, Palette, CheckCircle2, ArrowUpRight, X, Layers, ShieldCheck, Sparkles, Smartphone, Terminal, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export interface ServiceDetail {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  summary: string;
  fullDescription: string;
  deliverables: string[];
  tools: string[];
  idealFor: string;
  timeline: string;
}

export const Services = () => {
  const { language } = useLanguage();
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  const serviceListEn: ServiceDetail[] = [
    {
      id: 'web-development',
      title: "Web & Software Development",
      category: "Engineering",
      icon: <Code2 size={28} />,
      summary: "Modern, high-performance web applications and digital platforms engineered for scale, reliability, and speed.",
      fullDescription: "We build custom software solutions and web applications using modern, battle-tested frameworks like Next.js, React, Node.js, and TypeScript. From customer-facing portals to complex SaaS backends, our code is modular, well-documented, and production-ready.",
      deliverables: [
        "Custom Full-Stack Web Applications",
        "Responsive Corporate & Marketing Websites",
        "E-Commerce & Checkout Systems",
        "RESTful API & Database Architecture",
        "Content Management Systems (CMS) Integration",
        "Performance Optimization & SEO Readiness"
      ],
      tools: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL", "Firebase", "Google Cloud", "Vercel"],
      idealFor: "Startups building MVPs, businesses migrating legacy tools, and companies needing scalable web platforms.",
      timeline: "4 - 12 weeks depending on scope"
    },
    {
      id: 'ui-ux-design',
      title: "UI/UX & Product Design",
      category: "Product Design",
      icon: <Layout size={28} />,
      summary: "User-centric interface design and intuitive user experience journeys that boost engagement and conversions.",
      fullDescription: "Great design balances aesthetic beauty with functional clarity. We conduct user flow mapping, wireframing, high-fidelity UI design, and interactive prototyping to ensure your users navigate with confidence and ease.",
      deliverables: [
        "User Interface (UI) Design for Web & Mobile",
        "User Experience (UX) Journey & Wireframing",
        "Complete Design Systems in Figma",
        "Clickable High-Fidelity Prototypes",
        "Usability Testing & Design Audits",
        "Developer-Ready Asset Specifications"
      ],
      tools: ["Figma", "FigJam", "Adobe Creative Suite", "Miro", "Spline 3D"],
      idealFor: "Teams launching new digital products or redesigning existing applications to improve usability and retention.",
      timeline: "3 - 8 weeks"
    },
    {
      id: 'branding-identity',
      title: "Branding & Visual Identity",
      category: "Creative Strategy",
      icon: <Palette size={28} />,
      summary: "Comprehensive brand identity systems, logos, typography, and visual guidelines that build trust and market presence.",
      fullDescription: "Your brand is your business's visual handshake. We develop cohesive visual identities that communicate your unique value proposition, maintain visual consistency across all digital touchpoints, and leave a lasting impression.",
      deliverables: [
        "Logo Design & Brandmark Systems",
        "Typography & Color Palette Guidelines",
        "Comprehensive Brand Identity Guidelines (Brandbook)",
        "Investor Pitch Deck & Presentation Design",
        "Marketing & Social Media Design Templates",
        "Print & Digital Collateral"
      ],
      tools: ["Adobe Illustrator", "Photoshop", "InDesign", "Figma"],
      idealFor: "New ventures establishing their market presence or established brands undergoing a modern strategic rebrand.",
      timeline: "3 - 6 weeks"
    },
    {
      id: 'mobile-app-development',
      title: "Mobile App Development",
      category: "Mobile Engineering",
      icon: <Smartphone size={28} />,
      summary: "Native and cross-platform iOS and Android mobile applications crafted for seamless mobile experiences.",
      fullDescription: "We engineer smooth, responsive mobile applications using React Native and modern mobile architectures. We take care of state management, offline capabilities, secure authentication, and seamless app store submission.",
      deliverables: [
        "Cross-Platform iOS & Android Applications",
        "Mobile App UI Implementation",
        "Push Notifications & Offline State Sync",
        "Native Device Feature Integration (Camera, GPS, Biometrics)",
        "App Store & Google Play Deployment Assistance"
      ],
      tools: ["React Native", "Expo", "TypeScript", "Node.js", "Firebase", "App Store Connect"],
      idealFor: "Businesses requiring direct mobile touchpoints for their customers or internal operations.",
      timeline: "6 - 14 weeks"
    }
  ];

  const serviceListId: ServiceDetail[] = [
    {
      id: 'web-development',
      title: "Pengembangan Web & Software",
      category: "Rekayasa Perangkat Lunak",
      icon: <Code2 size={28} />,
      summary: "Aplikasi web modern dan platform digital berkinerja tinggi yang dirancang untuk skalabilitas, keandalan, dan kecepatan maksimal.",
      fullDescription: "Kami membangun solusi software kustom dan aplikasi web menggunakan framework teruji seperti Next.js, React, Node.js, dan TypeScript. Mulai dari portal pelanggan hingga backend SaaS yang kompleks, kode kami modular, terdokumentasi rapi, dan siap produksi.",
      deliverables: [
        "Aplikasi Web Full-Stack Kustom",
        "Website Korporat & Pemasaran Responsif",
        "Sistem E-Commerce & Checkout Cepat",
        "Arsitektur RESTful API & Database",
        "Integrasi Content Management System (CMS)",
        "Optimasi Kecepatan & Kesiapan SEO"
      ],
      tools: ["Next.js", "React", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL", "Firebase", "Google Cloud", "Vercel"],
      idealFor: "Startup yang membangun MVP, perusahaan yang memodernisasi sistem lama, dan bisnis yang membutuhkan platform web tangguh.",
      timeline: "4 - 12 minggu tergantung ruang lingkup"
    },
    {
      id: 'ui-ux-design',
      title: "Desain UI/UX & Produk Digital",
      category: "Desain Produk",
      icon: <Layout size={28} />,
      summary: "Desain antarmuka berpusat pada pengguna dan alur pengalaman intuitif yang meningkatkan retensi dan konversi bisnis.",
      fullDescription: "Desain yang hebat memadukan keindahan visual dengan kejelasan fungsional. Kami melakukan pemetaan alur pengguna, wireframing, desain UI presisi tinggi, dan pembuatan prototipe interaktif agar pengguna dapat berinteraksi dengan mudah dan nyaman.",
      deliverables: [
        "Desain Antarmuka Pengguna (UI) Web & Mobile",
        "Riset Pengalaman Pengguna (UX) & Wireframing",
        "Sistem Desain Lengkap di Figma",
        "Prototipe Interaktif Siap Uji Coba",
        "Audit Desain & Pengujian Usabilitas",
        "Spesifikasi Aset Siap Diserahkan ke Developer"
      ],
      tools: ["Figma", "FigJam", "Adobe Creative Suite", "Miro", "Spline 3D"],
      idealFor: "Tim yang meluncurkan produk digital baru atau mendesain ulang aplikasi yang ada untuk meningkatkan retensi pengguna.",
      timeline: "3 - 8 minggu"
    },
    {
      id: 'branding-identity',
      title: "Identitas Brand & Visual",
      category: "Strategi Kreatif",
      icon: <Palette size={28} />,
      summary: "Sistem identitas brand menyeluruh, logo, tipografi, dan pedoman visual yang membangun reputasi pasar dan kepercayaan pelanggan.",
      fullDescription: "Brand Anda adalah jabat tangan pertama dengan calon klien. Kami merancang identitas visual yang menyampaikan keunggulan unik bisnis Anda, menjaga konsistensi di seluruh media digital, dan meninggalkan kesan mendalam.",
      deliverables: [
        "Desain Logo & Sistem Brandmark",
        "Pedoman Tipografi & Palet Warna",
        "Buku Pedoman Identitas Brand (Brandbook)",
        "Desain Presentasi & Pitch Deck Investor",
        "Template Desain Media Sosial & Pemasaran",
        "Aset Cetak & Pemasaran Digital"
      ],
      tools: ["Adobe Illustrator", "Photoshop", "InDesign", "Figma"],
      idealFor: "Bisnis baru yang membangun reputasi atau perusahaan mapan yang melakukan rebrand strategis modern.",
      timeline: "3 - 6 minggu"
    },
    {
      id: 'mobile-app-development',
      title: "Pengembangan Aplikasi Mobile",
      category: "Rekayasa Mobile",
      icon: <Smartphone size={28} />,
      summary: "Aplikasi mobile iOS dan Android native serta cross-platform yang dirancang untuk pengalaman mobile tanpa hambatan.",
      fullDescription: "Kami membangun aplikasi mobile responsif menggunakan React Native dan arsitektur mobile modern. Kami mengelola manajemen state, fitur offline, otentikasi aman, hingga proses rilis ke App Store dan Google Play Store.",
      deliverables: [
        "Aplikasi Lintas Platform iOS & Android",
        "Implementasi UI Mobile Interaktif",
        "Notifikasi Push & Sinkronisasi Offline",
        "Integrasi Fitur Perangkat (Kamera, GPS, Biometrik)",
        "Bantuan Deployment ke App Store & Google Play"
      ],
      tools: ["React Native", "Expo", "TypeScript", "Node.js", "Firebase", "App Store Connect"],
      idealFor: "Bisnis yang membutuhkan kanal mobile langsung untuk pelanggan atau operasional tim internal.",
      timeline: "6 - 14 minggu"
    }
  ];

  const serviceList = language === 'id' ? serviceListId : serviceListEn;

  const processStepsEn = [
    {
      step: "01",
      title: "Discovery & Strategy",
      desc: "We align on your business goals, target audience, technical requirements, and project scope to create a realistic roadmap."
    },
    {
      step: "02",
      title: "Design & Prototyping",
      desc: "We explore visual directions, craft wireframes, build high-fidelity interactive prototypes, and gather your feedback before writing code."
    },
    {
      step: "03",
      title: "Engineering & QA",
      desc: "Our developers write clean, typed, modular code with regular milestone demos, continuous integration, and thorough cross-device testing."
    },
    {
      step: "04",
      title: "Launch & Support",
      desc: "We handle seamless deployment to production, perform final speed audits, provide documentation, and offer ongoing maintenance."
    }
  ];

  const processStepsId = [
    {
      step: "01",
      title: "Penemuan & Strategi",
      desc: "Kami menyelaraskan tujuan bisnis, target audiens, kebutuhan teknis, dan ruang lingkup proyek untuk menyusun peta jalan yang realistis."
    },
    {
      step: "02",
      title: "Desain & Prototipe",
      desc: "Kami merancang wireframe, membuat prototipe interaktif di Figma, dan mengumpulkan masukan Anda sebelum melangkah ke penulisan kode."
    },
    {
      step: "03",
      title: "Rekayasa & Pengujian",
      desc: "Developer kami menulis kode yang bersih, bertipe, dan modular dengan demo kemajuan berkala serta pengujian ketat di berbagai perangkat."
    },
    {
      step: "04",
      title: "Peluncuran & Pemeliharaan",
      desc: "Kami menangani deployment ke server produksi, audit kecepatan, dokumentasi teknis, dan dukungan pemeliharaan pasca-peluncuran."
    }
  ];

  const processSteps = language === 'id' ? processStepsId : processStepsEn;

  const engagementModelsEn = [
    {
      title: "Fixed Scope Project",
      tagline: "Clear deliverables with fixed milestones.",
      desc: "Ideal for well-defined projects like websites, MVPs, or branding packages with specific requirements and established deadlines.",
      features: ["Fixed cost & timeline", "Milestone-based delivery", "Dedicated project manager", "Post-launch warranty"]
    },
    {
      title: "Monthly Dedicated Retainer",
      tagline: "Continuous agile design & engineering.",
      desc: "Best for growing companies that need an ongoing design and development squad for continuous iteration and product features.",
      features: ["Flexible weekly sprints", "Direct Slack/meeting access", "Priority turnaround", "Scalable resource allocation"]
    },
    {
      title: "MVP Fast-Track",
      tagline: "4 to 6 weeks from idea to launch.",
      desc: "Specifically tailored for early-stage founders and startups looking to test market validation with a polished working product.",
      features: ["Core feature scoping", "Rapid UI/UX prototype", "Robust tech foundation", "Launch-day support"]
    }
  ];

  const engagementModelsId = [
    {
      title: "Proyek Ruang Lingkup Tetap",
      tagline: "Deliverable jelas dengan milestone terukur.",
      desc: "Ideal untuk proyek dengan kebutuhan spesifik seperti website korporat, MVP aplikasi, atau paket branding dengan tenggat waktu pasti.",
      features: ["Biaya & timeline tetap", "Pembayaran berbasis milestone", "Project manager berdedikasi", "Garansi pasca-peluncuran 30 hari"]
    },
    {
      title: "Retainer Bulanan Berdedikasi",
      tagline: "Desain & rekayasa berkesinambungan.",
      desc: "Pilihan tepat bagi bisnis berkembang yang membutuhkan tim desain dan engineer untuk iterasi fitur produk secara berkala.",
      features: ["Sprint mingguan fleksibel", "Akses komunikasi langsung via Slack/Meet", "Prioritas pengerjaan", "Alokasi resource terukur"]
    },
    {
      title: "Akselerasi Cepat MVP",
      tagline: "4 hingga 6 minggu dari ide hingga rilis.",
      desc: "Dikhususkan bagi founder tahap awal yang ingin memvalidasi pasar dengan cepat menggunakan produk kerja yang matang.",
      features: ["Perumusan fitur inti", "Prototipe UI/UX cepat", "Fondasi teknologi tangguh", "Dukungan penuh saat peluncuran"]
    }
  ];

  const engagementModels = language === 'id' ? engagementModelsId : engagementModelsEn;

  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-brand-red selection:text-white relative">
      {/* Page Header */}
      <section className="relative pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 md:px-12 border-b border-white/10 overflow-hidden">
        <AtmosphericBackground imageUrl="/hero_background_3d.png" opacity={0.12} disableGrayscale={true} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 sm:mb-4 block">
              {language === 'id' ? 'Layanan & Kemampuan' : 'Services & Capabilities'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold leading-[1.1] sm:leading-[1.05] tracking-tight mb-4 sm:mb-6 text-white">
              {language === 'id' ? (
                <>Desain strategis dan rekayasa untuk <span className="text-brand-red">brand visioner</span>.</>
              ) : (
                <>Strategic design and development for <span className="text-brand-red">ambitious brands</span>.</>
              )}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/70 font-light leading-relaxed">
              {language === 'id'
                ? 'Kami menyediakan solusi digital terpadu yang membantu bisnis memperkuat kredibilitas, menyederhanakan alur kerja kompleks, dan membangun produk digital yang siap diskalakan.'
                : 'We provide end-to-end digital solutions that help companies establish authority, streamline complex workflows, and build scalable digital products.'}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-12 border-b border-white/10 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-brand-red block mb-2 font-semibold">
                {language === 'id' ? 'Keahlian Kami' : 'What We Deliver'}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                {language === 'id' ? 'Layanan Utama Kami' : 'Our Core Services'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/60 font-light max-w-md">
              {language === 'id'
                ? 'Setiap proyek dipimpin oleh praktisi berpengalaman dengan keahlian teknis mendalam di bidang desain, frontend, dan arsitektur backend.'
                : 'Every project is led by experienced practitioners with deep technical expertise in design, frontend, and backend architecture.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            {serviceList.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedService(srv)}
                className="p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-white/10 hover:border-brand-red/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red group-hover:scale-105 transition-transform">
                      {srv.icon}
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
                      {srv.category}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white group-hover:text-brand-red transition-colors mb-2.5 sm:mb-3">
                    {srv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-5 sm:mb-6">
                    {srv.summary}
                  </p>

                  <div className="space-y-2 mb-6 sm:mb-8">
                    {srv.deliverables.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-white/80 font-light">
                        <CheckCircle2 size={14} className="text-brand-red shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                    {srv.deliverables.length > 3 && (
                      <p className="text-[11px] font-mono text-white/40 pt-1">
                        +{srv.deliverables.length - 3} {language === 'id' ? 'deliverables lainnya' : 'more deliverables'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-5 sm:pt-6 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-white/70 group-hover:text-white transition-colors">
                  <span>{language === 'id' ? 'Lihat Detail & Teknologi' : 'View Details & Tech Stack'}</span>
                  <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-brand-red" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our 4-Step Process */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-zinc-950 border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
              {language === 'id' ? 'Alur & Metodologi Kerja' : 'Workflow & Methodology'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-3 text-white">
              {language === 'id' ? 'Bagaimana kami mewujudkan produk Anda dari ide hingga rilis.' : 'How we take your product from concept to launch.'}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
              {language === 'id'
                ? 'Kami mengikuti proses terstruktur dan transparan dengan milestone jelas untuk menjamin ketepatan waktu serta hasil berkualitas tinggi.'
                : 'We follow a structured, transparent process with clear milestones to ensure predictability and timely delivery.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 flex flex-col justify-between hover:border-brand-red/40 transition-colors"
              >
                <div>
                  <span className="text-2xl sm:text-3xl font-display font-bold text-brand-red block mb-4 sm:mb-6 font-mono">
                    {step.step}
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-bold text-white mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-xs text-white/60 font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Models */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 border-b border-white/10 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
              {language === 'id' ? 'Model Kerjasama Fleksibel' : 'Flexible Collaboration'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-3 text-white">
              {language === 'id' ? 'Pilih skema yang sesuai dengan kebutuhan Anda.' : 'Choose the model that fits your needs.'}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
              {language === 'id'
                ? 'Baik Anda membutuhkan MVP cepat atau mitra engineer jangka panjang, kami menyediakan opsi kolaborasi yang transparan.'
                : 'Whether you need a quick MVP or a long-term engineering partner, we offer straightforward collaboration options.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {engagementModels.map((model, i) => (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between hover:border-brand-red/40 transition-colors"
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-bold mb-1.5 sm:mb-2 text-white">{model.title}</h3>
                  <p className="text-xs font-mono text-brand-red mb-3 sm:mb-4">{model.tagline}</p>
                  <p className="text-xs text-white/60 font-light leading-relaxed mb-5 sm:mb-6">
                    {model.desc}
                  </p>
                  <div className="space-y-2 pt-4 border-t border-white/10 mb-6 sm:mb-8">
                    {model.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-white/80">
                        <CheckCircle2 size={13} className="text-brand-red shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="w-full py-3 sm:py-3.5 rounded-full bg-white/5 hover:bg-brand-red text-white text-xs font-semibold uppercase tracking-wider text-center border border-white/10 hover:border-brand-red transition-colors active:scale-95 block"
                >
                  {language === 'id' ? 'Pilih Skema Ini' : 'Inquire This Model'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE DETAILS MODAL */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl my-auto max-h-[90vh] bg-zinc-950 border border-white/20 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="text-brand-red shrink-0">
                    {selectedService.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-mono text-brand-red uppercase tracking-wider block truncate font-medium">
                      {selectedService.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-display font-bold text-white truncate">
                      {selectedService.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full aspect-square bg-white/10 hover:bg-white hover:text-black transition-colors flex items-center justify-center shrink-0 active:scale-95 ml-auto"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
                    {language === 'id' ? 'Gambaran Umum' : 'Overview'}
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-white/80 font-light leading-relaxed">
                    {selectedService.fullDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div className="p-4 sm:p-5 rounded-2xl bg-black border border-white/10">
                    <span className="text-[10px] sm:text-[11px] font-mono text-brand-red uppercase block mb-1">
                      {language === 'id' ? 'Sangat Cocok Untuk' : 'Ideal For'}
                    </span>
                    <p className="text-xs text-white/70 font-light leading-relaxed">{selectedService.idealFor}</p>
                  </div>
                  <div className="p-4 sm:p-5 rounded-2xl bg-black border border-white/10">
                    <span className="text-[10px] sm:text-[11px] font-mono text-brand-red uppercase block mb-1">
                      {language === 'id' ? 'Estimasi Durasi Pengerjaan' : 'Estimated Timeline'}
                    </span>
                    <p className="text-xs text-white/70 font-light leading-relaxed">{selectedService.timeline}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
                    {language === 'id' ? 'Seluruh Deliverables Termasuk' : 'All Deliverables Included'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {selectedService.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-white/80 p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                        <CheckCircle2 size={14} className="text-brand-red shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
                    {language === 'id' ? 'Teknologi & Alat Utama' : 'Core Technologies & Tools'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.tools.map((tool) => (
                      <span key={tool} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-white/80">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 sm:pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-white/60 text-center sm:text-left">
                    {language === 'id' ? 'Siap mendiskusikan kebutuhan proyek Anda?' : 'Ready to discuss your project scope?'}
                  </p>
                  <Link
                    to="/contact"
                    onClick={() => setSelectedService(null)}
                    className="w-full sm:w-auto h-11 px-6 bg-brand-red hover:bg-white text-white hover:text-black rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>{language === 'id' ? 'Minta Estimasi Biaya' : 'Request a Quote'}</span>
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
