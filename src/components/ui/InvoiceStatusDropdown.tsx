import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
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
  dotColor: string;
}

const statusConfigs: Record<InvoiceStatus, StatusConfig> = {
  paid: {
    label: 'Paid',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dotColor: 'bg-emerald-400'
  },
  sent: {
    label: 'Sent',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dotColor: 'bg-blue-400'
  },
  overdue: {
    label: 'Overdue',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    dotColor: 'bg-red-400'
  },
  draft: {
    label: 'Draft',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dotColor: 'bg-slate-400'
  }
};

const statuses: InvoiceStatus[] = ['paid', 'sent', 'overdue', 'draft'];

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

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 rounded-md font-mono text-xs font-semibold border transition-all duration-150 select-none ${
          size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        } ${current.badgeClass} ${
          isOpen ? 'ring-1 ring-white/20' : 'hover:brightness-110'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor}`} />
          <span className="capitalize">{current.label}</span>
        </div>
        <ChevronDown
          size={11}
          className={`transition-transform duration-150 opacity-70 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 3, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="absolute left-0 sm:left-auto right-auto sm:right-0 md:left-0 md:right-auto z-50 mt-1 min-w-[130px] max-w-[calc(100vw-32px)] bg-[#13151C] border border-[#1F222C] rounded-lg p-1 shadow-[0_12px_32px_rgba(0,0,0,0.65)] space-y-0.5 font-mono text-xs"
          >
            {statuses.map((item) => {
              const isSelected = item === status;
              const config = statusConfigs[item];
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    onChange(item);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                    isSelected
                      ? 'bg-white/[0.08] text-[#F8FAFC] font-semibold'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.08]'
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${config.badgeClass}`}>
                    {config.label}
                  </span>
                  {isSelected && <Check size={12} className="text-[#F8FAFC] ml-2 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
