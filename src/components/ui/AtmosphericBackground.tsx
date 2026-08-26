import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '../../lib/utils';

interface AtmosphericBackgroundProps {
  imageUrl?: string;
  className?: string;
  opacity?: number;
  disableGrayscale?: boolean;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  imageUrl = "/hero_background_3d.png",
  className,
  opacity = 0.12,
  disableGrayscale = true,
}) => {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden -z-10", className)}>
      {/* Background Image with subtle Parallax */}
      <motion.div 
        style={{ y: yParallax }}
        className="absolute inset-0 -z-10 scale-105"
      >
        <img 
          src={imageUrl} 
          alt="" 
          aria-hidden="true"
          className={cn("w-full h-full object-cover object-center", !disableGrayscale && "grayscale")}
          style={{ opacity: opacity }}
          referrerPolicy="no-referrer"
        />
        {/* Soft elegant gradient overlays that blend seamlessly into dark theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/5 via-transparent to-transparent" />
      </motion.div>

      {/* Subtle bottom fade to blend with next section */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};


