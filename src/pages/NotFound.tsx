import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export const NotFound = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 overflow-hidden relative selection:bg-brand-red selection:text-white">
      {/* Background Glitch Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <span className="text-[50vw] font-display font-black uppercase tracking-tighter leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">404</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-[#161616] border border-[#2A2A2A] text-brand-red shadow-[0_0_25px_rgba(255,26,26,0.15)]">
            <Terminal size={48} />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-6 text-white">
          {language === 'id' ? 'Halaman Tidak Ditemukan.' : 'System Error 404.'}
        </h1>
        <p className="text-base md:text-xl text-[#8E8E93] font-light max-w-md mx-auto mb-12 leading-relaxed">
          {language === 'id'
            ? 'Arsitektur atau tautan yang Anda minta tidak dapat ditemukan. Halaman mungkin telah dipindahkan atau dinonaktifkan.'
            : 'The requested architecture could not be located. The path may have been decommissioned or moved to a secure server.'}
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          <Link 
            to="/" 
            className="group px-8 md:px-10 py-4 md:py-5 bg-brand-red text-white rounded-full font-bold flex items-center gap-3 hover:bg-white hover:text-black transition-all duration-300 text-xs md:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,26,26,0.3)]"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            {language === 'id' ? 'Kembali ke Beranda' : 'Return to Home'}
          </Link>
          <Link 
            to="/contact" 
            className="px-8 md:px-10 py-4 md:py-5 rounded-full border border-[#2A2A2A] bg-[#161616] hover:border-brand-red/50 transition-all font-semibold tracking-wider uppercase text-xs text-white"
          >
            {language === 'id' ? 'Hubungi Bantuan' : 'Contact Support'}
          </Link>
        </div>
      </motion.div>

      {/* Technical Details */}
      <div className="absolute bottom-12 left-12 hidden md:block">
        <div className="flex flex-col gap-2 text-[10px] font-mono text-[#8E8E93]/60 uppercase tracking-widest">
          <span>Error_Code: 0x404_NOT_FOUND</span>
          <span>Status: DECOMMISSIONED</span>
          <span>Location: KAPITECH_ROUTER</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
