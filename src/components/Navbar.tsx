import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Menu, 
  X, 
  Instagram, 
  Linkedin, 
  Twitter, 
  ChevronRight, 
  ChevronDown, 
  Phone, 
  Mail, 
  ArrowUpRight,
  Layers,
  Sparkles,
  Palette,
  Code2,
  Cpu
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '@/src/lib/LanguageContext';
import { ServiceItemData } from '@/src/data/servicesData';
import { getCmsServices, fetchServerCmsServices } from '@/src/lib/cmsStore';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [cmsServices, setCmsServices] = useState<ServiceItemData[]>(() => getCmsServices());
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    void fetchServerCmsServices().then(setCmsServices);
    const handleUpdate = () => setCmsServices(getCmsServices());
    window.addEventListener('kapitech_cms_updated', handleUpdate);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('kapitech_cms_updated', handleUpdate);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu & dropdown on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsServicesDropdownOpen(false);
    setIsMobileServicesOpen(false);
  }, [location.pathname]);

  const handleMouseEnterServices = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsServicesDropdownOpen(true);
  };

  const handleMouseLeaveServices = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsServicesDropdownOpen(false);
    }, 150);
  };

  // Organize services by categories
  const solutions = cmsServices.filter(s => s.category === 'Solutions');
  const branding = cmsServices.filter(s => s.category === 'Branding');
  const design = cmsServices.filter(s => s.category === 'Design');
  const development = cmsServices.filter(s => s.category === 'Development');

  const isServicesActive = location.pathname.startsWith('/services') || location.pathname.startsWith('/solutions');

  return (
    <>
      <nav
        className={cn(
          "kapi-public-nav fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b",
          isScrolled 
            ? "bg-[var(--k-bg-deep)]/95 backdrop-blur-md py-3 sm:py-3.5 border-[var(--k-border)] shadow-[var(--k-shadow-sm)] shadow-[var(--k-bg-deep)]/80" 
            : "bg-[var(--k-bg-deep)]/80 backdrop-blur-sm py-4 sm:py-5 border-[var(--k-border)]/60"
        )}
      >
        {/* Scroll Progress Bar */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-[2px] bg-brand-red origin-left"
          style={{ scaleX }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group py-1 shrink-0" aria-label="Kapitech Agency Home">
            <img 
              src="/white.png" 
              alt="Kapitech Agency" 
              className="h-6 sm:h-[22px] md:h-6 w-auto max-h-7 object-contain transition-opacity duration-300 group-hover:opacity-90 shrink-0 select-none"
            />
            {/* Hidden strictly on mobile view to maximize space and preserve top-tier minimal aesthetics */}
            <span className="hidden md:inline font-sans font-bold text-[15px] sm:text-base md:text-[17px] tracking-[-0.02em] text-white group-hover:text-brand-red transition-colors whitespace-nowrap">
              Kapitech Agency
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="kapi-public-nav-links hidden md:flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-5 lg:gap-6 px-6 py-2 rounded-full bg-[var(--k-surface)] backdrop-blur-md border border-[var(--k-border)]">
              
              {/* Work Link */}
              <Link 
                to="/work" 
                className={cn(
                  "relative inline-flex items-center h-7 text-[11px] font-medium uppercase tracking-[0.16em] leading-none transition-colors",
                  location.pathname === '/work' ? "text-brand-red font-semibold" : "text-[var(--k-text-secondary)] hover:text-white"
                )}
              >
                <span>{t('nav.work')}</span>
                <span className={cn(
                  "absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-brand-red transition-all duration-300",
                  location.pathname === '/work' ? "w-full" : "hover:w-full"
                )} />
              </Link>

              {/* SERVICES DROPDOWN TRIGGER */}
              <div 
                className="relative flex items-center h-7"
                onMouseEnter={handleMouseEnterServices}
                onMouseLeave={handleMouseLeaveServices}
              >
                <button
                  type="button"
                  onClick={() => setIsServicesDropdownOpen(prev => !prev)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 h-7 text-[11px] font-medium uppercase tracking-[0.16em] leading-none transition-colors cursor-pointer outline-none",
                    isServicesActive || isServicesDropdownOpen ? "text-brand-red font-semibold" : "text-[var(--k-text-secondary)] hover:text-white"
                  )}
                  aria-expanded={isServicesDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>{t('nav.services')}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isServicesDropdownOpen ? "rotate-180 text-brand-red" : "opacity-70")} />
                  <span className={cn(
                    "absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-brand-red transition-all duration-300",
                    isServicesActive ? "w-full" : ""
                  )} />
                </button>
              </div>

              {/* About Link */}
              <Link 
                to="/about" 
                className={cn(
                  "relative inline-flex items-center h-7 text-[11px] font-medium uppercase tracking-[0.16em] leading-none transition-colors",
                  location.pathname === '/about' ? "text-brand-red font-semibold" : "text-[var(--k-text-secondary)] hover:text-white"
                )}
              >
                <span>{t('nav.about')}</span>
                <span className={cn(
                  "absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-brand-red transition-all duration-300",
                  location.pathname === '/about' ? "w-full" : "hover:w-full"
                )} />
              </Link>

              {/* Careers Link */}
              <Link 
                to="/careers" 
                className={cn(
                  "relative inline-flex items-center h-7 text-[11px] font-medium uppercase tracking-[0.16em] leading-none transition-colors",
                  location.pathname === '/careers' ? "text-brand-red font-semibold" : "text-[var(--k-text-secondary)] hover:text-white"
                )}
              >
                <span>{t('nav.careers')}</span>
                <span className={cn(
                  "absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-brand-red transition-all duration-300",
                  location.pathname === '/careers' ? "w-full" : "hover:w-full"
                )} />
              </Link>
            </div>

            {/* Start Project CTA */}
            <Link
              to="/contact"
              className="relative inline-flex h-10 px-5 lg:px-6 items-center justify-center gap-2 rounded-full bg-brand-red hover:bg-brand-red text-white text-[11px] font-semibold uppercase tracking-[0.14em] border border-brand-red transition-colors duration-200 shrink-0"
            >
              <span>{t('nav.startProject')}</span>
              <ChevronRight size={14} aria-hidden="true" />
            </Link>

            {/* Language Switcher EN | ID */}
            <div className="flex items-center h-10 p-1 rounded-full bg-[var(--k-surface)] border border-[var(--k-border)] text-[11px] font-sans font-semibold backdrop-blur-md">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "h-full px-3 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer",
                  language === 'en'
                    ? "bg-brand-red text-white shadow-sm font-bold"
                    : "text-[var(--k-text-secondary)] hover:text-white hover:bg-white/5"
                )}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={cn(
                  "h-full px-3 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer",
                  language === 'id'
                    ? "bg-brand-red text-white shadow-sm font-bold"
                    : "text-[var(--k-text-secondary)] hover:text-white hover:bg-white/5"
                )}
                aria-label="Switch to Indonesian"
              >
                ID
              </button>
            </div>
          </div>

          {/* Mobile Right Controls: Language Switcher & Hamburger Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 md:hidden">
            <div className="flex items-center p-0.5 rounded-full bg-[var(--k-surface)] border border-[var(--k-border)] text-[11px] font-sans font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "min-w-[36px] min-h-[36px] py-1 px-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer",
                  language === 'en' ? "bg-brand-red text-white font-bold" : "text-[var(--k-text-secondary)]"
                )}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={cn(
                  "min-w-[36px] min-h-[36px] py-1 px-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer",
                  language === 'id' ? "bg-brand-red text-white font-bold" : "text-[var(--k-text-secondary)]"
                )}
                aria-label="Ganti ke Bahasa Indonesia"
              >
                ID
              </button>
            </div>

            <button 
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[var(--k-surface)] border border-[var(--k-border)] flex items-center justify-center text-white active:bg-white/20 transition-colors shrink-0 cursor-pointer"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MEGA DROPDOWN MENU FOR DESKTOP */}
        {/* ======================================================== */}
        <AnimatePresence>
          {isServicesDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={handleMouseEnterServices}
              onMouseLeave={handleMouseLeaveServices}
              className="hidden md:block absolute top-full left-0 w-full bg-[var(--k-surface)]/98 backdrop-blur-2xl border-b border-[var(--k-border)] shadow-[0_25px_60px_rgba(0,0,0,0.95)] py-8 px-6 lg:px-12"
            >
              <div className="max-w-7xl mx-auto grid grid-cols-4 gap-8 lg:gap-10">
                
                {/* COLUMN 1: SOLUTIONS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--k-border)] text-xs font-sans tracking-widest text-brand-red uppercase font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-brand-red" />
                    <span>SOLUTIONS</span>
                  </div>
                  <div className="space-y-3">
                    {solutions.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/solutions/${item.slug}`}
                        onClick={() => setIsServicesDropdownOpen(false)}
                        className="group block p-2.5 rounded-xl hover:bg-[var(--k-surface-raised)] border border-transparent hover:border-[var(--k-border)] transition-all duration-200"
                      >
                        <div className="flex items-center justify-between text-sm font-semibold text-white group-hover:text-brand-red transition-colors">
                          <span>{item.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-red" />
                        </div>
                        <div className="text-xs text-[var(--k-text-secondary)] group-hover:text-white/90 transition-colors mt-0.5 font-light">
                          {language === 'id' ? item.navSubtitleId : item.navSubtitle}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* COLUMN 2: BRANDING */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--k-border)] text-xs font-sans tracking-widest text-brand-red uppercase font-semibold">
                    <Palette className="w-3.5 h-3.5 text-brand-red" />
                    <span>BRANDING</span>
                  </div>
                  <div className="space-y-3">
                    {branding.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/services/${item.slug}`}
                        onClick={() => setIsServicesDropdownOpen(false)}
                        className="group block p-2.5 rounded-xl hover:bg-[var(--k-surface-raised)] border border-transparent hover:border-[var(--k-border)] transition-all duration-200"
                      >
                        <div className="flex items-center justify-between text-sm font-semibold text-white group-hover:text-brand-red transition-colors">
                          <span>{item.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-red" />
                        </div>
                        <div className="text-xs text-[var(--k-text-secondary)] group-hover:text-white/90 transition-colors mt-0.5 font-light">
                          {language === 'id' ? item.navSubtitleId : item.navSubtitle}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* COLUMN 3: DESIGN */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--k-border)] text-xs font-sans tracking-widest text-brand-red uppercase font-semibold">
                    <Layers className="w-3.5 h-3.5 text-brand-red" />
                    <span>DESIGN</span>
                  </div>
                  <div className="space-y-3">
                    {design.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/services/${item.slug}`}
                        onClick={() => setIsServicesDropdownOpen(false)}
                        className="group block p-2.5 rounded-xl hover:bg-[var(--k-surface-raised)] border border-transparent hover:border-[var(--k-border)] transition-all duration-200"
                      >
                        <div className="flex items-center justify-between text-sm font-semibold text-white group-hover:text-brand-red transition-colors">
                          <span>{item.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-red" />
                        </div>
                        <div className="text-xs text-[var(--k-text-secondary)] group-hover:text-white/90 transition-colors mt-0.5 font-light">
                          {language === 'id' ? item.navSubtitleId : item.navSubtitle}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* COLUMN 4: DEVELOPMENT */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--k-border)] text-xs font-sans tracking-widest text-brand-red uppercase font-semibold">
                    <Code2 className="w-3.5 h-3.5 text-brand-red" />
                    <span>DEVELOPMENT</span>
                  </div>
                  <div className="space-y-3">
                    {development.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/services/${item.slug}`}
                        onClick={() => setIsServicesDropdownOpen(false)}
                        className="group block p-2.5 rounded-xl hover:bg-[var(--k-surface-raised)] border border-transparent hover:border-[var(--k-border)] transition-all duration-200"
                      >
                        <div className="flex items-center justify-between text-sm font-semibold text-white group-hover:text-brand-red transition-colors">
                          <span>{item.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-red" />
                        </div>
                        <div className="text-xs text-[var(--k-text-secondary)] group-hover:text-white/90 transition-colors mt-0.5 font-light">
                          {language === 'id' ? item.navSubtitleId : item.navSubtitle}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom Quick Hub Bar */}
              <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-[var(--k-border)] flex items-center justify-between text-xs text-[var(--k-text-secondary)]">
                <Link 
                  to="/services" 
                  onClick={() => setIsServicesDropdownOpen(false)}
                  className="hover:text-white inline-flex items-center gap-1.5 transition-colors font-medium"
                >
                  <span>{language === 'id' ? 'Lihat Semua Gambaran Layanan' : 'Browse All Services Overview'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-brand-red" />
                </Link>
                <div className="font-sans text-[11px] text-[var(--k-text-secondary)]">
                  3 Strategic Solutions &bull; 15 Dedicated Services
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Fullscreen Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-[var(--k-bg)]/98 flex flex-col p-4 sm:p-6 overflow-y-auto"
          >
            {/* Header in Mobile Menu */}
            <div className="flex justify-between items-center pb-4 border-b border-[var(--k-border)] shrink-0">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 group"
              >
                <img 
                  src="/white.png" 
                  alt="Kapitech" 
                  className="h-6 sm:h-[22px] w-auto max-h-7 object-contain shrink-0 transition-opacity group-hover:opacity-90 select-none"
                />
              </Link>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-full bg-[var(--k-surface)] border border-[var(--k-border)] text-[11px] font-sans font-semibold">
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      "min-w-[36px] min-h-[36px] py-1 px-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer",
                      language === 'en' ? "bg-brand-red text-white font-bold" : "text-[var(--k-text-secondary)]"
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('id')}
                    className={cn(
                      "min-w-[36px] min-h-[36px] py-1 px-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer",
                      language === 'id' ? "bg-brand-red text-white font-bold" : "text-[var(--k-text-secondary)]"
                    )}
                  >
                    ID
                  </button>
                </div>

                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[var(--k-surface)] border border-[var(--k-border)] hover:bg-brand-red hover:text-white active:scale-95 transition-all text-white flex items-center justify-center shrink-0 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Nav Links in Mobile */}
            <div className="flex flex-col gap-2 my-auto py-6">
              
              {/* Work */}
              <Link
                to="/work"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between py-3.5 px-4 rounded-2xl transition-colors min-h-[48px]",
                  location.pathname === '/work' 
                    ? "bg-[var(--k-surface)] text-white font-bold border border-brand-red/40" 
                    : "text-[var(--k-text-secondary)] hover:text-white hover:bg-[var(--k-surface)] active:bg-[var(--k-surface)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-sans text-brand-red">01</span>
                  <span className="text-xl font-sans">{t('nav.work')}</span>
                </div>
                <ChevronRight size={18} className="text-[var(--k-text-secondary)]/40" />
              </Link>

              {/* Services & Solutions (Accordion in Mobile Menu) */}
              <div className="rounded-2xl border border-[var(--k-border)] bg-[var(--k-surface)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileServicesOpen(prev => !prev)}
                  className="w-full flex items-center justify-between py-3.5 px-4 text-left text-white font-sans text-xl min-h-[48px] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-sans text-brand-red">02</span>
                    <span>{t('nav.services')}</span>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-[var(--k-text-secondary)] transition-transform duration-200", isMobileServicesOpen ? "rotate-180 text-brand-red" : "")} />
                </button>

                <AnimatePresence>
                  {isMobileServicesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 space-y-4 border-t border-[var(--k-border)] pt-3"
                    >
                      {/* Solutions */}
                      <div>
                        <div className="text-[11px] font-sans text-brand-red font-semibold uppercase tracking-wider mb-2">
                          SOLUTIONS
                        </div>
                        <div className="space-y-2 pl-2 border-l border-[var(--k-border)]">
                          {solutions.map(item => (
                            <Link
                              key={item.slug}
                              to={`/solutions/${item.slug}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block py-2 text-sm text-[var(--k-text-secondary)] hover:text-white font-medium"
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Branding */}
                      <div>
                        <div className="text-[11px] font-sans text-brand-red font-semibold uppercase tracking-wider mb-2">
                          BRANDING
                        </div>
                        <div className="space-y-2 pl-2 border-l border-[var(--k-border)]">
                          {branding.map(item => (
                            <Link
                              key={item.slug}
                              to={`/services/${item.slug}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block py-2 text-sm text-[var(--k-text-secondary)] hover:text-white"
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Design */}
                      <div>
                        <div className="text-[11px] font-sans text-brand-red font-semibold uppercase tracking-wider mb-2">
                          DESIGN
                        </div>
                        <div className="space-y-2 pl-2 border-l border-[var(--k-border)]">
                          {design.map(item => (
                            <Link
                              key={item.slug}
                              to={`/services/${item.slug}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block py-2 text-sm text-[var(--k-text-secondary)] hover:text-white"
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Development */}
                      <div>
                        <div className="text-[11px] font-sans text-brand-red font-semibold uppercase tracking-wider mb-2">
                          DEVELOPMENT
                        </div>
                        <div className="space-y-2 pl-2 border-l border-[var(--k-border)]">
                          {development.map(item => (
                            <Link
                              key={item.slug}
                              to={`/services/${item.slug}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block py-2 text-sm text-[var(--k-text-secondary)] hover:text-white"
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link
                          to="/services"
                          onClick={() => setIsMenuOpen(false)}
                          className="inline-flex items-center gap-1.5 text-xs text-brand-red font-sans uppercase tracking-wider py-1.5"
                        >
                          <span>{language === 'id' ? 'Lihat Semua Layanan' : 'View All Services'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* About */}
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between py-3.5 px-4 rounded-2xl transition-colors min-h-[48px]",
                  location.pathname === '/about' 
                    ? "bg-[var(--k-surface)] text-white font-bold border border-brand-red/40" 
                    : "text-[var(--k-text-secondary)] hover:text-white hover:bg-[var(--k-surface)] active:bg-[var(--k-surface)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-sans text-brand-red">03</span>
                  <span className="text-xl font-sans">{t('nav.about')}</span>
                </div>
                <ChevronRight size={18} className="text-[var(--k-text-secondary)]/40" />
              </Link>

              {/* Careers */}
              <Link
                to="/careers"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between py-3.5 px-4 rounded-2xl transition-colors min-h-[48px]",
                  location.pathname === '/careers' 
                    ? "bg-[var(--k-surface)] text-white font-bold border border-brand-red/40" 
                    : "text-[var(--k-text-secondary)] hover:text-white hover:bg-[var(--k-surface)] active:bg-[var(--k-surface)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-sans text-brand-red">04</span>
                  <span className="text-xl font-sans">{t('nav.careers')}</span>
                </div>
                <ChevronRight size={18} className="text-[var(--k-text-secondary)]/40" />
              </Link>

              <div className="pt-4 mt-1">
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full h-12 rounded-xl bg-brand-red hover:bg-[var(--k-red-hover)] text-white flex items-center justify-center text-xs font-semibold uppercase tracking-wider gap-2 shadow-[var(--k-shadow-sm)] shadow-brand-red/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{t('nav.startProject')}</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            {/* Quick Contact & Footer in Drawer */}
            <div className="pt-4 border-t border-[var(--k-border)] space-y-3 shrink-0">
              <div className="grid grid-cols-1 gap-2 text-xs">
                <a
                  href="https://wa.me/6287769957062?text=Halo%20Kapitech%20Agency,%20saya%20ingin%20konsultasi%20proyek."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[var(--k-surface)] border border-[var(--k-border)] flex items-center gap-2.5 text-white active:bg-[var(--k-surface-raised)] transition-colors min-h-[44px]"
                >
                  <Phone size={15} className="text-brand-red shrink-0" />
                  <span className="truncate">+62 877-6995-7062 (WhatsApp)</span>
                </a>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="mailto:business@kapitech.id"
                    className="p-3 rounded-xl bg-[var(--k-surface)] border border-brand-red/30 flex items-center gap-2.5 text-white active:bg-[var(--k-surface-raised)] transition-colors min-h-[44px]"
                  >
                    <Mail size={15} className="text-brand-red shrink-0" />
                    <span className="truncate">business@kapitech.id</span>
                  </a>
                  <a
                    href="mailto:hello@kapitech.id"
                    className="p-3 rounded-xl bg-[var(--k-surface)] border border-[var(--k-border)] flex items-center gap-2.5 text-white active:bg-[var(--k-surface-raised)] transition-colors min-h-[44px]"
                  >
                    <Mail size={15} className="text-[var(--k-text-secondary)] shrink-0" />
                    <span className="truncate">hello@kapitech.id</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--k-text-secondary)] pt-1">
                <div className="flex gap-4">
                  <Instagram className="text-[var(--k-text-secondary)] hover:text-white cursor-pointer" size={16} />
                  <Linkedin className="text-[var(--k-text-secondary)] hover:text-white cursor-pointer" size={16} />
                  <Twitter className="text-[var(--k-text-secondary)] hover:text-white cursor-pointer" size={16} />
                </div>
                <span className="font-sans text-[10px] text-[var(--k-text-secondary)]">Tangerang Selatan, ID</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
