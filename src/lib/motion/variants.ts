import type { Variants } from 'framer-motion';
import { motionDistance, motionDurations, motionEasing } from './motionTokens';

/**
 * Route transition pair.
 * Outgoing page lifts 8px and fades; incoming page settles up from 12px.
 * Total ≈ 440ms so navigation still feels immediate.
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: motionDistance.pageEnter },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: motionEasing.museum },
  },
  exit: {
    opacity: 0,
    y: motionDistance.pageExit,
    transition: { duration: 0.16, ease: motionEasing.editorial },
  },
};

/** Reduced-motion route transition: content swaps with no travel or waiting. */
export const instantPageTransition: Variants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0, transition: { duration: 0 } },
  exit: { opacity: 1, y: 0, transition: { duration: 0 } },
};

/**
 * Archival rule draw: a hairline separator drawing left-to-right.
 * One of the signature DinoVerse motions — used sparingly on section rules.
 */
export const archivalRule: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: motionDurations.slow, ease: motionEasing.museum },
  },
};

/** Very short opacity settle used when the interface language changes. */
export const languageSwap: Variants = {
  hidden: { opacity: 0.35 },
  visible: {
    opacity: 1,
    transition: { duration: motionDurations.instant + 0.05, ease: motionEasing.museum },
  },
};
