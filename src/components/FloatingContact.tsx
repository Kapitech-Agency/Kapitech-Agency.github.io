import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';

export const FloatingContact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const contactOptions = [
    {
      icon: <Phone size={18} />,
      label: language === 'id' ? 'WhatsApp Langsung' : 'Direct WhatsApp',
      href: 'https://wa.me/6287769957062?text=Halo%20Kapitech%20Agency,%20saya%20ingin%20konsultasi%20proyek.',
      color: 'bg-emerald-600',
      isExternal: true
    },
    {
      icon: <Mail size={18} />,
      label: language === 'id' ? 'Email Bisnis' : 'Business Email',
      href: 'mailto:business@kapitech.id',
      color: 'bg-[var(--k-text-secondary)]'
    },
    {
      icon: <MessageSquare size={18} />,
      label: language === 'id' ? 'Mulai Proyek' : 'Start a Project',
      href: '/contact',
      isLink: true,
      color: 'bg-brand-red'
    }
  ];

  return (
    <>
      {/* Backdrop overlay for mobile to dismiss */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="kapi-contact-backdrop"
          />
        )}
      </AnimatePresence>

      <div className="kapi-floating-contact">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              className="kapi-contact-actions"
            >
              {contactOptions.map((option, i) => (
                <motion.div
                  key={option.label}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  {option.isLink ? (
                    <Link
                      to={option.href}
                      onClick={() => setIsOpen(false)}
                      className="kapi-contact-action"
                    >
                      <span className="kapi-contact-label">
                        {option.label}
                      </span>
                      <div className={cn("kapi-contact-icon", option.color)}>
                        {option.icon}
                      </div>
                    </Link>
                  ) : (
                    <a
                      href={option.href}
                      target={option.isExternal ? "_blank" : undefined}
                      rel={option.isExternal ? "noopener noreferrer" : undefined}
                      onClick={() => setIsOpen(false)}
                      className="kapi-contact-action"
                    >
                      <span className="kapi-contact-label">
                        {option.label}
                      </span>
                      <div className={cn("kapi-contact-icon", option.color)}>
                        {option.icon}
                      </div>
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0, rotate: 45 }}
              className="relative group"
            >
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isOpen ? "Tutup Kontak Cepat" : "Buka Kontak Cepat"}
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-white shadow-[var(--k-shadow-sm)] transition-all duration-300",
                  isOpen 
                    ? "bg-[var(--k-surface)] border border-[var(--k-border)]" 
                    : "bg-brand-red shadow-[0_10px_28px_rgba(176,0,32,.28)]"
                )}
              >
                {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
              </motion.button>
              
              {!isOpen && (
                <div className="hidden sm:block absolute right-full mr-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="px-3 py-1.5 rounded-xl bg-[var(--k-surface)] border border-[var(--k-border)] whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <span className="text-xs font-sans uppercase tracking-wider text-white">
                      {language === 'id' ? 'Hubungi Kapitech' : 'Contact Kapitech'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
