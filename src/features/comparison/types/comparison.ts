import type { Dinosaur } from '@/types';

/** Hard ceiling on compared dinosaurs. The stage is art-directed for three. */
export const MAX_COMPARISON_SPECIMENS = 3;

/** Visual reference height for the human silhouette, in metres. */
export const HUMAN_REFERENCE_HEIGHT_METERS = 1.75;

/** Slot identifiers used by both the URL contract and the UI. */
export const COMPARISON_SLOTS = ['a', 'b', 'c'] as const;
export type ComparisonSlot = (typeof COMPARISON_SLOTS)[number];

/**
 * A resolved comparison entry.
 *
 * `dinosaur: null` represents an intentionally empty slot (the user removed
 * specimen B or C). It is distinct from an *invalid* slug, which is dropped
 * during URL resolution rather than surfaced as an empty slot.
 */
export interface ComparisonEntry {
  slot: ComparisonSlot;
  dinosaur: Dinosaur | null;
}

/** Parsed and validated comparison state, ready to render. */
export interface ComparisonState {
  /** Resolved dinosaurs in slot order, with empty slots omitted. */
  specimens: Dinosaur[];
  /** True when slot C holds a dinosaur. */
  hasThirdSlot: boolean;
  /** Whether the human reference silhouette is shown. */
  showHuman: boolean;
  /** True when at least one URL parameter was rejected during parsing. */
  hadInvalidInput: boolean;
}

/**
 * One body drawn on the stage.
 *
 * All specimens share a single `pixelsPerMeter`, so a body's rendered width is
 * a direct, honest function of its real length. Nothing is fit-to-box.
 */
export interface StagedSpecimen {
  id: string;
  label: string;
  scientificName: string | null;
  /** Rendered width in px, derived from real length × pixelsPerMeter. */
  widthPx: number;
  /** Rendered height in px, derived from real height × pixelsPerMeter. */
  heightPx: number;
  /** Real length in metres, or the human's reference height. */
  lengthMeters: number;
  /** Real shoulder/hip height in metres, when documented. */
  heightMeters: number | null;
  kind: 'dinosaur' | 'human';
  /** Silhouette family, used to pick the drawing. */
  silhouette: SilhouetteKind;
  /** Whether the height figure is a documented value or a visual estimate. */
  heightIsDocumented: boolean;
}

/**
 * Silhouette families.
 *
 * These are deliberately *abstract taxonomic* profiles, not skeletally accurate
 * reconstructions: DinoVerse does not hold per-species silhouette assets, and
 * inventing precise outlines would be dishonest. Each family conveys the
 * animal's gross body plan at the correct scale.
 */
export const SILHOUETTE_KINDS = [
  'theropod',
  'sauropod',
  'ceratopsian',
  'stegosaur',
  'ankylosaur',
  'hadrosaur',
  'ornithomimid',
  'human',
] as const;
export type SilhouetteKind = (typeof SILHOUETTE_KINDS)[number];

/**
 * Describes the visual stage: how many pixels represent one metre, plus the
 * total extent the stage must accommodate.
 */
export interface ComparisonScale {
  pixelsPerMeter: number;
  /** Longest body on the stage, in metres. */
  maxLengthMeters: number;
  /** Tallest body on the stage, in metres. */
  maxHeightMeters: number;
  /** Stage width in px, including all bodies and gutters. */
  stageWidthPx: number;
  /** Stage height in px (ground line to top of tallest body). */
  stageHeightPx: number;
  /** Ruler divisions in metres, chosen to stay human-readable. */
  rulerIntervalMeters: number;
  /** Ruler extent in metres (always a whole multiple of the interval). */
  rulerMaxMeters: number;
  /** True when the stage is wider than the container and needs horizontal scroll. */
  isScrollable: boolean;
}
