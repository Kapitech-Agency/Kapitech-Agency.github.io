import React, { useRef, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollShadow } from '../../lib/useScrollShadow';
import { setupDragToScroll } from '../../lib/useDragToScroll';

export interface ScrollShadowContainerProps {
  children: ReactNode;
  className?: string;
  scrollClassName?: string;
  direction?: 'horizontal' | 'vertical' | 'both';
  shadowBg?: 'app' | 'surface' | 'elevated' | 'transparent';
  customShadowColor?: string; // hex or rgb
  shadowSize?: 'sm' | 'md' | 'lg';
  showNavButtons?: boolean;
  scrollStep?: number;
  externalRef?: React.RefObject<HTMLDivElement | null>;
  bottomOffset?: string; // e.g. 'bottom-4' when padding-bottom on scrollbar exists
  topOffset?: string;
  enableDragToScroll?: boolean;
}

export const ScrollShadowContainer: React.FC<ScrollShadowContainerProps> = ({
  children,
  className = '',
  scrollClassName = '',
  direction = 'horizontal',
  shadowBg = 'app',
  customShadowColor,
  shadowSize = 'md',
  showNavButtons = false,
  scrollStep = 320,
  externalRef,
  bottomOffset = 'bottom-0',
  topOffset = 'top-0',
  enableDragToScroll = true
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const activeRef = externalRef || internalRef;

  const { canScrollLeft, canScrollRight, canScrollTop, canScrollBottom, scrollBy } = useScrollShadow(activeRef);

  useEffect(() => {
    if (!enableDragToScroll || (direction !== 'horizontal' && direction !== 'both')) {
      return;
    }

    const checkAndAttach = () => {
      const el = activeRef.current;
      if (el) {
        return setupDragToScroll(el);
      }
      return () => {};
    };

    let cleanup = checkAndAttach();

    const rafId = requestAnimationFrame(() => {
      if (!cleanup || cleanup.name === '') {
        cleanup = checkAndAttach();
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (cleanup) cleanup();
    };
  }, [activeRef, direction, enableDragToScroll]);

  const bgClassMap = {
    app: {
      left: 'from-[var(--bg)] via-[var(--bg)]/85 to-transparent',
      right: 'from-[var(--bg)] via-[var(--bg)]/85 to-transparent',
      top: 'from-[var(--bg)] via-[var(--bg)]/85 to-transparent',
      bottom: 'from-[var(--bg)] via-[var(--bg)]/85 to-transparent'
    },
    surface: {
      left: 'from-[var(--panel)] via-[var(--panel)]/85 to-transparent',
      right: 'from-[var(--panel)] via-[var(--panel)]/85 to-transparent',
      top: 'from-[var(--panel)] via-[var(--panel)]/85 to-transparent',
      bottom: 'from-[var(--panel)] via-[var(--panel)]/85 to-transparent'
    },
    elevated: {
      left: 'from-[var(--panel)] via-[var(--panel)]/85 to-transparent',
      right: 'from-[var(--panel)] via-[var(--panel)]/85 to-transparent',
      top: 'from-[var(--panel)] via-[var(--panel)]/85 to-transparent',
      bottom: 'from-[var(--panel)] via-[var(--panel)]/85 to-transparent'
    },
    transparent: {
      left: 'from-black/80 via-black/40 to-transparent',
      right: 'from-black/80 via-black/40 to-transparent',
      top: 'from-black/80 via-black/40 to-transparent',
      bottom: 'from-black/80 via-black/40 to-transparent'
    }
  };

  const gradients = bgClassMap[shadowBg];

  const sizeMap = {
    sm: { hWidth: 'w-8 sm:w-12', vHeight: 'h-6' },
    md: { hWidth: 'w-12 sm:w-20', vHeight: 'h-10' },
    lg: { hWidth: 'w-16 sm:w-28', vHeight: 'h-14' }
  };

  const { hWidth, vHeight } = sizeMap[shadowSize];

  const navButtonClass = 'hidden md:flex absolute top-1/2 -translate-y-1/2 size-10 rounded-control bg-[var(--panel)]/95 hover:bg-[var(--line)] text-[var(--text)] border border-[var(--line)] items-center justify-center z-30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]';

  return (
    <div className={`relative group/scroll-shadow ${className}`}>
      {(direction === 'horizontal' || direction === 'both') && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 ${topOffset} ${bottomOffset} ${hWidth} bg-gradient-to-r ${gradients.left} z-20 transition-opacity duration-300 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {(direction === 'horizontal' || direction === 'both') && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-0 ${topOffset} ${bottomOffset} ${hWidth} bg-gradient-to-l ${gradients.right} z-20 transition-opacity duration-300 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {(direction === 'vertical' || direction === 'both') && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute top-0 left-0 right-0 ${vHeight} bg-gradient-to-b ${gradients.top} z-20 transition-opacity duration-300 ${
            canScrollTop ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {(direction === 'vertical' || direction === 'both') && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-0 left-0 right-0 ${vHeight} bg-gradient-to-t ${gradients.bottom} z-20 transition-opacity duration-300 ${
            canScrollBottom ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {showNavButtons && (direction === 'horizontal' || direction === 'both') && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-scrollStep, 0, true)}
            aria-label="Scroll left"
            className={`${navButtonClass} left-2 ${
              canScrollLeft
                ? 'opacity-0 group-hover/scroll-shadow:opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(scrollStep, 0, true)}
            aria-label="Scroll right"
            className={`${navButtonClass} right-2 ${
              canScrollRight
                ? 'opacity-0 group-hover/scroll-shadow:opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </>
      )}

      <div ref={activeRef} className={scrollClassName}>
        {children}
      </div>
    </div>
  );
};
