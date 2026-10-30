import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dinosaurs } from '@/data/dinosaurs';
import type { Dinosaur, GeologicalPeriod } from '@/types';
import {
  CURSOR_COARSE_STEP_MYR,
  CURSOR_STEP_MYR,
  type SpeciesRangeEntry,
  type TimelineState,
} from '../types/timeline';
import {
  clampMya,
  getDinosaursAliveAt,
  getPeriodAtMya,
  isDinosaurAliveAt,
  sortSpeciesByFirstAppearance,
  timelinePercentToMya,
  toRangeSegment,
} from '../utils/geologicalScale';
import {
  DEFAULT_TIMELINE_MYA,
  buildTimelineSearchParams,
  getPeriodFocusMya,
  parseTimelineSearchParams,
} from '../utils/timelineUrl';

export interface UseGeologicalTimelineResult {
  state: TimelineState;
  hadInvalidTime: boolean;
  wasClamped: boolean;
  activePeriod: ReturnType<typeof getPeriodAtMya>;
  /** Whole collection, oldest appearance first. */
  species: Dinosaur[];
  /**
   * Rows listed under the active period filter. Range BARS always keep true
   * coordinates — the filter narrows the list, never the geology.
   */
  visibleSpecies: Dinosaur[];
  /** Species alive at the selected time, from the unfiltered collection. */
  activeSpecies: Dinosaur[];
  activeCount: number;
  setTime: (mya: number) => void;
  stepTime: (direction: -1 | 1, coarse?: boolean) => void;
  setPeriod: (period: GeologicalPeriod | null) => void;
  reset: () => void;
}

/**
 * Timeline state, backed by the URL.
 *
 * Selection lives in search params (never Zustand) so a moment in geological
 * time is shareable, survives refresh, and answers Back/Forward. The collection
 * is projected per state change; at ~20 records that is trivially cheap, so no
 * virtualization and no canvas.
 */
export function useGeologicalTimeline(): UseGeologicalTimelineResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const { state, hadInvalidTime, wasClamped } = useMemo(
    () => parseTimelineSearchParams(searchParams),
    [searchParams]
  );

  const commit = useCallback(
    (next: TimelineState) => setSearchParams(buildTimelineSearchParams(next), { replace: true }),
    [setSearchParams]
  );

  const setTime = useCallback(
    (mya: number) => commit({ mya: clampMya(mya), period: state.period }),
    [commit, state.period]
  );

  const stepTime = useCallback(
    (direction: -1 | 1, coarse = false) => {
      const step = coarse ? CURSOR_COARSE_STEP_MYR : CURSOR_STEP_MYR;
      // +1 walks toward the present; MYA decreases as time advances.
      setTime(state.mya - direction * step);
    },
    [setTime, state.mya]
  );

  const setPeriod = useCallback(
    (period: GeologicalPeriod | null) => {
      // Selecting a period must produce a coherent state: if the cursor sits
      // outside it (or in a gap between that period's specimens), every listed
      // row would be permanently inactive while the inspector shows species
      // from elsewhere. Focus the cursor on a moment the period actually covers.
      if (period !== null) {
        const insidePeriod = getPeriodAtMya(state.mya)?.id === period;
        const hasActive = dinosaurs.some(
          (dinosaur) => dinosaur.period === period && isDinosaurAliveAt(dinosaur, state.mya)
        );
        if (!insidePeriod || !hasActive) {
          const focus = getPeriodFocusMya(period);
          commit({ mya: focus ?? state.mya, period });
          return;
        }
      }
      commit({ mya: state.mya, period });
    },
    [commit, state.mya]
  );

  const reset = useCallback(() => commit({ mya: DEFAULT_TIMELINE_MYA, period: null }), [commit]);

  const species = useMemo(() => sortSpeciesByFirstAppearance(dinosaurs), []);

  const visibleSpecies = useMemo(
    () =>
      state.period === null
        ? species
        : species.filter((dinosaur) => dinosaur.period === state.period),
    [species, state.period]
  );

  const activeSpecies = useMemo(
    () => getDinosaursAliveAt(species, state.mya),
    [species, state.mya]
  );

  const activePeriod = useMemo(() => getPeriodAtMya(state.mya), [state.mya]);

  return {
    state,
    hadInvalidTime,
    wasClamped,
    activePeriod,
    species,
    visibleSpecies,
    activeSpecies,
    activeCount: activeSpecies.length,
    setTime,
    stepTime,
    setPeriod,
    reset,
  };
}

/** Projects species into timeline coordinates. Pure derivation, no state. */
export function toSpeciesEntries(species: readonly Dinosaur[], mya: number): SpeciesRangeEntry[] {
  return species.map((dinosaur) => ({
    dinosaur,
    ...toRangeSegment(dinosaur),
    isActive: isDinosaurAliveAt(dinosaur, mya),
  }));
}

/**
 * Pointer scrubbing for the timeline.
 *
 * Pointer Events only (no mouse-only path), with pointer capture so a drag that
 * leaves the plot keeps tracking — which is what makes touch dragging feel
 * correct. The cursor follows the pointer 1:1 with no easing, because scrub
 * latency matters more than cinematic motion here.
 */
export function useTimelineScrub(
  onScrub: (mya: number) => void,
  elementRef: React.RefObject<HTMLElement | null>
) {
  const draggingRef = useRef(false);

  const myaFromClientX = useCallback(
    (clientX: number): number | null => {
      const node = elementRef.current;
      if (!node) {
        return null;
      }
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0) {
        return null;
      }
      const percent = ((clientX - rect.left) / rect.width) * 100;
      return timelinePercentToMya(percent);
    },
    [elementRef]
  );

  const begin = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) {
        return;
      }
      draggingRef.current = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const mya = myaFromClientX(event.clientX);
      if (mya !== null) {
        onScrub(mya);
      }
    },
    [myaFromClientX, onScrub]
  );

  const move = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!draggingRef.current) {
        return;
      }
      const mya = myaFromClientX(event.clientX);
      if (mya !== null) {
        onScrub(mya);
      }
    },
    [myaFromClientX, onScrub]
  );

  const end = useCallback((event: React.PointerEvent<HTMLElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return { begin, move, end };
}
