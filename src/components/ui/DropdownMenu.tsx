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
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-1.5 min-w-[180px] bg-[#16181D]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl space-y-0.5 font-mono text-xs ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${menuClassName}`}
          >
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider && <div className="h-px bg-white/10 my-1" />}
                <button
                  type="button"
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    item.variant === 'danger'
                      ? 'text-red-400 hover:text-red-200 hover:bg-red-950/40'
                      : item.variant === 'warning'
                      ? 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/40'
                      : 'text-[#8A909D] hover:text-white hover:bg-[#20242D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#262930] text-[#8A909D]">
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
