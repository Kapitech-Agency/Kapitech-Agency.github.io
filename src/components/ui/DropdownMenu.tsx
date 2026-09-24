import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning';
  badge?: string;
  divider?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
  menuClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`absolute z-50 mt-1.5 min-w-[190px] bg-[#161922]/98 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-lg p-1 shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-0.5 font-sans text-xs ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${menuClassName}`}
          >
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider && <div className="h-px bg-[rgba(255,255,255,0.06)] my-1" />}
                <button
                  type="button"
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
                    item.variant === 'danger'
                      ? 'text-red-400 hover:text-red-200 hover:bg-red-950/40'
                      : item.variant === 'warning'
                      ? 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1B1E2B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="truncate font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[rgba(255,255,255,0.06)] text-[#94A3B8]">
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default DropdownMenu;
