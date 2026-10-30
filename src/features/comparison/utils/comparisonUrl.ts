import { getDinosaurBySlug } from '@/data/dinosaurs';
import type { Dinosaur } from '@/types';
import {
  COMPARISON_SLOTS,
  MAX_COMPARISON_SPECIMENS,
  type ComparisonSlot,
  type ComparisonState,
} from '../types/comparison';

/** Slugs used when the visitor arrives at /compare with no query parameters. */
export const DEFAULT_COMPARISON_SLUGS: readonly string[] = [
  'tyrannosaurus-rex',
  'velociraptor-mongoliensis',
];

/** The human reference is on by default; `human=0` turns it off. */
const HUMAN_PARAM = 'human';

export interface ParsedComparison {
  state: ComparisonState;
  /** Per-slot slugs after resolution, with invalid/duplicate entries removed. */
  slugs: Partial<Record<ComparisonSlot, string>>;
  /** True when any supplied value failed validation. */
  hadInvalidInput: boolean;
  /** True when no specimen parameters were present at all. */
  hadNoSpecimenParams: boolean;
}

/**
 * Resolves one raw slug to a dinosaur, or null when it is not a real record.
 *
 * Uses the same `getDinosaurBySlug` resolver as the rest of the app, so there
 * is exactly one definition of a valid specimen. No casts, no assumptions.
 */
function resolveSlug(raw: string | null): Dinosaur | null {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  return getDinosaurBySlug(trimmed) ?? null;
}

/**
 * Parses and validates the comparison query string.
 *
 * Contract:
 * - `a`, `b`, `c` hold dinosaur slugs; `human` toggles the reference body.
 * - Invalid slugs are dropped, never rendered, never thrown on.
 * - Duplicates are dropped (a dinosaur can only occupy one slot).
 * - With no specimen params, the documented default comparison is used.
 * - At least one dinosaur is always returned when the archive is non-empty, so
 *   the page can never end up in an empty, unusable state.
 * - Unnecessary params are NOT written back; the URL stays as the visitor
 *   left it.
 */
export function parseComparisonSearchParams(searchParams: URLSearchParams): ParsedComparison {
  let hadInvalidInput = false;

  const rawBySlot = COMPARISON_SLOTS.map((slot) => ({
    slot,
    raw: searchParams.get(slot),
  }));

  const hadNoSpecimenParams = rawBySlot.every((entry) => entry.raw === null);

  const slugs: Partial<Record<ComparisonSlot, string>> = {};
  const specimens: Dinosaur[] = [];
  const seenIds = new Set<string>();

  for (const { slot, raw } of rawBySlot) {
    if (raw === null) {
      continue;
    }

    // An explicitly empty value (`b=`) is treated as a cleared slot, not an
    // error — this is how the remove button round-trips through the URL.
    if (!raw.trim()) {
      continue;
    }

    const dinosaur = resolveSlug(raw);
    if (!dinosaur) {
      hadInvalidInput = true;
      continue;
    }

    if (seenIds.has(dinosaur.id)) {
      // Duplicate slot: drop it rather than showing the same animal twice.
      hadInvalidInput = true;
      continue;
    }

    seenIds.add(dinosaur.id);
    specimens.push(dinosaur);
    slugs[slot] = dinosaur.slug;
  }

  // --- Defaults -----------------------------------------------------------
  if (hadNoSpecimenParams) {
    for (const slug of DEFAULT_COMPARISON_SLUGS.slice(0, MAX_COMPARISON_SPECIMENS)) {
      const dinosaur = resolveSlug(slug);
      if (dinosaur && !seenIds.has(dinosaur.id)) {
        seenIds.add(dinosaur.id);
        specimens.push(dinosaur);
        const freeSlot = COMPARISON_SLOTS[specimens.length - 1];
        if (freeSlot) {
          slugs[freeSlot] = dinosaur.slug;
        }
      }
    }
  }

  // --- Never render an empty gallery --------------------------------------
  // If every supplied slug was invalid, fall back to the default pair so the
  // page remains usable instead of showing a broken stage.
  if (specimens.length === 0) {
    if (!hadNoSpecimenParams) {
      hadInvalidInput = true;
    }
    for (const slug of DEFAULT_COMPARISON_SLUGS.slice(0, MAX_COMPARISON_SPECIMENS)) {
      const dinosaur = resolveSlug(slug);
      if (dinosaur) {
        specimens.push(dinosaur);
        const freeSlot = COMPARISON_SLOTS[specimens.length - 1];
        if (freeSlot) {
          slugs[freeSlot] = dinosaur.slug;
        }
      }
    }
  }

  // --- Human reference ----------------------------------------------------
  // Absent means "on" (the documented default). Only an explicit 0/false/none
  // turns it off.
  const humanParam = searchParams.get(HUMAN_PARAM);
  const showHuman = humanParam === null ? true : !isFalsyFlag(humanParam);

  const hasThirdSlot = specimens.length >= MAX_COMPARISON_SPECIMENS;

  return {
    state: {
      specimens: specimens.slice(0, MAX_COMPARISON_SPECIMENS),
      hasThirdSlot,
      showHuman,
      hadInvalidInput,
    },
    slugs,
    hadInvalidInput,
    hadNoSpecimenParams,
  };
}

/** Recognises the values that mean "human reference off". */
export function isFalsyFlag(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === '0' || normalized === 'false' || normalized === 'off' || normalized === 'no'
  );
}

/**
 * Builds the canonical query object for a comparison.
 *
 * Emission rule, chosen for correctness over brevity:
 * - If the whole comparison IS the documented default, emit nothing, so the
 *   default plate keeps a clean `/compare` URL.
 * - Otherwise emit EVERY occupied slot explicitly.
 *
 * The earlier "omit any value matching the default at that position" approach
 * was wrong: changing only slot C produced `?c=triceratops`, and the parser —
 * which cannot know that a/b were the defaults — then resolved a one-specimen
 * comparison. Partial elision is only safe when the omitted values are
 * recoverable, which they are not here.
 */
export function buildComparisonSearchParams(
  specimens: readonly Dinosaur[],
  showHuman: boolean
): URLSearchParams {
  const params = new URLSearchParams();
  const limited = specimens.slice(0, MAX_COMPARISON_SPECIMENS);

  if (isDefaultComparison(limited, showHuman)) {
    return params;
  }

  COMPARISON_SLOTS.forEach((slot, index) => {
    const dinosaur = limited[index];
    if (dinosaur) {
      params.set(slot, dinosaur.slug);
    }
  });

  // The default is human ON, so only record the deviation.
  if (!showHuman) {
    params.set(HUMAN_PARAM, '0');
  }

  return params;
}

/**
 * True when the comparison matches the documented default, allowing the page
 * to decide whether the URL needs touching at all.
 */
export function isDefaultComparison(specimens: readonly Dinosaur[], showHuman: boolean): boolean {
  if (!showHuman) {
    return false;
  }
  const slugs = specimens.map((dinosaur) => dinosaur.slug);
  if (slugs.length !== DEFAULT_COMPARISON_SLUGS.length) {
    return false;
  }
  return slugs.every((slug, index) => slug === DEFAULT_COMPARISON_SLUGS[index]);
}

/** Convenience: the default specimens resolved from the archive. */
export function getDefaultComparisonSpecimens(): Dinosaur[] {
  return DEFAULT_COMPARISON_SLUGS.map((slug) => resolveSlug(slug)).filter(
    (dinosaur): dinosaur is Dinosaur => dinosaur !== null
  );
}
