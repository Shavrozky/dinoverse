import { dinosaurs } from '@/data/dinosaurs';
import { geologicalPeriods } from '@/data/periods';
import { GEOLOGICAL_PERIODS } from '@/types';
import type { Dinosaur, GeologicalPeriod } from '@/types';
import { MESOZOIC_YOUNGEST_MYA, type TimelineState } from '../types/timeline';
import { clampMya } from './geologicalScale';

export const TIME_PARAM = 'time';
export const PERIOD_PARAM = 'period';

/** Default cursor position: the Mesozoic's youngest boundary. */
export const DEFAULT_TIMELINE_MYA = MESOZOIC_YOUNGEST_MYA;

export interface ParsedTimelineParams {
  state: TimelineState;
  /** True when a `time` value was supplied but unusable (e.g. `banana`). */
  hadInvalidTime: boolean;
  /** True when the value was numeric but outside the Mesozoic and got clamped. */
  wasClamped: boolean;
}

function toPeriod(value: string): GeologicalPeriod | null {
  const normalised = value.trim().toLowerCase();
  return (GEOLOGICAL_PERIODS as readonly string[]).includes(normalised)
    ? (normalised as GeologicalPeriod)
    : null;
}

/** Midpoint of a canonical period. */
export function getPeriodMidpointMya(period: GeologicalPeriod): number | null {
  const info = geologicalPeriods.find((entry) => entry.id === period);
  return info ? Math.round((info.startMya + info.endMya) / 2) : null;
}

/**
 * A time inside `period` where specimens from that period actually existed.
 *
 * The period's geometric midpoint is NOT usable for this: the Jurassic's
 * midpoint (173 Mya) falls in the gap between Dilophosaurus (193–183) and the
 * 155–145 specimens, so focusing there would list five Jurassic rows that are
 * all inactive. The median of the period's own specimen midpoints always lands
 * on a moment the collection genuinely covers.
 */
export function getPeriodFocusMya(period: GeologicalPeriod): number | null {
  const info = geologicalPeriods.find((entry) => entry.id === period);
  if (!info) {
    return null;
  }

  const midpoints = dinosaurs
    .filter((dinosaur) => dinosaur.period === period)
    .map((dinosaur) => (dinosaur.livedFromMya + dinosaur.livedToMya) / 2)
    .sort((a, b) => a - b);

  if (midpoints.length === 0) {
    return Math.round((info.startMya + info.endMya) / 2);
  }

  const median = midpoints[Math.floor(midpoints.length / 2)] as number;
  const rounded = Math.round(median);
  // Clamp defensively so the result is always a valid member of the period.
  return Math.min(info.startMya - 1, Math.max(info.endMya, rounded));
}

/**
 * Parses and validates timeline query parameters.
 *
 * Contract:
 * - `time` accepts a finite number of MYA. Non-numeric input falls back to the
 *   default cursor and flags `hadInvalidTime`, so the UI can say so.
 * - Numeric but out-of-range input is CLAMPED to 252–66 and flagged: a visitor
 *   linking `?time=999` means "the far end", not "broken".
 * - `period` accepts only a canonical id; anything else is ignored.
 * - A filter without an explicit time FOCUSES the cursor on that period, so the
 *   listed rows and the inspector can never contradict each other.
 */
export function parseTimelineSearchParams(params: URLSearchParams): ParsedTimelineParams {
  const rawTime = params.get(TIME_PARAM);
  const rawPeriod = params.get(PERIOD_PARAM);

  let mya = DEFAULT_TIMELINE_MYA;
  let hadInvalidTime = false;
  let wasClamped = false;

  if (rawTime !== null) {
    const trimmed = rawTime.trim();
    const parsed = Number(trimmed);

    if (trimmed === '' || !Number.isFinite(parsed)) {
      hadInvalidTime = true;
    } else {
      mya = clampMya(parsed);
      wasClamped = mya !== parsed;
    }
  }

  const period = rawPeriod !== null ? toPeriod(rawPeriod) : null;

  if (period !== null && rawTime === null) {
    const focus = getPeriodFocusMya(period);
    if (focus !== null) {
      mya = focus;
    }
  }

  return { state: { mya, period }, hadInvalidTime, wasClamped };
}

/**
 * Builds the canonical query string.
 *
 * Emits nothing when the state matches the documented default, so the pristine
 * timeline keeps a bare `/timeline` URL. Otherwise every meaningful param is
 * written explicitly — partial elision is unsafe here for the same reason it
 * was on the comparison page.
 */
export function buildTimelineSearchParams(state: TimelineState): URLSearchParams {
  const params = new URLSearchParams();

  // Round to a tenth of a Myr: sub-100-kyr cursor precision is false precision
  // across a 186-Myr axis and would make every URL unique and ugly.
  const rounded = Math.round(state.mya * 10) / 10;

  if (rounded !== DEFAULT_TIMELINE_MYA) {
    params.set(TIME_PARAM, String(rounded));
  }
  if (state.period !== null) {
    params.set(PERIOD_PARAM, state.period);
  }

  return params;
}

/** Convenience for building links to a timeline state. */
export function timelineHref(state: Partial<TimelineState>): string {
  const params = buildTimelineSearchParams({
    mya: state.mya ?? DEFAULT_TIMELINE_MYA,
    period: state.period ?? null,
  });
  const query = params.toString();
  return query ? `/timeline?${query}` : '/timeline';
}

/**
 * Sensible navigation target for a species: the midpoint of its represented
 * range. A navigation convenience only — never presented as a factual date.
 */
export function getRepresentedMidpointMya(dinosaur: Dinosaur): number {
  return Math.round(((dinosaur.livedFromMya + dinosaur.livedToMya) / 2) * 10) / 10;
}
