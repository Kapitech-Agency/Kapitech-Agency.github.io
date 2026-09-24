import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';

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
  prefixIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizes = {
    xs: 'h-9 gap-2 px-3 text-[11px]',
    sm: 'h-10 gap-2 px-3 text-xs',
    md: 'h-10 gap-2 px-3.5 text-sm',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`ams-control flex w-full items-center justify-between rounded-[12px] border bg-[#181B22] text-[#F5F5F7] transition-colors duration-150 select-none ${sizes[size]} ${isOpen ? 'border-[rgba(230,57,70,.55)]' : 'border-[rgba(255,255,255,.09)] hover:border-[rgba(255,255,255,.16)]'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${triggerClassName}`}
      >
        <span className="flex min-w-0 items-center gap-2 pr-2">
          {prefixIcon && (
            <span className="shrink-0 text-[#A1A1AA]">{prefixIcon}</span>
          )}
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium">
            {selectedOption?.label ?? placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${selectedOption.badgeColor ?? 'bg-white/[.06] text-[#A1A1AA]'}`}
            >
              {selectedOption.badge}
            </span>
          )}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#A1A1AA] transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#E63946]' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.12 }}
            className={`ams-dropdown-surface absolute z-50 mt-1.5 max-h-[280px] min-w-[180px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-[14px] border border-white/[.10] bg-[#1C1C1F]/95 p-1 shadow-[0_18px_50px_rgba(0,0,0,.34)] backdrop-blur-xl ${align === 'right' ? 'right-0' : 'left-0'} ${menuClassName}`}
          >
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`ams-dropdown-item flex min-h-9 w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left text-xs transition-colors ${selected ? 'bg-white/[.07] text-white' : 'text-[#A1A1AA] hover:bg-white/[.055] hover:text-white'}`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    {option.icon && (
                      <span className="shrink-0">{option.icon}</span>
                    )}
                    <span className="min-w-0 truncate">
                      <span className="block truncate font-medium">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="block truncate text-[10px] text-[#71717A]">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-1.5">
                    {option.badge && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${option.badgeColor ?? 'bg-white/[.06] text-[#A1A1AA]'}`}
                      >
                        {option.badge}
                      </span>
                    )}
                    {selected && (
                      <Check size={14} className="text-[#E63946]" />
                    )}
                  </span>
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
