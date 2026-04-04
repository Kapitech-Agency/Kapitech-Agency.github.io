import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const FloatingContact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
      label: 'Call Us',
      href: 'tel:+62215550192',
      color: 'bg-blue-500'
    },
    {
      icon: <Mail size={18} />,
      label: 'Email Us',
      href: 'mailto:hello@kapitech.id',
      color: 'bg-emerald-500'
    },
    {
      icon: <MessageSquare size={18} />,
      label: 'Contact Form',
      href: '/contact',
      isLink: true,
      color: 'bg-brand-red'
    }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-2"
          >
            {contactOptions.map((option, i) => (
              <motion.div
                key={option.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {option.isLink ? (
                  <Link
                    to={option.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 group"
                  >
                    <span className="px-4 py-2 rounded-lg bg-black/80 backdrop-blur-xl border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-white/60 group-hover:text-white group-hover:border-brand-red/50 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                      {option.label}
                    </span>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 active:scale-95",
                      option.color
                    )}>
                      {option.icon}
                    </div>
                  </Link>
                ) : (
                  <a
                    href={option.href}
                    className="flex items-center gap-4 group"
                  >
                    <span className="px-4 py-2 rounded-lg bg-black/80 backdrop-blur-xl border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-white/60 group-hover:text-white group-hover:border-brand-red/50 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
                      {option.label}
                    </span>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 active:scale-95",
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
              className={cn(
                "w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(255,59,59,0.3)] transition-all duration-500",
                isOpen ? "bg-zinc-900 rotate-90" : "bg-brand-red"
              )}
            >
              {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>
            
            {!isOpen && (
              <div className="absolute right-full mr-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="px-4 py-2 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white">Initialize Communication</span>
                </div>
              </div>
            )}
            
            {/* Pulsing Ring */}
            {!isOpen && (
              <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 rounded-[2rem] bg-brand-red/20 animate-ping" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
