import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOutsideClick?: boolean;
  labelledBy?: string;
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-3xl' };

export const Modal: React.FC<ModalProps> = ({
  open, onClose, title, description, children, footer, size = 'md',
  closeOnOutsideClick = true, labelledBy = 'ams-modal-title'
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = (): HTMLElement[] => dialogRef.current ? Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[href],[tabindex="0"]')).filter(el => el.getClientRects().length > 0) : [];
    requestAnimationFrame(() => focusables()[0]?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      triggerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="ams-modal-root fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4" role="presentation">
      <button aria-label="Close dialog overlay" className="absolute inset-0 bg-black/70" onClick={() => closeOnOutsideClick && onClose()} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={labelledBy}
        className={`relative w-full ${sizes[size]} max-h-[calc(100dvh-24px)] flex flex-col overflow-hidden rounded-card border border-line bg-panel`}>
        <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 id={labelledBy} className="text-sm font-semibold text-fg">{title}</h2>
            {description && <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog"
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-control border border-line text-muted transition-colors hover:bg-bg hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <X size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-panel px-4 py-3.5 sm:px-5">{footer}</footer>}
      </div>
    </div>
  );
};
export default Modal;
