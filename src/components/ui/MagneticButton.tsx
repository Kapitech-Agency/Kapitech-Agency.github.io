import React from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
}

export const MagneticButton = ({ children, className }: MagneticButtonProps) => {
  return <div className={className}>{children}</div>;
};
