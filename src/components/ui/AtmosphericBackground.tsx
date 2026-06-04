import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '../../lib/utils';

interface AtmosphericBackgroundProps {
  imageUrl?: string;
  className?: string;
  opacity?: number;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2564",
  className,
  opacity = 0.15,
}) => {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <div className={cn("absolute inset-0 z-0 pointer-events-none overflow-hidden", className)}>
      {/* Background Image with Parallax effect */}
      <motion.div 
        style={{ y: yParallax }}
        className="absolute inset-0 z-0 scale-110"
      >
        <img 
          src={imageUrl} 
          alt="Background Texture" 
          className="w-full h-full object-cover grayscale"
          style={{ opacity: opacity }}
          referrerPolicy="no-referrer"
        />
        {/* Soft elegant gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/5 via-transparent to-brand-red/5" />
      </motion.div>

      {/* Subtle radial glow to draw attention to center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10" />

      {/* Grain / Noise Overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Subtle bottom gradient to blend into page */}
      <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-b from-transparent to-black" />
    </div>
  );
};

