import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { Menu, X, Instagram, Linkedin, Twitter, ChevronRight, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '@/src/lib/LanguageContext';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
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

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: t('nav.work'), href: '/work' },
    { name: t('nav.services'), href: '/services' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.careers'), href: '/careers' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b",
          isScrolled 
            ? "bg-black/95 backdrop-blur-md py-3 sm:py-3.5 border-white/10 shadow-lg shadow-black/60" 
            : "bg-black/60 backdrop-blur-sm py-4 sm:py-5 border-white/5"
        )}
      >
        {/* Scroll Progress Bar */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-[2px] bg-brand-red origin-left"
          style={{ scaleX }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group py-1" aria-label="Kapitech Agency Home">
            <img 
              src="/Kapitech Logo 3D Glass.png" 
              alt="Kapitech Agency" 
              className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
            />
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-brand-red transition-colors">
              Kapitech Agency
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-5 lg:gap-6 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  to={link.href} 
                  className={cn(
                    "relative text-[11px] font-medium uppercase tracking-[0.16em] transition-colors py-1",
                    location.pathname === link.href ? "text-brand-red font-semibold" : "text-white/70 hover:text-white"
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-brand-red transition-all duration-300",
                    location.pathname === link.href ? "w-full" : "hover:w-full"
                  )} />
                </Link>
              ))}
            </div>

            {/* Start Project CTA with Rotating Clockwise White Outline Glow */}
            <div className="relative p-[1.5px] rounded-full overflow-hidden group/cta flex items-center justify-center shrink-0">
              {/* Rotating Conic Gradient Beam (Clockwise) */}
              <motion.div
                className="absolute -inset-[200%] w-[500%] h-[500%] will-change-transform"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 200deg, rgba(255,255,255,0.05) 240deg, rgba(255,255,255,0.4) 300deg, rgba(255,255,255,0.9) 340deg, #ffffff 360deg)',
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Ambient Soft Blur Glow (Clockwise) */}
              <motion.div 
                className="absolute -inset-[200%] w-[500%] h-[500%] blur-[8px] opacity-70 group-hover/cta:opacity-100 transition-opacity duration-500 will-change-transform"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 200deg, rgba(255,255,255,0.08) 250deg, rgba(255,255,255,0.45) 310deg, #ffffff 360deg)',
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              <Link 
                to="/contact" 
                className="relative z-10 h-10 px-5 lg:px-6 bg-zinc-950 hover:bg-white text-white hover:text-black rounded-full text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 flex items-center gap-2 shrink-0 active:scale-95 border border-white/10"
              >
                <span className="relative z-10">{t('nav.startProject')}</span>
                <ChevronRight size={14} className="relative z-10 opacity-80 group-hover/cta:translate-x-0.5 transition-transform duration-300" />
              </Link>
            </div>

            {/* Language Switcher EN | ID (Proportionally matched with h-10 height) */}
            <div className="flex items-center h-10 p-1 rounded-full bg-zinc-950/80 border border-white/10 text-[11px] font-mono font-semibold backdrop-blur-md">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "h-full px-3 rounded-full transition-all duration-300 flex items-center justify-center",
                  language === 'en'
                    ? "bg-brand-red text-white shadow-sm font-bold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={cn(
                  "h-full px-3 rounded-full transition-all duration-300 flex items-center justify-center",
                  language === 'id'
                    ? "bg-brand-red text-white shadow-sm font-bold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
                aria-label="Switch to Indonesian"
              >
                ID
              </button>
            </div>
          </div>

          {/* Mobile Right Controls: Language Switcher & Hamburger Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 md:hidden">
            <div className="flex items-center p-0.5 rounded-full bg-zinc-900 border border-white/15 text-[10px] font-mono font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-colors",
                  language === 'en' ? "bg-brand-red text-white font-bold" : "text-white/60"
                )}
                aria-label="Bahasa Inggris"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-colors",
                  language === 'id' ? "bg-brand-red text-white font-bold" : "text-white/60"
                )}
                aria-label="Bahasa Indonesia"
              >
                ID
              </button>
            </div>

            <button 
              className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white active:bg-white/20 transition-colors"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col p-5 sm:p-8 overflow-y-auto"
          >
            {/* Header in Mobile Menu */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/Kapitech Logo 3D Glass.png" 
                  alt="Kapitech" 
                  className="h-8 w-auto object-contain"
                />
                <span className="font-display font-bold text-base text-white">Kapitech Agency</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Language Switcher inside Mobile Menu */}
                <div className="flex items-center p-0.5 rounded-full bg-zinc-900 border border-white/15 text-[10px] font-mono font-semibold">
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      "px-2.5 py-1 rounded-full transition-colors",
                      language === 'en' ? "bg-brand-red text-white font-bold" : "text-white/60"
                    )}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('id')}
                    className={cn(
                      "px-2.5 py-1 rounded-full transition-colors",
                      language === 'id' ? "bg-brand-red text-white font-bold" : "text-white/60"
                    )}
                  >
                    ID
                  </button>
                </div>

                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 hover:bg-brand-red hover:text-white transition-colors text-white flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex flex-col gap-2 my-auto py-6">
              {navLinks.map((link, i) => {
                const isActive = location.pathname === link.href;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={link.href}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between py-3.5 px-4 rounded-2xl transition-colors",
                        isActive 
                          ? "bg-zinc-900 text-white font-bold border border-brand-red/40" 
                          : "text-white/80 hover:text-white hover:bg-zinc-950 active:bg-zinc-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn("text-xs font-mono", isActive ? "text-brand-red font-bold" : "text-white/40")}>
                          0{i + 1}
                        </span>
                        <span className="text-xl sm:text-2xl font-display tracking-tight">
                          {link.name}
                        </span>
                      </div>
                      <ChevronRight size={18} className={cn("transition-transform", isActive ? "text-brand-red translate-x-0.5" : "text-white/30")} />
                    </Link>
                  </motion.div>
                );
              })}

              <div className="pt-4 mt-2">
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full h-12 rounded-xl bg-brand-red text-white flex items-center justify-center text-xs font-semibold uppercase tracking-wider gap-2 shadow-lg shadow-brand-red/20 active:scale-[0.98] transition-transform"
                >
                  <span>{t('nav.startProject')}</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

            {/* Quick Contact & Footer in Drawer */}
            <div className="pt-5 border-t border-white/10 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href="tel:+6287769957062"
                  className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-2 text-white/80 active:bg-zinc-800"
                >
                  <Phone size={14} className="text-brand-red shrink-0" />
                  <span className="truncate">+62 877-6995-7062</span>
                </a>
                <a
                  href="mailto:hello@kapitech.id"
                  className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-2 text-white/80 active:bg-zinc-800"
                >
                  <Mail size={14} className="text-brand-red shrink-0" />
                  <span className="truncate">hello@kapitech.id</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 pt-1">
                <div className="flex gap-4">
                  <Instagram className="text-white/60 hover:text-white cursor-pointer" size={16} />
                  <Linkedin className="text-white/60 hover:text-white cursor-pointer" size={16} />
                  <Twitter className="text-white/60 hover:text-white cursor-pointer" size={16} />
                </div>
                <span className="font-mono text-[10px] text-white/40">Tangerang Selatan, ID</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

