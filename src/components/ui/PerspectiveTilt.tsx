import React from 'react';

interface PerspectiveTiltProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const PerspectiveTilt = ({ children, className, onClick }: PerspectiveTiltProps) => {
  return (
    <div
      onClick={onClick}
      className={className}
    >
      {children}
    </div>
  );
};
