import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface TelemetryOverlayProps {
  className?: string;
  accentColor?: 'red' | 'blue' | 'emerald' | 'purple';
  label?: string;
}

export const TelemetryOverlay: React.FC<TelemetryOverlayProps> = ({
  className,
  accentColor = 'red',
  label = 'SYSTEM_TELEMETRY'
}) => {
  const accentColors = {
    red: 'text-brand-red/40 border-brand-red/20 bg-brand-red/5',
    blue: 'text-blue-500/40 border-blue-500/20 bg-blue-500/5',
    emerald: 'text-emerald-500/40 border-emerald-500/20 bg-emerald-500/5',
    purple: 'text-purple-500/40 border-purple-500/20 bg-purple-500/5',
  };

  const accentGlow = {
    red: 'bg-brand-red/20',
    blue: 'bg-blue-500/20',
    emerald: 'bg-emerald-500/20',
    purple: 'bg-purple-500/20',
  };

  return (
    <div className={cn("absolute inset-0 pointer-events-none z-10 overflow-hidden", className)}>
      {/* Top Left: Coordinates & Label */}
      <div className="absolute top-12 left-12 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", accentGlow[accentColor])} />
          <span className="text-[8px] font-mono font-bold tracking-[0.4em] text-white/20 uppercase">
            {label} // 0x{Math.random().toString(16).substring(2, 6).toUpperCase()}
          </span>
        </div>
        <div className="h-px w-24 bg-gradient-to-r from-white/10 to-transparent" />
        <div className="flex gap-4 font-mono text-[6px] text-white/10 tracking-widest">
          <span>X: {Math.floor(Math.random() * 1000)}</span>
          <span>Y: {Math.floor(Math.random() * 1000)}</span>
          <span>Z: {Math.floor(Math.random() * 1000)}</span>
        </div>
      </div>

      {/* Top Right: System Specs */}
      <div className="absolute top-12 right-12 flex flex-col items-end gap-2 text-right">
        <span className="text-[8px] font-mono font-bold tracking-[0.4em] text-white/20 uppercase">
          NODE_STABILITY: 99.99%
        </span>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
              className={cn("w-1 h-3 rounded-sm", i < 4 ? accentGlow[accentColor] : "bg-white/5")}
            />
          ))}
        </div>
      </div>

      {/* Bottom Left: Scanning Line & Data */}
      <div className="absolute bottom-12 left-12 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-px w-8 bg-white/10" />
            ))}
          </div>
          <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-white/10 uppercase">
            DATA_STREAM_ACTIVE
          </span>
        </div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn("w-1 h-1 rounded-full", accentGlow[accentColor])} />
              <div className="h-px w-12 bg-white/5" />
              <span className="text-[6px] font-mono text-white/10">
                LOG_{i}: {Math.random().toString(36).substring(7).toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Right: Compass / Radar */}
      <div className="absolute bottom-12 right-12 w-24 h-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-white/5 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border border-white/5 rounded-full border-dashed"
        />
        <div className={cn("w-1 h-8 absolute top-0 left-1/2 -translate-x-1/2 origin-bottom", accentGlow[accentColor])} />
        <span className="text-[8px] font-mono font-bold text-white/20">NAV</span>
      </div>

      {/* Vertical Scanning Line */}
      <motion.div
        animate={{ left: ["-10%", "110%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent z-0"
      />
    </div>
  );
};
