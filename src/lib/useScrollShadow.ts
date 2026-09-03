import { useState, useEffect, useCallback, RefObject } from 'react';

export interface UseScrollShadowOptions {
  threshold?: number;
}

export function useScrollShadow(
  ref: RefObject<HTMLElement | null>,
  options: UseScrollShadowOptions = {}
) {
  const { threshold = 4 } = options;

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollTop, setCanScrollTop] = useState(false);
  const [canScrollBottom, setCanScrollBottom] = useState(false);

  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth, scrollTop, scrollHeight, clientHeight } = el;

    const hasHorizontalOverflow = scrollWidth > clientWidth + 1;
    const hasVerticalOverflow = scrollHeight > clientHeight + 1;

    setCanScrollLeft(hasHorizontalOverflow && scrollLeft > threshold);
    setCanScrollRight(hasHorizontalOverflow && scrollLeft + clientWidth < scrollWidth - threshold);

    setCanScrollTop(hasVerticalOverflow && scrollTop > threshold);
    setCanScrollBottom(hasVerticalOverflow && scrollTop + clientHeight < scrollHeight - threshold);
  }, [ref, threshold]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    checkScroll();

    // Debounced and RAF check for buttery smooth transitions
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkScroll);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    // Watch for DOM mutations (new cards added, columns rendered, data loaded)
    const observer = new MutationObserver(checkScroll);
    observer.observe(el, { childList: true, subtree: true, attributes: true });

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
    };
  }, [ref, checkScroll]);

  const scrollBy = useCallback(
    (x: number, y: number = 0, smooth: boolean = true) => {
      const el = ref.current;
      if (!el) return;
      el.scrollBy({
        left: x,
        top: y,
        behavior: smooth ? 'smooth' : 'auto'
      });
    },
    [ref]
  );

  return {
    canScrollLeft,
    canScrollRight,
    canScrollTop,
    canScrollBottom,
    checkScroll,
    scrollBy
  };
}
