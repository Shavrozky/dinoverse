import type { Dinosaur } from '@/types';
import {
  DEFAULT_DINOSAUR_FILTERS,
  DEFAULT_SORT_OPTION,
  isDinosaurDiet,
  isDinosaurSortOption,
  isGeologicalPeriod,
  type DinosaurFilterState,
} from '../types';
import { matchesDinosaurSearch } from './searchDinosaurs';
import { sortDinosaurs } from './sortDinosaurs';

/**
 * Pure function that filters and sorts a dinosaur collection according to active filter criteria.
 */
export function filterDinosaurs(
  dinosaurs: readonly Dinosaur[],
  filters: Partial<DinosaurFilterState>
): Dinosaur[] {
  const mergedFilters: DinosaurFilterState = {
    ...DEFAULT_DINOSAUR_FILTERS,
    ...filters,
  };

  const filtered = dinosaurs.filter((dinosaur) => {
    if (mergedFilters.period !== 'all' && dinosaur.period !== mergedFilters.period) {
      return false;
    }

    if (mergedFilters.diet !== 'all' && dinosaur.diet !== mergedFilters.diet) {
      return false;
    }

    if (mergedFilters.search && !matchesDinosaurSearch(dinosaur, mergedFilters.search)) {
      return false;
    }

    return true;
  });

  return sortDinosaurs(filtered, mergedFilters.sort);
}

/**
 * Safely parses and validates dinosaur filter parameters from URLSearchParams.
 */
export function parseDinosaurFiltersFromSearchParams(
  searchParams: URLSearchParams
): DinosaurFilterState {
  const rawQuery = searchParams.get('q') ?? '';
  const rawPeriod = searchParams.get('period')?.toLowerCase();
  const rawDiet = searchParams.get('diet')?.toLowerCase();
  const rawSort = searchParams.get('sort')?.toLowerCase();

  return {
    search: rawQuery,
    period: isGeologicalPeriod(rawPeriod) ? rawPeriod : 'all',
    diet: isDinosaurDiet(rawDiet) ? rawDiet : 'all',
    sort: isDinosaurSortOption(rawSort) ? rawSort : DEFAULT_SORT_OPTION,
  };
}

/**
 * Serializes active dinosaur filters into compact URLSearchParams (omitting defaults).
 */
export function serializeDinosaurFiltersToSearchParams(
  filters: DinosaurFilterState
): URLSearchParams {
  const params = new URLSearchParams();
  const trimmedSearch = filters.search.trim();

  if (trimmedSearch) {
    params.set('q', filters.search);
  }

  if (filters.period !== 'all') {
    params.set('period', filters.period);
  }

  if (filters.diet !== 'all') {
    params.set('diet', filters.diet);
  }

  if (filters.sort !== DEFAULT_SORT_OPTION) {
    params.set('sort', filters.sort);
  }

  return params;
}

/**
 * Returns true if any search query, period filter, or diet filter is currently active.
 */
export function hasActiveFilters(filters: DinosaurFilterState): boolean {
  return filters.search.trim().length > 0 || filters.period !== 'all' || filters.diet !== 'all';
}
