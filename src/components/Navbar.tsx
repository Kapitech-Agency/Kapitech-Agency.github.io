import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Work', href: '/work' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b",
          isScrolled 
            ? "bg-black/80 backdrop-blur-xl py-4 border-white/10" 
            : "bg-transparent backdrop-blur-[0.05px] py-8 border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="https://ais-dev-l4gphadlzxjwyhm6e7c2hc-185669140339.asia-southeast1.run.app/kapitech-logo.png" 
              alt="KAPITECH" 
              className="h-10 w-auto object-contain group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <span className="text-2xl font-display font-bold tracking-tighter">KAPITECH</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest transition-all hover:tracking-[0.2em]",
                  location.pathname === link.href ? "text-brand-red" : "text-white/50 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/contact" className="px-8 py-3 bg-white text-black rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all duration-500">
              Start Project
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
              <div className="flex items-center gap-3">
                <img 
                  src="https://ais-dev-l4gphadlzxjwyhm6e7c2hc-185669140339.asia-southeast1.run.app/kapitech-logo.png" 
                  alt="KAPITECH" 
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="text-2xl font-display font-bold tracking-tighter">KAPITECH</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.name}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-5xl font-display font-bold hover:text-brand-red transition-colors"
                  >
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
