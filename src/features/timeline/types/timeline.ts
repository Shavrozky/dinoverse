import type { Dinosaur } from '@/types';

/** Absolute bounds of the Mesozoic window this timeline represents, in MYA. */
export const MESOZOIC_OLDEST_MYA = 252;
export const MESOZOIC_YOUNGEST_MYA = 66;

/** The K–Pg boundary that closes the Mesozoic. */
export const KPg_BOUNDARY_MYA = 66;

/**
 * Readability floor for the plotting area, in pixels per million years.
 *
 * The shortest range in the collection is 2 Myr (T. rex, 68–66). At anything
 * below ~8 px/Myr that bar collapses into an invisible sliver and the whole
 * point of the exhibit — "these animals did not all live at the same time" —
 * is lost. When the container cannot honour this floor the plot scrolls
 * horizontally rather than compressing the geology. True coordinates are never
 * distorted to fit.
 */
export const MIN_PIXELS_PER_MYR = 9;

/** Keyboard step, in million years, for a single arrow press. */
export const CURSOR_STEP_MYR = 1;
/** Keyboard step with Shift held — jumps a period-scale distance. */
export const CURSOR_COARSE_STEP_MYR = 10;

/** Valid zoom levels. Only `mesozoic` is exposed in the UI today. */
export const TIMELINE_ZOOMS = ['mesozoic', 'period'] as const;
export type TimelineZoom = (typeof TIMELINE_ZOOMS)[number];

/** A dinosaur with its range pre-projected into timeline coordinates. */
export interface SpeciesRangeEntry {
  dinosaur: Dinosaur;
  /** Percentage from the left (oldest) edge. */
  startPercent: number;
  /** Percentage width of the range bar. */
  widthPercent: number;
  /** True if the cursor's time falls inside this species' range. */
  isActive: boolean;
}

/** Result of projecting the whole axis into pixels. */
export interface TimelineGeometry {
  /** Pixels per million years actually used. */
  pixelsPerMyr: number;
  /** Width of the plotting area, in px. */
  plotWidthPx: number;
  /** True when the plot exceeds the viewport and must scroll. */
  isScrollable: boolean;
  /** Axis tick positions in MYA, oldest first. */
  ticks: number[];
}

/** Parsed, validated timeline state. */
export interface TimelineState {
  /** Selected time, in million years ago. Always inside the Mesozoic bounds. */
  mya: number;
  /** Selected period filter, or null for the whole Mesozoic. */
  period: Dinosaur['period'] | null;
}
