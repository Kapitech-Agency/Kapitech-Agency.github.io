import React, { useRef, useState } from 'react';
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const toggle = () => setIsOpen(open => !open);

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen(true);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
        className="flex w-full cursor-pointer items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {trigger}
      </button>

      <DropdownPortal
        open={isOpen}
        anchorRef={triggerRef}
        onClose={close}
        align={align}
        className={`ams-dropdown-surface z-40 min-w-[190px] max-w-[calc(100vw-16px)] max-h-[min(320px,calc(100dvh-16px))] overflow-y-auto overscroll-contain p-1 font-sans text-xs ${menuClassName}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          role="menu"
          className="space-y-0.5"
        >
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.divider && <div className="my-1 h-px bg-line" role="separator" />}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  close();
                }}
                className={`ams-dropdown-item flex min-h-10 w-full items-center justify-between text-left transition-colors focus-visible:outline-none ${
                  item.variant === 'danger'
                    ? 'text-danger hover:text-fg hover:bg-danger/10'
                    : item.variant === 'warning'
                      ? 'text-warning hover:text-fg hover:bg-warning/10'
                      : 'text-muted hover:text-fg hover:bg-panel'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate font-medium">{item.label}</span>
                </div>
                {item.badge && <span className="rounded-badge border border-line bg-panel px-1.5 py-0.5 text-[9px] font-medium text-muted">{item.badge}</span>}
              </button>
            </React.Fragment>
          ))}
        </motion.div>
      </DropdownPortal>
    </div>
  );
};

export default DropdownMenu;
