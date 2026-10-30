import { useCallback, useEffect, useRef, useState } from 'react';

export interface StageWidth {
  /** Attach to the element whose available width should be measured. */
  ref: (node: HTMLDivElement | null) => void;
  width: number;
}

/** Used before layout is readable (first paint). */
const FALLBACK_WIDTH = 960;

/**
 * Measures the comparison stage's available WIDTH only.
 *
 * Width is the only dimension the scale engine may take from layout: stage
 * height is a *product* of the scale, so feeding it back in creates a feedback
 * loop (the plate inflates its container → the container inflates the allowed
 * px-per-metre → the plate grows). Height stays a fixed budget owned by the
 * caller; only width is observed.
 *
 * One observer, torn down on unmount and on re-attach, so nothing leaks across
 * navigations.
 */
export function useStageWidth(): StageWidth {
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (!node) {
      return;
    }

    const read = (): void => {
      const next = node.clientWidth || FALLBACK_WIDTH;
      setWidth((previous) => (previous === next ? previous : next));
    };

    read();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', read);
      cleanupRef.current = () => window.removeEventListener('resize', read);
      return;
    }

    const observer = new ResizeObserver(read);
    observer.observe(node);
    cleanupRef.current = () => observer.disconnect();
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return { ref, width };
}
