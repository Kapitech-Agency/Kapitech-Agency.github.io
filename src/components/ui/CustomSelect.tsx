import React, { useState, useRef, useEffect } from 'react';
import { UntitledIcon } from './UntitledIcon';

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
  const selectedIndex = Math.max(0, options.findIndex((opt) => opt.value === value));

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
    xs: 'h-8 px-2.5 text-[11px] gap-2 rounded-lg',
    sm: 'h-9 px-3 text-xs gap-2.5 rounded-lg',
    md: 'h-10 px-3.5 text-sm gap-3 rounded-lg'
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            const next = options[(selectedIndex + delta + options.length) % options.length];
            if (next) onChange(next.value);
            setIsOpen(true);
          } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(v => !v);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between font-sans transition-colors duration-150 border select-none ${
          sizeClasses[size]
        } ${
          isOpen
            ? 'bg-panel border-accent text-fg shadow-none'
            : 'bg-panel hover:bg-bg border-line hover:border-muted text-fg'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {prefixIcon && <span className="text-muted shrink-0">{prefixIcon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate font-medium text-xs">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                selectedOption.badgeColor || 'bg-bg text-muted border border-line'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <UntitledIcon name="chevron" size={size === 'xs' ? 14 : 16} className="text-muted shrink-0" />
      </button>

      {isOpen && (
          <div
            role="listbox"
            className={`absolute z-[100] mt-1 min-w-[140px] sm:min-w-[180px] max-w-[calc(100vw-32px)] sm:max-w-[280px] max-h-[280px] overflow-y-auto bg-panel border border-line rounded-control p-1 shadow-none space-y-0.5 font-sans text-xs custom-scrollbar ${
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
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full flex items-center justify-between min-h-9 px-3 py-2 rounded-control text-left transition-colors group ${
                    isSelected
                      ? 'bg-bg text-fg font-semibold border border-line'
                      : 'text-muted hover:text-fg hover:bg-bg'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {option.icon && (
                      <span className={isSelected ? 'text-accent-text' : 'text-muted group-hover:text-fg'}>
                        {option.icon}
                      </span>
                    )}
                    <div className="truncate">
                      <div className="truncate font-medium">{option.label}</div>
                      {option.description && (
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-muted' : 'text-muted'
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
                            ? 'bg-bg text-fg border border-line'
                            : option.badgeColor || 'bg-bg text-muted border border-line'
                        }`}
                      >
                        {option.badge}
                      </span>
                    )}
                    {isSelected && <UntitledIcon name="check" size={14} className="text-accent-text shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
    </div>
  );
};
export default CustomSelect;
