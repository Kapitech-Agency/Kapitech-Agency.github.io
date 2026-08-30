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
    xs: 'px-2.5 py-1.5 text-[11px] gap-2 rounded-lg',
    sm: 'px-3 py-2 text-xs gap-2.5 rounded-xl',
    md: 'px-4 py-2.5 text-xs gap-3 rounded-xl'
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between font-mono transition-all duration-150 border select-none ${
          sizeClasses[size]
        } ${
          isOpen
            ? 'bg-[#1E222A] border-brand-red text-white shadow-lg shadow-brand-red/10'
            : 'bg-[#16181D] hover:bg-[#1C2027] border-white/10 hover:border-white/20 text-[#D0D4DC] hover:text-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {prefixIcon && <span className="text-[#8A909D] shrink-0">{prefixIcon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate font-semibold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${
                selectedOption.badgeColor || 'bg-[#262930] text-[#8A909D]'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={size === 'xs' ? 12 : 14}
          className={`text-[#8A909D] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-brand-red' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 mt-1.5 min-w-[200px] max-w-[320px] max-h-[300px] overflow-y-auto bg-[#16181D]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl space-y-1 font-mono text-xs ${
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors group ${
                    isSelected
                      ? 'bg-brand-red text-white font-bold shadow-sm shadow-brand-red/20'
                      : 'text-[#8A909D] hover:text-white hover:bg-[#20242D]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {option.icon && (
                      <span className={isSelected ? 'text-white' : 'text-[#8A909D] group-hover:text-white'}>
                        {option.icon}
                      </span>
                    )}
                    <div className="truncate">
                      <div className="truncate">{option.label}</div>
                      {option.description && (
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-white/80' : 'text-[#5C626E]'
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
                            : option.badgeColor || 'bg-[#262930] text-[#8A909D]'
                        }`}
                      >
                        {option.badge}
                      </span>
                    )}
                    {isSelected && <Check size={13} className="text-white shrink-0" />}
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
