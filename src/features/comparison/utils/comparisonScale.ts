import type { Dinosaur } from '@/types';
import {
  HUMAN_REFERENCE_HEIGHT_METERS,
  type ComparisonScale,
  type SilhouetteKind,
  type StagedSpecimen,
} from '../types/comparison';

/**
 * Clade → silhouette family mapping.
 *
 * Keyed on the canonical `clade` strings present in the dataset. Anything
 * unrecognised falls back to `theropod`, which is the most common body plan in
 * the archive — and, importantly, the fallback is still drawn at the correct
 * scale, so only the *shape* is generic, never the size.
 */
const CLADE_TO_SILHOUETTE: Record<string, SilhouetteKind> = {
  Tyrannosauridae: 'theropod',
  Allosauridae: 'theropod',
  Carnotauridae: 'theropod',
  Spinosauridae: 'theropod',
  Coelophysidae: 'theropod',
  Dilophosauridae: 'theropod',
  Carcharodontosauridae: 'theropod',
  Ceratosauridae: 'theropod',
  Brachiosauridae: 'sauropod',
  Diplodocidae: 'sauropod',
  Antarctosauridae: 'sauropod',
  Cetiosauridae: 'sauropod',
  Ceratopsidae: 'ceratopsian',
  Stegosauridae: 'stegosaur',
  Ankylosauridae: 'ankylosaur',
  Hadrosauridae: 'hadrosaur',
  Iguanodontidae: 'hadrosaur',
  Ornithomimidae: 'ornithomimid',
  Pachycephalosauridae: 'ornithomimid',
  Plateosauridae: 'theropod',
};

/**
 * Resolves the abstract silhouette family for a dinosaur's clade.
 * Unknown clades fall back to the theropod profile; scale is unaffected.
 */
export function getSilhouetteKind(clade: string): SilhouetteKind {
  const direct = CLADE_TO_SILHOUETTE[clade];
  if (direct) {
    return direct;
  }

  const normalized = clade.trim().toLowerCase();
  const match = Object.keys(CLADE_TO_SILHOUETTE).find((key) => key.toLowerCase() === normalized);
  return match ? CLADE_TO_SILHOUETTE[match] : 'theropod';
}

/**
 * Picks a human-readable ruler interval (in metres) for the stage extent.
 *
 * Small comparisons get 1 m divisions; very large ones step up so labels never
 * collide. Always returns a value that divides evenly into a tidy max.
 */
export function getMeasurementInterval(maxMeters: number): number {
  if (!Number.isFinite(maxMeters) || maxMeters <= 0) {
    return 1;
  }
  if (maxMeters <= 4) return 0.5;
  if (maxMeters <= 12) return 1;
  if (maxMeters <= 30) return 2;
  if (maxMeters <= 60) return 5;
  if (maxMeters <= 120) return 10;
  return 20;
}

/**
 * Rounds `maxMeters` up to the next whole multiple of `interval`, so the ruler
 * always closes on a labelled tick rather than a dangling stub.
 */
export function roundUpToInterval(maxMeters: number, interval: number): number {
  if (!Number.isFinite(maxMeters) || maxMeters <= 0 || interval <= 0) {
    return interval > 0 ? interval : 1;
  }
  return Math.ceil(maxMeters / interval) * interval;
}

export interface ScaleInput {
  specimens: readonly Dinosaur[];
  showHuman?: boolean;
  /** Usable width of the stage viewport, in px. */
  availableWidth: number;
  /** Usable height of the stage, in px. */
  availableHeight: number;
  /** Minimum px-per-metre before the stage is allowed to scroll horizontally. */
  minPixelsPerMeter?: number;
}

/** Horizontal breathing room per body, as a fraction of that body's width. */
const BODY_GUTTER_RATIO = 0.12;
/** Space reserved between adjacent bodies, in px. */
const BODY_GAP_PX = 44;
/** Vertical headroom above the tallest body, in px. */
const TOP_HEADROOM_PX = 34;
/** Floor for the stage height, so a small comparison still reads as a gallery. */
const MIN_STAGE_HEIGHT_PX = 260;
/** Floor for px-per-metre so tiny specimens never collapse into specks. */
const DEFAULT_MIN_PX_PER_METER = 14;

/**
 * Derives one honest pixels-per-metre figure for the whole stage.
 *
 * This is the scientific core of the comparison: every body — human included —
 * is multiplied by the SAME factor. Nothing is individually fit to its slot.
 *
 * Strategy:
 * 1. Try to fit everything into the container width.
 * 2. Never let px/m drop below a readability floor; if the honest fit would be
 *    smaller than that floor, keep the floor and let the stage become wider than
 *    the container (the caller enables horizontal scroll). This is the
 *    deliberate trade the brief requires: preserve true scale over fitting.
 * 3. Derive height from the tallest body at that same factor.
 */
