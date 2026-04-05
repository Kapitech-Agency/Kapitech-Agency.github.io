import React, { useState, useEffect } from 'react';
import { ChevronRight, Instagram, Linkedin, Twitter, Github, Mail, MapPin, ArrowUpRight, ArrowUp, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MagneticButton } from './ui/MagneticButton';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [localTime, setLocalTime] = useState('');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setLocalTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black pt-20 pb-10 px-6 md:px-12 overflow-hidden border-t border-white/5">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute bottom-0 left-0 w-full h-full grid-bg" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-red/10 blur-[120px] rounded-full" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Section: Big CTA */}
        <div className="pb-20 mb-20 border-b border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-8 h-px bg-brand-red" />
                <span className="text-brand-red font-mono font-bold tracking-[0.3em] uppercase text-[10px]">
                  Project Inquiry
                </span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-[clamp(2.5rem,6vw,6rem)] font-display font-bold tracking-tighter leading-[0.9] mb-8"
              >
                Ready to <span className="text-brand-red">Initialize?</span>
              </motion.h2>
              <p className="text-white/40 text-lg font-light max-w-md leading-relaxed">
                Let's build something that matters. Our team is ready to transform your vision into a high-performance reality.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-8">
              <MagneticButton>
                <Link 
                  to="/contact" 
                  className="group relative inline-flex items-center gap-6 bg-brand-red text-white px-10 py-5 rounded-full font-display font-bold text-xl overflow-hidden transition-all hover:pr-14 active:scale-95"
                >
                  <span className="relative z-10">Let's Talk</span>
                  <ArrowUpRight className="relative z-10 group-hover:rotate-45 transition-transform duration-500" size={24} />
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="absolute inset-0 z-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                </Link>
              </MagneticButton>
              
              <div className="flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-widest text-white/30">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>Systems: Online</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <span>TGR: {localTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-4 mb-10 group">
              <img 
                src="/Logo KTA - Blak BG.png" 
                alt="KAPITECH" 
                className="h-8 md:h-10 w-auto object-contain transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3"
              />
              <span className="text-2xl md:text-3xl font-display font-bold tracking-tighter group-hover:text-brand-red transition-colors">KAPITECH</span>
            </Link>
            <p className="text-white/40 text-sm font-light leading-relaxed max-w-sm mb-10">
              Agency specializes in systems. Design. Bridge technology and experience.
            </p>
            
            <form onSubmit={handleSubscribe} className="relative max-w-sm group">
              <input 
                type="email" 
                placeholder="JOIN OUR NEWSLETTER" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-[10px] font-mono font-bold tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-brand-red/50 transition-all"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red hover:bg-brand-red hover:text-white transition-all"
              >
                <AnimatePresence mode="wait">
                  {isSubscribed ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <ChevronRight size={16} className="rotate-90" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Send size={14} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </form>
          </div>
          
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-mono font-bold mb-8">Navigation</h4>
            <ul className="space-y-4 font-mono text-[10px] uppercase tracking-[0.2em]">
              {['Work', 'Services', 'About', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className="text-white/40 hover:text-brand-red transition-all flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-brand-red group-hover:w-4 transition-all duration-300" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-mono font-bold mb-8">Contact</h4>
            <div className="space-y-6">
              <a href="mailto:hello@kapitech.id" className="flex items-center gap-4 text-white/40 hover:text-brand-red transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-red/30 group-hover:bg-brand-red/5 transition-all">
                  <Mail size={16} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest">hello@kapitech.id</span>
              </a>
              <div className="flex items-start gap-4 text-white/40">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                  <MapPin size={16} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest leading-loose">
                  South Tangerang, Banten<br />
                  Indonesia
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col items-start lg:items-end justify-between">
            <div className="w-full">
              <h4 className="text-white/20 uppercase tracking-[0.3em] text-[10px] font-mono font-bold mb-8 lg:text-right">Connect</h4>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                {[
                  { icon: <Instagram size={18} />, label: 'Instagram', href: '#' },
                  { icon: <Linkedin size={18} />, label: 'LinkedIn', href: '#' },
                  { icon: <Twitter size={18} />, label: 'Twitter', href: '#' },
                  { icon: <Github size={18} />, label: 'GitHub', href: '#' }
                ].map((social) => (
                  <a 
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-brand-red hover:border-brand-red/30 hover:bg-brand-red/5 transition-all duration-500 hover:-translate-y-1"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            
            <button 
              onClick={scrollToTop}
              className="mt-12 lg:mt-0 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:text-brand-red hover:border-brand-red/30 transition-all group"
            >
              <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 text-[9px] font-mono font-bold uppercase tracking-[0.3em]">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p>© {currentYear} PT KAPITECH DIGITAL INDONESIA.</p>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <p>Logical Design // Operational Excellence</p>
            </div>
          </div>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
