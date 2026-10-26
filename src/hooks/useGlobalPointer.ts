import { useEffect, useRef, type MutableRefObject } from 'react';

export interface NormalizedPointer {
  x: number;
  y: number;
}

/**
 * Window-level normalized pointer ([-1, 1] on both axes).
 *
 * The hero's 3D exhibit only receives parallax when the visitor moves over the
 * canvas, which would make the interaction feel dead across most of the
 * viewport. Tracking at window level keeps it continuous, while a single
 * passive listener plus ref storage means zero re-renders.
 *
 * Only attached on fine-pointer devices: on touch there is no hover state, so
 * the effect would never fire and would just cost a listener.
 */
export function useGlobalPointer(enabled = true): MutableRefObject<NormalizedPointer> {
  const pointer = useRef<NormalizedPointer>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      pointer.current.x = 0;
      pointer.current.y = 0;
      return;
    }

    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) {
      return;
    }

    const handlePointerMove = (event: PointerEvent): void => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      pointer.current.x = (event.clientX / width) * 2 - 1;
      pointer.current.y = -((event.clientY / height) * 2 - 1);
    };

    const handlePointerOut = (): void => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerOut);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerOut);
    };
  }, [enabled]);

  return pointer;
}
