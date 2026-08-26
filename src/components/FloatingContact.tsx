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
      label: language === 'id' ? 'Telepon / WhatsApp' : 'Phone / WhatsApp',
      href: 'tel:+6287769957062',
      color: 'bg-emerald-600'
    },
    {
      icon: <Mail size={18} />,
      label: language === 'id' ? 'Kirim Email' : 'Send Email',
      href: 'mailto:hello@kapitech.id',
      color: 'bg-blue-600'
    },
    {
      icon: <MessageSquare size={18} />,
      label: language === 'id' ? 'Formulir Proyek' : 'Project Form',
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
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[90]"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[95] flex flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              className="flex flex-col gap-2.5 mb-2"
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
                      className="flex items-center justify-end gap-2.5 sm:gap-3 group"
                    >
                      <span className="px-3.5 py-1.5 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-white/15 text-xs font-medium text-white shadow-lg transition-all group-hover:border-brand-red/60 group-hover:text-brand-red">
                        {option.label}
                      </span>
                      <div className={cn(
                        "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105 active:scale-95",
                        option.color
                      )}>
                        {option.icon}
                      </div>
                    </Link>
                  ) : (
                    <a
                      href={option.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-end gap-2.5 sm:gap-3 group"
                    >
                      <span className="px-3.5 py-1.5 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-white/15 text-xs font-medium text-white shadow-lg transition-all group-hover:border-brand-red/60 group-hover:text-brand-red">
                        {option.label}
                      </span>
                      <div className={cn(
                        "w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105 active:scale-95",
                        option.color
                      )}>
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
                  "w-13 h-13 sm:w-15 sm:h-15 rounded-2xl sm:rounded-[1.75rem] flex items-center justify-center text-white shadow-xl transition-all duration-300",
                  isOpen 
                    ? "bg-zinc-800 border border-white/20" 
                    : "bg-brand-red shadow-brand-red/30 shadow-lg"
                )}
              >
                {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
              </motion.button>
              
              {!isOpen && (
                <div className="hidden sm:block absolute right-full mr-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white">
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
