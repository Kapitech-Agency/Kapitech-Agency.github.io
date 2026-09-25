import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { DropdownPortal } from './DropdownPortal';

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
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={triggerRef}>
      <div
        onClick={() => setIsOpen(v => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Tab') setIsOpen(false);
        }}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      <DropdownPortal
        open={isOpen}
        anchorRef={triggerRef}
        onClose={() => setIsOpen(false)}
        align={align}
        className={`min-w-[190px] max-w-[calc(100vw-16px)] bg-panel border border-line rounded-control p-1 font-sans text-xs ${menuClassName}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 2, scale: 0.98 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="space-y-0.5"
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.divider && <div className="h-px bg-line my-1" />}
              <button
                type="button"
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between min-h-10 sm:min-h-9 px-3 py-2 rounded-control text-left transition-colors ${
                  item.variant === 'danger'
                    ? 'text-danger hover:text-fg hover:bg-danger/10'
                    : item.variant === 'warning'
                    ? 'text-warning hover:text-fg hover:bg-warning/10'
                    : 'text-muted hover:text-fg hover:bg-panel-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-bg text-muted border border-line">
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          ))}
        </motion.div>
      </DropdownPortal>
    </div>
  );
};

export default DropdownMenu;
