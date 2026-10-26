import type { FC } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/hooks';
import { motionDistance, motionDurations, motionEasing } from '@/lib/motion';

/**
 * Route transition boundary.
 *
 * Sits inside the router's layout route, so routing architecture, lazy loading
 * and the single <Outlet /> tree are untouched: this only decides how the
 * already-resolved outlet element is presented.
 *
 * Deliberately ENTER-ONLY, keyed on the location.
 *
 * An AnimatePresence exit cross-fade was tried first and rejected: under
 * React 18 StrictMode with a Suspense boundary, the exiting page was never
 * unmounted, so consecutive navigations stacked full page trees in the DOM
 * (4 <h1>s, tripled document height, duplicated content for screen readers).
 * A keyed enter-only transition cannot leave ghosts — the previous page is
 * unmounted by React in the same commit — and it adds zero delay before the
 * new page appears, which is what the motion brief requires.
 *
 * Language and theme changes do not alter the location key, so they never
 * re-run this entrance.
 */
export const RouteTransition: FC = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const prefersReducedMotion = useReducedMotionPreference();

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: motionDurations.normal, ease: motionEasing.museum };

  return (
    <motion.div
      key={location.pathname}
      initial={prefersReducedMotion ? false : { opacity: 0, y: motionDistance.pageEnter }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      {outlet}
    </motion.div>
  );
};
