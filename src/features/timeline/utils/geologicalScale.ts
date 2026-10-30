import { geologicalPeriods, type PeriodInfo } from '@/data/periods';
import type { Dinosaur, GeologicalPeriod } from '@/types';
import {
  MESOZOIC_OLDEST_MYA,
  MESOZOIC_YOUNGEST_MYA,
  MIN_PIXELS_PER_MYR,
  type SpeciesRangeEntry,
  type TimelineGeometry,
} from '../types/timeline';

export function clampMya(mya: number): number {
  if (!Number.isFinite(mya)) {
    return MESOZOIC_OLDEST_MYA;
  }
  return Math.min(MESOZOIC_OLDEST_MYA, Math.max(MESOZOIC_YOUNGEST_MYA, mya));
}

export function myaToTimelinePercent(
  mya: number,
  oldest: number = MESOZOIC_OLDEST_MYA,
  youngest: number = MESOZOIC_YOUNGEST_MYA
): number {
  const span = oldest - youngest;
  if (span <= 0) {
    return 0;
  }
  const clamped = Math.min(oldest, Math.max(youngest, mya));
  return ((oldest - clamped) / span) * 100;
}

/** Percentage along the axis → million years ago. Inverse of the above. */
export function timelinePercentToMya(
  percent: number,
  oldest: number = MESOZOIC_OLDEST_MYA,
  youngest: number = MESOZOIC_YOUNGEST_MYA
): number {
  const span = oldest - youngest;
  if (span <= 0 || !Number.isFinite(percent)) {
    return oldest;
  }
  const clamped = Math.min(100, Math.max(0, percent));
  return oldest - (clamped / 100) * span;
}

/**
 * Resolves the geological period containing a given time.
 *
 * Boundaries follow the ICS convention: a boundary belongs to the BASE of the
 * younger unit, so 201 Mya is Jurassic (not Triassic) and 145 Mya is Cretaceous
 * (not Jurassic). Each period therefore spans `startMya` (exclusive) down to and
 * including `endMya`. Resolving the other way would put the Triassic/Jurassic
 * boundary in the Triassic, which contradicts how the GSSP is defined.
 *
 * The outermost bounds are inclusive: 252 → Triassic, 66 → Cretaceous.
 * Tested explicitly at 252, 201, 145 and 66.
 */
export function getPeriodAtMya(mya: number): PeriodInfo | null {
  if (!Number.isFinite(mya)) {
    return null;
  }

  // Outermost bounds are inclusive; interior boundaries resolve to the older
  // period, which is the convention used by the canonical period data.
  if (mya > MESOZOIC_OLDEST_MYA || mya < MESOZOIC_YOUNGEST_MYA) {
    return null;
  }

  for (const period of geologicalPeriods) {
    if (mya <= period.startMya && mya > period.endMya) {
      return period;
    }
  }

  // Exactly at the youngest boundary (66 Mya) — the Cretaceous terminus.
  const last = geologicalPeriods[geologicalPeriods.length - 1];
  if (mya === last?.endMya) {
    return last;
  }

  return null;
}

/** Convenience: the period id at a time, or null outside the Mesozoic. */
export function getPeriodIdAtMya(mya: number): GeologicalPeriod | null {
  return getPeriodAtMya(mya)?.id ?? null;
}

/**
 * True when a species' represented range contains the given time.
 *
 * `livedFromMya` is the OLDER bound and `livedToMya` the YOUNGER one, so the
 * comparison is `mya <= livedFromMya && mya >= livedToMya`. Reversing it would
 * silently invert the entire exhibit.
 */
export function isDinosaurAliveAt(dinosaur: Dinosaur, mya: number): boolean {
  if (
    !Number.isFinite(mya) ||
    !Number.isFinite(dinosaur.livedFromMya) ||
    !Number.isFinite(dinosaur.livedToMya)
  ) {
    return false;
  }
  const oldest = Math.max(dinosaur.livedFromMya, dinosaur.livedToMya);
  const youngest = Math.min(dinosaur.livedFromMya, dinosaur.livedToMya);
  return mya <= oldest && mya >= youngest;
}

