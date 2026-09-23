import React from 'react';
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
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden -z-10", className)}>
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className={cn(
          "absolute inset-0 w-full h-full object-cover object-center",
          !disableGrayscale && "grayscale"
        )}
        style={{ opacity }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
