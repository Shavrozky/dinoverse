import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_DINOSAUR_FILTERS,
  type DietFilterValue,
  type DinosaurFilterState,
  type DinosaurSortOption,
  type PeriodFilterValue,
} from '../types';
import {
  hasActiveFilters as checkHasActiveFilters,
  parseDinosaurFiltersFromSearchParams,
  serializeDinosaurFiltersToSearchParams,
} from '../utils';

export interface UseDinosaurFiltersReturn {
  filters: DinosaurFilterState;
  hasActiveFilters: boolean;
  setSearch: (search: string) => void;
  setPeriod: (period: PeriodFilterValue) => void;
  setDiet: (diet: DietFilterValue) => void;
  setSort: (sort: DinosaurSortOption) => void;
  clearFilters: () => void;
}

export function useDinosaurFilters(): UseDinosaurFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseDinosaurFiltersFromSearchParams(searchParams), [searchParams]);

  const updateFilters = useCallback(
    (updater: (prev: DinosaurFilterState) => DinosaurFilterState, replace = false) => {
      setSearchParams(
        (prevParams) => {
          const current = parseDinosaurFiltersFromSearchParams(prevParams);
          const next = updater(current);
          return serializeDinosaurFiltersToSearchParams(next);
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const setSearch = useCallback(
    (search: string) => {
      updateFilters((prev) => ({ ...prev, search }), true);
    },
    [updateFilters]
  );

  const setPeriod = useCallback(
    (period: PeriodFilterValue) => {
      updateFilters((prev) => ({ ...prev, period }));
    },
    [updateFilters]
  );

  const setDiet = useCallback(
    (diet: DietFilterValue) => {
      updateFilters((prev) => ({ ...prev, diet }));
    },
    [updateFilters]
  );

  const setSort = useCallback(
    (sort: DinosaurSortOption) => {
      updateFilters((prev) => ({ ...prev, sort }));
    },
    [updateFilters]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(serializeDinosaurFiltersToSearchParams(DEFAULT_DINOSAUR_FILTERS));
  }, [setSearchParams]);

  const activeFilters = useMemo(() => checkHasActiveFilters(filters), [filters]);

  return {
    filters,
    hasActiveFilters: activeFilters,
    setSearch,
    setPeriod,
    setDiet,
    setSort,
    clearFilters,
  };
}
