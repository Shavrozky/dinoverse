import type { BezierDefinition, Transition } from 'framer-motion';

/**
 * DinoVerse Motion Tokens
 *
 * The single source of truth for the exhibition motion language.
 * Motion must read as "a museum exhibition slowly revealing itself":
 * heavy, deliberate, editorial — never flashy or game-like.
 *
 * Rules encoded here:
 * - No spring overshoot, bounce, spin or large zoom. Easing is always a
 *   decelerating bezier so elements settle rather than arrive.
 * - Durations stay short enough that navigation never feels delayed.
 * - Everything has a reduced-motion escape hatch (duration 0, delay 0).
 */

export const motionDurations = {
  /** Micro feedback: hover, focus, control state. */
  instant: 0.15,
  /** Fast UI response: nav, toggles, small state changes. */
  fast: 0.25,
  /** Standard content transition: page enter, card reveal. */
  normal: 0.45,
  /** Editorial reveal: section entrances, archival rules. */
  slow: 0.8,
  /** Signature hero reveal window. */
  cinematic: 1.2,
} as const;

/**
 * Decelerating beziers only.
 * `museum` is the signature DinoVerse curve (weighty, no overshoot).
 * `editorial` is slightly snappier, used for small elements and exits.
 */
export const motionEasing: Record<'museum' | 'editorial', BezierDefinition> = {
  museum: [0.22, 1, 0.36, 1],
  editorial: [0.16, 1, 0.3, 1],
};

/** Travel distances in px. Kept small so nothing appears to "fly" in. */
export const motionDistance = {
  micro: 8,
  settle: 16,
  reveal: 24,
  pageEnter: 12,
  pageExit: -8,
} as const;

/** Stagger steps in seconds. */
export const motionStagger = {
  tight: 0.06,
  normal: 0.09,
  wide: 0.12,
} as const;

/** Scroll reveal: reveal once, when a meaningful portion is visible. */
export const revealViewport = { once: true, amount: 0.2 } as const;

/**
 * Homepage hero entrance timeline (seconds).
 * Background paint is already visible at 0; the specimen lighting begins
 * shortly after the editorial column so the eye lands on type first.
 */
export const heroTimeline = {
  badge: 0.15,
  eyebrow: 0.3,
  title: 0.45,
  description: 0.7,
  actions: 0.9,
  stats: 1.05,
  specimen: 1.05,
  scene: 0.4,
} as const;

/** Delay before the 3D exhibit lighting begins its ramp. */
export const sceneRevealDelay = 0.38;

/** Build a Framer Motion transition from the token system. */
export function motionTransition(
  duration: number,
  delay = 0,
  reducedMotion = false
): Transition {
  if (reducedMotion) {
    return { duration: 0, delay: 0 };
  }

  return { duration, delay, ease: motionEasing.museum };
}

/**
 * Stagger delay for an item at `index`.
 * Capped so a long grid never makes the visitor wait: the sixth item and
 * everything after it starts together.
 */
export function staggerDelay(
  index: number,
  step: number = motionStagger.normal,
  maxIndex = 5
): number {
  return Math.min(Math.max(index, 0), maxIndex) * step;
}
