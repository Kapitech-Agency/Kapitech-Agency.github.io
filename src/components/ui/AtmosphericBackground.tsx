import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface AtmosphericBackgroundProps {
  imageUrl?: string;
  accentColor?: 'red' | 'blue' | 'emerald' | 'purple';
  statusText?: string;
  scanMode?: string;
  sysRef?: string;
  className?: string;
  opacity?: number;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072",
  accentColor = 'red',
  statusText = "OPERATIONAL_SYNC",
  scanMode = "ACTIVE_TELEMETRY",
  sysRef = "KPTCH_SYS_REF_00",
  className,
  opacity = 0.03
}) => {
  const accentClasses = {
    red: 'via-brand-red/[0.03] shadow-[0_0_10px_rgba(255,59,59,0.5)] bg-brand-red/[0.07]',
    blue: 'via-blue-500/[0.03] shadow-[0_0_10px_rgba(59,130,246,0.5)] bg-blue-500/[0.07]',
    emerald: 'via-emerald-500/[0.03] shadow-[0_0_10px_rgba(16,185,129,0.5)] bg-emerald-500/[0.07]',
    purple: 'via-purple-500/[0.03] shadow-[0_0_10px_rgba(168,85,247,0.5)] bg-purple-500/[0.07]',
  };

  const glowColor = {
    red: 'bg-brand-red/[0.07]',
    blue: 'bg-blue-900/[0.05]',
    emerald: 'bg-emerald-900/[0.05]',
    purple: 'bg-purple-900/[0.05]',
  };

  return (
    <div className={cn("absolute inset-0 z-0 pointer-events-none overflow-hidden", className)}>
      {/* Base Grid & Dots */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="absolute inset-0 grid-bg opacity-[0.07]" />
      
      {/* Dynamic Scanning Lines */}
      <motion.div 
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className={cn("absolute left-0 right-0 h-[30vh] bg-gradient-to-b from-transparent to-transparent z-10", 
          accentColor === 'red' ? 'via-brand-red/[0.05]' : 
          accentColor === 'blue' ? 'via-blue-500/[0.05]' :
          accentColor === 'emerald' ? 'via-emerald-500/[0.05]' : 'via-purple-500/[0.05]'
        )}
      />
      <motion.div 
        animate={{ left: ["-10%", "110%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
        className={cn("absolute top-0 bottom-0 w-[20vw] bg-gradient-to-r from-transparent to-transparent z-10",
          accentColor === 'red' ? 'via-brand-red/[0.03]' : 
          accentColor === 'blue' ? 'via-blue-500/[0.03]' :
          accentColor === 'emerald' ? 'via-emerald-500/[0.03]' : 'via-purple-500/[0.03]'
        )}
      />

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Technical Glows */}
      <div className={cn("absolute top-1/4 -right-20 w-[800px] h-[800px] blur-[200px] rounded-full animate-pulse", glowColor[accentColor])} />
      <div className={cn("absolute -bottom-40 -left-40 w-[1000px] h-[1000px] blur-[250px] rounded-full animate-pulse opacity-50", 
        accentColor === 'red' ? 'bg-blue-900/[0.05]' : 'bg-brand-red/[0.05]'
      )} style={{ animationDelay: '3s' }} />
      
      {/* Architectural Lines */}
      <div className="absolute top-0 left-[15%] w-px h-full bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute top-0 left-[85%] w-px h-full bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-white/10" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-white/10" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-white/10" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-white/10" />

      {/* Junction Points */}
      {[
        { top: '33.33%', left: '15%' },
        { top: '66.66%', left: '15%' },
        { top: '33.33%', left: '85%' },
        { top: '66.66%', left: '85%' },
      ].map((pos, i) => (
        <div 
          key={i}
          className={cn("absolute w-1 h-1 -translate-x-1/2 -translate-y-1/2 z-10 border", 
            accentColor === 'red' ? 'bg-brand-red/20 border-brand-red/40' : 
            accentColor === 'blue' ? 'bg-blue-500/20 border-blue-500/40' :
            accentColor === 'emerald' ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-purple-500/20 border-purple-500/40'
          )}
          style={{ top: pos.top, left: pos.left }}
        >
          <div className={cn("absolute inset-0 animate-ping rounded-full scale-150", 
            accentColor === 'red' ? 'bg-brand-red/40' : 
            accentColor === 'blue' ? 'bg-blue-500/40' :
            accentColor === 'emerald' ? 'bg-emerald-500/40' : 'bg-purple-500/40'
          )} />
        </div>
      ))}

      {/* Floating Data Bits */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: Math.random() * 100 + "%" }}
          animate={{ 
            opacity: [0, 0.1, 0],
            x: ["0%", "100%"],
            y: (Math.random() * 100) + "%"
          }}
          transition={{ 
            duration: 15 + Math.random() * 10, 
            repeat: Infinity, 
            delay: i * 2,
            ease: "linear"
          }}
          className="absolute left-0 font-mono text-[6px] text-white/20 whitespace-nowrap z-10 select-none"
        >
          {Math.random().toString(16).substring(2, 10).toUpperCase()} // 0x{i.toString(16).padStart(2, '0')}
        </motion.div>
      ))}

      {/* Coordinate Markers */}
      <div className="absolute top-12 left-12 font-mono text-[8px] text-white/10 uppercase tracking-[0.2em] hidden lg:flex flex-col gap-1">
        <span>[ LAT: 34.0522° N // LON: 118.2437° W ]</span>
        <span className={cn(
          accentColor === 'red' ? 'text-brand-red/40' : 
          accentColor === 'blue' ? 'text-blue-500/40' :
          accentColor === 'emerald' ? 'text-emerald-400/40' : 'text-purple-400/40'
        )}>STATUS: {statusText}</span>
      </div>
      <div className="absolute bottom-12 right-12 font-mono text-[8px] text-white/10 uppercase tracking-[0.2em] hidden lg:flex flex-col items-end gap-1">
        <span className={cn(
          accentColor === 'red' ? 'text-blue-500/40' : 'text-brand-red/40'
        )}>SCAN_MODE: {scanMode}</span>
        <span>[ SYS_REF: {sysRef} ]</span>
      </div>

      {/* Texture Overlay */}
      <img 
        src={imageUrl} 
        className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-overlay"
        style={{ opacity }}
        alt="Background Texture"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
    </div>
  );
};
