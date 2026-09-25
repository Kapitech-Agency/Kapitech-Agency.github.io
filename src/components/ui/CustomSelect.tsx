import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { DropdownPortal } from './DropdownPortal';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedIndex = Math.max(0, options.findIndex((opt) => opt.value === value));

  useEffect(() => setActiveIndex(selectedIndex), [selectedIndex]);

  const sizeClasses = {
    xs: 'h-10 sm:h-9 px-2.5 text-xs gap-2 rounded-control',
    sm: 'h-10 sm:h-9 px-3 text-[13px] gap-2.5 rounded-control',
    md: 'h-10 px-3.5 text-[13px] gap-3 rounded-control'
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((open) => !open)}
        onKeyDown={(e) => {
          if (disabled) return;

          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            const nextIndex = options.length
              ? (activeIndex + delta + options.length) % options.length
              : 0;
            setActiveIndex(nextIndex);
            setIsOpen(true);
          } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isOpen && options[activeIndex]) {
              onChange(options[activeIndex].value);
              setIsOpen(false);
            } else {
              setIsOpen(true);
            }
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
          } else if (e.key === 'Tab') {
            setIsOpen(false);
          }
        }}
        ref={triggerRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between font-sans transition-colors duration-150 border select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
          sizeClasses[size]
        } ${
          isOpen
            ? 'bg-panel border-line text-fg outline outline-2 outline-accent outline-offset-2'
            : 'bg-panel hover:bg-panel-hover border-line hover:border-muted text-fg'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {prefixIcon && <span className="text-muted shrink-0">{prefixIcon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`px-1.5 py-0.5 rounded-badge text-[10px] font-semibold shrink-0 ${
                selectedOption.badgeColor || 'bg-panel text-muted border border-line'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={size === 'xs' ? 14 : 16}
          className={`text-muted shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <DropdownPortal
        open={isOpen}
        anchorRef={triggerRef}
        onClose={() => setIsOpen(false)}
        align={align}
        className={`z-50 min-w-[140px] sm:min-w-[180px] max-w-[calc(100vw-16px)] sm:max-w-[280px] max-h-[280px] overflow-y-auto bg-bg border border-line rounded-control p-1 custom-scrollbar font-sans text-xs ${menuClassName}`}
      >
        <div role="listbox" aria-label={placeholder}>
          {options.length === 0 ? (
            <div className="px-3 py-2.5 text-muted">No options available</div>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <button
                  key={option.value}
                  id={`custom-select-option-${option.value}`}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    onChange(option.value);
                    setActiveIndex(index);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full flex items-center justify-between min-h-10 sm:min-h-9 px-3 py-2 rounded-control text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px] group ${
                    isSelected
                      ? 'bg-accent/10 text-fg font-semibold'
                      : isActive
                        ? 'text-fg bg-panel'
                        : 'text-muted hover:text-fg hover:bg-panel'
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
                        <div className="text-[10px] truncate text-muted">{option.description}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {option.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-badge text-[9px] font-semibold ${
                          isSelected
                            ? 'bg-bg text-fg border border-line'
                            : option.badgeColor || 'bg-panel text-muted border border-line'
                        }`}
                      >
                        {option.badge}
                      </span>
                    )}
                    {isSelected && <Check size={14} className="text-accent-text shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DropdownPortal>
    </div>
  );
};

export default CustomSelect;
