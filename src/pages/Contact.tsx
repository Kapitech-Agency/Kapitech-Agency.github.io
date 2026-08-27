import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, ArrowUpRight, Send, Globe, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';

export const Contact = () => {
  const { t, language } = useLanguage();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<string>('');
  const [showAllFaqs, setShowAllFaqs] = useState<boolean>(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const serviceOptionsEn = [
    // Visual Experience
    'UI/UX Design',
    'Video Production (Event, Wedding & Commercials)',
    '2D Animation',
    'Branding & Identity',
    'Motion & Graphic Design',
    'Creative Design',
    '3D Visualization',
    // Innovation Development
    'Brochure Site / Company Profile Website',
    'E-Commerce Website',
    'Web Application',
    'ERP / CRM System',
    'IT Support & Infrastructure'
  ];

  const serviceOptionsId = [
    // Visual Experience
    'UI/UX Design',
    'Produksi Video (Event, Pernikahan & Iklan)',
    'Animasi 2D',
    'Branding & Identitas',
    'Motion & Desain Grafis',
    'Desain Kreatif & Publikasi',
    'Visualisasi 3D',
    // Innovation Development
    'Website Profil Perusahaan / Brochure Site',
    'Website E-Commerce',
    'Aplikasi Web / SaaS',
    'Sistem ERP / CRM',
    'Dukungan & Infrastruktur IT'
  ];

  const serviceOptions = language === 'id' ? serviceOptionsId : serviceOptionsEn;

  const budgetOptionsEn = [
    '< $3,000 (IDR 40M - 50M)',
    '$3,000 - $10,000 (IDR 50M - 150M)',
    '$10,000 - $25,000 (IDR 150M - 400M)',
    '$25,000+ (Enterprise)'
  ];

  const budgetOptionsId = [
    '< Rp 50 Juta (Skala Standar)',
    'Rp 50 Juta - Rp 150 Juta (Menengah)',
    'Rp 150 Juta - Rp 400 Juta (Lanjutan)',
    '> Rp 400 Juta (Skala Enterprise)'
  ];

  const budgetOptions = language === 'id' ? budgetOptionsId : budgetOptionsEn;

  const toggleService = (srv: string) => {
    setSelectedServices(prev =>
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate brief API submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const faqsEn = [
    {
      q: "What is your typical project turnaround time?",
      a: "Standard corporate websites and brand systems take between 3 to 6 weeks. Full-scale custom web applications, SaaS platforms, and mobile apps typically range from 6 to 14 weeks depending on the technical complexity and feature set."
    },
    {
      q: "Do you sign Non-Disclosure Agreements (NDAs)?",
      a: "Yes, absolutely. We prioritize your privacy and intellectual property. We are happy to execute an NDA before reviewing any proprietary assets or product specifications."
    },
    {
      q: "How does project billing and payment work?",
      a: "For fixed-scope projects, we usually operate on milestone-based payments (e.g. 50% deposit upon kickoff, 25% design sign-off, 25% final deployment). For ongoing product support, we offer monthly retainer agreements."
    },
    {
      q: "Do you provide post-launch maintenance and technical support?",
      a: "Yes. Every deployed project comes with a 30-day post-launch warranty for bug fixes and adjustments. We also offer dedicated monthly SLA maintenance packages for security, backups, and feature iterations."
    },
    {
      q: "Can Kapitech take over or revamp an existing legacy codebase?",
      a: "Yes. We conduct a preliminary architectural audit to evaluate code quality, security vulnerabilities, and database performance before recommending an incremental refactor or modern framework migration."
    },
    {
      q: "How is communication and progress tracked during sprints?",
      a: "We provide dedicated Slack/WhatsApp channels, shared Figma project files, and weekly milestone demos. You have direct transparent communication with our tech lead and project manager."
    },
    {
      q: "Do you assist with cloud hosting and app store deployments?",
      a: "Yes. We handle end-to-end production setups on Google Cloud, AWS, Vercel, or custom servers, including SSL certificates, custom DNS routing, and Apple App Store / Google Play submission assistance."
    },
    {
      q: "What core tech stack do you specialize in?",
      a: "Our core engineering ecosystem centers around modern React, Next.js (App Router), TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Firebase, and React Native for mobile applications."
    }
  ];

  const faqsId = [
    {
      q: "Berapa lama estimasi waktu pengerjaan sebuah proyek?",
      a: "Website korporat standar dan sistem identitas brand memakan waktu antara 3 hingga 6 minggu. Aplikasi web kustom berskala penuh, platform SaaS, dan aplikasi mobile umumnya berkisar antara 6 hingga 14 minggu tergantung pada kompleksitas teknis dan ruang lingkup fitur."
    },
    {
      q: "Apakah Kapitech bersedia menandatangani perjanjian kerahasiaan (NDA)?",
      a: "Tentu saja. Kami sangat menghargai privasi dan hak kekayaan intelektual (HAKI) Anda. Kami siap menandatangani NDA resmi sebelum meninjau dokumen spesifikasi proyek atau aset milik Anda."
    },
    {
      q: "Bagaimana sistem pembayaran dan penagihan proyek?",
      a: "Untuk proyek dengan ruang lingkup tetap (fixed-scope), kami menggunakan skema pembayaran berbasis milestone (misalnya 50% deposit saat kickoff, 25% setelah persetujuan desain, dan 25% saat peluncuran final). Untuk dukungan jangka panjang, kami menyediakan sistem retainer bulanan."
    },
    {
      q: "Apakah Anda menyediakan dukungan teknis dan pemeliharaan setelah rilis?",
      a: "Ya. Setiap proyek yang dirilis dilengkapi dengan garansi pasca-peluncuran 30 hari untuk perbaikan bug dan penyesuaian. Kami juga menawarkan paket pemeliharaan SLA bulanan untuk pembaruan keamanan, backup berkala, dan iterasi fitur baru."
    },
    {
      q: "Bisakah Kapitech melanjutkan atau merombak codebase lama (legacy code)?",
      a: "Bisa. Kami akan melakukan audit arsitektur awal untuk mengevaluasi kualitas kode, celah keamanan, dan performa database sebelum merekomendasikan refactoring bertahap atau migrasi ke framework modern."
    },
    {
      q: "Bagaimana komunikasi dan pemantauan progress selama sprint berlangsung?",
      a: "Kami menyediakan kanal komunikasi langsung (Slack/WhatsApp), akses file Figma bersama, dan sesi demo milestone mingguan. Anda dapat berkomunikasi secara transparan langsung dengan Tech Lead dan Project Manager kami."
    },
    {
      q: "Apakah Anda membantu proses hosting cloud dan rilis aplikasi ke app store?",
      a: "Ya. Kami menangani konfigurasi cloud production end-to-end di Google Cloud, AWS, Vercel, atau server kustom, termasuk sertifikat SSL, routing DNS, hingga bantuan submisi ke Apple App Store dan Google Play Store."
    },
    {
      q: "Apa saja teknologi (tech stack) utama yang menjadi spesialisasi Anda?",
      a: "Ekosistem rekayasa utama kami berpusat pada React modern, Next.js (App Router), TypeScript, Tailwind CSS, Node.js, Express, PostgreSQL, Firebase, serta React Native untuk aplikasi mobile."
    }
  ];

  const allFaqs = language === 'id' ? faqsId : faqsEn;
  const displayedFaqs = showAllFaqs ? allFaqs : allFaqs.slice(0, 4);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-brand-red selection:text-white relative" role="main">
      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 md:px-12 border-b border-white/10 overflow-hidden">
        <AtmosphericBackground imageUrl="/hero_background_3d.png" opacity={0.12} disableGrayscale={true} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-3 sm:mb-4 block">
              {language === 'id' ? 'Kontak & Konsultasi Proyek' : 'Contact & Inquiries'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold leading-[1.1] sm:leading-[1.05] tracking-tight mb-4 sm:mb-6 text-white">
              {language === 'id' ? (
                <>Mari bangun produk digital <span className="text-brand-red">luar biasa</span> bersama kami.</>
              ) : (
                <>Let’s build something <span className="text-brand-red">exceptional</span> together.</>
              )}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/70 font-light leading-relaxed">
              {language === 'id'
                ? 'Punya ide proyek, membutuhkan konsultasi arsitektur perangkat lunak, atau ingin menjajaki kemitraan? Hubungi tim Kapitech Agency secara langsung.'
                : 'Have an upcoming project, need technical consultation, or want to explore collaboration? Reach out to Kapitech Agency directly.'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Form & Info Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 md:px-12 border-b border-white/10 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Left Column: Direct Info & Location */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-brand-red block mb-2 font-semibold">
                  {language === 'id' ? 'Informasi Perusahaan' : 'Corporate Information'}
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold mb-2 sm:mb-3 text-white">
                  Kapitech Agency
                </h3>
                <p className="text-xs font-mono text-white/50 uppercase tracking-wider mb-2.5 sm:mb-3">
                  PT Kapitech Digital Indonesia
                </p>
                <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                  {language === 'id'
                    ? 'Agensi produk digital independen yang berfokus pada desain UI/UX strategis, rekayasa web full-stack, dan identitas brand modern.'
                    : 'An independent digital product agency specializing in strategic UI/UX design, full-stack web engineering, and brand systems.'}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Email Client */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 flex items-start gap-3.5 sm:gap-4 hover:border-brand-red/40 transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-mono text-white/50 uppercase block mb-0.5">
                      {language === 'id' ? 'Konsultasi Klien & Proyek' : 'Client Inquiries'}
                    </span>
                    <a href="mailto:hello@kapitech.id" className="text-xs sm:text-sm font-semibold text-white hover:text-brand-red transition-colors block truncate">
                      hello@kapitech.id
                    </a>
                    <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">
                      {language === 'id' ? 'Tanggapan terjamin dalam 24 jam kerja' : 'Responses guaranteed within 24 business hours'}
                    </p>
                  </div>
                </div>

                {/* Email Business */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 flex items-start gap-3.5 sm:gap-4 hover:border-brand-red/40 transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
                    <Globe size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-mono text-white/50 uppercase block mb-0.5">
                      {language === 'id' ? 'Kemitraan & Korporasi' : 'Partnerships & Corporate'}
                    </span>
                    <a href="mailto:business@kapitech.id" className="text-xs sm:text-sm font-semibold text-white hover:text-brand-red transition-colors block truncate">
                      business@kapitech.id
                    </a>
                    <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">
                      {language === 'id' ? 'Untuk kebutuhan vendor, enterprise, dan media' : 'For vendor, enterprise, and press inquiries'}
                    </p>
                  </div>
                </div>

                {/* Careers Recruitment Email */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 flex items-start gap-3.5 sm:gap-4 hover:border-brand-red/40 transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-mono text-white/50 uppercase block mb-0.5">
                      {language === 'id' ? 'Karir & Rekrutmen' : 'Careers & Talent'}
                    </span>
                    <a href="mailto:recruitment@kapitech.id" className="text-xs sm:text-sm font-semibold text-white hover:text-brand-red transition-colors block truncate">
                      recruitment@kapitech.id
                    </a>
                    <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">
                      {language === 'id' ? 'Untuk lamaran kerja dan program magang' : 'For job applications and internships'}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 flex items-start gap-3.5 sm:gap-4 hover:border-brand-red/40 transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-mono text-white/50 uppercase block mb-0.5">
                      {language === 'id' ? 'Telepon Langsung / WhatsApp' : 'Direct Phone / WhatsApp'}
                    </span>
                    <a href="tel:+6287769957062" className="text-xs sm:text-sm font-semibold text-white hover:text-brand-red transition-colors block truncate">
                      +62 877-6995-7062
                    </a>
                    <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">
                      {language === 'id' ? 'Tersedia Senin - Jumat, 09:00 - 18:00 WIB' : 'Available Mon-Fri, 09:00 - 18:00 WIB'}
                    </p>
                  </div>
                </div>

                {/* Location in English */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 flex items-start gap-3.5 sm:gap-4 hover:border-brand-red/40 transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-mono text-white/50 uppercase block mb-0.5">
                      {language === 'id' ? 'Alamat Kantor Pusat' : 'Headquarters Address'}
                    </span>
                    <p className="text-xs text-white/90 leading-relaxed font-light">
                      Linea Residence, Block G No. 5, Melati Loka Street, Paku Jaya, North Serpong, South Tangerang City, Banten 15220, Indonesia
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-white/10 flex items-start gap-3.5 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0 mt-0.5">
                    <Clock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-mono text-white/50 uppercase block mb-0.5">
                      {language === 'id' ? 'Jam Operasional' : 'Operating Hours'}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {language === 'id' ? 'Senin - Jumat: 09:00 - 18:00 WIB' : 'Monday - Friday: 09:00 - 18:00 WIB'}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">GMT+7 (Waktu Indonesia Barat)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Consultation Form */}
            <div className="lg:col-span-7">
              <div className="p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl bg-zinc-950 border border-white/10">
                {isSubmitted ? (
                  <div className="text-center py-12 sm:py-16 space-y-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                      <CheckCircle2 size={28} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold">
                      {language === 'id' ? 'Pesan Berhasil Terkirim!' : 'Inquiry Sent Successfully!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto font-light leading-relaxed">
                      {language === 'id'
                        ? 'Terima kasih telah menghubungi Kapitech Agency. Tim kami akan meninjau detail proyek Anda dan merespons dalam waktu 24 jam kerja.'
                        : 'Thank you for reaching out to Kapitech Agency. Our team will review your project details and get back to you within 24 business hours.'}
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormState({ name: '', email: '', company: '', phone: '', message: '' });
                        setSelectedServices([]);
                        setBudgetRange('');
                      }}
                      className="px-6 py-3 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-brand-red hover:text-white transition-colors active:scale-95"
                    >
                      {language === 'id' ? 'Kirim Pesan Lainnya' : 'Send Another Message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-display font-bold mb-1.5 sm:mb-2">
                        {language === 'id' ? 'Formulir Konsultasi Proyek' : 'Project Inquiry Form'}
                      </h3>
                      <p className="text-xs text-white/60 font-light mb-4 sm:mb-6">
                        {language === 'id'
                          ? 'Isi formulir di bawah ini dan kami akan segera menjadwalkan sesi discovery untuk mendiskusikan ruang lingkup dan timeline.'
                          : 'Fill out the details below and we’ll schedule a discovery call to discuss scope and timelines.'}
                      </p>
                    </div>

                    {/* Services Selection */}
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-mono text-white/60 uppercase mb-2">
                        {language === 'id' ? 'Layanan apa yang Anda butuhkan?' : 'What services do you need?'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {serviceOptions.map((srv) => (
                          <button
                            type="button"
                            key={srv}
                            onClick={() => toggleService(srv)}
                            className={`p-3 rounded-xl text-xs text-left border transition-colors flex items-center justify-between ${
                              selectedServices.includes(srv)
                                ? 'bg-brand-red/20 border-brand-red text-white'
                                : 'bg-black/60 border-white/10 text-white/70 hover:border-white/30'
                            }`}
                          >
                            <span>{srv}</span>
                            {selectedServices.includes(srv) && <CheckCircle2 size={14} className="text-brand-red shrink-0 ml-2" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Basic Info Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-mono text-white/60 uppercase mb-1">
                          {language === 'id' ? 'Nama Lengkap *' : 'Your Name *'}
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formState.name}
                          onChange={handleInputChange}
                          placeholder={language === 'id' ? 'cth. Budi Santoso' : 'e.g. John Doe'}
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-mono text-white/60 uppercase mb-1">
                          {language === 'id' ? 'Email Kantor *' : 'Work Email *'}
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formState.email}
                          onChange={handleInputChange}
                          placeholder="john@company.com"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-mono text-white/60 uppercase mb-1">
                          {language === 'id' ? 'Nama Perusahaan / Brand' : 'Company / Brand Name'}
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formState.company}
                          onChange={handleInputChange}
                          placeholder="e.g. Acme Corp"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-mono text-white/60 uppercase mb-1">
                          {language === 'id' ? 'Nomor WhatsApp / Telepon' : 'Phone / WhatsApp'}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formState.phone}
                          onChange={handleInputChange}
                          placeholder="+62 812-xxxx-xxxx"
                          className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red font-mono"
                        />
                      </div>
                    </div>

                    {/* Estimated Budget */}
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-mono text-white/60 uppercase mb-2">
                        {language === 'id' ? 'Estimasi Anggaran Proyek' : 'Estimated Budget Range'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {budgetOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setBudgetRange(opt)}
                            className={`p-2.5 rounded-xl text-xs text-left border transition-colors ${
                              budgetRange === opt
                                ? 'bg-white text-black font-semibold border-white'
                                : 'bg-black/60 border-white/10 text-white/70 hover:border-white/30'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Project Message */}
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-mono text-white/60 uppercase mb-1">
                        {language === 'id' ? 'Detail Proyek & Tujuan *' : 'Project Details & Goals *'}
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formState.message}
                        onChange={handleInputChange}
                        placeholder={language === 'id' ? 'Ceritakan tentang kebutuhan produk yang ingin dibangun, tantangan saat ini, target rilis, dll...' : 'Tell us about what you want to build, existing challenges, desired launch dates, etc...'}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-base sm:text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-red resize-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 sm:py-4 rounded-full bg-brand-red hover:bg-white text-white hover:text-black font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 active:scale-95"
                    >
                      {isSubmitting ? (
                        <span>{language === 'id' ? 'Mengirimkan Detail...' : 'Submitting Details...'}</span>
                      ) : (
                        <>
                          <span>{language === 'id' ? 'Kirimkan Konsultasi Proyek' : 'Submit Project Inquiry'}</span>
                          <Send size={14} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions: 8 Total with View More Toggle */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 relative z-10 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="text-brand-red font-mono font-semibold tracking-widest uppercase text-xs mb-2 sm:mb-3 block">
              {language === 'id' ? 'Jawaban Lengkap' : 'Clear Answers'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight mb-3 text-white">
              {language === 'id' ? 'Pertanyaan yang Sering Diajukan' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
              {language === 'id'
                ? 'Semua hal yang perlu Anda ketahui mengenai kolaborasi bersama Kapitech Agency.'
                : 'Everything you need to know about partnering with Kapitech Agency.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            {displayedFaqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 flex flex-col justify-between min-h-[150px] sm:min-h-[170px] hover:border-brand-red/40 transition-colors"
              >
                <div>
                  <h3 className="text-sm sm:text-base font-display font-bold text-white mb-2 sm:mb-3">
                    {faq.q}
                  </h3>
                  <p className="text-xs text-white/70 font-light leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View More / Show Less Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowAllFaqs(prev => !prev)}
              className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-full border border-white/20 bg-zinc-900/80 hover:bg-white hover:text-black text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 active:scale-95"
            >
              <span>
                {language === 'id'
                  ? showAllFaqs ? 'Tampilkan Lebih Sedikit' : `Lihat FAQ Lainnya (${allFaqs.length - 4} Lainnya)`
                  : showAllFaqs ? 'Show Less FAQs' : `View More FAQs (${allFaqs.length - 4} More)`}
              </span>
              {showAllFaqs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