export function calculateComparisonScale({
  specimens,
  showHuman = false,
  availableWidth,
  availableHeight,
  minPixelsPerMeter = DEFAULT_MIN_PX_PER_METER,
}: ScaleInput): ComparisonScale {
  const widths = specimens
    .map((dinosaur) => dinosaur.lengthMeters)
    .filter((value) => Number.isFinite(value) && value > 0);

  const heights = specimens
    .map((dinosaur) =>
      typeof dinosaur.heightMeters === 'number' && dinosaur.heightMeters > 0
        ? dinosaur.heightMeters
        : null
    )
    .filter((value): value is number => value !== null);

  if (showHuman) {
    widths.push(HUMAN_REFERENCE_HEIGHT_METERS);
    heights.push(HUMAN_REFERENCE_HEIGHT_METERS);
  }

  const maxLengthMeters = widths.length > 0 ? Math.max(...widths) : 0;
  const maxHeightMeters = heights.length > 0 ? Math.max(...heights) : 0;
  const bodyCount = widths.length;

  const safeWidth = Number.isFinite(availableWidth) && availableWidth > 0 ? availableWidth : 960;
  const safeHeight =
    Number.isFinite(availableHeight) && availableHeight > 0 ? availableHeight : MIN_STAGE_HEIGHT_PX;

  const interval = getMeasurementInterval(maxLengthMeters);
  const rulerMaxMeters = roundUpToInterval(maxLengthMeters, interval);

  // --- 1. Honest fit into the container ---------------------------------
  // Each body occupies its own width plus a proportional gutter; bodies are
  // separated by fixed gaps.
  const gutterFactor = 1 + BODY_GUTTER_RATIO;
  const totalMeterWidth = widths.reduce((sum, value) => sum + value * gutterFactor, 0);
  const totalGapPx = Math.max(0, bodyCount - 1) * BODY_GAP_PX;

  const fitByWidth =
    totalMeterWidth > 0 ? (safeWidth - totalGapPx - 24) / totalMeterWidth : minPixelsPerMeter;

  // Height must also accommodate the tallest body plus headroom.
  const verticalBudget = safeHeight - TOP_HEADROOM_PX;
  const fitByHeight = maxHeightMeters > 0 ? verticalBudget / maxHeightMeters : fitByWidth;

  // The tighter constraint wins so nothing is cropped.
  const honestFit = Math.min(fitByWidth, fitByHeight);

  // --- 2. Readability floor ---------------------------------------------
  // Below the floor the animals become indistinguishable, which defeats the
  // point of a true-scale stage. Prefer scrolling over shrinking.
  const pixelsPerMeter = Math.max(honestFit, minPixelsPerMeter);

  // --- 3. Resulting extent ----------------------------------------------
  const renderedBodyWidths = widths.map((value) => value * gutterFactor * pixelsPerMeter);
  const totalRenderedWidth =
    renderedBodyWidths.reduce((sum, value) => sum + value, 0) + totalGapPx + 24;

  const stageWidthPx = Math.max(totalRenderedWidth, rulerMaxMeters * pixelsPerMeter + 24);
  const stageHeightPx = Math.max(
    maxHeightMeters * pixelsPerMeter + TOP_HEADROOM_PX,
    MIN_STAGE_HEIGHT_PX
  );

  return {
    pixelsPerMeter,
    maxLengthMeters,
    maxHeightMeters,
    stageWidthPx: Math.ceil(stageWidthPx),
    stageHeightPx: Math.ceil(stageHeightPx),
    rulerIntervalMeters: interval,
    rulerMaxMeters,
    isScrollable: stageWidthPx > safeWidth + 1,
  };
}

/**
 * Builds the ordered list of bodies to draw on the stage.
 *
 * Ordering is intentional and stable: dinosaurs largest-first so the eye reads
 * the hierarchy immediately, with the human always last (it is a reference
 * object, not a specimen).
 *
 * A dinosaur with no documented height still gets a staged height — derived
 * from its length by a constant ratio — but it is flagged as undocumented so
 * the UI can render the metric as "not documented" rather than implying the
 * derived figure is data.
 */
export function buildStagedSpecimens(
  specimens: readonly Dinosaur[],
  pixelsPerMeter: number,
  showHuman: boolean
): StagedSpecimen[] {
  const ordered = [...specimens].sort((a, b) => b.lengthMeters - a.lengthMeters);

  const staged: StagedSpecimen[] = ordered.map((dinosaur) => {
    const documentedHeight =
      typeof dinosaur.heightMeters === 'number' && dinosaur.heightMeters > 0
        ? dinosaur.heightMeters
        : null;

    // Visual-only fallback for drawing; never shown as a measurement.
    const drawingHeight = documentedHeight ?? dinosaur.lengthMeters * 0.3;

    return {
      id: dinosaur.id,
      label: dinosaur.name,
      scientificName: dinosaur.scientificName,
      widthPx: dinosaur.lengthMeters * pixelsPerMeter,
      heightPx: drawingHeight * pixelsPerMeter,
      lengthMeters: dinosaur.lengthMeters,
      heightMeters: documentedHeight,
      kind: 'dinosaur' as const,
      silhouette: getSilhouetteKind(dinosaur.clade),
      heightIsDocumented: documentedHeight !== null,
    };
  });

  if (showHuman) {
    staged.push({
      id: 'human-reference',
      label: 'Human',
      scientificName: null,
      widthPx: HUMAN_REFERENCE_HEIGHT_METERS * pixelsPerMeter * 0.32,
      heightPx: HUMAN_REFERENCE_HEIGHT_METERS * pixelsPerMeter,
      lengthMeters: HUMAN_REFERENCE_HEIGHT_METERS,
      heightMeters: HUMAN_REFERENCE_HEIGHT_METERS,
      kind: 'human',
      silhouette: 'human',
      heightIsDocumented: true,
    });
  }

  return staged;
}

/** Generates the ruler tick positions in metres, from 0 to `rulerMaxMeters`. */
export function buildRulerTicks(scale: ComparisonScale): number[] {
  const ticks: number[] = [];
  const { rulerIntervalMeters, rulerMaxMeters } = scale;
  if (rulerIntervalMeters <= 0) {
    return [0];
  }

  for (let value = 0; value <= rulerMaxMeters + 1e-9; value += rulerIntervalMeters) {
    ticks.push(Math.round(value * 100) / 100);
  }
  return ticks;
}