/** All species whose represented range contains `mya`. */
export function getDinosaursAliveAt(dinosaurs: readonly Dinosaur[], mya: number): Dinosaur[] {
  return dinosaurs.filter((dinosaur) => isDinosaurAliveAt(dinosaur, mya));
}

/**
 * Projects a species range into percentages along the shared axis.
 *
 * Width uses `livedFromMya - livedToMya` directly (the true span), never an
 * absolute difference of a sorted pair — a 2 Myr range must render as a 2 Myr
 * sliver, not as a typical-width bar.
 */
export function toRangeSegment(
  dinosaur: Dinosaur
): Pick<SpeciesRangeEntry, 'startPercent' | 'widthPercent'> {
  if (!Number.isFinite(dinosaur.livedFromMya) || !Number.isFinite(dinosaur.livedToMya)) {
    return { startPercent: 0, widthPercent: 0 };
  }
  const fromPercent = myaToTimelinePercent(dinosaur.livedFromMya);
  const toPercent = myaToTimelinePercent(dinosaur.livedToMya);
  // Older bound maps to the smaller percentage, so this is already left→right.
  const startPercent = Math.min(fromPercent, toPercent);
  const widthPercent = Math.abs(toPercent - fromPercent);
  return { startPercent, widthPercent };
}

/** Species ordered oldest-first (earliest appearance), ties broken by name. */
export function sortSpeciesByFirstAppearance(dinosaurs: readonly Dinosaur[]): Dinosaur[] {
  return [...dinosaurs].sort((a, b) => {
    // Higher livedFromMya = appeared earlier.
    if (b.livedFromMya !== a.livedFromMya) {
      return b.livedFromMya - a.livedFromMya;
    }
    return a.scientificName.localeCompare(b.scientificName);
  });
}

/**
 * Chooses a human-readable tick interval for the axis.
 *
 * Target: roughly 8–12 labelled ticks across the span.
 */
export function getAxisTickInterval(totalMyr: number): number {
  if (!Number.isFinite(totalMyr) || totalMyr <= 0) {
    return 25;
  }
  const candidates = [5, 10, 25, 50, 100];
  const target = totalMyr / 10;
  return candidates.find((step) => step >= target) ?? 100;
}

/** Axis ticks, oldest to youngest, aligned to clean intervals. */
export function buildAxisTicks(totalMyr: number): number[] {
  const interval = getAxisTickInterval(totalMyr);
  const ticks: number[] = [];
  for (let mya = MESOZOIC_OLDEST_MYA; mya >= MESOZOIC_YOUNGEST_MYA; mya -= interval) {
    ticks.push(mya);
  }
  // Ensure the youngest boundary is always labelled.
  if (ticks[ticks.length - 1] !== MESOZOIC_YOUNGEST_MYA) {
    ticks.push(MESOZOIC_YOUNGEST_MYA);
  }
  return ticks;
}

/**
 * Computes the axis geometry for the available width.
 *
 * Honours the readability floor first: if the container is too narrow to reach
 * `MIN_PIXELS_PER_MYR`, the plot keeps that density and grows wider than the
 * viewport (the caller makes it scroll). Geology is never compressed to fit.
 */
export function calculateTimelineGeometry(availableWidth: number): TimelineGeometry {
  const totalMyr = MESOZOIC_OLDEST_MYA - MESOZOIC_YOUNGEST_MYA;
  const width = Number.isFinite(availableWidth) && availableWidth > 0 ? availableWidth : 0;
  const naive = width / totalMyr;
  const pixelsPerMyr = Math.max(MIN_PIXELS_PER_MYR, naive);
  const plotWidthPx = Math.round(pixelsPerMyr * totalMyr);

  return {
    pixelsPerMyr,
    plotWidthPx,
    isScrollable: plotWidthPx > width + 1,
    ticks: buildAxisTicks(totalMyr),
  };
}
