import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to enable smooth drag-to-scroll (mouse and touch click-and-drag scrolling)
 * on horizontal scroll containers like Kanban boards, portfolio rails, and tables.
 */
export function useDragToScroll<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    const slider = containerRef.current;
    if (!slider) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      // Don't drag-scroll if clicking interactive form controls, links, or draggable cards/handles
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[draggable="true"]') ||
        target.closest('[data-drag-handle]') ||
        target.closest('.draggable-card') ||
        target.closest('.kanban-card') ||
        target.closest('.task-card') ||
        target.closest('.no-drag-scroll')
      ) {
        return;
      }

      isDown = true;
      slider.classList.add('cursor-grabbing');
      slider.classList.remove('cursor-grab');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
      slider.classList.add('cursor-grab');
    };

    const onMouseUp = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
      slider.classList.add('cursor-grab');
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed factor
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', onMouseDown);
    slider.addEventListener('mouseleave', onMouseLeave);
    slider.addEventListener('mouseup', onMouseUp);
    slider.addEventListener('mousemove', onMouseMove);

    // Initial cursor style
    slider.classList.add('cursor-grab');

    return () => {
      slider.removeEventListener('mousedown', onMouseDown);
      slider.removeEventListener('mouseleave', onMouseLeave);
      slider.removeEventListener('mouseup', onMouseUp);
      slider.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return containerRef;
}
