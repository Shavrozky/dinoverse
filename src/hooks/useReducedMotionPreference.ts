import { useReducedMotion } from 'framer-motion';

/**
 * Single source of truth for the visitor's reduced-motion preference.
 *
 * Wraps Framer Motion's media-query listener so every motion surface in the
 * app (CSS-driven and Three.js-driven) branches on the same boolean.
 */
export function useReducedMotionPreference(): boolean {
  return useReducedMotion() ?? false;
}
