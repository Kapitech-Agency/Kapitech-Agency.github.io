import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { Menu, X, Instagram, Linkedin, Twitter, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const checkModal = () => {
      setIsModalOpen(document.body.hasAttribute('data-modal-open'));
    };
    
    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Work', href: '/work' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: isModalOpen ? -100 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b",
          isScrolled 
            ? "bg-black/80 backdrop-blur-xl py-4 border-white/10" 
            : "bg-transparent backdrop-blur-[0.05px] py-8 border-transparent"
        )}
      >
        {/* Scroll Progress Bar */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-[2px] bg-brand-red origin-left"
          style={{ scaleX }}
        />
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <img 
              src="https://ais-dev-l4gphadlzxjwyhm6e7c2hc-185669140339.asia-southeast1.run.app/kapitech-logo.png" 
              alt="KAPITECH" 
              className="h-10 md:h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </Link>

          <div className="hidden md:flex items-center gap-12">
            <div className="flex items-center gap-8 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className={cn(
                    "relative text-[10px] font-bold uppercase tracking-[0.2em] transition-all py-1 group/link",
                    location.pathname === link.href ? "text-brand-red" : "text-white/60 hover:text-white"
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-red transition-all duration-300 group-hover/link:w-full",
                    location.pathname === link.href && "w-full"
                  )} />
                </Link>
              ))}
            </div>
            <Link 
              to="/contact" 
              className="relative overflow-hidden px-8 py-3 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-[0.2em] group/btn transition-all duration-500 hover:pr-12"
            >
              <span className="relative z-10">Start Project</span>
              <div className="absolute inset-0 bg-brand-red translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 transition-all duration-500">
                <ChevronRight size={14} className="text-white" />
              </div>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Fullscreen Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col p-12"
          >
            <div className="flex justify-between items-center mb-20">
              <div className="flex items-center">
                <img 
                  src="https://ais-dev-l4gphadlzxjwyhm6e7c2hc-185669140339.asia-southeast1.run.app/kapitech-logo.png" 
                  alt="KAPITECH" 
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:text-brand-red transition-colors">
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.name}
                  className="group/item"
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-baseline gap-4 text-5xl sm:text-7xl font-display font-bold hover:text-brand-red transition-colors"
                  >
                    <span className="text-xs font-mono opacity-30 group-hover/item:opacity-100 transition-opacity">0{i + 1}</span>
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-auto flex gap-6">
              <Instagram className="text-white/40 hover:text-white cursor-pointer" />
              <Linkedin className="text-white/40 hover:text-white cursor-pointer" />
              <Twitter className="text-white/40 hover:text-white cursor-pointer" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
