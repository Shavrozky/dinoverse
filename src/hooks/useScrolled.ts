import { useEffect, useState } from 'react';

/**
 * Reports whether the document has scrolled past `threshold` pixels.
 *
 * Used by the navbar for its background/border settle. Reads are throttled to
 * one per animation frame and the listener is passive, so scrolling stays on
 * the compositor.
 */
export function useScrolled(threshold = 8): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let frame = 0;

    const read = (): void => {
      frame = 0;
      setIsScrolled(window.scrollY > threshold);
    };

    const handleScroll = (): void => {
      if (frame !== 0) {
        return;
      }
      frame = window.requestAnimationFrame(read);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [threshold]);

  return isScrolled;
}
