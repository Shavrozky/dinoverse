import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dinosaurs, getDinosaurBySlug } from '@/data/dinosaurs';
import type { Dinosaur } from '@/types';
import { MAX_COMPARISON_SPECIMENS, type ComparisonState } from '../types/comparison';
import { buildComparisonSearchParams, parseComparisonSearchParams } from '../utils/comparisonUrl';

export interface UseComparisonReturn {
  state: ComparisonState;
  /** Dinosaurs available to add (excludes ones already compared). */
  availableDinosaurs: Dinosaur[];
  /** Total archive size, for "n of 20" affordances. */
  totalCount: number;
  canAddSpecimen: boolean;
  canRemoveSpecimen: boolean;
  /** Replaces the dinosaur in one slot, or fills the next empty slot. */
  setSlot: (index: number, slug: string) => void;
  /** Appends a dinosaur to the next free slot if there is one. */
  addSpecimen: (slug: string) => void;
  /** Clears a slot. Never removes the last remaining dinosaur. */
  removeSlot: (index: number) => void;
  /** Exchanges two compared dinosaurs. */
  swapSlots: () => void;
  /** Toggles the human reference silhouette. */
  setShowHuman: (show: boolean) => void;
  /** True when the currently compared dinosaur is already in another slot. */
  isSlugInUse: (slug: string) => boolean;
}

/**
 * Comparison state, with the URL as the single source of truth.
 *
 * Deliberately NOT Zustand: comparison selection is view state that must be
 * shareable, deep-linkable and survive refresh + Back/Forward. Zustand stays
 * reserved for app-wide preferences (theme, language, audio, quality).
 *
 * Every mutation writes a canonical query string; the render path re-derives
 * everything from `useSearchParams`. There is no shadow copy to drift.
 */
export function useComparison(): UseComparisonReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const parsed = useMemo(() => parseComparisonSearchParams(searchParams), [searchParams]);
  const { state } = parsed;

  const comparedIds = useMemo(
    () => new Set(state.specimens.map((dinosaur) => dinosaur.id)),
    [state.specimens]
  );

  const availableDinosaurs = useMemo(
    () => dinosaurs.filter((dinosaur) => !comparedIds.has(dinosaur.id)),
    [comparedIds]
  );

  const commit = useCallback(
    (specimens: readonly Dinosaur[], showHuman: boolean) => {
      const params = buildComparisonSearchParams(specimens, showHuman);
      // `replace: false` keeps Back/Forward meaningful: the visitor can step
      // through their own comparison history.
      setSearchParams(params, { replace: false });
    },
    [setSearchParams]
  );

  const setSlot = useCallback(
    (index: number, slug: string) => {
      const dinosaur = getDinosaurBySlug(slug);
      if (!dinosaur) {
        return;
      }

      const current = [...state.specimens];

      // Reject a dinosaur that already occupies a different slot.
      const existingIndex = current.findIndex((entry) => entry.id === dinosaur.id);
      if (existingIndex !== -1 && existingIndex !== index) {
        return;
      }

      if (index < 0 || index >= MAX_COMPARISON_SPECIMENS) {
        return;
      }

      if (index < current.length) {
        current[index] = dinosaur;
      } else if (index === current.length && current.length < MAX_COMPARISON_SPECIMENS) {
        current.push(dinosaur);
      } else {
        return;
      }

      // Removing a specimen via a slot replace could leave a hole; compact.
      commit(
        current.filter((entry): entry is Dinosaur => entry !== null),
        state.showHuman
      );
    },
    [commit, state.showHuman, state.specimens]
  );

  const addSpecimen = useCallback(
    (slug: string) => {
      if (state.specimens.length >= MAX_COMPARISON_SPECIMENS) {
        return;
      }
      setSlot(state.specimens.length, slug);
    },
    [setSlot, state.specimens.length]
  );

  const removeSlot = useCallback(
    (index: number) => {
      // Guard: a comparison must always contain at least one dinosaur.
      if (state.specimens.length <= 1) {
        return;
      }
      if (index < 0 || index >= state.specimens.length) {
        return;
      }

      const next = state.specimens.filter((_, position) => position !== index);
      commit(next, state.showHuman);
    },
    [commit, state.showHuman, state.specimens]
  );

  const swapSlots = useCallback(() => {
    if (state.specimens.length < 2) {
      return;
    }
    const [first, second, ...rest] = state.specimens;
    if (!first || !second) {
      return;
    }
    commit([second, first, ...rest], state.showHuman);
  }, [commit, state.showHuman, state.specimens]);

  const setShowHuman = useCallback(
    (show: boolean) => {
      commit(state.specimens, show);
    },
    [commit, state.specimens]
  );

  const isSlugInUse = useCallback(
    (slug: string) => {
      const dinosaur = getDinosaurBySlug(slug);
      if (!dinosaur) {
        return false;
      }
      return comparedIds.has(dinosaur.id);
    },
    [comparedIds]
  );

  return {
    state,
    availableDinosaurs,
    totalCount: dinosaurs.length,
    canAddSpecimen: state.specimens.length < MAX_COMPARISON_SPECIMENS,
    canRemoveSpecimen: state.specimens.length > 1,
    setSlot,
    addSpecimen,
    removeSlot,
    swapSlots,
    setShowHuman,
    isSlugInUse,
  };
}
