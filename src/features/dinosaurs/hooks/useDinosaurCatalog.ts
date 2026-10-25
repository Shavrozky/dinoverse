import { useMemo } from 'react';
import { dinosaurs } from '@/data/dinosaurs';
import {
  DINOSAUR_DIETS,
  GEOLOGICAL_PERIODS,
  type Dinosaur,
  type DinosaurDiet,
  type GeologicalPeriod,
} from '@/types';
import { filterDinosaurs } from '../utils';
import { useDinosaurFilters, type UseDinosaurFiltersReturn } from './useDinosaurFilters';

export interface UseDinosaurCatalogReturn extends UseDinosaurFiltersReturn {
  dinosaurs: readonly Dinosaur[];
  filteredDinosaurs: Dinosaur[];
  resultCount: number;
  totalCount: number;
  availablePeriods: GeologicalPeriod[];
  availableDiets: DinosaurDiet[];
}

export function useDinosaurCatalog(): UseDinosaurCatalogReturn {
  const filterControls = useDinosaurFilters();
  const { filters } = filterControls;

  const filteredDinosaurs = useMemo(() => filterDinosaurs(dinosaurs, filters), [filters]);

  const availablePeriods = useMemo(() => {
    const represented = new Set(dinosaurs.map((dinosaur) => dinosaur.period));
    return GEOLOGICAL_PERIODS.filter((period) => represented.has(period));
  }, []);

  const availableDiets = useMemo(() => {
    const represented = new Set(dinosaurs.map((dinosaur) => dinosaur.diet));
    return DINOSAUR_DIETS.filter((diet) => represented.has(diet));
  }, []);

  return {
    ...filterControls,
    dinosaurs,
    filteredDinosaurs,
    resultCount: filteredDinosaurs.length,
    totalCount: dinosaurs.length,
    availablePeriods,
    availableDiets,
  };
}
