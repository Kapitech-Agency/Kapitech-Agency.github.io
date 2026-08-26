import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Globe, Users, Heart, Coffee, Laptop, Upload, FileText, Phone, Mail, User, Link as LinkIcon, X, Briefcase, MapPin, Clock } from 'lucide-react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
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

  const positionsEn: Position[] = [
    {
      id: 'ui-ux-designer',
      title: 'UI/UX & Product Designer',
      department: 'Design',
      location: 'Remote (Indonesia)',
      type: 'Full-time / Contract',
      summary: 'Craft high-fidelity web and mobile interfaces, build structured design systems in Figma, and partner directly with our engineering team and clients.',
      responsibilities: [
        'Design responsive web and mobile application interfaces from wireframes to high-fidelity prototypes',
        'Create and maintain scalable design systems, token sets, and UI components in Figma',
        'Conduct usability tests, user flow analysis, and design reviews with clients',
        'Hand off pixel-accurate specs and assets to frontend developers'
      ],
      requirements: [
        '2+ years of experience in UI/UX design for digital products or agency environments',
        'Strong portfolio demonstrating modern typography, layout, and mobile-responsive UI',
        'Expert proficiency in Figma, FigJam, and component auto-layout principles',
        'Clear communication skills and ability to present design decisions objectively'
      ]
    },
    {
      id: 'frontend-engineer',
      title: 'Frontend Developer (React / Next.js)',
      department: 'Engineering',
      location: 'Remote (Indonesia)',
      type: 'Full-time',
      summary: 'Engineer fast, accessible, and responsive user interfaces using React, Next.js, TypeScript, and Tailwind CSS.',
      responsibilities: [
        'Translate Figma designs into pixel-perfect, accessible, and responsive web pages',
        'Build reusable React components and maintain clean code architecture',
        'Integrate REST APIs, GraphQL, and backend services seamlessly',
        'Optimize Core Web Vitals, page speed, and browser compatibility'
      ],
      requirements: [
        '2+ years of experience building modern frontend applications with React and Next.js',
        'Strong proficiency in TypeScript, Tailwind CSS, and HTML5 semantic markup',
        'Familiarity with animations (Framer Motion / CSS transitions) and state management',
        'Solid understanding of Git workflows and code reviews'
      ]
    },
    {
      id: 'fullstack-engineer',
      title: 'Full-Stack Developer (Node.js & Next.js)',
      department: 'Engineering',
      location: 'Remote (Indonesia)',
      type: 'Full-time',
      summary: 'Develop end-to-end web applications, design database schemas, and build resilient API backends.',
      responsibilities: [
        'Design and deploy backend APIs with Node.js, Express, or Next.js server routes',
        'Model and optimize database schemas using PostgreSQL, Prisma, or Firestore',
        'Implement secure authentication (OAuth, JWT) and role-based access control',
        'Collaborate on cloud deployment setups with Google Cloud, AWS, or Vercel'
      ],
      requirements: [
        '2+ years of full-stack engineering experience with Node.js and TypeScript',
        'Strong knowledge of relational databases (PostgreSQL/MySQL) or document stores',
        'Experience with API design, security best practices, and third-party integrations',
        'Problem-solving mindset and clear documentation habits'
      ]
    },
    {
      id: 'associate-project-manager',
      title: 'Associate Project Manager',
      department: 'Operations',
      location: 'Remote / Tangerang Hybrid',
      type: 'Full-time',
      summary: 'Coordinate agile sprint cycles, manage client communications, and ensure on-time delivery across our design and engineering squads.',
      responsibilities: [
        'Facilitate sprint planning, daily standups, and milestone deliverables',
        'Serve as the key operational bridge between clients and the internal creative/dev teams',
        'Track project timelines, scope documents, and quality assurance checklists',
        'Organize project documentation in Notion and task tracking in Linear/Trello'
      ],
      requirements: [
        '1+ years of project management or account coordination experience in digital/tech agencies',
        'Strong organizational, time management, and multitasking skills',
        'Excellent written and spoken English and Bahasa Indonesia',
        'Familiarity with agile product development methodologies'
      ]
    }
  ];

  const positionsId: Position[] = [
    {
      id: 'ui-ux-designer',
      title: 'UI/UX & Desainer Produk',
      department: 'Desain',
      location: 'Remote (Indonesia)',
      type: 'Full-time / Kontrak',
      summary: 'Merancang antarmuka web dan mobile berpresisi tinggi, membangun sistem desain terstruktur di Figma, dan berkolaborasi langsung dengan tim engineer dan klien.',
      responsibilities: [
        'Mendesain antarmuka web responsif dan aplikasi mobile dari wireframe hingga prototipe interaktif',
        'Membuat serta memelihara sistem desain, token desain, dan pustaka komponen UI di Figma',
        'Melakukan uji usabilitas, analisis alur pengguna, dan presentasi desain berkala bersama klien',
        'Menyerahkan spesifikasi desain dan aset visual yang akurat kepada developer frontend'
      ],
      requirements: [
        '2+ tahun pengalaman dalam desain UI/UX untuk produk digital atau agensi',
        'Portofolio kuat yang menunjukkan penguasaan tipografi, tata letak, dan UI responsif',
        'Keahlian tingkat lanjut dalam Figma, FigJam, dan prinsip auto-layout komponen',
        'Kemampuan komunikasi yang jelas dan mampu memaparkan argumen desain secara objektif'
      ]
    },
    {
      id: 'frontend-engineer',
      title: 'Frontend Developer (React / Next.js)',
      department: 'Engineering',
      location: 'Remote (Indonesia)',
      type: 'Full-time',
      summary: 'Membangun antarmuka web yang cepat, aksesibel, dan responsif menggunakan ekosistem React, Next.js, TypeScript, dan Tailwind CSS.',
      responsibilities: [
        'Menerjemahkan desain Figma menjadi halaman web responsif yang presisi dan aksesibel',
        'Membangun komponen React modular yang dapat digunakan kembali dan memelihara arsitektur kode bersih',
        'Mengintegrasikan REST API, GraphQL, dan layanan backend dengan mulus',
        'Mengoptimalkan Core Web Vitals, kecepatan akses halaman, dan kompatibilitas peramban'
      ],
      requirements: [
        '2+ tahun pengalaman membangun aplikasi frontend modern dengan React dan Next.js',
        'Kemampuan mendalam dalam TypeScript, Tailwind CSS, dan markup semantik HTML5',
        'Terbiasa dengan animasi mikro (Motion / transisi CSS) dan state management',
        'Pemahaman solid tentang alur kerja Git dan standar review kode'
      ]
    },
    {
      id: 'fullstack-engineer',
      title: 'Full-Stack Developer (Node.js & Next.js)',
      department: 'Engineering',
      location: 'Remote (Indonesia)',
      type: 'Full-time',
      summary: 'Mengembangkan aplikasi web end-to-end, merancang skema database, dan membangun arsitektur API yang tangguh dan aman.',
      responsibilities: [
        'Merancang dan mendeploy backend API menggunakan Node.js, Express, atau Next.js server routes',
        'Membuat dan mengoptimalkan skema database menggunakan PostgreSQL, Prisma, atau Firestore',
        'Menerapkan sistem otentikasi aman (OAuth, JWT) dan kontrol akses berbasis peran (RBAC)',
        'Berkolaborasi dalam konfigurasi deployment cloud di Google Cloud, AWS, atau Vercel'
      ],
      requirements: [
        '2+ tahun pengalaman rekayasa full-stack dengan Node.js dan TypeScript',
        'Pemahaman kuat tentang database relasional (PostgreSQL/MySQL) atau document store',
        'Pengalaman dalam perancangan API, keamanan sistem, dan integrasi pihak ketiga',
        'Kemampuan problem-solving yang tajam dan kebiasaan dokumentasi yang rapi'
      ]
    },
    {
      id: 'associate-project-manager',
      title: 'Associate Project Manager',
      department: 'Operasional',
      location: 'Remote / Tangerang Hybrid',
      type: 'Full-time',
      summary: 'Mengoordinasikan siklus sprint agile, mengelola komunikasi klien, dan memastikan deliverable selesai tepat waktu lintas tim desain dan engineer.',
      responsibilities: [
        'Memfasilitasi perencanaan sprint, daily standup, dan penyelesaian milestone proyek',
        'Menjadi jembatan komunikasi utama antara klien dan tim kreatif/teknis internal',
        'Memantau lini masa proyek, dokumen ruang lingkup, dan daftar uji kualitas (QA)',
        'Mengorganisir dokumentasi proyek di Notion dan pelacakan tugas di Linear/Trello'
      ],
      requirements: [
        '1+ tahun pengalaman manajemen proyek atau koordinasi akun di agensi digital/teknologi',
        'Keterampilan organisasi, manajemen waktu, dan multitasking yang sangat baik',
        'Kemampuan komunikasi tertulis dan lisan yang lancar dalam Bahasa Indonesia dan Bahasa Inggris',
        'Familiar dengan metodologi pengembangan produk agile (Scrum/Kanban)'
      ]
    }
  ];

  const positions = language === 'id' ? positionsId : positionsEn;

  const benefitsEn = [
    {
      icon: <Laptop size={24} />,
      title: "Remote-Friendly Flexibility",
      desc: "Work from wherever you are most productive with flexible hours and asynchronous communication."
    },
    {
      icon: <Briefcase size={24} />,
      title: "Impactful Real Projects",
      desc: "Collaborate on real-world digital products for innovative startups and established enterprises."
    },
    {
      icon: <Coffee size={24} />,
      title: "Transparent & Direct Culture",
      desc: "Zero bureaucracy. Direct access to leadership, open feedback, and room to take ownership."
    },
    {
      icon: <Heart size={24} />,
      title: "Professional Growth",
      desc: "Access to learning resources, modern tools (Figma, GitHub, AI tools), and project mentorship."
    }
  ];

  const benefitsId = [
    {
      icon: <Laptop size={24} />,
      title: "Fleksibilitas Kerja Remote",
      desc: "Bekerja dari lokasi mana pun yang membuat Anda paling produktif dengan jam kerja fleksibel dan komunikasi asinkron."
    },
    {
      icon: <Briefcase size={24} />,
      title: "Proyek Nyata & Berdampak",
      desc: "Berkontribusi pada produk digital dunia nyata untuk startup inovatif dan perusahaan korporat terkemuka."
    },
    {
      icon: <Coffee size={24} />,
      title: "Budaya Transparan & Langsung",
      desc: "Tanpa birokrasi berbelit. Akses komunikasi langsung ke pimpinan, budaya feedback terbuka, dan kebebasan bereksplorasi."
    },
    {
      icon: <Heart size={24} />,
      title: "Pertumbuhan Profesional",
      desc: "Akses ke sumber belajar, alat kerja modern (Figma, GitHub, AI tools), dan bimbingan proyek langsung dari praktisi senior."
    }
  ];

  const benefits = language === 'id' ? benefitsId : benefitsEn;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, resume: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="bg-black text-white min-h-screen selection:bg-brand-red selection:text-white relative">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 md:px-12 border-b border-white/10 overflow-hidden">
        <AtmosphericBackground imageUrl="/hero_background_3d.png" opacity={0.12} disableGrayscale={true} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-4 block">
              {language === 'id' ? 'Bergabung Bersama Tim Kami' : 'Join Our Team'}
            </span>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-display font-bold leading-[1.05] tracking-tight mb-6 text-white">
              {language === 'id' ? (
                <>Bangun masa depan produk digital bersama <span className="text-brand-red">Kapitech</span>.</>
              ) : (
                <>Build the future of digital products with <span className="text-brand-red">Kapitech</span>.</>
              )}
            </h1>
            <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
              {language === 'id'
                ? 'Kami mencari desainer berbakat, engineer kreatif, dan problem solver berdedikasi yang menjunjung tinggi keahlian, kecepatan eksekusi, dan dampak nyata bagi klien.'
                : 'We are looking for passionate designers, engineers, and problem solvers who value craft, speed, and genuine client impact.'}
            </p>
          </div>
        </div>
      </section>

      {/* Culture & Benefits */}
      <section className="py-20 px-6 md:px-12 bg-black border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-red block mb-2 font-semibold">
              {language === 'id' ? 'Mengapa Bergabung Bersama Kami' : 'Why Work With Us'}
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
              {language === 'id' ? 'Lingkungan kerja yang fokus pada kualitas dan hasil.' : 'A workplace focused on craft and results.'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between hover:border-brand-red/40 transition-colors"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mb-6">
                    {b.icon}
                  </div>
                  <h3 className="text-lg font-display font-bold mb-3 text-white">{b.title}</h3>
                  <p className="text-xs text-white/60 font-light leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions List */}
      <section className="py-24 px-6 md:px-12 bg-zinc-950 border-b border-white/10 relative z-10" id="positions">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-brand-red block mb-2 font-semibold">
                {language === 'id' ? 'Posisi Terbuka' : 'Open Roles'} ({positions.length})
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white">
                {language === 'id' ? 'Peluang Karir Saat Ini' : 'Current Opportunities'}
              </h2>
            </div>
            <p className="text-xs text-white/60 font-mono">
              {language === 'id' ? 'Kontak rekrutmen langsung:' : 'Direct recruitment inquiries:'}{' '}
              <a href="mailto:recruitment@kapitech.id" className="text-brand-red hover:underline font-medium">recruitment@kapitech.id</a>
            </p>
          </div>

          <div className="space-y-4">
            {positions.map((pos) => (
              <div
                key={pos.id}
                onClick={() => { setSelectedPosition(pos); setIsSubmitted(false); }}
                className="p-6 md:p-8 rounded-2xl bg-zinc-950 border border-white/10 hover:border-brand-red/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30 uppercase tracking-wider">
                      {pos.department}
                    </span>
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      <MapPin size={12} /> {pos.location}
                    </span>
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      <Clock size={12} /> {pos.type}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white group-hover:text-brand-red transition-colors">
                    {pos.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/60 font-light max-w-2xl">
                    {pos.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-white/70 group-hover:text-white uppercase tracking-wider shrink-0">
                  <span>{language === 'id' ? 'Lihat Detail & Lamar' : 'View Details & Apply'}</span>
                  <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSITION DETAILS & APPLICATION MODAL */}
      <AnimatePresence>
        {selectedPosition && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl my-auto max-h-[90vh] bg-zinc-950 border border-white/20 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-black/80 sticky top-0 z-20">
                <div className="min-w-0 flex-1 pr-3 sm:pr-4">
                  <span className="text-[10px] sm:text-xs font-mono text-brand-red uppercase tracking-wider block mb-0.5 font-medium">
                    {selectedPosition.department} • {selectedPosition.type}
                  </span>
                  <h3 className="text-base sm:text-lg md:text-xl font-display font-bold text-white leading-snug break-words">
                    {selectedPosition.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPosition(null)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full aspect-square shrink-0 bg-white/10 hover:bg-white hover:text-black transition-colors flex items-center justify-center active:scale-95 ml-auto"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Scroll Content */}
              <div className="overflow-y-auto p-6 md:p-10 space-y-8">
                {isSubmitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-display font-bold">
                      {language === 'id' ? 'Lamaran Anda Berhasil Terkirim!' : 'Application Received!'}
                    </h3>
                    <p className="text-sm text-white/70 max-w-md mx-auto font-light">
                      {language === 'id' ? (
                        <>Terima kasih telah melamar untuk posisi <span className="text-white font-medium">{selectedPosition.title}</span>. Tim rekrutmen kami akan meninjau kualifikasi Anda dan menghubungi via email.</>
                      ) : (
                        <>Thank you for applying for the <span className="text-white font-medium">{selectedPosition.title}</span> role. Our hiring team will review your application and get in touch via email.</>
                      )}
                    </p>
                    <button
                      onClick={() => setSelectedPosition(null)}
                      className="px-6 py-3 rounded-xl bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-brand-red hover:text-white transition-colors"
                    >
                      {language === 'id' ? 'Tutup Jendela' : 'Close Window'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">
                        {language === 'id' ? 'Deskripsi Peran' : 'Role Overview'}
                      </h4>
                      <p className="text-sm text-white/80 font-light leading-relaxed">
                        {selectedPosition.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
                        {language === 'id' ? 'Tanggung Jawab Utama' : 'Key Responsibilities'}
                      </h4>
                      <div className="space-y-2">
                        {selectedPosition.responsibilities.map((resp, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-white/80">
                            <CheckCircle2 size={14} className="text-brand-red shrink-0 mt-0.5" />
                            <span className="font-light leading-relaxed">{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
                        {language === 'id' ? 'Kualifikasi & Persyaratan' : 'Qualifications & Requirements'}
                      </h4>
                      <div className="space-y-2">
                        {selectedPosition.requirements.map((req, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-white/80">
                            <CheckCircle2 size={14} className="text-brand-red shrink-0 mt-0.5" />
                            <span className="font-light leading-relaxed">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Application Form */}
                    <div className="pt-6 border-t border-white/10">
                      <h4 className="text-base font-display font-bold mb-4">
                        {language === 'id' ? 'Kirimkan Lamaran Anda' : 'Submit Your Application'}
                      </h4>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                              {language === 'id' ? 'Nama Lengkap *' : 'Full Name *'}
                            </label>
                            <input
                              type="text"
                              name="name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="e.g. Alex Pratama"
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                              {language === 'id' ? 'Alamat Email *' : 'Email Address *'}
                            </label>
                            <input
                              type="email"
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="alex@example.com"
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                              {language === 'id' ? 'Nomor WhatsApp / Telepon' : 'Phone / WhatsApp'}
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+62 812-xxxx-xxxx"
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                              {language === 'id' ? 'Tautan Portofolio / GitHub *' : 'Portfolio / GitHub Link *'}
                            </label>
                            <input
                              type="url"
                              name="portfolio"
                              required
                              value={formData.portfolio}
                              onChange={handleInputChange}
                              placeholder="https://behance.net/alex or https://github.com/alex"
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                            {language === 'id' ? 'Catatan Singkat / Mengapa Tertarik di Kapitech?' : 'Cover Note / Why Kapitech?'}
                          </label>
                          <textarea
                            name="coverLetter"
                            rows={3}
                            value={formData.coverLetter}
                            onChange={handleInputChange}
                            placeholder={language === 'id' ? 'Ceritakan secara singkat pengalaman dan kontribusi yang ingin Anda berikan...' : 'Tell us briefly about your experience and what you hope to achieve at Kapitech...'}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">
                            {language === 'id' ? 'Resume / CV (Format PDF atau DOC)' : 'Resume / CV (PDF or DOC)'}
                          </label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="w-full text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-brand-red file:cursor-pointer"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-white text-white hover:text-black font-semibold text-xs uppercase tracking-wider transition-colors"
                        >
                          {language === 'id' ? 'Kirimkan Lamaran' : 'Submit Application'}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
