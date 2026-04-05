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
  variant?: 'default' | 'dense' | 'minimal';
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072",
  accentColor = 'red',
  statusText = "OPERATIONAL_SYNC",
  scanMode = "ACTIVE_TELEMETRY",
  sysRef = "KPTCH_SYS_REF_00",
  className,
  opacity = 0.03,
  variant = 'default'
}) => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
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
      {/* Parallax Image Layer */}
      <motion.div 
        style={{ 
          x: mousePos.x * -0.5,
          y: mousePos.y * -0.5,
        }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={imageUrl} 
          alt="Background" 
          className="w-full h-full object-cover grayscale opacity-20 scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60" />
      </motion.div>

      {/* Base Grid & Dots */}
      <motion.div 
        style={{ 
          x: mousePos.x * 0.2,
          y: mousePos.y * 0.2,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
          backgroundSize: '64px 64px'
        }}
        className="absolute inset-0 opacity-[0.02]" 
      />
      <motion.div 
        style={{ 
          x: mousePos.x * 0.3,
          y: mousePos.y * 0.3,
        }}
        className="absolute inset-0 grid-bg opacity-[0.05]" 
      />
      
      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />

      {/* Dynamic Scanning Lines */}
      {variant !== 'minimal' && (
        <>
          <motion.div 
            animate={{ top: ["-20%", "120%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className={cn("absolute left-0 right-0 h-[40vh] bg-gradient-to-b from-transparent to-transparent z-10", 
              accentColor === 'red' ? 'via-brand-red/[0.04]' : 
              accentColor === 'blue' ? 'via-blue-500/[0.04]' :
              accentColor === 'emerald' ? 'via-emerald-500/[0.04]' : 'via-purple-500/[0.04]'
            )}
          />
          <motion.div 
            animate={{ left: ["-20%", "120%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
            className={cn("absolute top-0 bottom-0 w-[30vw] bg-gradient-to-r from-transparent to-transparent z-10",
              accentColor === 'red' ? 'via-brand-red/[0.02]' : 
              accentColor === 'blue' ? 'via-blue-500/[0.02]' :
              accentColor === 'emerald' ? 'via-emerald-500/[0.02]' : 'via-purple-500/[0.02]'
            )}
          />
        </>
      )}

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none mix-blend-overlay z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Technical Glows */}
      <div className={cn("absolute top-1/4 -right-40 w-[1000px] h-[1000px] blur-[250px] rounded-full animate-pulse opacity-40", glowColor[accentColor])} />
      <div className={cn("absolute -bottom-60 -left-60 w-[1200px] h-[1200px] blur-[300px] rounded-full animate-pulse opacity-30", 
        accentColor === 'red' ? 'bg-blue-900/[0.05]' : 'bg-brand-red/[0.05]'
      )} style={{ animationDelay: '4s' }} />
      
      {/* Architectural Lines */}
      <div className="absolute top-0 left-[10%] w-px h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      <div className="absolute top-0 left-[90%] w-px h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      <div className="absolute top-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      <div className="absolute top-[80%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

      {/* Corner Brackets */}
      <div className="absolute top-12 left-12 w-16 h-16 border-t border-l border-white/5" />
      <div className="absolute top-12 right-12 w-16 h-16 border-t border-r border-white/5" />
      <div className="absolute bottom-12 left-12 w-16 h-16 border-b border-l border-white/5" />
      <div className="absolute bottom-12 right-12 w-16 h-16 border-b border-r border-white/5" />

      {/* Junction Points */}
      {[
        { top: '20%', left: '10%' },
        { top: '80%', left: '10%' },
        { top: '20%', left: '90%' },
        { top: '80%', left: '90%' },
        { top: '50%', left: '50%' },
      ].map((pos, i) => (
        <div 
          key={i}
          className={cn("absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 z-10 border", 
            accentColor === 'red' ? 'bg-brand-red/10 border-brand-red/30' : 
            accentColor === 'blue' ? 'bg-blue-500/10 border-blue-500/30' :
            accentColor === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-purple-500/10 border-purple-500/30'
          )}
          style={{ top: pos.top, left: pos.left }}
        >
          <div className={cn("absolute inset-0 animate-ping rounded-full scale-[2.5] opacity-20", 
            accentColor === 'red' ? 'bg-brand-red/40' : 
            accentColor === 'blue' ? 'bg-blue-500/40' :
            accentColor === 'emerald' ? 'bg-emerald-500/40' : 'bg-purple-500/40'
          )} />
        </div>
      ))}

      {/* Floating Data Bits */}
      {variant === 'dense' && [...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: Math.random() * 100 + "%" }}
          animate={{ 
            opacity: [0, 0.15, 0],
            x: ["-10%", "110%"],
            y: (Math.random() * 100) + "%"
          }}
          transition={{ 
            duration: 20 + Math.random() * 15, 
            repeat: Infinity, 
            delay: i * 1.5,
            ease: "linear"
          }}
          className="absolute left-0 font-mono text-[7px] text-white/10 whitespace-nowrap z-10 select-none tracking-widest"
        >
          {Math.random().toString(36).substring(2, 15).toUpperCase()} // 0x{i.toString(16).padStart(2, '0')} // {Math.random() > 0.5 ? 'SYNC' : 'WAIT'}
        </motion.div>
      ))}

      {/* Subtle Glitch Lines */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            opacity: [0, 0.05, 0],
            top: (Math.random() * 100) + "%"
          }}
          transition={{ 
            duration: 0.2, 
            repeat: Infinity, 
            repeatDelay: Math.random() * 10,
            ease: "linear"
          }}
          className={cn("absolute left-0 w-full h-px z-10", 
            accentColor === 'red' ? 'bg-brand-red/20' : 
            accentColor === 'blue' ? 'bg-blue-500/20' :
            accentColor === 'emerald' ? 'bg-emerald-500/20' : 'bg-purple-500/20'
          )}
        />
      ))}

      {/* Coordinate Markers */}
      <div className="absolute top-16 left-16 font-mono text-[9px] text-white/10 uppercase tracking-[0.3em] hidden lg:flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white/5 border border-white/10" />
          <span>[ LAT: 34.0522° N // LON: 118.2437° W ]</span>
        </div>
        <span className={cn(
          "pl-5",
          accentColor === 'red' ? 'text-brand-red/40' : 
          accentColor === 'blue' ? 'text-blue-500/40' :
          accentColor === 'emerald' ? 'text-emerald-400/40' : 'text-purple-400/40'
        )}>STATUS: {statusText}</span>
      </div>
      <div className="absolute bottom-16 right-16 font-mono text-[9px] text-white/10 uppercase tracking-[0.3em] hidden lg:flex flex-col items-end gap-2">
        <span className={cn(
          "pr-5",
          accentColor === 'red' ? 'text-blue-500/40' : 'text-brand-red/40'
        )}>SCAN_MODE: {scanMode}</span>
        <div className="flex items-center gap-3">
          <span>[ SYS_REF: {sysRef} ]</span>
          <span className="w-2 h-2 rounded-full bg-white/5 border border-white/10" />
        </div>
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
