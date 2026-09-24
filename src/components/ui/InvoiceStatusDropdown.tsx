import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, CircleCheck, Clock3, Send, CircleAlert, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InvoiceStatus } from '../../lib/financeStore';

interface InvoiceStatusDropdownProps {
  status: InvoiceStatus;
  onChange: (status: InvoiceStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

interface StatusConfig {
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const statusConfigs: Record<InvoiceStatus, StatusConfig> = {
  paid: {
    label: 'Paid',
    badgeClass: 'bg-success/10 text-success border-success/20',
    icon: CircleCheck
  },
  partially_paid: {
    label: 'Partially paid',
    badgeClass: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock3
  },
  sent: {
    label: 'Sent',
    badgeClass: 'bg-info/10 text-info border-info/20',
    icon: Send
  },
  overdue: {
    label: 'Overdue',
    badgeClass: 'bg-danger/10 text-danger border-danger/20',
    icon: CircleAlert
  },
  draft: {
    label: 'Draft',
    badgeClass: 'bg-bg text-muted border-line',
    icon: FileText
  }
};

const statuses: InvoiceStatus[] = ['paid', 'partially_paid', 'sent', 'overdue', 'draft'];

export const InvoiceStatusDropdown: React.FC<InvoiceStatusDropdownProps> = ({
  status,
  onChange,
  disabled = false,
  size = 'sm'
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

  const current = statusConfigs[status] || statusConfigs.draft;
  const CurrentIcon = current.icon;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2 rounded-badge font-sans text-xs font-semibold border transition-colors duration-150 select-none ${
          size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        } ${current.badgeClass} ${
          isOpen ? 'outline outline-2 outline-accent outline-offset-2' : 'hover:brightness-110'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <CurrentIcon size={12} className="shrink-0" />
          <span className="truncate">{current.label}</span>
        </span>
        <ChevronDown size={12} className={`shrink-0 transition-transform duration-150 opacity-70 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            className="absolute left-0 sm:left-auto right-auto sm:right-0 md:left-0 md:right-auto z-50 mt-1 min-w-[150px] max-w-[calc(100vw-32px)] bg-panel border border-line rounded-control p-1 shadow-none space-y-0.5 font-sans text-xs"
          >
            {statuses.map((item) => {
              const isSelected = item === status;
              const config = statusConfigs[item];
              const Icon = config.icon;
              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(item);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-control text-left transition-colors ${
                    isSelected
                      ? 'bg-bg text-fg font-semibold'
                      : 'text-muted hover:text-fg hover:bg-bg'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Icon size={13} className="shrink-0" />
                    <span className="truncate">{config.label}</span>
                  </span>
                  {isSelected && <Check size={13} className="text-fg ml-2 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoiceStatusDropdown;
