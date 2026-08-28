import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Cpu, 
  Code2, 
  Palette, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ExternalLink,
  Briefcase,
  Star
} from 'lucide-react';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { useLanguage } from '../lib/LanguageContext';
import { getServiceBySlug, allSolutionsAndServices } from '../data/servicesData';
import { allProjects } from '../data/projectsData';

export const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const service = slug ? getServiceBySlug(slug) : undefined;

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  // Find related case studies from allProjects
  const relatedProjects = allProjects.filter(p => 
    service.caseStudySlugs.includes(p.id) ||
    p.pillar.toLowerCase().includes(service.category.toLowerCase()) ||
    p.service.toLowerCase().includes(service.category.toLowerCase()) ||
    p.title.toLowerCase().includes(service.title.toLowerCase())
  ).slice(0, 3);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-brand-red selection:text-white pt-28 pb-24 overflow-hidden">
      <AtmosphericBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB & BACK NAVIGATION */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-400 mb-8 sm:mb-12">
          <Link 
            to="/services" 
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'id' ? 'Semua Solusi & Layanan' : 'All Solutions & Services'}</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-neutral-500 uppercase tracking-wider font-mono text-[11px]">
            {service.category}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-none">
            {service.title}
          </span>
        </div>

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-20 lg:mb-28">
          <div className="lg:col-span-8">
            
            {/* Category / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-red/30 bg-brand-red/10 text-brand-red text-xs font-mono tracking-wider uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              <span>{language === 'id' ? service.badgeId : service.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white leading-[1.1] mb-6">
              {language === 'id' ? service.heroHeadlineId : service.heroHeadline}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-neutral-300 font-light leading-relaxed max-w-3xl mb-10">
              {language === 'id' ? service.heroSubtitleId : service.heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={`/contact?service=${encodeURIComponent(service.title)}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.15)] group"
              >
                <span>{language === 'id' ? 'Mulai Proyek Ini' : 'Start This Project'}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href="#case-studies"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-medium text-sm hover:bg-white/10 hover:border-white/40 transition-all duration-200"
              >
                <span>{language === 'id' ? 'Lihat Studi Kasus' : 'View Case Studies'}</span>
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* METRICS SIDEBAR */}
          <div className="lg:col-span-4 w-full">
            <div className="rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md p-6 sm:p-8 space-y-6">
              <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 flex items-center justify-between">
                <span>{language === 'id' ? 'METRIK KINERJA' : 'PERFORMANCE METRICS'}</span>
                <Sparkles className="w-4 h-4 text-brand-red" />
              </div>
              <div className="space-y-6 divide-y divide-white/10">
                {service.metrics.map((metric, idx) => (
                  <div key={idx} className={idx > 0 ? 'pt-6' : ''}>
                    <div className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
                      {metric.value}
                    </div>
                    <div className="text-xs sm:text-sm text-neutral-400 mt-1">
                      {language === 'id' ? metric.labelId : metric.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tools Stack */}
              <div className="pt-6 border-t border-white/10">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
                  {language === 'id' ? 'TOOLCHAIN & STANDAR' : 'TOOLCHAIN & STACK'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {service.tools.map((tool, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 border border-white/10 text-neutral-300"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TESTIMONIAL PULL QUOTE */}
        {service.testimonial && (
          <div className="mb-20 sm:mb-28">
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-r from-neutral-900/80 via-neutral-900/40 to-neutral-900/80 p-8 sm:p-12 backdrop-blur-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-1.5 text-brand-red mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-serif text-white leading-relaxed mb-8">
                &ldquo;{language === 'id' ? service.testimonial.quoteId : service.testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <img
                  src={service.testimonial.avatar}
                  alt={service.testimonial.author}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-white/20"
                />
                <div>
                  <div className="text-base font-semibold text-white">
                    {service.testimonial.author}
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-400">
                    {service.testimonial.role} &bull; <span className="text-neutral-300">{service.testimonial.company}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROBLEM VS. SOLUTION MATRIX */}
        <div className="mb-20 sm:mb-28">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-brand-red mb-3">
              {language === 'id' ? 'TANTANGAN & SOLUSI' : 'CHALLENGE & SOLUTION'}
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
              {language === 'id' ? 'Menghadapi hambatan umum produk digital?' : 'Facing common digital bottlenecks?'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {service.problemsSolutions.map((item, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
              >
                <div>
                  {/* Problem Block */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="text-xs font-mono uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span>{language === 'id' ? 'Tantangan' : 'The Problem'}</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {language === 'id' ? item.problemTitleId : item.problemTitle}
                    </h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      {language === 'id' ? item.problemDescId : item.problemDesc}
                    </p>
                  </div>

                  {/* Solution Block */}
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'id' ? 'Solusi Kapitech' : 'Kapitech Solution'}</span>
                    </div>
                    <h4 className="text-base font-semibold text-white mb-2">
                      {language === 'id' ? item.solutionTitleId : item.solutionTitle}
                    </h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {language === 'id' ? item.solutionDescId : item.solutionDesc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CORE CAPABILITIES & SPECIALIZATIONS */}
        <div className="mb-20 sm:mb-28">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-brand-red mb-3">
              {language === 'id' ? 'KAPABILITAS UTAMA' : 'CORE CAPABILITIES'}
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
              {language === 'id' ? 'Apa yang kami kerjakan untuk Anda' : 'What we deliver for your business'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.capabilities.map((cap, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-white/10 bg-neutral-900/40 p-6 hover:bg-neutral-900/70 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 group-hover:border-brand-red/40 group-hover:text-brand-red transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-medium text-white mb-2">
                  {language === 'id' ? cap.titleId : cap.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  {language === 'id' ? cap.descId : cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CASE STUDIES SHOWCASE */}
        <div id="case-studies" className="mb-20 sm:mb-28 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-brand-red mb-3">
                {language === 'id' ? 'BUKTI NYATA' : 'PROVEN CASE STUDIES'}
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
                {language === 'id' ? 'Proyek terkait yang telah kami rilis' : 'Related work we have shipped'}
              </h2>
            </div>
            <Link
              to="/work"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white font-medium transition-colors"
            >
              <span>{language === 'id' ? 'Lihat Semua 250+ Proyek' : 'View All 250+ Projects'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {relatedProjects.map((project) => (
              <Link
                key={project.id}
                to={`/work`}
                className="group block rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden hover:border-white/30 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300">
                      {project.service}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-serif font-medium text-white group-hover:text-brand-red transition-colors truncate">
                      {project.title}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                    {language === 'id' ? project.descId : project.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 2).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-neutral-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* PROCESS & METHODOLOGY (01, 02, 03, 04) */}
        <div className="mb-20 sm:mb-28">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-brand-red mb-3">
              {language === 'id' ? 'METODOLOGI KERJA' : 'PROCESS & METHODOLOGY'}
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
              {language === 'id' ? 'Tahapan pelaksanaan terstruktur' : 'How we execute from day one'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.processStages.map((stage, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-white/10 bg-neutral-900/40 p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
              >
                <div>
                  <div className="text-3xl font-serif text-neutral-500 font-light mb-4">
                    {stage.stageNumber}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    {language === 'id' ? stage.stageNameId : stage.stageName}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                    {language === 'id' ? stage.stageDescId : stage.stageDesc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-1.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-2">
                    {language === 'id' ? 'Hasil Kerja:' : 'Deliverables:'}
                  </div>
                  {(language === 'id' ? stage.deliverablesId : stage.deliverables).map((del, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 text-xs text-neutral-300">
                      <span className="w-1 h-1 rounded-full bg-brand-red shrink-0" />
                      <span className="truncate">{del}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BUSINESS OUTCOMES & DISCOVERY CALL BANNER */}
        <div className="mb-20 sm:mb-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="text-xs font-mono uppercase tracking-widest text-brand-red">
                  {language === 'id' ? 'NILAI TAMBAH BISNIS' : 'TANGIBLE ROI'}
                </div>
                <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
                  {language === 'id' ? service.businessOutcomes.headingId : service.businessOutcomes.heading}
                </h2>
                <div className="space-y-3.5 pt-2">
                  {(language === 'id' ? service.businessOutcomes.benefitsId : service.businessOutcomes.benefits).map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 w-full">
                <div className="rounded-2xl border border-white/15 bg-black/60 p-6 sm:p-8 space-y-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-white">
                    {language === 'id' ? 'Siap mendiskusikan kebutuhan Anda?' : 'Ready to discuss your project?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {language === 'id' 
                      ? 'Jadwalkan sesi konsultasi gratis 30 menit bersama tim arsitek produk kami.' 
                      : 'Schedule a free 30-minute discovery call with our senior product architects.'}
                  </p>
                  <Link
                    to={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all duration-300"
                  >
                    <span>{language === 'id' ? 'Mulai Proyek Sekarang' : 'Start a Project Now'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <div className="text-xs text-neutral-500 font-mono">
                    business@kapitech.id &bull; 48-hr Response SLA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="mb-20 sm:mb-28 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs font-mono uppercase tracking-widest text-brand-red mb-3">
                {language === 'id' ? 'PERTANYAAN UMUM' : 'FREQUENTLY ASKED QUESTIONS'}
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
                {language === 'id' ? 'Hal yang sering ditanyakan' : 'Everything you need to know'}
              </h2>
            </div>

            <div className="space-y-4">
              {service.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-neutral-900/40 overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 text-white font-medium hover:text-brand-red transition-colors"
                    >
                      <span className="text-base sm:text-lg">
                        {language === 'id' ? faq.qId : faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-neutral-400 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-6 pb-6 text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-4">
                            {language === 'id' ? faq.aId : faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM GLOBAL NAVIGATION STRIP (Browse other services) */}
        <div className="pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'id' ? 'Kembali ke Semua Layanan' : 'Back to All Services'}</span>
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-red text-white text-sm font-medium hover:bg-brand-red/90 transition-all shadow-[0_0_20px_rgba(255,26,26,0.3)]"
          >
            <span>{language === 'id' ? 'Konsultasi Gratis' : 'Book a Discovery Call'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
