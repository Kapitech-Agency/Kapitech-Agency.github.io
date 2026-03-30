import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 overflow-hidden relative">
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
          <div className="p-4 rounded-2xl bg-brand-red/10 text-brand-red">
            <Terminal size={48} />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-6">System Error.</h1>
        <p className="text-xl text-white/40 font-light max-w-md mx-auto mb-12">
          The requested architecture could not be located. The path may have been decommissioned or moved to a secure server.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link 
            to="/" 
            className="group px-10 py-5 bg-white text-black rounded-full font-bold flex items-center gap-3 hover:bg-brand-red hover:text-white transition-all duration-500"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Return to Base
          </Link>
          <Link 
            to="/contact" 
            className="px-10 py-5 rounded-full border border-white/10 hover:bg-white/5 transition-all font-bold tracking-widest uppercase text-xs"
          >
            Report Breach
          </Link>
        </div>
      </motion.div>

      {/* Technical Details */}
      <div className="absolute bottom-12 left-12 hidden md:block">
        <div className="flex flex-col gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
          <span>Error_Code: 0x404_NOT_FOUND</span>
          <span>Status: DECOMMISSIONED</span>
          <span>Location: UNKNOWN_SECTOR</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
