import type { Dinosaur } from '@/types';

/**
 * Ratio helpers for the comparison insights.
 *
 * Every function returns `null` rather than a fabricated number when the
 * required canonical measurements are missing — the UI then omits the sentence
 * entirely instead of inventing a comparison.
 */

/** Length ratio of `a` to `b`, or null if either length is unusable. */
export function getLengthRatio(a: Dinosaur, b: Dinosaur): number | null {
  if (!isPositive(a.lengthMeters) || !isPositive(b.lengthMeters)) {
    return null;
  }
  return a.lengthMeters / b.lengthMeters;
}

/** Mass ratio of `a` to `b`, or null if either mass is undocumented. */
export function getMassRatio(a: Dinosaur, b: Dinosaur): number | null {
  if (!isPositive(a.weightKg) || !isPositive(b.weightKg)) {
    return null;
  }
  return a.weightKg / b.weightKg;
}

/** Height ratio of `a` to `b`, or null if either height is undocumented. */
export function getHeightRatio(a: Dinosaur, b: Dinosaur): number | null {
  if (!isPositive(a.heightMeters) || !isPositive(b.heightMeters)) {
    return null;
  }
  return a.heightMeters / b.heightMeters;
}

/**
 * The longest specimen. Ties resolve to the first in the provided order so the
 * result is stable and not dependent on sort internals.
 */
export function getLargestSpecimen(specimens: readonly Dinosaur[]): Dinosaur | null {
  let best: Dinosaur | null = null;
  for (const dinosaur of specimens) {
    if (!isPositive(dinosaur.lengthMeters)) {
      continue;
    }
    if (best === null || dinosaur.lengthMeters > best.lengthMeters) {
      best = dinosaur;
    }
  }
  return best;
}

/** The shortest specimen; ties resolve to the first in order. */
export function getSmallestSpecimen(specimens: readonly Dinosaur[]): Dinosaur | null {
  let best: Dinosaur | null = null;
  for (const dinosaur of specimens) {
    if (!isPositive(dinosaur.lengthMeters)) {
      continue;
    }
    if (best === null || dinosaur.lengthMeters < best.lengthMeters) {
      best = dinosaur;
    }
  }
  return best;
}

/** The heaviest specimen with a documented mass. */
export function getHeaviestSpecimen(specimens: readonly Dinosaur[]): Dinosaur | null {
  let best: Dinosaur | null = null;
  for (const dinosaur of specimens) {
    if (!isPositive(dinosaur.weightKg)) {
      continue;
    }
    if (best === null || dinosaur.weightKg > (best.weightKg ?? 0)) {
      best = dinosaur;
    }
  }
  return best;
}

/**
 * Rounds a ratio to one decimal place for display.
 *
 * Ratios below 10 keep one decimal (6.2×); larger ratios are shown as whole
 * numbers to avoid implying false precision about estimates.
 */
export function formatRatio(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return '—';
  }
  if (ratio >= 100) {
    return String(Math.round(ratio));
  }
  if (ratio >= 10) {
    return String(Math.round(ratio * 10) / 10);
  }
  return String(Math.round(ratio * 10) / 10);
}

/**
 * Returns the ordered (larger, smaller) pair for a "X vs Y" insight, so the
 * generated sentence always reads from the bigger animal to the smaller one.
 */
export function orderByLength(a: Dinosaur, b: Dinosaur): [Dinosaur, Dinosaur] {
  return a.lengthMeters >= b.lengthMeters ? [a, b] : [b, a];
}

function isPositive(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}
