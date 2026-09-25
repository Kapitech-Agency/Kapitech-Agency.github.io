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
  open,
  anchorRef,
  onClose,
  children,
  className = '',
  align = 'left',
  offset = 6
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      const menu = menuRef.current;
      if (!anchor || !menu) return;

      const rect = anchor.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const viewportPadding = 8;
      const below = window.innerHeight - rect.bottom;
      const above = rect.top;
      const openUp = below < menuRect.height + offset && above > below;
      const top = openUp
        ? Math.max(viewportPadding, rect.top - menuRect.height - offset)
        : Math.min(window.innerHeight - menuRect.height - viewportPadding, rect.bottom + offset);

      let left = align === 'right' ? rect.right - menuRect.width : rect.left;
      left = Math.max(viewportPadding, Math.min(left, window.innerWidth - menuRect.width - viewportPadding));

      setStyle({
        position: 'fixed',
        top,
        left,
        minWidth: Math.min(rect.width, window.innerWidth - viewportPadding * 2),
        maxWidth: window.innerWidth - viewportPadding * 2,
        zIndex: 120,
        visibility: 'visible'
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
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, anchorRef, onClose, align, offset]);

  if (!open) return null;

  return createPortal(
    <div ref={menuRef} style={style} className={className}>
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;
