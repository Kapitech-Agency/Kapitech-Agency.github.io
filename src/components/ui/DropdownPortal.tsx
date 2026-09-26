import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
  offset?: number;
}

export const DropdownPortal: React.FC<DropdownPortalProps> = ({
  open, anchorRef, onClose, children, className = '', align = 'left', offset = 6
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const updatePosition = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const anchor = anchorRef.current;
        const menu = menuRef.current;
        if (!anchor || !menu) return;
        const rect = anchor.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const viewportPadding = 8;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const availableBelow = Math.max(0, viewportHeight - rect.bottom - viewportPadding - offset);
        const availableAbove = Math.max(0, rect.top - viewportPadding - offset);
        const canOpenUp = availableBelow < menuRect.height && availableAbove > availableBelow;
        const top = canOpenUp
          ? Math.max(viewportPadding, rect.top - menuRect.height - offset)
          : Math.min(viewportHeight - menuRect.height - viewportPadding, rect.bottom + offset);
        const rawLeft = align === 'right' ? rect.right - menuRect.width : rect.left;
        const left = Math.max(viewportPadding, Math.min(rawLeft, viewportWidth - menuRect.width - viewportPadding));
        setStyle({
          position: 'fixed',
          top,
          left,
          maxWidth: viewportWidth - viewportPadding * 2,
          maxHeight: Math.max(120, viewportHeight - viewportPadding * 2),
          zIndex: 60,
          visibility: 'visible',
          '--ams-bg': '#09090c',
          '--ams-panel': '#0f0f14',
          '--ams-panel-hover': '#15151b',
          '--ams-line': '#20202a',
          '--ams-text': '#f3f3f6',
          '--ams-muted': '#8b8b99',
          '--ams-accent': '#dc143c',
          '--ams-accent-text': '#ff4d6d',
          '--ams-radius-control': '8px',
          '--ams-radius-card': '12px'
        } as React.CSSProperties);
      });
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target) && !menuRef.current?.contains(target)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, anchorRef, onClose, align, offset]);

  if (!open) return null;
  return createPortal(<div ref={menuRef} style={style} className={className}>{children}</div>, document.body);
};

export default DropdownPortal;
