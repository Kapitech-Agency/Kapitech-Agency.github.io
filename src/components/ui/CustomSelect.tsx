import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  size?: 'xs' | 'sm' | 'md';
  disabled?: boolean;
  prefixIcon?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  align = 'left',
  size = 'sm',
  disabled = false,
  prefixIcon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-[11px] gap-2 rounded-md',
    sm: 'px-3 py-1.5 text-xs gap-2.5 rounded-lg',
    md: 'px-3.5 py-2 text-xs gap-3 rounded-lg'
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between font-sans transition-all duration-150 border select-none ${
          sizeClasses[size]
        } ${
          isOpen
            ? 'bg-[#1B1E2B] border-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.15)]'
            : 'bg-[#161922] hover:bg-[#1B1E2B] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] text-[#F8FAFC]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {prefixIcon && <span className="text-[#94A3B8] shrink-0">{prefixIcon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate font-medium text-xs">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${
                selectedOption.badgeColor || 'bg-[rgba(255,255,255,0.06)] text-[#94A3B8]'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={size === 'xs' ? 12 : 14}
          className={`text-[#94A3B8] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#FF1E27]' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`absolute z-50 mt-1.5 min-w-[200px] max-w-[320px] max-h-[300px] overflow-y-auto bg-[#13151C] backdrop-blur-xl border border-[#1F222C] rounded-md p-1 shadow-[0_16px_40px_rgba(0,0,0,0.65)] space-y-0.5 font-sans text-xs custom-scrollbar ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${menuClassName}`}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors group ${
                    isSelected
                      ? 'bg-white/[0.08] text-[#F8FAFC] font-semibold border border-white/10'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {option.icon && (
                      <span className={isSelected ? 'text-[#FF1E27]' : 'text-[#94A3B8] group-hover:text-white'}>
                        {option.icon}
                      </span>
                    )}
                    <div className="truncate">
                      <div className="truncate font-medium">{option.label}</div>
                      {option.description && (
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-[#94A3B8]' : 'text-[#64748B]'
                          }`}
                        >
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {option.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : option.badgeColor || 'bg-[rgba(255,255,255,0.06)] text-[#94A3B8]'
                        }`}
                      >
                        {option.badge}
                      </span>
                    )}
                    {isSelected && <Check size={13} className="text-[#FF1E27] shrink-0" />}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CustomSelect;
